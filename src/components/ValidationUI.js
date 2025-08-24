export class ValidationUI {
  static wrapField(fieldElement, labelText) {
    if (fieldElement.closest('.form-field')) {
      return fieldElement.closest('.form-field');
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'form-field';
    
    const label = document.createElement('label');
    label.textContent = labelText;
    label.setAttribute('for', fieldElement.id || '');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    
    const errorIcon = document.createElement('div');
    errorIcon.className = 'field-icon error-icon';
    errorIcon.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor" style="color: #dc3545">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>`;
    
    const successIcon = document.createElement('div');
    successIcon.className = 'field-icon success-icon';
    successIcon.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor" style="color: #28a745">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>`;

    fieldElement.parentNode.insertBefore(wrapper, fieldElement);
    wrapper.appendChild(label);
    
    const inputWrapper = document.createElement('div');
    inputWrapper.style.position = 'relative';
    inputWrapper.appendChild(fieldElement);
    inputWrapper.appendChild(errorIcon);
    inputWrapper.appendChild(successIcon);
    
    wrapper.appendChild(inputWrapper);
    wrapper.appendChild(errorMessage);
    wrapper.appendChild(successMessage);

    return wrapper;
  }

  static showError(fieldElement, message) {
    const wrapper = this.getWrapper(fieldElement);
    const errorMessage = wrapper.querySelector('.error-message');
    
    wrapper.classList.remove('success');
    wrapper.classList.add('error');
    
    if (errorMessage) {
      errorMessage.textContent = message;
    }
    
    fieldElement.setAttribute('aria-invalid', 'true');
    fieldElement.setAttribute('aria-describedby', errorMessage?.id || '');
  }

  static showSuccess(fieldElement, message = '') {
    const wrapper = this.getWrapper(fieldElement);
    const successMessage = wrapper.querySelector('.success-message');
    
    wrapper.classList.remove('error');
    wrapper.classList.add('success');
    
    if (successMessage && message) {
      successMessage.textContent = message;
    }
    
    fieldElement.setAttribute('aria-invalid', 'false');
    fieldElement.removeAttribute('aria-describedby');
  }

  static clearValidation(fieldElement) {
    const wrapper = this.getWrapper(fieldElement);
    
    wrapper.classList.remove('error', 'success');
    
    const errorMessage = wrapper.querySelector('.error-message');
    const successMessage = wrapper.querySelector('.success-message');
    
    if (errorMessage) errorMessage.textContent = '';
    if (successMessage) successMessage.textContent = '';
    
    fieldElement.setAttribute('aria-invalid', 'false');
    fieldElement.removeAttribute('aria-describedby');
  }

  static getWrapper(fieldElement) {
    return fieldElement.closest('.form-field') || fieldElement.parentNode;
  }

  static isValid(fieldElement) {
    const wrapper = this.getWrapper(fieldElement);
    return !wrapper.classList.contains('error');
  }

  static addRealTimeValidation(fieldElement, validator, options = {}) {
    const { debounce = 300, validateOnBlur = true, validateOnInput = true } = options;
    
    let timeoutId;
    
    const validate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const result = validator(fieldElement.value);
        if (result.isValid) {
          this.showSuccess(fieldElement, result.successMessage);
        } else {
          this.showError(fieldElement, result.error);
        }
      }, debounce);
    };

    if (validateOnInput) {
      fieldElement.addEventListener('input', validate);
    }
    
    if (validateOnBlur) {
      fieldElement.addEventListener('blur', () => {
        clearTimeout(timeoutId);
        const result = validator(fieldElement.value);
        if (result.isValid) {
          this.showSuccess(fieldElement, result.successMessage);
        } else {
          this.showError(fieldElement, result.error);
        }
      });
    }
  }
}