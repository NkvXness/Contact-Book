import { BaseComponent } from './BaseComponent.js';
import { ContactService } from '../services/ContactService.js';
import { GroupService } from '../services/GroupService.js';
import { SELECTORS, EVENTS, CSS_CLASSES } from '../utils/constants.js';

export class ContactList extends BaseComponent {
  constructor(contactForm) {
    super();
    this.contactForm = contactForm;
    this.accordionEngine = null;
    this.filteredContacts = [];
    this.searchState = { query: '', groupFilter: '', hasActiveFilters: false };
    this.bindElements();
    this.bindEvents();
    this.initAccordion();
    this.render();
  }

  bindElements() {
    this.accordion = this.$(SELECTORS.ACCORDION);
    this.mainTitle = this.$('.main__title');
  }

  bindEvents() {
    this.addEventListener(this.accordion, EVENTS.CLICK, (e) => this.handleAccordionClick(e));
    
    this.on('contactCreated', () => this.handleDataChange());
    this.on('contactUpdated', () => this.handleDataChange());
    this.on('contactDeleted', () => this.handleDataChange());
    this.on('groupCreated', () => this.handleDataChange());
    this.on('groupDeleted', () => this.handleDataChange());
    
    this.on('searchResults', (e) => this.handleSearchResults(e.detail));
  }

  handleDataChange() {
    this.emit('contactsChanged');
    if (this.searchState.hasActiveFilters) {
      return;
    }
    this.render();
  }

  handleSearchResults(results) {
    this.filteredContacts = results.results;
    this.searchState = {
      query: results.query,
      groupFilter: results.groupFilter,
      hasActiveFilters: results.hasActiveFilters
    };
    this.renderSearchResults();
  }

  initAccordion() {
    this.accordionEngine = new AccordionEngine(this.accordion, {
      alwaysOpen: true,
      duration: 350
    });
  }

  render() {
    const groups = GroupService.getAllGroups();
    const contacts = ContactService.getAllContacts();

    this.setHTML(this.accordion, '');
    
    if (contacts.length === 0) {
      this.updateEmptyState();
      return;
    }

    this.updateTitle(contacts.length);

    groups.forEach(group => {
      const groupContacts = contacts.filter(contact => contact.groupId === group.id);
      if (groupContacts.length > 0) {
        this.renderGroupSection(group, groupContacts);
      }
    });

    const ungroupedContacts = contacts.filter(contact => 
      !contact.groupId || !GroupService.findById(contact.groupId)
    );
    if (ungroupedContacts.length > 0) {
      this.renderGroupSection({ name: 'Без группы', id: 'ungrouped' }, ungroupedContacts);
    }
  }

  renderSearchResults() {
    this.setHTML(this.accordion, '');
    
    if (this.filteredContacts.length === 0) {
      this.updateSearchEmptyState();
      return;
    }

    this.updateSearchTitle();

    if (!this.searchState.groupFilter) {
      const groups = GroupService.getAllGroups();
      
      groups.forEach(group => {
        const groupContacts = this.filteredContacts.filter(contact => contact.groupId === group.id);
        if (groupContacts.length > 0) {
          this.renderGroupSection(group, groupContacts, true);
        }
      });

      const ungroupedContacts = this.filteredContacts.filter(contact => 
        !contact.groupId || !GroupService.findById(contact.groupId)
      );
      if (ungroupedContacts.length > 0) {
        this.renderGroupSection({ name: 'Без группы', id: 'ungrouped' }, ungroupedContacts, true);
      }
    } else {
      const group = GroupService.findById(this.searchState.groupFilter);
      if (group) {
        this.renderGroupSection(group, this.filteredContacts, true);
      }
    }
  }

  renderGroupSection(group, contacts) {
    const accordionItem = this.createElement('div', {
      className: 'accordion__item',
      dataset: { groupId: group.id }
    });

    const header = this.createElement('div', {
      className: 'accordion__header'
    }, `${group.name} (${contacts.length})`);

    const body = this.createElement('div', {
      className: 'accordion__body'
    });

    contacts.forEach(contact => {
      const contactElement = this.createContactElement(contact);
      body.appendChild(contactElement);
    });

    accordionItem.appendChild(header);
    accordionItem.appendChild(body);
    this.accordion.appendChild(accordionItem);
  }

  createContactElement(contact) {
    const contactDiv = this.createElement('div', {
      className: 'contact-item accordion__content',
      dataset: { contactId: contact.id }
    });

    contactDiv.innerHTML = `
      <div class="contact-info">
        <div class="contact-name accordion__person-data">${this.escapeHtml(contact.name)}</div>
        <div class="contact-phone accordion__person-number">${this.escapeHtml(contact.phone)}</div>
      </div>
      <div class="contact-actions accordion__left_container">
        <button class="contact-action-btn inline-edit-btn" data-action="inline-edit" title="Редактировать на месте">
          ✏️
        </button>
        <button class="contact-action-btn edit-button" data-action="edit" title="Редактировать в форме">
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.3" d="M0 15.2501V19.0001H3.75L14.81 7.94006L11.06 4.19006L0 15.2501ZM17.71 5.04006C18.1 4.65006 18.1 4.02006 17.71 3.63006L15.37 1.29006C14.98 0.900059 14.35 0.900059 13.96 1.29006L12.13 3.12006L15.88 6.87006L17.71 5.04006Z" fill="black"></path>
          </svg>
        </button>
        <button class="contact-action-btn delete-button" data-action="delete" title="Удалить контакт">
          <svg width="16" height="20" fill="none" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.3" d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z" fill="black"></path>
          </svg>
        </button>
      </div>
      <div class="line accordion__line"></div>
    `;

    return contactDiv;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  handleAccordionClick(e) {
    const action = e.target.dataset.action;
    const contactElement = e.target.closest('[data-contact-id]');
    
    if (!contactElement) return;
    
    const contactId = contactElement.dataset.contactId;
    const contact = ContactService.findById(contactId);
    
    if (!contact) return;

    switch (action) {
      case 'inline-edit':
        this.emit('startInlineEdit', { contact, contactElement });
        break;
      case 'edit':
        this.editContact(contact);
        break;
      case 'delete':
        this.deleteContact(contact);
        break;
    }
  }

  editContact(contact) {
    this.contactForm.openForm(contact);
  }

  deleteContact(contact) {
    if (confirm(`Удалить контакт ${contact.name}?`)) {
      const success = ContactService.deleteContact(contact.id);
      if (success) {
        this.emit('contactDeleted', { contact });
      }
    }
  }

  updateEmptyState() {
    if (this.mainTitle) {
      this.mainTitle.textContent = 'Список контактов пуст';
    }
  }

  updateSearchEmptyState() {
    if (this.mainTitle) {
      if (this.searchState.query || this.searchState.groupFilter) {
        this.mainTitle.textContent = 'Контакты не найдены';
        
        const emptyState = this.createElement('div', {
          className: 'search-empty-state'
        });
        
        emptyState.innerHTML = `
          <h3>По вашему запросу ничего не найдено</h3>
          <p>Попробуйте изменить поисковый запрос или выбрать другую группу</p>
          <div class="search-suggestions">
            <button class="search-suggestion" data-action="clear-search">Очистить фильтры</button>
            <button class="search-suggestion" data-action="show-all">Показать все контакты</button>
          </div>
        `;
        
        this.accordion.appendChild(emptyState);
        
        this.addEventListener(emptyState, EVENTS.CLICK, (e) => {
          if (e.target.dataset.action === 'clear-search') {
            this.emit('clearSearch');
          } else if (e.target.dataset.action === 'show-all') {
            this.emit('showAllContacts');
          }
        });
      } else {
        this.mainTitle.textContent = 'Список контактов пуст';
      }
    }
  }

  updateTitle(count) {
    if (this.mainTitle) {
      this.mainTitle.textContent = `Контактов: ${count}`;
    }
  }

  updateSearchTitle() {
    if (this.mainTitle) {
      const query = this.searchState.query;
      const count = this.filteredContacts.length;
      
      if (query) {
        this.mainTitle.innerHTML = `Результаты поиска "${query}": ${count} ${this.getContactWord(count)}`;
      } else if (this.searchState.groupFilter) {
        const group = GroupService.findById(this.searchState.groupFilter);
        this.mainTitle.textContent = `${group?.name || 'Группа'}: ${count} ${this.getContactWord(count)}`;
      } else {
        this.mainTitle.textContent = `Контактов: ${count}`;
      }
    }
  }

  getContactWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'контакт';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'контакта';
    return 'контактов';
  }
}

class AccordionEngine {
  constructor(element, config = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    this.config = {
      alwaysOpen: true,
      duration: 350,
      ...config
    };
    this.init();
  }

  init() {
    if (!this.element) return;
    this.element.addEventListener('click', (e) => this.handleClick(e));
  }

  handleClick(e) {
    const header = e.target.closest('.accordion__header');
    if (!header) return;

    const item = header.parentElement;
    if (!item) return;

    if (!this.config.alwaysOpen) {
      const openItem = this.element.querySelector('.accordion__item_show');
      if (openItem && openItem !== item) {
        this.toggle(openItem);
      }
    }

    this.toggle(item);
  }

  toggle(item) {
    if (item.classList.contains('accordion__item_show')) {
      this.hide(item);
    } else {
      this.show(item);
    }
  }

  show(item) {
    const body = item.querySelector('.accordion__body');
    if (!body || body.classList.contains('collapsing') || item.classList.contains('accordion__item_show')) {
      return;
    }

    body.style.display = 'block';
    const height = body.offsetHeight;
    body.style.height = '0';
    body.style.overflow = 'hidden';
    body.style.transition = `height ${this.config.duration}ms ease`;
    body.classList.add('collapsing');
    item.classList.add('accordion__item_slidedown');

    body.offsetHeight; // Force reflow

    body.style.height = `${height}px`;

    setTimeout(() => {
      body.classList.remove('collapsing');
      item.classList.remove('accordion__item_slidedown');
      body.classList.add('collapse');
      item.classList.add('accordion__item_show');
      body.style.display = '';
      body.style.height = '';
      body.style.transition = '';
      body.style.overflow = '';
    }, this.config.duration);
  }

  hide(item) {
    const body = item.querySelector('.accordion__body');
    if (!body || body.classList.contains('collapsing') || !item.classList.contains('accordion__item_show')) {
      return;
    }

    body.style.height = `${body.offsetHeight}px`;
    body.offsetHeight; // Force reflow
    body.style.display = 'block';
    body.style.height = '0';
    body.style.overflow = 'hidden';
    body.style.transition = `height ${this.config.duration}ms ease`;
    body.classList.remove('collapse');
    item.classList.remove('accordion__item_show');
    body.classList.add('collapsing');

    setTimeout(() => {
      body.classList.remove('collapsing');
      body.classList.add('collapse');
      body.style.display = '';
      body.style.height = '';
      body.style.transition = '';
      body.style.overflow = '';
    }, this.config.duration);
  }
}