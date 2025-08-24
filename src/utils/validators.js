export const validateContactName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Name cannot exceed 100 characters' };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }

  return { isValid: true, value: trimmedName };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Check length and format for Russian mobile numbers
  if (cleanPhone.length !== 11) {
    return { isValid: false, error: 'Phone number must be 11 digits' };
  }

  if (!['7', '8'].includes(cleanPhone[0])) {
    return { isValid: false, error: 'Phone number must start with 7 or 8' };
  }

  // Format the phone number
  const formattedPhone = formatPhoneNumber(cleanPhone);
  
  return { isValid: true, value: formattedPhone };
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