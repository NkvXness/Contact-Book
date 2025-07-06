/**
 * Модель контакта
 */
export class Contact {
  constructor(id, name, phone, groupId) {
    this.id = id || this.generateId();
    this.name = this.validateName(name);
    this.phone = this.validatePhone(phone);
    this.groupId = groupId;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  generateId() {
    // Генерирует уникальный ID
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateName(name) {
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      throw new Error("Имя должно содержать минимум 2 символа");
    }
    return name.trim();
  }

  validatePhone(phone) {
    if (!phone || typeof phone !== "string") {
      throw new Error("Номер телефона обязателен");
    }

    // Убираем все символы кроме цифр
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 11 || !["7", "8"].includes(cleanPhone[0])) {
      throw new Error("Неверный формат номера телефона");
    }

    return this.formatPhone(cleanPhone);
  }

  formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, "");
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7,
      9
    )}-${cleaned.slice(9, 11)}`;
  }

  /**
   * Обновление контакта
   * @param {Object} updates
   */
  update(updates) {
    if (updates.name !== undefined) {
      this.name = this.validateName(updates.name);
    }
    if (updates.phone !== undefined) {
      this.phone = this.validatePhone(updates.phone);
    }
    if (updates.groupId !== undefined) {
      this.groupId = updates.groupId;
    }
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Сериализация для localStorage
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      groupId: this.groupId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Создание экземпляра из JSON
   * @param {Object} json
   * @returns {Contact}
   */
  static fromJSON(json) {
    const contact = new Contact(json.id, json.name, json.phone, json.groupId);
    contact.createdAt = json.createdAt;
    contact.updatedAt = json.updatedAt;
    return contact;
  }
}
