/**
 * Модель группы контактов
 */
export class Group {
  constructor(id, name) {
    this.id = id || this.generateId();
    this.name = this.validateName(name);
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  generateId() {
    // Генерирует уникальный ID
    return `group_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  validateName(name) {
    if (!name || typeof name !== "string" || name.trim().length < 1) {
      throw new Error("Название группы не может быть пустым");
    }

    if (name.trim().length > 50) {
      throw new Error("Название группы не должно превышать 50 символов");
    }

    return name.trim();
  }

  /**
   * Обновление группы
   * @param {Object} updates
   */
  update(updates) {
    if (updates.name !== undefined) {
      this.name = this.validateName(updates.name);
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Создание экземпляра из JSON
   * @param {Object} json
   * @returns {Group}
   */
  static fromJSON(json) {
    const group = new Group(json.id, json.name);
    group.createdAt = json.createdAt;
    group.updatedAt = json.updatedAt;
    return group;
  }
}
