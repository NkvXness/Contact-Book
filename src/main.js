// CSS is now imported directly in HTML for GitHub Pages compatibility
import { GroupManager } from './components/GroupManager.js';
import { ContactForm } from './components/ContactForm.js';
import { ContactList } from './components/ContactList.js';
import { ContactSearch } from './components/ContactSearch.js';
import { ContactImportExport } from './components/ContactImportExport.js';
import { MobileInterface } from './components/MobileInterface.js';
import { ContactService } from './services/ContactService.js';
import { GroupService } from './services/GroupService.js';
import { APP_CONFIG } from './utils/constants.js';

class ContactBookApp {
  constructor() {
    this.groupManager = null;
    this.contactForm = null;
    this.contactList = null;
    this.contactSearch = null;
    this.contactImportExport = null;
    this.mobileInterface = null;
  }

  init() {
    console.log(`${APP_CONFIG.NAME} v${APP_CONFIG.VERSION} - Starting...`);
    this.initModernMode();
  }

  initModernMode() {
    try {
      this.mobileInterface = new MobileInterface();
      this.groupManager = new GroupManager();
      this.contactForm = new ContactForm(this.groupManager);
      this.contactList = new ContactList(this.contactForm);
      this.contactSearch = new ContactSearch();
      this.contactImportExport = new ContactImportExport();
      
      this.setupComponentCommunication();
      console.log('Modern responsive architecture with full features active');
    } catch (error) {
      console.error('Failed to initialize modern mode:', error);
    }
  }

  setupComponentCommunication() {
    document.addEventListener('contactCreated', (e) => {
      console.log('Contact created:', e.detail.contact.name);
    });

    document.addEventListener('contactUpdated', (e) => {
      console.log('Contact updated:', e.detail.contact.name);
    });

    document.addEventListener('contactDeleted', (e) => {
      console.log('Contact deleted:', e.detail.contact.name);
    });

    document.addEventListener('groupCreated', (e) => {
      console.log('Group created:', e.detail.group.name);
    });

    document.addEventListener('groupDeleted', (e) => {
      console.log('Group deleted:', e.detail.group.name);
    });

    document.addEventListener('clearSearch', () => {
      this.contactSearch.clearSearch();
    });

    document.addEventListener('showAllContacts', () => {
      this.contactSearch.clearSearch();
    });

    document.addEventListener('contactsImported', (e) => {
      console.log('Contacts imported:', e.detail.imported, 'contacts');
    });
  }

  getStats() {
    return {
      contacts: ContactService.getContactCount(),
      groups: GroupService.getAllGroups().length,
      version: APP_CONFIG.VERSION
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new ContactBookApp();
  app.init();
  window.ContactBookApp = app;
});