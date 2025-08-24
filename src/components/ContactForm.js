/**
 * Contact form component
 * Handles contact creation and editing
 */
import { BaseComponent } from './BaseComponent.js';
import { ContactService } from '@services/ContactService.js';
import { GroupService } from '@services/GroupService.js';
import { validateContactName, validatePhoneNumber } from '@utils/validators.js';
import { SELECTORS, EVENTS, KEYS, CSS_CLASSES } from '@utils/constants.js';

export class ContactForm extends BaseComponent {
  constructor(groupManager) {
    super();
    this.groupManager = groupManager;
    this.editingContact = null;
    this.bindElements();
    this.bindEvents();
    this.initializePhoneMask();
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    this.addContactButton = this.$(SELECTORS.ADD_CONTACT);
    this.contactAdd = this.$(SELECTORS.CONTACT_ADD);
    this.crossAddButton = this.$(SELECTORS.CROSS_ADD_BUTTON);
    this.saveContactButton = this.$(SELECTORS.SAVE_CONTACT_BUTTON);
    this.darkBg = this.$(SELECTORS.DARK_BG);
    this.nameInput = this.$(SELECTORS.ADD_NAME);
    this.phoneInput = this.$(SELECTORS.ADD_PHONE_NUMBER);
    this.selected = this.$(SELECTORS.SELECTED);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Form controls
    this.addEventListener(this.addContactButton, EVENTS.CLICK, () => this.openForm());
    this.addEventListener(this.crossAddButton, EVENTS.CLICK, () => this.closeForm());
    this.addEventListener(this.saveContactButton, EVENTS.CLICK, (e) => this.handleSubmit(e));

    // Form validation
    this.addEventListener(this.nameInput, EVENTS.INPUT, () => this.validateName());
    this.addEventListener(this.phoneInput, EVENTS.INPUT, () => this.validatePhone());

    // Listen for group selection
    this.on('groupSelected', (e) => this.handleGroupSelection(e.detail));
  }

  /**
   * Open contact form
   * @param {Contact|null} contact - Contact to edit (null for new contact)
   */
  openForm(contact = null) {
    this.editingContact = contact;
    
    if (contact) {
      // Edit mode
      this.populateForm(contact);
    } else {
      // Create mode
      this.resetForm();
    }

    this.addClass(this.contactAdd, CSS_CLASSES.ADD_OPEN);
    this.addClass(this.darkBg, CSS_CLASSES.BACKGROUND_ACTIVE);
    
    // Focus on name input
    this.nameInput?.focus();
  }

  /**
   * Close contact form
   */
  closeForm() {
    this.removeClass(this.contactAdd, CSS_CLASSES.ADD_OPEN);
    this.removeClass(this.darkBg, CSS_CLASSES.BACKGROUND_ACTIVE);
    this.removeClass(this.selected, CSS_CLASSES.NON_SELECTABLE);
    
    this.resetForm();
    this.editingContact = null;
  }

  /**
   * Populate form with contact data
   * @param {Contact} contact - Contact to populate
   */
  populateForm(contact) {
    this.setValue(this.nameInput, contact.name);
    this.setValue(this.phoneInput, contact.phone);
    this.nameInput?.setAttribute('value', contact.name);
    this.phoneInput?.setAttribute('value', contact.phone);

    // Set selected group
    const group = GroupService.findById(contact.groupId);
    if (group) {
      this.groupManager.setSelectedGroup(group.name);
      this.addClass(this.selected, CSS_CLASSES.NON_SELECTABLE);
    }

    this.clearValidationErrors();
  }

  /**
   * Reset form to empty state
   */
  resetForm() {
    this.setValue(this.nameInput, '');
    this.setValue(this.phoneInput, '');
    this.nameInput?.removeAttribute('value');
    this.phoneInput?.removeAttribute('value');
    
    this.groupManager.setSelectedGroup(null);
    this.clearValidationErrors();
  }

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const formData = this.getFormData();
    
    if (this.editingContact) {
      this.updateContact(formData);
    } else {
      this.createContact(formData);
    }
  }

  /**
   * Get form data
   * @returns {Object} Form data object
   */
  getFormData() {
    const groupName = this.groupManager.getSelectedGroup();
    const group = groupName ? GroupService.findByName(groupName) : null;

    return {
      name: this.getValue(this.nameInput).trim(),
      phone: this.getValue(this.phoneInput).trim(),
      groupId: group?.id || null,
      groupName: groupName
    };
  }

  /**
   * Create new contact
   * @param {Object} formData - Form data
   */
  createContact(formData) {
    if (!formData.groupId) {
      this.showFormError('Please select a group');
      return;
    }

    const contact = ContactService.createContactByGroupName(
      formData.name,
      formData.phone,
      formData.groupName
    );

    if (contact) {
      this.emit('contactCreated', { contact });
      this.closeForm();
      this.showSuccess('Contact created successfully');
    } else {
      this.showFormError('Failed to create contact');
    }
  }

  /**
   * Update existing contact
   * @param {Object} formData - Form data
   */
  updateContact(formData) {
    if (!this.editingContact) return;

    const updates = {
      name: formData.name,
      phone: formData.phone
    };

    // Only update group if it's different and valid
    if (formData.groupId && formData.groupId !== this.editingContact.groupId) {
      updates.groupId = formData.groupId;
    }

    const updatedContact = ContactService.updateContact(this.editingContact.id, updates);

    if (updatedContact) {
      this.emit('contactUpdated', { contact: updatedContact, oldContact: this.editingContact });
      this.closeForm();
      this.showSuccess('Contact updated successfully');
    } else {
      this.showFormError('Failed to update contact');
    }
  }

  /**
   * Validate entire form
   * @returns {boolean} Validation result
   */
  validateForm() {
    const nameValid = this.validateName();
    const phoneValid = this.validatePhone();
    const groupValid = this.validateGroup();

    return nameValid && phoneValid && groupValid;
  }

  /**
   * Validate name field
   * @returns {boolean} Validation result
   */
  validateName() {
    const value = this.getValue(this.nameInput);
    const validation = validateContactName(value);

    if (validation.isValid) {
      this.clearFieldError(this.nameInput);
      return true;
    } else {
      this.showFieldError(this.nameInput, validation.error);
      return false;
    }
  }

  /**
   * Validate phone field
   * @returns {boolean} Validation result
   */
  validatePhone() {
    const value = this.getValue(this.phoneInput);
    const validation = validatePhoneNumber(value);

    if (validation.isValid) {
      this.setValue(this.phoneInput, validation.value);
      this.clearFieldError(this.phoneInput);
      return true;
    } else {
      this.showFieldError(this.phoneInput, validation.error);
      return false;
    }
  }

  /**
   * Validate group selection
   * @returns {boolean} Validation result
   */
  validateGroup() {
    const selectedGroup = this.groupManager.getSelectedGroup();
    
    if (!selectedGroup) {
      this.showFieldError(this.selected, 'Please select a group');
      return false;
    }

    this.clearFieldError(this.selected);
    return true;
  }

  /**
   * Handle group selection event
   * @param {Object} detail - Event detail
   */
  handleGroupSelection(detail) {
    this.clearFieldError(this.selected);
  }

  /**
   * Initialize phone number input mask
   */
  initializePhoneMask() {
    if (!this.phoneInput) return;

    const maskHandler = (event) => {
      let keyCode = event.keyCode;
      let pos = this.phoneInput.selectionStart;
      
      if (pos < 3) event.preventDefault();
      
      let matrix = '+7 (___) ___-__-__';
      let i = 0;
      let def = matrix.replace(/\D/g, '');
      let val = this.phoneInput.value.replace(/\D/g, '');
      let newValue = matrix.replace(/[_\d]/g, (a) => {
        return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
      });
      
      i = newValue.indexOf('_');
      if (i !== -1) {
        i < 5 && (i = 3);
        newValue = newValue.slice(0, i);
      }
      
      let reg = matrix.substr(0, this.phoneInput.value.length).replace(/_+/g, (a) => {
        return `\\d{1,${a.length}}`;
      }).replace(/[+()]/g, '\\$&');
      
      reg = new RegExp(`^${reg}$`);
      
      if (!reg.test(this.phoneInput.value) || this.phoneInput.value.length < 5 || keyCode > 47 && keyCode < 58) {
        this.phoneInput.value = newValue;
      }
      
      if (event.type === 'blur' && this.phoneInput.value.length < 5) {
        this.phoneInput.value = '';
      }
    };

    this.addEventListener(this.phoneInput, EVENTS.INPUT, maskHandler);
    this.addEventListener(this.phoneInput, EVENTS.FOCUS, maskHandler);
    this.addEventListener(this.phoneInput, EVENTS.BLUR, maskHandler);
    this.addEventListener(this.phoneInput, EVENTS.KEYDOWN, maskHandler);
  }

  /**
   * Show field validation error
   * @param {Element} field - Input field
   * @param {string} message - Error message
   */
  showFieldError(field, message) {
    this.addClass(field, 'error');
    field.title = message;
  }

  /**
   * Clear field validation error
   * @param {Element} field - Input field
   */
  clearFieldError(field) {
    this.removeClass(field, 'error');
    field.title = '';
  }

  /**
   * Clear all validation errors
   */
  clearValidationErrors() {
    this.clearFieldError(this.nameInput);
    this.clearFieldError(this.phoneInput);
    this.clearFieldError(this.selected);
  }

  /**
   * Show form-level error
   * @param {string} message - Error message
   */
  showFormError(message) {
    console.error('Form Error:', message);
    // In a real app, this would show a toast or modal
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    console.log('Success:', message);
    // In a real app, this would show a toast notification
  }
}