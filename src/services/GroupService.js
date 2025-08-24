import { Group } from '../models/Group.js';
import { StorageService } from './StorageService.js';

export class GroupService {
  static STORAGE_KEYS = {
    INPUT_GROUPS: 'input-groups',
    ACCORDION_GROUPS: 'accordion-groups', 
    OPTION_GROUPS: 'option-groups'
  };

  static getAllGroups() {
    const inputGroups = StorageService.load(this.STORAGE_KEYS.INPUT_GROUPS, []);
    return inputGroups.map(groupData => {
      if (groupData.value) {
        return new Group(null, groupData.value);
      }
      return Group.fromJSON(groupData);
    });
  }
  static createGroup(name) {
    try {
      const group = new Group(null, name);
      const groups = this.getAllGroups();
      
      // Check for duplicate names
      const exists = groups.some(g => g.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        throw new Error('Group with this name already exists');
      }

      groups.push(group);
      this.saveGroups(groups);
      return group;
    } catch (error) {
      console.error('Failed to create group:', error);
      return null;
    }
  }

  static updateGroup(id, updates) {
    try {
      const groups = this.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === id);
      
      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      groups[groupIndex].update(updates);
      this.saveGroups(groups);
      return groups[groupIndex];
    } catch (error) {
      console.error('Failed to update group:', error);
      return null;
    }
  }

  static deleteGroup(id) {
    try {
      const groups = this.getAllGroups();
      const filteredGroups = groups.filter(g => g.id !== id);
      
      if (filteredGroups.length === groups.length) {
        throw new Error('Group not found');
      }

      this.saveGroups(filteredGroups);
      return true;
    } catch (error) {
      console.error('Failed to delete group:', error);
      return false;
    }
  }

  static findById(id) {
    const groups = this.getAllGroups();
    return groups.find(g => g.id === id) || null;
  }

  static findByName(name) {
    const groups = this.getAllGroups();
    return groups.find(g => g.name.toLowerCase() === name.toLowerCase()) || null;
  }

  static saveGroups(groups) {
    const inputGroups = groups.map(group => ({
      value: group.name,
      dom: this.generateInputHTML(group.name)
    }));

    const optionGroups = groups.map(group => ({
      value: group.name,
      dom: this.generateOptionHTML(group.name)
    }));

    const accordionGroups = groups.map(group => ({
      value: group.name,
      dom: this.generateAccordionHTML(group.name)
    }));

    StorageService.save(this.STORAGE_KEYS.INPUT_GROUPS, inputGroups);
    StorageService.save(this.STORAGE_KEYS.OPTION_GROUPS, optionGroups);
    StorageService.save(this.STORAGE_KEYS.ACCORDION_GROUPS, accordionGroups);
  }

  static generateInputHTML(name) {
    return `<input type="text" class="groupInput" placeholder="Введите название" value="${name}">
            <span class="deleteButton">
                <svg width="16" height="20" fill="none" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.3" d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z" fill="black"></path>
                </svg>
            </span>`;
  }

  static generateOptionHTML(name) {
    return `<div class="option">
                <input type="radio" class="radio" name="category" id="${name}">
                <label class="option-label" for="${name}">${name}</label>
            </div>`;
  }

  static generateAccordionHTML(name) {
    return `<div class="accordion__item">
                <div class="accordion__header">${name}</div>
                <div class="accordion__body"></div>
            </div>`;
  }

  static clearAll() {
    const success1 = StorageService.remove(this.STORAGE_KEYS.INPUT_GROUPS);
    const success2 = StorageService.remove(this.STORAGE_KEYS.OPTION_GROUPS);
    const success3 = StorageService.remove(this.STORAGE_KEYS.ACCORDION_GROUPS);
    return success1 && success2 && success3;
  }
}