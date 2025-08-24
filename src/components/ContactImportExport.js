import { BaseComponent } from './BaseComponent.js';
import { ContactService } from '../services/ContactService.js';
import { GroupService } from '../services/GroupService.js';
import { showToast } from './ToastManager.js';
import { validateContactName, validatePhoneNumber } from '../utils/validators.js';

export class ContactImportExport extends BaseComponent {
  constructor() {
    super();
    this.createUI();
    this.bindEvents();
  }

  createUI() {
    const importExportContainer = document.createElement('div');
    importExportContainer.className = 'import-export-container';
    
    importExportContainer.innerHTML = `
      <div class="import-export-wrapper">
        <div class="export-section">
          <h3>Экспорт контактов</h3>
          <div class="export-options">
            <button class="export-btn" data-format="json" title="Экспорт в формате JSON">
              <span class="btn-icon">📄</span>
              JSON
            </button>
            <button class="export-btn" data-format="csv" title="Экспорт в формате CSV">
              <span class="btn-icon">📊</span>
              CSV
            </button>
            <button class="export-btn" data-format="vcard" title="Экспорт в формате vCard">
              <span class="btn-icon">👤</span>
              vCard
            </button>
          </div>
        </div>
        
        <div class="import-section">
          <h3>Импорт контактов</h3>
          <div class="import-options">
            <input type="file" id="import-file" accept=".json,.csv,.vcf" style="display: none;">
            <button class="import-btn" data-action="select-file">
              <span class="btn-icon">📁</span>
              Выбрать файл
            </button>
            <div class="import-info">
              <span class="file-name">Файл не выбран</span>
              <button class="import-process-btn" disabled>Импортировать</button>
            </div>
          </div>
          <div class="import-status"></div>
        </div>
      </div>
    `;

    const headerWrapper = document.querySelector('.header__wrapper');
    if (headerWrapper) {
      const importExportBtn = document.createElement('button');
      importExportBtn.className = 'import-export-toggle';
      importExportBtn.innerHTML = '⚙️ Импорт/Экспорт';
      importExportBtn.title = 'Открыть панель импорта и экспорта';
      
      headerWrapper.appendChild(importExportBtn);
      
      this.addEventListener(importExportBtn, 'click', () => {
        this.togglePanel(importExportContainer);
      });
    }

    document.body.appendChild(importExportContainer);
    
    this.importExportContainer = importExportContainer;
    this.fileInput = importExportContainer.querySelector('#import-file');
    this.fileName = importExportContainer.querySelector('.file-name');
    this.processBtn = importExportContainer.querySelector('.import-process-btn');
    this.importStatus = importExportContainer.querySelector('.import-status');
  }

  bindEvents() {
    this.addEventListener(this.importExportContainer, 'click', (e) => {
      const exportBtn = e.target.closest('.export-btn');
      const importBtn = e.target.closest('.import-btn');
      
      if (exportBtn) {
        this.handleExport(exportBtn.dataset.format);
      } else if (importBtn) {
        const action = importBtn.dataset.action;
        if (action === 'select-file') {
          this.fileInput.click();
        }
      } else if (e.target.classList.contains('import-process-btn')) {
        this.handleImport();
      }
    });

    this.addEventListener(this.fileInput, 'change', (e) => {
      this.handleFileSelection(e.target.files[0]);
    });

    this.addEventListener(document, 'click', (e) => {
      if (!this.importExportContainer.contains(e.target) && 
          !e.target.classList.contains('import-export-toggle')) {
        this.hidePanel();
      }
    });
  }

  togglePanel(container) {
    const isVisible = container.classList.contains('visible');
    if (isVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  showPanel() {
    this.importExportContainer.classList.add('visible');
    this.updateExportStats();
  }

  hidePanel() {
    this.importExportContainer.classList.remove('visible');
  }

  updateExportStats() {
    const contactCount = ContactService.getContactCount();
    const groupCount = GroupService.getAllGroups().length;
    
    const statsElement = this.importExportContainer.querySelector('.export-stats');
    if (statsElement) {
      statsElement.remove();
    }
    
    const exportSection = this.importExportContainer.querySelector('.export-section');
    const stats = document.createElement('div');
    stats.className = 'export-stats';
    stats.innerHTML = `
      <small>Доступно для экспорта: ${contactCount} контактов в ${groupCount} группах</small>
    `;
    exportSection.appendChild(stats);
  }

  async handleExport(format) {
    try {
      const contacts = ContactService.getAllContacts();
      const groups = GroupService.getAllGroups();
      
      if (contacts.length === 0) {
        showToast('Нет контактов для экспорта', 'warning');
        return;
      }

      let exportData, fileName, mimeType;

      switch (format) {
        case 'json':
          exportData = this.exportToJSON(contacts, groups);
          fileName = `contacts_${this.getDateString()}.json`;
          mimeType = 'application/json';
          break;
        case 'csv':
          exportData = this.exportToCSV(contacts, groups);
          fileName = `contacts_${this.getDateString()}.csv`;
          mimeType = 'text/csv';
          break;
        case 'vcard':
          exportData = this.exportToVCard(contacts, groups);
          fileName = `contacts_${this.getDateString()}.vcf`;
          mimeType = 'text/vcard';
          break;
        default:
          throw new Error('Неподдерживаемый формат экспорта');
      }

      this.downloadFile(exportData, fileName, mimeType);
      showToast(`Экспорт завершен: ${contacts.length} контактов`, 'success');
      
    } catch (error) {
      console.error('Export error:', error);
      showToast('Ошибка при экспорте контактов', 'error');
    }
  }

  exportToJSON(contacts, groups) {
    const exportObject = {
      version: '3.0.0',
      exportDate: new Date().toISOString(),
      groups: groups,
      contacts: contacts
    };
    return JSON.stringify(exportObject, null, 2);
  }

  exportToCSV(contacts, groups) {
    const groupMap = groups.reduce((map, group) => {
      map[group.id] = group.name;
      return map;
    }, {});

    const headers = ['Имя', 'Телефон', 'Группа', 'ID', 'Дата создания'];
    const rows = contacts.map(contact => [
      this.escapeCsvField(contact.name),
      this.escapeCsvField(contact.phone),
      this.escapeCsvField(groupMap[contact.groupId] || 'Без группы'),
      contact.id,
      contact.createdAt || ''
    ]);

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  exportToVCard(contacts, groups) {
    const groupMap = groups.reduce((map, group) => {
      map[group.id] = group.name;
      return map;
    }, {});

    return contacts.map(contact => {
      const groupName = groupMap[contact.groupId] || '';
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${contact.name}`,
        `TEL:${contact.phone}`,
        groupName ? `CATEGORIES:${groupName}` : '',
        contact.id ? `UID:${contact.id}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\r\n');
    }).join('\r\n');
  }

  handleFileSelection(file) {
    if (!file) {
      this.fileName.textContent = 'Файл не выбран';
      this.processBtn.disabled = true;
      return;
    }

    const supportedTypes = ['.json', '.csv', '.vcf'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!supportedTypes.includes(fileExtension)) {
      showToast('Неподдерживаемый тип файла. Поддерживаются: JSON, CSV, vCard', 'error');
      this.fileInput.value = '';
      return;
    }

    this.fileName.textContent = file.name;
    this.processBtn.disabled = false;
    this.selectedFile = file;
  }

  async handleImport() {
    if (!this.selectedFile) return;

    try {
      this.showImportStatus('Импорт файла...', 'loading');
      
      const fileContent = await this.readFile(this.selectedFile);
      const fileExtension = '.' + this.selectedFile.name.split('.').pop().toLowerCase();
      
      let importResult;
      
      switch (fileExtension) {
        case '.json':
          importResult = await this.importFromJSON(fileContent);
          break;
        case '.csv':
          importResult = await this.importFromCSV(fileContent);
          break;
        case '.vcf':
          importResult = await this.importFromVCard(fileContent);
          break;
        default:
          throw new Error('Неподдерживаемый формат файла');
      }

      this.showImportStatus(`Импорт завершен: ${importResult.imported} контактов добавлено, ${importResult.skipped} пропущено`, 'success');
      showToast(`Импортировано ${importResult.imported} контактов`, 'success');
      
      this.emit('contactsImported', importResult);
      
    } catch (error) {
      console.error('Import error:', error);
      this.showImportStatus(`Ошибка импорта: ${error.message}`, 'error');
      showToast('Ошибка при импорте контактов', 'error');
    }
  }

  async importFromJSON(content) {
    const data = JSON.parse(content);
    let imported = 0;
    let skipped = 0;

    if (data.groups && Array.isArray(data.groups)) {
      for (const group of data.groups) {
        if (!GroupService.findByName(group.name)) {
          GroupService.createGroup(group.name);
        }
      }
    }

    if (data.contacts && Array.isArray(data.contacts)) {
      for (const contactData of data.contacts) {
        try {
          const nameValidation = validateContactName(contactData.name);
          const phoneValidation = validatePhoneNumber(contactData.phone);
          
          if (!nameValidation.isValid || !phoneValidation.isValid) {
            skipped++;
            continue;
          }

          const existingContact = ContactService.findByPhone(phoneValidation.value);
          if (existingContact) {
            skipped++;
            continue;
          }

          let groupName = 'Импортированные';
          if (contactData.groupId && data.groups) {
            const group = data.groups.find(g => g.id === contactData.groupId);
            if (group) groupName = group.name;
          }

          const contact = ContactService.createContactByGroupName(
            nameValidation.value,
            phoneValidation.value,
            groupName
          );

          if (contact) {
            imported++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.warn('Skipped invalid contact:', contactData, error);
          skipped++;
        }
      }
    }

    return { imported, skipped };
  }

  async importFromCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        const contact = {};
        
        headers.forEach((header, index) => {
          if (header.includes('имя') || header.includes('name')) {
            contact.name = values[index]?.trim();
          } else if (header.includes('телефон') || header.includes('phone')) {
            contact.phone = values[index]?.trim();
          } else if (header.includes('группа') || header.includes('group')) {
            contact.groupName = values[index]?.trim();
          }
        });

        if (!contact.name || !contact.phone) {
          skipped++;
          continue;
        }

        const nameValidation = validateContactName(contact.name);
        const phoneValidation = validatePhoneNumber(contact.phone);
        
        if (!nameValidation.isValid || !phoneValidation.isValid) {
          skipped++;
          continue;
        }

        const existingContact = ContactService.findByPhone(phoneValidation.value);
        if (existingContact) {
          skipped++;
          continue;
        }

        const groupName = contact.groupName || 'Импортированные';
        const createdContact = ContactService.createContactByGroupName(
          nameValidation.value,
          phoneValidation.value,
          groupName
        );

        if (createdContact) {
          imported++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.warn('Skipped CSV line:', lines[i], error);
        skipped++;
      }
    }

    return { imported, skipped };
  }

  async importFromVCard(content) {
    const vCards = content.split('BEGIN:VCARD').filter(card => card.trim());
    let imported = 0;
    let skipped = 0;

    for (const vCardContent of vCards) {
      try {
        const lines = ('BEGIN:VCARD' + vCardContent).split('\n').map(l => l.trim());
        
        let name = '';
        let phone = '';
        let groupName = 'Импортированные';

        for (const line of lines) {
          if (line.startsWith('FN:')) {
            name = line.substring(3);
          } else if (line.startsWith('TEL:')) {
            phone = line.substring(4);
          } else if (line.startsWith('CATEGORIES:')) {
            groupName = line.substring(11);
          }
        }

        if (!name || !phone) {
          skipped++;
          continue;
        }

        const nameValidation = validateContactName(name);
        const phoneValidation = validatePhoneNumber(phone);
        
        if (!nameValidation.isValid || !phoneValidation.isValid) {
          skipped++;
          continue;
        }

        const existingContact = ContactService.findByPhone(phoneValidation.value);
        if (existingContact) {
          skipped++;
          continue;
        }

        const contact = ContactService.createContactByGroupName(
          nameValidation.value,
          phoneValidation.value,
          groupName
        );

        if (contact) {
          imported++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.warn('Skipped vCard:', vCardContent, error);
        skipped++;
      }
    }

    return { imported, skipped };
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showImportStatus(message, type) {
    this.importStatus.innerHTML = `
      <div class="import-message ${type}">
        ${type === 'loading' ? '<span class="spinner">⏳</span>' : ''} ${message}
      </div>
    `;
  }

  escapeCsvField(field) {
    if (!field) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  getDateString() {
    const now = new Date();
    return now.getFullYear() + 
           String(now.getMonth() + 1).padStart(2, '0') + 
           String(now.getDate()).padStart(2, '0');
  }
}