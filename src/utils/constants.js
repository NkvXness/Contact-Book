export const APP_CONFIG = {
  NAME: 'Contact Book',
  VERSION: '3.0.0',
  AUTHOR: 'NkvXness'
};

export const STORAGE_KEYS = {
  CONTACTS: 'contacts',
  GROUPS: {
    INPUT: 'input-groups',
    OPTIONS: 'option-groups', 
    ACCORDION: 'accordion-groups'
  },
  SETTINGS: 'app-settings',
  THEME: 'theme-preference'
};

export const TEMPLATES = {
  GROUP_INPUT: `
    <input type="text" class="groupInput" placeholder="Введите название">
    <span class="deleteButton">
      <svg width="16" height="20" fill="none" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.3" d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z" fill="black">
        </path>
      </svg>
    </span>
  `,
  
  GROUP_OPTION: `
    <div class="option">
      <input type="radio" class="radio" name="category">
      <label class="option-label"></label>
    </div>
  `,
  
  ACCORDION_ITEM: `
    <div class="accordion__item">
      <div class="accordion__header"></div>
      <div class="accordion__body"></div>
    </div>
  `,
  
  CONTACT_ITEM: `
    <div class="accordion__content">
      <div class="accordion__inner-content">
        <div class="line"></div>
        <div class="accordion__right-container">
          <div class="accordion__person-data"></div>
        </div>
        <div class="accordion__left_container">
          <div class="accordion__person-number"></div>
          <span id="editButton">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.3" d="M0 15.2501V19.0001H3.75L14.81 7.94006L11.06 4.19006L0 15.2501ZM17.71 5.04006C18.1 4.65006 18.1 4.02006 17.71 3.63006L15.37 1.29006C14.98 0.900059 14.35 0.900059 13.96 1.29006L12.13 3.12006L15.88 6.87006L17.71 5.04006Z" fill="black"></path>
            </svg>
          </span>
          <span id="accDeleteButton">
            <svg width="16" height="20" fill="none" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.3" d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z" fill="black"></path>
            </svg>
          </span>
        </div>
      </div>
    </div>
  `
};

export const CSS_CLASSES = {
  // Modal states
  MODAL_OPEN: 'open',
  MODAL_HIDE: 'hide',
  ADD_OPEN: 'add__open',
  HIDE_OPTION: 'hide-option',
  
  // Background states
  BACKGROUND_ACTIVE: 'bg',
  
  // Accordion states
  ACCORDION_SHOW: 'accordion__item_show',
  ACCORDION_SLIDEDOWN: 'accordion__item_slidedown',
  COLLAPSING: 'collapsing',
  COLLAPSE: 'collapse',
  
  // Form states
  NON_SELECTABLE: 'non-selectable',
  ACTIVE: 'active',
  
  // Button and UI elements
  DELETE_BUTTON: 'deleteButton',
  GROUP_INPUT: 'groupInput',
  OPTION: 'option',
  RADIO: 'radio',
  OPTION_LABEL: 'option-label'
};

export const SELECTORS = {
  // Buttons
  GROUPS_BUTTON: '.groups',
  CROSS_BUTTON: '.contact__groups-cross',
  CROSS_ADD_BUTTON: '.contact__add-cross',
  ADD_BUTTON: '.add',
  SAVE_BUTTON: '.save',
  ADD_CONTACT: '.add-contact',
  SAVE_CONTACT_BUTTON: '.contact__save-button',
  
  // Containers
  CONTACT_GROUPS: '.contact__groups',
  CONTACT_ADD: '.contact__add',
  DARK_BG: '.dark-bg',
  CONTACT_GROUPS_BODY: '.contact__groups-body',
  ACCORDION: '.accordion',
  OPTIONS_CONTAINER: '.options-container',
  
  // Form elements
  SELECTED: '.selected',
  ADD_NAME: '.addName',
  ADD_PHONE_NUMBER: '.addPhoneNumber',
  
  // Dynamic elements
  GROUP_INPUT: '.groupInput',
  OPTION: '.option',
  OPTION_LABEL: '.option-label',
  ACCORDION_ITEM: '.accordion__item',
  ACCORDION_HEADER: '.accordion__header',
  ACCORDION_BODY: '.accordion__body',
  ACCORDION_PERSON_DATA: '.accordion__person-data',
  ACCORDION_PERSON_NUMBER: '.accordion__person-number'
};

export const EVENTS = {
  CLICK: 'click',
  KEYPRESS: 'keypress',
  INPUT: 'input',
  FOCUS: 'focus',
  BLUR: 'blur',
  KEYDOWN: 'keydown',
  SUBMIT: 'submit',
  CHANGE: 'change',
  DOM_CONTENT_LOADED: 'DOMContentLoaded'
};

export const KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  SPACE: ' '
};

export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  GROUP_NAME_MAX_LENGTH: 50,
  PHONE_LENGTH: 11,
  PHONE_VALID_STARTS: ['7', '8']
};

export const ANIMATION = {
  DURATION: 350,
  EASING: 'ease'
};

export const MESSAGES = {
  EMPTY_CONTACTS: 'Список контактов пуст',
  GROUP_EXISTS: 'Группа с таким названием уже существует',
  CONTACT_EXISTS: 'Контакт с таким номером уже существует',
  GROUP_NOT_FOUND: 'Группа не найдена',
  CONTACT_NOT_FOUND: 'Контакт не найден',
  INVALID_NAME: 'Некорректное имя',
  INVALID_PHONE: 'Некорректный номер телефона',
  INVALID_GROUP: 'Некорректное название группы'
};