import { Contact } from '@models/Contact.js';
import { StorageService } from './StorageService.js';
import { GroupService } from './GroupService.js';

export class ContactService {
  static STORAGE_KEY = 'contacts';

  static getAllContacts() {
    const contactsData = StorageService.load(this.STORAGE_KEY, []);
    return contactsData.map(contactData => Contact.fromJSON(contactData));
  }

  static getContactsByGroup(groupId) {
    const contacts = this.getAllContacts();
    return contacts.filter(contact => contact.groupId === groupId);
  }

  static getContactsByGroupName(groupName) {
    const contacts = this.getAllContacts();
    const group = GroupService.findByName(groupName);
    if (!group) return [];
    
    return contacts.filter(contact => contact.groupId === group.id);
  }

  static createContact(name, phone, groupId) {
    try {
      const group = GroupService.findById(groupId);
      if (!group) {
        throw new Error('Selected group does not exist');
      }

      const contact = new Contact(null, name, phone, groupId);
      const contacts = this.getAllContacts();
      
      const exists = contacts.some(c => c.phone === contact.phone);
      if (exists) {
        throw new Error('Contact with this phone number already exists');
      }

      contacts.push(contact);
      this.saveContacts(contacts);
      return contact;
    } catch (error) {
      console.error('Failed to create contact:', error);
      return null;
    }
  }

  static createContactByGroupName(name, phone, groupName) {
    const group = GroupService.findByName(groupName);
    if (!group) {
      console.error('Group not found:', groupName);
      return null;
    }
    return this.createContact(name, phone, group.id);
  }

  static updateContact(id, updates) {
    try {
      const contacts = this.getAllContacts();
      const contactIndex = contacts.findIndex(c => c.id === id);
      
      if (contactIndex === -1) {
        throw new Error('Contact not found');
      }

      if (updates.groupId) {
        const group = GroupService.findById(updates.groupId);
        if (!group) {
          throw new Error('Selected group does not exist');
        }
      }

      if (updates.phone) {
        const exists = contacts.some(c => c.id !== id && c.phone === updates.phone);
        if (exists) {
          throw new Error('Contact with this phone number already exists');
        }
      }

      contacts[contactIndex].update(updates);
      this.saveContacts(contacts);
      return contacts[contactIndex];
    } catch (error) {
      console.error('Failed to update contact:', error);
      return null;
    }
  }

  static deleteContact(id) {
    try {
      const contacts = this.getAllContacts();
      const filteredContacts = contacts.filter(c => c.id !== id);
      
      if (filteredContacts.length === contacts.length) {
        throw new Error('Contact not found');
      }

      this.saveContacts(filteredContacts);
      return true;
    } catch (error) {
      console.error('Failed to delete contact:', error);
      return false;
    }
  }

  static findById(id) {
    const contacts = this.getAllContacts();
    return contacts.find(c => c.id === id) || null;
  }

  static findByPhone(phone) {
    const contacts = this.getAllContacts();
    return contacts.find(c => c.phone === phone) || null;
  }

  static searchByName(query) {
    const contacts = this.getAllContacts();
    const searchTerm = query.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm)
    );
  }

  static getContactCount() {
    return this.getAllContacts().length;
  }

  static getContactCountByGroup(groupId) {
    return this.getContactsByGroup(groupId).length;
  }

  static saveContacts(contacts) {
    const contactsData = contacts.map(contact => contact.toJSON());
    StorageService.save(this.STORAGE_KEY, contactsData);
  }

  static clearAll() {
    return StorageService.remove(this.STORAGE_KEY);
  }

  static exportData() {
    return {
      contacts: this.getAllContacts().map(c => c.toJSON()),
      exportDate: new Date().toISOString(),
      version: '3.0.0'
    };
  }

  static importData(data) {
    try {
      if (!data.contacts || !Array.isArray(data.contacts)) {
        throw new Error('Invalid data format');
      }

      const contacts = data.contacts.map(contactData => Contact.fromJSON(contactData));
      this.saveContacts(contacts);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}