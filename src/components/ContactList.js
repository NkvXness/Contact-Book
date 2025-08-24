import { BaseComponent } from './BaseComponent.js';
import { ContactService } from '../services/ContactService.js';
import { GroupService } from '../services/GroupService.js';
import { SELECTORS, EVENTS, CSS_CLASSES } from '../utils/constants.js';

export class ContactList extends BaseComponent {
  constructor(contactForm) {
    super();
    this.contactForm = contactForm;
    this.accordionEngine = null;
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
    
    this.on('contactCreated', () => this.render());
    this.on('contactUpdated', () => this.render());
    this.on('contactDeleted', () => this.render());
    this.on('groupCreated', () => this.render());
    this.on('groupDeleted', () => this.render());
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

    // Handle contacts without groups (legacy data)
    const ungroupedContacts = contacts.filter(contact => 
      !contact.groupId || !GroupService.findById(contact.groupId)
    );
    if (ungroupedContacts.length > 0) {
      this.renderGroupSection({ name: 'Без группы', id: 'ungrouped' }, ungroupedContacts);
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
      className: 'accordion__content',
      dataset: { contactId: contact.id }
    });

    contactDiv.innerHTML = `
      <div class="accordion__inner-content">
        <div class="line"></div>
        <div class="accordion__right-container">
          <div class="accordion__person-data">${contact.name}</div>
        </div>
        <div class="accordion__left_container">
          <div class="accordion__person-number">${contact.phone}</div>
          <span class="edit-button" data-action="edit">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.3" d="M0 15.2501V19.0001H3.75L14.81 7.94006L11.06 4.19006L0 15.2501ZM17.71 5.04006C18.1 4.65006 18.1 4.02006 17.71 3.63006L15.37 1.29006C14.98 0.900059 14.35 0.900059 13.96 1.29006L12.13 3.12006L15.88 6.87006L17.71 5.04006Z" fill="black"></path>
            </svg>
          </span>
          <span class="delete-button" data-action="delete">
            <svg width="16" height="20" fill="none" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.3" d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z" fill="black"></path>
            </svg>
          </span>
        </div>
      </div>
    `;

    return contactDiv;
  }

  handleAccordionClick(e) {
    const action = e.target.dataset.action;
    const contactElement = e.target.closest('[data-contact-id]');
    
    if (!contactElement) return;
    
    const contactId = contactElement.dataset.contactId;
    const contact = ContactService.findById(contactId);
    
    if (!contact) return;

    switch (action) {
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

  updateTitle(count) {
    if (this.mainTitle) {
      this.mainTitle.textContent = `Контактов: ${count}`;
    }
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