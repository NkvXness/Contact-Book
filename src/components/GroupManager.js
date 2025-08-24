/**
 * Group management component
 * Handles group creation, editing, and display
 */
import { BaseComponent } from './BaseComponent.js';
import { GroupService } from '@services/GroupService.js';
import { validateGroupName } from '@utils/validators.js';
import { SELECTORS, EVENTS, KEYS, TEMPLATES, CSS_CLASSES } from '@utils/constants.js';

export class GroupManager extends BaseComponent {
  constructor() {
    super();
    this.bindElements();
    this.bindEvents();
    this.render();
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    this.groupsButton = this.$(SELECTORS.GROUPS_BUTTON);
    this.contactGroups = this.$(SELECTORS.CONTACT_GROUPS);
    this.contactGroupsBody = this.$(SELECTORS.CONTACT_GROUPS_BODY);
    this.crossButton = this.$(SELECTORS.CROSS_BUTTON);
    this.addButton = this.$(SELECTORS.ADD_BUTTON);
    this.saveButton = this.$(SELECTORS.SAVE_BUTTON);
    this.darkBg = this.$(SELECTORS.DARK_BG);
    this.optionsContainer = this.$(SELECTORS.OPTIONS_CONTAINER);
    this.selected = this.$(SELECTORS.SELECTED);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Modal controls
    this.addEventListener(this.groupsButton, EVENTS.CLICK, () => this.toggleModal());
    this.addEventListener(this.crossButton, EVENTS.CLICK, () => this.closeModal());
    this.addEventListener(this.addButton, EVENTS.CLICK, () => this.addGroupInput());
    this.addEventListener(this.saveButton, EVENTS.CLICK, () => this.saveGroups());

    // Group input handling
    this.addEventListener(this.contactGroupsBody, EVENTS.CLICK, (e) => this.handleGroupAction(e));
    this.addEventListener(this.contactGroupsBody, EVENTS.KEYPRESS, (e) => this.handleGroupInput(e));

    // Option selection
    this.addEventListener(this.selected, EVENTS.CLICK, () => this.toggleOptionsContainer());
    this.addEventListener(this.optionsContainer, EVENTS.CLICK, (e) => this.handleOptionSelection(e));
  }

  /**
   * Initial render of groups
   */
  render() {
    this.renderGroupInputs();
    this.renderGroupOptions();
  }

  /**
   * Toggle groups modal
   */
  toggleModal() {
    this.toggleClass(this.contactGroups, CSS_CLASSES.MODAL_OPEN);
    this.toggleClass(this.darkBg, CSS_CLASSES.BACKGROUND_ACTIVE);
  }

  /**
   * Close groups modal
   */
  closeModal() {
    this.removeClass(this.contactGroups, CSS_CLASSES.MODAL_OPEN);
    this.removeClass(this.darkBg, CSS_CLASSES.BACKGROUND_ACTIVE);
    this.cleanupEmptyInputs();
  }

  /**
   * Add new group input field
   */
  addGroupInput() {
    const inputContainer = this.createElement('div', {
      className: 'contact__groups-field'
    }, TEMPLATES.GROUP_INPUT);

    this.contactGroupsBody.appendChild(inputContainer);
    
    // Focus on the new input
    const input = inputContainer.querySelector(SELECTORS.GROUP_INPUT);
    input?.focus();
  }

  /**
   * Handle group input events
   * @param {Event} e - Keyboard event
   */
  handleGroupInput(e) {
    if (e.key === KEYS.ENTER && e.target.classList.contains('groupInput')) {
      e.preventDefault();
      this.processGroupInput(e.target);
    }
  }

  /**
   * Process group input value
   * @param {HTMLInputElement} input - Input element
   */
  processGroupInput(input) {
    const value = input.value.trim();
    
    if (!value) {
      this.showValidationError(input, 'Group name cannot be empty');
      return;
    }

    const validation = validateGroupName(value);
    if (!validation.isValid) {
      this.showValidationError(input, validation.error);
      return;
    }

    // Check if group already exists
    if (GroupService.findByName(validation.value)) {
      this.showValidationError(input, 'Group with this name already exists');
      return;
    }

    // Create group
    const group = GroupService.createGroup(validation.value);
    if (group) {
      input.value = group.name;
      input.setAttribute('value', group.name);
      this.clearValidationError(input);
      this.renderGroupOptions();
      this.emit('groupCreated', { group });
    }
  }

  /**
   * Handle group actions (delete, etc.)
   * @param {Event} e - Click event
   */
  handleGroupAction(e) {
    if (e.target.closest('.deleteButton')) {
      e.preventDefault();
      this.deleteGroup(e.target);
    }
  }

  /**
   * Delete group
   * @param {Element} deleteButton - Delete button element
   */
  deleteGroup(deleteButton) {
    const inputContainer = deleteButton.closest('.contact__groups-field');
    const input = inputContainer?.querySelector(SELECTORS.GROUP_INPUT);
    
    if (input?.value) {
      const group = GroupService.findByName(input.value);
      if (group) {
        GroupService.deleteGroup(group.id);
        this.emit('groupDeleted', { group });
      }
    }

    inputContainer?.remove();
    this.renderGroupOptions();
  }

  /**
   * Save all groups
   */
  saveGroups() {
    const inputs = this.$$(SELECTORS.GROUP_INPUT, this.contactGroupsBody);
    let hasChanges = false;

    inputs.forEach(input => {
      const value = input.value.trim();
      if (value && !input.hasAttribute('value')) {
        this.processGroupInput(input);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.renderGroupOptions();
    }

    this.emit('groupsSaved');
  }

  /**
   * Render group input fields
   */
  renderGroupInputs() {
    const groups = GroupService.getAllGroups();
    this.setHTML(this.contactGroupsBody, '');

    groups.forEach(group => {
      const inputContainer = this.createElement('div', {
        className: 'contact__groups-field'
      }, TEMPLATES.GROUP_INPUT);

      const input = inputContainer.querySelector(SELECTORS.GROUP_INPUT);
      input.value = group.name;
      input.setAttribute('value', group.name);

      this.contactGroupsBody.appendChild(inputContainer);
    });
  }

  /**
   * Render group options in dropdown
   */
  renderGroupOptions() {
    const groups = GroupService.getAllGroups();
    this.setHTML(this.optionsContainer, '');

    groups.forEach(group => {
      const option = this.createElement('div', { className: 'option' });
      
      const radio = this.createElement('input', {
        type: 'radio',
        className: 'radio',
        name: 'category',
        id: group.id
      });

      const label = this.createElement('label', {
        className: 'option-label',
        'for': group.id
      }, group.name);

      option.appendChild(radio);
      option.appendChild(label);
      this.optionsContainer.appendChild(option);
    });
  }

  /**
   * Toggle options container visibility
   */
  toggleOptionsContainer() {
    this.toggleClass(this.optionsContainer, CSS_CLASSES.ACTIVE);
    
    // Handle overflow for scrolling
    const optionCount = this.$$(SELECTORS.OPTION, this.optionsContainer).length;
    this.optionsContainer.style.overflowY = optionCount < 7 ? 'hidden' : 'scroll';
  }

  /**
   * Handle option selection
   * @param {Event} e - Click event
   */
  handleOptionSelection(e) {
    const option = e.target.closest(SELECTORS.OPTION);
    if (!option) return;

    const label = option.querySelector(SELECTORS.OPTION_LABEL);
    if (label) {
      this.setText(this.selected, label.textContent);
      this.removeClass(this.optionsContainer, CSS_CLASSES.ACTIVE);
      this.emit('groupSelected', { groupName: label.textContent });
    }
  }

  /**
   * Get currently selected group
   * @returns {string|null} Selected group name
   */
  getSelectedGroup() {
    const selectedText = this.selected.textContent.trim();
    return selectedText === 'Выберите группу' ? null : selectedText;
  }

  /**
   * Set selected group
   * @param {string} groupName - Group name to select
   */
  setSelectedGroup(groupName) {
    this.setText(this.selected, groupName || 'Выберите группу');
  }

  /**
   * Clean up empty input fields
   */
  cleanupEmptyInputs() {
    const inputs = this.$$(SELECTORS.GROUP_INPUT, this.contactGroupsBody);
    inputs.forEach(input => {
      if (!input.value.trim() && !input.hasAttribute('value')) {
        input.closest('.contact__groups-field')?.remove();
      }
    });
  }

  /**
   * Show validation error on input
   * @param {HTMLInputElement} input - Input element
   * @param {string} message - Error message
   */
  showValidationError(input, message) {
    this.addClass(input, 'error');
    input.title = message;
    
    // Remove error after 3 seconds
    setTimeout(() => {
      this.clearValidationError(input);
    }, 3000);
  }

  /**
   * Clear validation error from input
   * @param {HTMLInputElement} input - Input element
   */
  clearValidationError(input) {
    this.removeClass(input, 'error');
    input.title = '';
  }

  /**
   * Reset component state
   */
  reset() {
    this.setSelectedGroup(null);
    this.removeClass(this.contactGroups, CSS_CLASSES.MODAL_OPEN);
    this.removeClass(this.darkBg, CSS_CLASSES.BACKGROUND_ACTIVE);
    this.removeClass(this.optionsContainer, CSS_CLASSES.ACTIVE);
  }
}