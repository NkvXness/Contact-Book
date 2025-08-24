import { BaseComponent } from './BaseComponent.js';
import { ContactService } from '../services/ContactService.js';
import { GroupService } from '../services/GroupService.js';
import { validateContactName, validatePhoneNumber } from '../utils/validators.js';
import { ValidationUI } from './ValidationUI.js';
import { showToast } from './ToastManager.js';
import { EVENTS } from '../utils/constants.js';

export class InlineEditor extends BaseComponent {
  constructor() {
    super();
    this.currentEditor = null;
    this.originalData = null;
    this.bindEvents();
  }

  bindEvents() {
    this.addEventListener(document, 'click', (e) => {
      if (e.target.classList.contains('inline-edit-btn')) {
        this.startInlineEdit(e.target);
      } else if (!this.currentEditor?.contains(e.target)) {
        this.cancelEdit();
      }
    });

    this.addEventListener(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.cancelEdit();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        this.saveEdit();
      }
    });
  }

  startInlineEdit(button) {
    if (this.currentEditor) {
      this.cancelEdit();
    }

    const contactItem = button.closest('.contact-item');
    if (!contactItem) return;

    const contactId = contactItem.dataset.contactId;
    const contact = ContactService.findById(contactId);
    if (!contact) return;

    this.originalData = { ...contact };
    this.createInlineEditor(contactItem, contact);
  }

  createInlineEditor(contactItem, contact) {
    const nameElement = contactItem.querySelector('.contact-name');
    const phoneElement = contactItem.querySelector('.contact-phone');
    const actionsElement = contactItem.querySelector('.contact-actions');

    if (!nameElement || !phoneElement || !actionsElement) return;

    const editor = document.createElement('div');
    editor.className = 'inline-editor';
    editor.innerHTML = `
      <div class="inline-edit-form">
        <div class="inline-field">
          <label class="inline-label">Имя:</label>
          <input type="text" class="inline-name-input" value="${this.escapeHtml(contact.name)}">
          <div class="inline-error"></div>
        </div>
        
        <div class="inline-field">
          <label class="inline-label">Телефон:</label>
          <input type="tel" class="inline-phone-input" value="${this.escapeHtml(contact.phone)}">
          <div class="inline-error"></div>
        </div>
        
        <div class="inline-field">
          <label class="inline-label">Группа:</label>
          <select class="inline-group-select">
            ${this.generateGroupOptions(contact.groupId)}
          </select>
        </div>
        
        <div class="inline-actions">
          <button class="inline-save-btn" type="button" title="Сохранить изменения (Ctrl+Enter)">
            ✓ Сохранить
          </button>
          <button class="inline-cancel-btn" type="button" title="Отменить изменения (Esc)">
            ✗ Отмена
          </button>
        </div>
      </div>
    `;

    // Hide original content
    nameElement.style.display = 'none';
    phoneElement.style.display = 'none';
    actionsElement.style.display = 'none';

    // Insert editor
    contactItem.appendChild(editor);
    contactItem.classList.add('editing');
    
    this.currentEditor = editor;
    this.setupEditorEvents(editor, contactItem);
    this.setupValidation(editor);
    
    // Focus first input
    const firstInput = editor.querySelector('.inline-name-input');
    if (firstInput) {
      firstInput.focus();
      firstInput.select();
    }

    this.emit('inlineEditStarted', { contactId: contact.id, contact });
  }

  generateGroupOptions(selectedGroupId) {
    const groups = GroupService.getAllGroups();
    return groups.map(group => 
      `<option value="${group.id}" ${group.id === selectedGroupId ? 'selected' : ''}>
        ${this.escapeHtml(group.name)}
      </option>`
    ).join('');
  }

  setupEditorEvents(editor, contactItem) {
    this.addEventListener(editor, 'click', (e) => {
      e.stopPropagation();
      
      if (e.target.classList.contains('inline-save-btn')) {
        this.saveEdit();
      } else if (e.target.classList.contains('inline-cancel-btn')) {
        this.cancelEdit();
      }
    });

    // Auto-resize inputs
    const inputs = editor.querySelectorAll('input');
    inputs.forEach(input => {
      this.addEventListener(input, 'input', () => {
        this.autoResizeInput(input);
        this.validateField(input);
      });
      
      // Initial resize
      this.autoResizeInput(input);
    });

    // Validate on blur
    inputs.forEach(input => {
      this.addEventListener(input, 'blur', () => {
        this.validateField(input);
      });
    });
  }

  setupValidation(editor) {
    const nameInput = editor.querySelector('.inline-name-input');
    const phoneInput = editor.querySelector('.inline-phone-input');
    
    if (nameInput) {
      this.setupFieldValidation(nameInput, validateContactName);
    }
    
    if (phoneInput) {
      this.setupFieldValidation(phoneInput, validatePhoneNumber);
    }
  }

  setupFieldValidation(input, validator) {
    let validationTimeout;
    
    this.addEventListener(input, 'input', () => {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        this.validateField(input, validator);
      }, 300);
    });
  }

  validateField(input, validator = null) {
    const field = input.closest('.inline-field');
    const errorDiv = field.querySelector('.inline-error');
    
    if (!validator) {
      if (input.classList.contains('inline-name-input')) {
        validator = validateContactName;
      } else if (input.classList.contains('inline-phone-input')) {
        validator = validatePhoneNumber;
      }
    }
    
    if (!validator) return true;
    
    const result = validator(input.value);
    
    if (result.isValid) {
      field.classList.remove('error');
      field.classList.add('valid');
      errorDiv.textContent = '';
      
      if (input.classList.contains('inline-phone-input') && result.value) {
        input.value = result.value;
      }
      
      return true;
    } else {
      field.classList.remove('valid');
      field.classList.add('error');
      errorDiv.textContent = result.error;
      return false;
    }
  }

  autoResizeInput(input) {
    const minWidth = 100;
    const maxWidth = 300;
    
    // Create temporary element to measure text width
    const temp = document.createElement('span');
    temp.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: nowrap;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      padding: 0;
      margin: 0;
    `;
    temp.textContent = input.value || input.placeholder;
    document.body.appendChild(temp);
    
    const textWidth = temp.offsetWidth;
    document.body.removeChild(temp);
    
    const newWidth = Math.min(maxWidth, Math.max(minWidth, textWidth + 20));
    input.style.width = newWidth + 'px';
  }

  async saveEdit() {
    if (!this.currentEditor) return;

    const nameInput = this.currentEditor.querySelector('.inline-name-input');
    const phoneInput = this.currentEditor.querySelector('.inline-phone-input');
    const groupSelect = this.currentEditor.querySelector('.inline-group-select');

    if (!nameInput || !phoneInput || !groupSelect) return;

    // Validate all fields
    const nameValid = this.validateField(nameInput);
    const phoneValid = this.validateField(phoneInput);
    
    if (!nameValid || !phoneValid) {
      showToast('Исправьте ошибки перед сохранением', 'error');
      return;
    }

    const contactItem = this.currentEditor.closest('.contact-item');
    const contactId = contactItem.dataset.contactId;
    
    const updates = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      groupId: groupSelect.value
    };

    // Check if anything changed
    if (updates.name === this.originalData.name && 
        updates.phone === this.originalData.phone && 
        updates.groupId === this.originalData.groupId) {
      this.cancelEdit();
      return;
    }

    try {
      const updatedContact = ContactService.updateContact(contactId, updates);
      
      if (updatedContact) {
        this.emit('contactUpdated', { 
          contact: updatedContact, 
          oldContact: this.originalData 
        });
        
        showToast('Контакт успешно обновлен', 'success');
        this.finishEdit();
      } else {
        showToast('Ошибка при сохранении контакта', 'error');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      showToast('Ошибка при сохранении контакта', 'error');
    }
  }

  cancelEdit() {
    if (!this.currentEditor) return;
    
    this.finishEdit();
    this.emit('inlineEditCanceled', { contact: this.originalData });
  }

  finishEdit() {
    if (!this.currentEditor) return;

    const contactItem = this.currentEditor.closest('.contact-item');
    
    // Remove editor
    this.currentEditor.remove();
    
    // Show original content
    const nameElement = contactItem.querySelector('.contact-name');
    const phoneElement = contactItem.querySelector('.contact-phone');
    const actionsElement = contactItem.querySelector('.contact-actions');
    
    if (nameElement) nameElement.style.display = '';
    if (phoneElement) phoneElement.style.display = '';
    if (actionsElement) actionsElement.style.display = '';
    
    contactItem.classList.remove('editing');
    
    this.currentEditor = null;
    this.originalData = null;
    
    this.emit('inlineEditFinished');
  }

  // Utility methods
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  isEditing() {
    return this.currentEditor !== null;
  }

  getCurrentEditingContactId() {
    if (!this.currentEditor) return null;
    
    const contactItem = this.currentEditor.closest('.contact-item');
    return contactItem?.dataset.contactId || null;
  }

  // Static method to add inline edit button to contact items
  static addEditButtonToContactItem(contactItem) {
    const actionsDiv = contactItem.querySelector('.contact-actions');
    if (!actionsDiv) return;

    const editButton = document.createElement('button');
    editButton.className = 'contact-action-btn inline-edit-btn';
    editButton.title = 'Редактировать контакт';
    editButton.innerHTML = '✏️';
    
    // Insert before delete button
    const deleteButton = actionsDiv.querySelector('[data-action="delete"]');
    if (deleteButton) {
      actionsDiv.insertBefore(editButton, deleteButton);
    } else {
      actionsDiv.appendChild(editButton);
    }
  }
}