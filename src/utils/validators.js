export const validateContactName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Имя обязательно для заполнения' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    return { isValid: false, error: 'Имя не может быть пустым' };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Имя должно содержать минимум 2 символа' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Имя не может содержать более 100 символов' };
  }

  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Имя может содержать только буквы, пробелы, дефисы и апострофы' };
  }

  const consecutiveSpaces = /\s{2,}/;
  if (consecutiveSpaces.test(trimmedName)) {
    return { isValid: false, error: 'Имя не может содержать несколько пробелов подряд' };
  }

  return { 
    isValid: true, 
    value: trimmedName,
    successMessage: 'Имя корректно'
  };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Номер телефона обязателен для заполнения' };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 0) {
    return { isValid: false, error: 'Введите номер телефона' };
  }

  if (cleanPhone.length < 10) {
    return { isValid: false, error: 'Номер телефона слишком короткий' };
  }

  if (cleanPhone.length > 11) {
    return { isValid: false, error: 'Номер телефона слишком длинный' };
  }

  if (cleanPhone.length === 10 && !cleanPhone.startsWith('9')) {
    return { isValid: false, error: 'Мобильный номер должен начинаться с 9' };
  }

  if (cleanPhone.length === 11 && !['7', '8'].includes(cleanPhone[0])) {
    return { isValid: false, error: 'Номер должен начинаться с +7 или 8' };
  }

  if (cleanPhone.length === 11 && cleanPhone[0] === '7' && !cleanPhone.startsWith('79')) {
    return { isValid: false, error: 'Мобильный номер должен начинаться с +79' };
  }

  if (cleanPhone.length === 11 && cleanPhone[0] === '8' && !cleanPhone.startsWith('89')) {
    return { isValid: false, error: 'Мобильный номер должен начинаться с 89' };
  }

  const formattedPhone = formatPhoneNumber(cleanPhone);
  
  return { 
    isValid: true, 
    value: formattedPhone,
    successMessage: 'Номер телефона корректен'
  };
};

/**
 * Validate group name
 * @param {string} name - Group name to validate
 * @returns {Object} Validation result
 */
export const validateGroupName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Group name is required' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < 1) {
    return { isValid: false, error: 'Group name cannot be empty' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Group name cannot exceed 50 characters' };
  }

  return { isValid: true, value: trimmedName };
};

/**
 * Format phone number to display format
 * @param {string} phone - Clean phone number (digits only)
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true, value: email.toLowerCase() };
};

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeHTML = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Validate form data object
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export const validateFormData = (data, rules) => {
  const errors = {};
  const validatedData = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const result = rule(value);
    
    if (result.isValid) {
      validatedData[field] = result.value;
    } else {
      errors[field] = result.error;
      isValid = false;
    }
  }

  return {
    isValid,
    data: validatedData,
    errors
  };
};