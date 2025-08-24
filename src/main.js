import './styles/main.css';
import { GroupManager } from '@components/GroupManager.js';
import { ContactForm } from '@components/ContactForm.js';
import { ContactService } from '@services/ContactService.js';
import { GroupService } from '@services/GroupService.js';
import { APP_CONFIG } from '@utils/constants.js';
class ContactBookApp {
  constructor() {
    this.groupManager = null;
    this.contactForm = null;
    this.isLegacyMode = true;
  }

  init() {
    console.log(`${APP_CONFIG.NAME} v${APP_CONFIG.VERSION} - Starting...`);

    if (this.isLegacyMode) {
      this.initLegacyMode();
    } else {
      this.initModernMode();
    }
  }

  async initLegacyMode() {
    try {
      await import('../app.js');
      console.log('Legacy mode active - all functionality preserved');
      this.prepareModernComponents();
    } catch (error) {
      console.error('Failed to load legacy mode:', error);
      this.initModernMode();
    }
  }

  initModernMode() {
    try {
      this.groupManager = new GroupManager();
      this.contactForm = new ContactForm(this.groupManager);
      this.setupComponentCommunication();
      this.initializeContactList();
      console.log('Modern architecture active');
    } catch (error) {
      console.error('Failed to initialize modern mode:', error);
    }
  }

  prepareModernComponents() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        console.log('Switching to modern architecture...');
        this.switchToModernMode();
      }
    });
  }

  switchToModernMode() {
    this.cleanupLegacyMode();
    this.isLegacyMode = false;
    this.initModernMode();
  }

  setupComponentCommunication() {
    document.addEventListener('groupCreated', (e) => {
      console.log('Group created:', e.detail.group.name);
    });

    document.addEventListener('groupDeleted', (e) => {
      console.log('Group deleted:', e.detail.group.name);
    });

    document.addEventListener('contactCreated', (e) => {
      console.log('Contact created:', e.detail.contact.name);
      this.refreshContactList();
    });

    document.addEventListener('contactUpdated', (e) => {
      console.log('Contact updated:', e.detail.contact.name);
      this.refreshContactList();
    });
  }

  initializeContactList() {
    this.refreshContactList();
    this.updateEmptyState();
  }

  refreshContactList() {
    const contactCount = ContactService.getContactCount();
    console.log(`Contact list refreshed - ${contactCount} contacts`);
  }

  updateEmptyState() {
    const mainTitle = document.querySelector('.main__title');
    const contactCount = ContactService.getContactCount();
    
    if (mainTitle) {
      mainTitle.textContent = contactCount === 0 
        ? 'Список контактов пуст'
        : `Контактов: ${contactCount}`;
    }
  }

  cleanupLegacyMode() {
    console.log('Cleaning up legacy mode...');
  }

  getStats() {
    return {
      contacts: ContactService.getContactCount(),
      groups: GroupService.getAllGroups().length,
      mode: this.isLegacyMode ? 'legacy' : 'modern',
      version: APP_CONFIG.VERSION
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new ContactBookApp();
  app.init();
  window.ContactBookApp = app;
});