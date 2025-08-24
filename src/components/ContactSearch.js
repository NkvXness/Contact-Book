import { BaseComponent } from './BaseComponent.js';
import { ContactService } from '../services/ContactService.js';
import { GroupService } from '../services/GroupService.js';
import { EVENTS } from '../utils/constants.js';

export class ContactSearch extends BaseComponent {
  constructor() {
    super();
    this.searchInput = null;
    this.groupFilter = null;
    this.clearButton = null;
    this.createSearchUI();
    this.bindEvents();
  }

  createSearchUI() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    searchContainer.innerHTML = `
      <div class="search-wrapper">
        <div class="search-field">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Поиск по имени или номеру телефона..."
            autocomplete="off"
          >
          <button class="search-clear" type="button" title="Очистить поиск">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="filter-field">
          <select class="group-filter">
            <option value="">Все группы</option>
          </select>
        </div>
        <div class="search-stats">
          <span class="results-count">Найдено: <strong>0</strong> контактов</span>
        </div>
      </div>
    `;

    const mainWrapper = document.querySelector('.main__wrapper');
    if (mainWrapper) {
      mainWrapper.insertBefore(searchContainer, mainWrapper.firstChild);
    }

    this.searchInput = searchContainer.querySelector('.search-input');
    this.groupFilter = searchContainer.querySelector('.group-filter');
    this.clearButton = searchContainer.querySelector('.search-clear');
    this.resultsCount = searchContainer.querySelector('.results-count');
    
    this.updateGroupOptions();
  }

  bindEvents() {
    let searchTimeout;
    
    this.addEventListener(this.searchInput, EVENTS.INPUT, () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 300);
    });

    this.addEventListener(this.groupFilter, EVENTS.CHANGE, () => {
      this.performSearch();
    });

    this.addEventListener(this.clearButton, EVENTS.CLICK, () => {
      this.clearSearch();
    });

    this.addEventListener(this.searchInput, EVENTS.KEYDOWN, (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });

    this.on('contactsChanged', () => {
      this.updateGroupOptions();
      this.performSearch();
    });
  }

  performSearch() {
    const query = this.searchInput.value.trim();
    const selectedGroup = this.groupFilter.value;
    
    const results = this.searchContacts(query, selectedGroup);
    
    this.updateResultsCount(results.length);
    this.updateClearButtonVisibility();
    
    this.emit('searchResults', {
      results,
      query,
      groupFilter: selectedGroup,
      hasActiveFilters: this.hasActiveFilters()
    });
  }

  searchContacts(query, groupFilter = '') {
    let contacts = ContactService.getAllContacts();
    
    if (groupFilter) {
      contacts = contacts.filter(contact => contact.groupId === groupFilter);
    }
    
    if (!query) {
      return contacts;
    }
    
    const normalizedQuery = this.normalizeSearchTerm(query);
    
    return contacts.filter(contact => {
      const normalizedName = this.normalizeSearchTerm(contact.name);
      const normalizedPhone = this.normalizeSearchTerm(contact.phone);
      
      return normalizedName.includes(normalizedQuery) || 
             normalizedPhone.includes(normalizedQuery);
    });
  }

  normalizeSearchTerm(term) {
    return term.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  clearSearch() {
    this.searchInput.value = '';
    this.groupFilter.value = '';
    this.performSearch();
    this.searchInput.focus();
  }

  updateGroupOptions() {
    if (!this.groupFilter) return;
    
    const currentValue = this.groupFilter.value;
    const groups = GroupService.getAllGroups();
    
    this.groupFilter.innerHTML = '<option value="">Все группы</option>';
    
    groups.forEach(group => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.name;
      this.groupFilter.appendChild(option);
    });
    
    if (currentValue && groups.some(g => g.id === currentValue)) {
      this.groupFilter.value = currentValue;
    }
  }

  updateResultsCount(count) {
    if (this.resultsCount) {
      const word = this.getContactWord(count);
      this.resultsCount.innerHTML = `Найдено: <strong>${count}</strong> ${word}`;
    }
  }

  getContactWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'контакт';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'контакта';
    return 'контактов';
  }

  updateClearButtonVisibility() {
    const hasQuery = this.searchInput.value.trim().length > 0;
    const hasGroupFilter = this.groupFilter.value !== '';
    
    if (hasQuery || hasGroupFilter) {
      this.clearButton.style.opacity = '1';
      this.clearButton.style.pointerEvents = 'auto';
    } else {
      this.clearButton.style.opacity = '0';
      this.clearButton.style.pointerEvents = 'none';
    }
  }

  hasActiveFilters() {
    return this.searchInput.value.trim().length > 0 || this.groupFilter.value !== '';
  }

  getSearchState() {
    return {
      query: this.searchInput.value.trim(),
      groupFilter: this.groupFilter.value,
      hasActiveFilters: this.hasActiveFilters()
    };
  }

  setSearchQuery(query) {
    this.searchInput.value = query;
    this.performSearch();
  }

  setGroupFilter(groupId) {
    this.groupFilter.value = groupId;
    this.performSearch();
  }

  focusSearch() {
    this.searchInput?.focus();
  }
}