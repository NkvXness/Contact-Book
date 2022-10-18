/*-----------------------------Buttons-----------------------------*/
const groupsButton = document.querySelector('.groups');
const crossButton = document.querySelector('.contact__groups-cross');
const crossAddButton = document.querySelector('.contact__add-cross');
const addButton = document.querySelector('.add');
const saveButton = document.querySelector('.save');
const addContact = document.querySelector('.add-contact');
const saveContactButton = document.querySelector('.contact__save-button');

/*----------------------------Elements----------------------------*/
const contactGroups = document.querySelector('.contact__groups');
const contactAdd = document.querySelector('.contact__add');
const bg = document.querySelector('.dark-bg');
const contactGroupsBody = document.querySelector('.contact__groups-body');
const accordion = document.querySelector('.accordion');
const selected = document.querySelector('.selected');
const optionsContainer = document.querySelector('.options-container');
const optionList = document.querySelectorAll('.option');

const accordionPersonName = document.querySelector('.accordion__person-data');
const accordionPersonNumber = document.querySelector('.accordion__person-number');
const inputNameField = document.querySelector('.addName');
const inputPhoneField = document.querySelector('.addPhoneNumber');

const inputGroupTemplate = `<input type="text" class="groupInput" placeholder="Введите название">
                             <span class="deleteButton">
                                 <svg width="16" height="20" fill="none" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg">
                                     <path opacity="0.3" d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z" fill="black">
                                     </path>
                                 </svg>
                             </span>`;

const optionTemplate = `<div class="option">
                             <input type="radio" class="radio" name="category">
                             <label class="option-label"></label>
                         </div>`;

const accordionTemplate = `<div class="accordion__item">
                                <div class="accordion__header"></div>
                                <div class="accordion__body"></div>
                            </div>`;

/*-----------------------LocalStorage Data-----------------------*/
let inputGroups = JSON.parse(localStorage.getItem('input-groups'));
let accordionGroups = JSON.parse(localStorage.getItem('accordion-groups'));
let optionGroups = JSON.parse(localStorage.getItem('option-groups'));

/*------------------------------App------------------------------*/

class GroupInput {
    constructor(template = inputGroupTemplate) {
        this.template = template;

        this.element = document.createElement('div');
        this.element.className = 'contact__groups-field';
        this.element.innerHTML = template;
        document.querySelector('.contact__groups-body').appendChild(this.element);
    }
}

class Option {
    constructor(template = optionTemplate) {
        this.template = template;

        const newOption = document.createRange().createContextualFragment(this.template);
        optionsContainer.appendChild(newOption);
    }
}

class Contact {
    constructor(name, number, option) {
        this.name = name;
        this.number = number;
        this.option = option;
    }
}

class Accordion {
    constructor(template = accordionTemplate) {
        this.template = template;

        const newAccordion = document.createRange().createContextualFragment(this.template);
        accordion.appendChild(newAccordion);
    }
}

class AccordionEngine {
    constructor(target, config) {
        this._el = typeof target === 'string' ? document.querySelector(target) : target;
        const defaultConfig = {
            alwaysOpen: true,
            duration: 350
        };
        this._config = Object.assign(defaultConfig, config);
        this.addEventListener();
    }
    addEventListener() {
        this._el.addEventListener('click', (e) => {
            const elHeader = e.target.closest('.accordion__header');
            if (!elHeader) {
                return;
            }
            if (!this._config.alwaysOpen) {
                const elOpenItem = this._el.querySelector('.accordion__item_show');
                if (elOpenItem) {
                    elOpenItem !== elHeader.parentElement ? this.toggle(elOpenItem) : null;
                }
            }
            this.toggle(elHeader.parentElement);
        });
    }
    show(el) {
        const elBody = el.querySelector('.accordion__body');
        if (elBody.classList.contains('collapsing') || el.classList.contains('accordion__item_show')) {
            return;
        }
        elBody.style['display'] = 'block';
        const height = elBody.offsetHeight;
        elBody.style['height'] = 0;
        elBody.style['overflow'] = 'hidden';
        elBody.style['transition'] = `height ${this._config.duration}ms ease`;
        elBody.classList.add('collapsing');
        el.classList.add('accordion__item_slidedown');
        elBody.offsetHeight;
        elBody.style['height'] = `${height}px`;
        window.setTimeout(() => {
            elBody.classList.remove('collapsing');
            el.classList.remove('accordion__item_slidedown');
            elBody.classList.add('collapse');
            el.classList.add('accordion__item_show');
            elBody.style['display'] = '';
            elBody.style['height'] = '';
            elBody.style['transition'] = '';
            elBody.style['overflow'] = '';
        }, this._config.duration);
    }
    hide(el) {
        const elBody = el.querySelector('.accordion__body');
        if (elBody.classList.contains('collapsing') || !el.classList.contains('accordion__item_show')) {
            return;
        }
        elBody.style['height'] = `${elBody.offsetHeight}px`;
        elBody.offsetHeight;
        elBody.style['display'] = 'block';
        elBody.style['height'] = 0;
        elBody.style['overflow'] = 'hidden';
        elBody.style['transition'] = `height ${this._config.duration}ms ease`;
        elBody.classList.remove('collapse');
        el.classList.remove('accordion__item_show');
        elBody.classList.add('collapsing');
        window.setTimeout(() => {
            elBody.classList.remove('collapsing');
            elBody.classList.add('collapse');
            elBody.style['display'] = '';
            elBody.style['height'] = '';
            elBody.style['transition'] = '';
            elBody.style['overflow'] = '';
        }, this._config.duration);
    }
    toggle(el) {
        el.classList.contains('accordion__item_show') ? this.hide(el) : this.show(el);
    }
}

new AccordionEngine(document.querySelector('.accordion'), {
    alwaysOpen: true
});

class UI {
    static showInput() {
        let newElement = '';
        if (!inputGroups) inputGroups = [];
        inputGroups.forEach((val, i) => {
            newElement += val.dom;
        });
        contactGroupsBody.innerHTML = newElement;
    }

    static deleteInput(el) {
        if (el.classList.contains('deleteButton')) {
            el.parentElement.remove();
        }
    }

    static addInputElement(e) {
        const {
            value
        } = e.target;
        if (e.key === 'Enter' && e.target.hasAttribute('value')) {
            e.target.setAttribute('value', `${{value}.value}`);
            let inputGroupsValues = inputGroups.map(v => v.value);
            let newGroupValues = [...document.querySelectorAll('.groupInput')].map(v => v.defaultValue);
            let newGropDOMs = [...document.querySelectorAll('.groupInput')].map(v => v.parentNode.outerHTML);

            if (inputGroups) inputGroups = [];

            for (let i = 0; i < inputGroupsValues.length; i++) {
                let inputData = {
                    value: newGroupValues[i],
                    dom: newGropDOMs[i],
                }
                inputGroups.push(inputData);
            }

            inputGroups = inputGroups.reduce((acc, e) => {
                if (!acc.find(item => item.value == e.value && item.dom == e.dom)) {
                    acc.push(e);
                }
                return acc;
            }, []);

            localStorage.setItem('input-groups', JSON.stringify(inputGroups));
            UI.addOptionElement();
            UI.selectOption();
            UI.addAccordionElement();
        } else if (e.key === 'Enter' && e.target.className == 'groupInput') {
            e.target.setAttribute('value', `${{value}.value}`);
            if (!inputGroups) inputGroups = [];
            let inputData = {
                value: e.target.value,
                dom: e.target.parentNode.outerHTML,
            }
            inputGroups.push(inputData);
            localStorage.setItem('input-groups', JSON.stringify(inputGroups));
            UI.addOptionElement();
        }
    }

    static addOptionElement() {
        inputGroups.forEach(el => {
            if (!document.querySelector('.option')) {
                new Option();
            } else {
                let elems = document.querySelectorAll('.option-label');
                let res = Array.from(elems).find(v => v.textContent == el.value);
                if (!res) new Option();
            }
        });

        let groupsNameArr = inputGroups.map(v => v.value);

        for (let i = 0; i < document.querySelectorAll('.option-label').length; i++) {
            document.querySelectorAll('.option-label')[i].innerHTML = groupsNameArr[i];
            document.querySelectorAll('.radio')[i].setAttribute('id', `${groupsNameArr[i]}`);
            document.querySelectorAll('.option-label')[i].setAttribute('for', `${groupsNameArr[i]}`);
        }

        [...document.querySelectorAll('.option-label')].forEach(v => {
            if (v.innerText == 'undefined') {
                v.parentElement.remove();
            }
        });

        if (!optionGroups || optionGroups) {
            optionGroups = [];
            for (let i = 0; i < inputGroups.length; i++) {
                let optionsData = {
                    value: groupsNameArr[i],
                    dom: [...document.querySelectorAll('.option')][i].outerHTML,
                }
                optionGroups.push(optionsData);
            }
        }

        optionGroups = optionGroups.reduce((acc, e) => {
            if (!acc.find(item => item.value == e.value && item.dom == e.dom)) {
                acc.push(e);
            }
            return acc;
        }, []);

        localStorage.setItem('option-groups', JSON.stringify(optionGroups));

        this.selectOption();
    }

    static showOption() {
        let newElement = '';
        if (!optionGroups) optionGroups = [];
        optionGroups.forEach((val, i) => {
            newElement += val.dom;
        });
        optionsContainer.innerHTML = newElement;
    }

    static selectOption() {
        [...document.querySelectorAll('.option')].forEach(v => {
            v.addEventListener('click', (e) => {
                selected.innerHTML = v.querySelector('.option-label').innerHTML;
                optionsContainer.classList.remove('active');
            });
        });
    }

    static showAccordion() {
        let newElement = '';
        if (!accordionGroups) accordionGroups = [];
        accordionGroups.forEach((val, i) => {
            newElement += val.dom;
        });
        accordion.innerHTML = newElement;
    }

    static addAccordionElement() {
        inputGroups.forEach(el => {
            if (!document.querySelector('.accordion__item')) {
                new Accordion();
            } else {
                let elems = document.querySelectorAll('.accordion__header');
                let res = Array.from(elems).find(v => v.textContent == el.value);
                if (!res) new Accordion();
            }
        });

        let groupsNameArr = inputGroups.map(v => v.value);

        for (let i = 0; i < document.querySelectorAll('.accordion__header').length; i++) {
            document.querySelectorAll('.accordion__header')[i].innerHTML = groupsNameArr[i];
        }

        [...document.querySelectorAll('.accordion__header')].forEach(v => {
            if (v.innerText == 'undefined') {
                v.parentElement.remove();
            }
        });

        if (!accordionGroups || accordionGroups) {
            accordionGroups = [];
            for (let i = 0; i < inputGroups.length; i++) {
                let accordionData = {
                    value: groupsNameArr[i],
                    dom: [...document.querySelectorAll('.accordion__item')][i].outerHTML,
                }
                accordionGroups.push(accordionData);
            }
        }

        accordionGroups = accordionGroups.reduce((acc, e) => {
            if (!acc.find(item => item.value == e.value && item.dom == e.dom)) {
                acc.push(e);
            }
            return acc;
        }, []);

        localStorage.setItem('accordion-groups', JSON.stringify(accordionGroups));
    }

    static addContactToAccordion(contact) {
        let accordionContentTemplate = `<div class="accordion__content">
                                            <div class="accordion__inner-content">
                                            <div class="line"></div>
                                                <div class="accordion__right-container">
                                                    <div class="accordion__person-data">${contact.name}</div>
                                                </div>
                                                <div class="accordion__left_container">
                                                    <div class="accordion__person-number">${contact.number}</div>
                                                    <span id="editButton">
                                                        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path opacity="0.3"
                                                                d="M0 15.2501V19.0001H3.75L14.81 7.94006L11.06 4.19006L0 15.2501ZM17.71 5.04006C18.1 4.65006 18.1 4.02006 17.71 3.63006L15.37 1.29006C14.98 0.900059 14.35 0.900059 13.96 1.29006L12.13 3.12006L15.88 6.87006L17.71 5.04006Z"
                                                                fill="black"></path>
                                                        </svg>
                                                    </span>
                                                    <span id="accDeleteButton">
                                                        <svg width="16" height="20" fill="none" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path opacity="0.3"
                                                                d="M1.66664 17.3889C1.66664 18.55 2.61664 19.5 3.77775 19.5H12.2222C13.3833 19.5 14.3333 18.55 14.3333 17.3889V4.72222H1.66664V17.3889ZM4.26331 9.87333L5.75164 8.385L7.99997 10.6228L10.2378 8.385L11.7261 9.87333L9.48831 12.1111L11.7261 14.3489L10.2378 15.8372L7.99997 13.5994L5.7622 15.8372L4.27386 14.3489L6.51164 12.1111L4.26331 9.87333ZM11.6944 1.55556L10.6389 0.5H5.36108L4.30553 1.55556H0.611084V3.66667H15.3889V1.55556H11.6944Z"
                                                                fill="black"></path>
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>`;

        const newAccordionContent = document.createRange().createContextualFragment(accordionContentTemplate);
        let accordionTitle = document.querySelectorAll('.accordion__header');

        for (let i = 0; i < accordionTitle.length; i++) {
            if (accordionTitle[i].innerText === contact.option && document.querySelector('.addName').getAttribute('value') === '') {
                document.querySelectorAll('.accordion__body')[i].appendChild(newAccordionContent);
                UI.addAccordionElement();
            }
        }
    }

    static deleteAccordionContent(el) {
        if (el.id === 'accDeleteButton') {
            el.parentElement.parentElement.parentElement.remove();
            UI.addAccordionElement();
        } else if (el.id === 'editButton') {
            UI.contactToggleLogic();
            document.querySelector('.addName').setAttribute('value', el.parentElement.previousElementSibling.innerText);
            document.querySelector('.addPhoneNumber').setAttribute('value', el.previousElementSibling.innerText);

            document.querySelector('.addName').value = el.parentElement.previousElementSibling.innerText;
            document.querySelector('.addPhoneNumber').value = el.previousElementSibling.innerText;
            document.querySelector('.selected').innerText = el.parentElement.parentElement.parentElement.parentElement.previousElementSibling.innerText;
            document.querySelector('.selected').classList.add('non-selectable');
        }
    }

    static editContactField() {
        let nameAttr = document.querySelector('.addName').getAttribute('value');
        let targetName = [...document.querySelectorAll(".accordion__person-data")].filter(v => v.textContent.includes(nameAttr));

        let numberAttr = document.querySelector('.addPhoneNumber').getAttribute('value');
        let targetNumber = [...document.querySelectorAll(".accordion__person-number")].filter(v => v.textContent.includes(numberAttr));

        if (targetName[0].innerText === nameAttr) targetName[0].innerText = document.querySelector('.addName').value;
        if (targetNumber[0].innerText === numberAttr) targetNumber[0].innerText = document.querySelector('.addPhoneNumber').value;
        UI.addAccordionElement();
    }

    static contactToggleLogic() {
        contactAdd.classList.toggle('add__open');
        contactGroups.classList.toggle('hide-option');
        bg.classList.toggle('bg');
        selected.innerHTML = 'Выберите группу';
    }
}

UI.showInput();
UI.showOption();
UI.selectOption();
UI.showAccordion();

class Store {
    static removeInput(value) {
        inputGroups.forEach((input, idx) => {
            if (input.value === value) inputGroups.splice(idx, 1);
        });

        localStorage.setItem('input-groups', JSON.stringify(inputGroups));
    }

    static removeOption(value) {
        optionGroups.forEach((option, idx) => {
            if (option.value === value) optionGroups.splice(idx, 1);
        });

        localStorage.setItem('option-groups', JSON.stringify(optionGroups));
        UI.showOption();
        UI.selectOption();
    }

    static removeAccordion(value) {
        accordionGroups.forEach((accordion, idx) => {
            if (accordion.value === value) accordionGroups.splice(idx, 1);
        });

        localStorage.setItem('accordion-groups', JSON.stringify(accordionGroups));
        UI.showAccordion();
    }
}

const toggleLogic = function() {
    contactGroups.classList.toggle('open');
    contactAdd.classList.toggle('hide');
    bg.classList.toggle('bg');
}

const contactToggleLogic = function() {
    contactAdd.classList.toggle('add__open');
    contactGroups.classList.toggle('hide-option');
    bg.classList.toggle('bg');
    selected.innerHTML = 'Выберите группу';
    document.querySelector('.addName').setAttribute('value', '');
    document.querySelector('.addPhoneNumber').setAttribute('value', '');
    document.querySelector('.selected').classList.remove('non-selectable');
}

/*-------------------------Event Listeners-------------------------*/

groupsButton.addEventListener('click', () => toggleLogic());

addContact.addEventListener('click', () => {
    document.querySelector('.addName').value = '';
    document.querySelector('.addPhoneNumber').value = '';
    contactToggleLogic();
});

crossButton.addEventListener('click', () => {
    toggleLogic();
    document.querySelectorAll('.groupInput').forEach(el => el.hasAttribute('value') ? el : el.parentNode.remove());
});

crossAddButton.addEventListener('click', () => contactToggleLogic());

addButton.addEventListener('click', () => new GroupInput());

document.addEventListener('keypress', (e) => UI.addInputElement(e));

contactGroupsBody.addEventListener('click', (e) => {
    UI.deleteInput(e.target);

    if (e.target.value == null) Store.removeInput(e.target.previousElementSibling.value);

    if (e.target.value == null) Store.removeOption(e.target.previousElementSibling.value);

    if (e.target.value == null) Store.removeAccordion(e.target.previousElementSibling.value);
});

saveButton.addEventListener('click', () => UI.addAccordionElement());

document.querySelector('.accordion').addEventListener('click', (e) => {
    UI.deleteAccordionContent(e.target);
});

selected.addEventListener('click', () => {
    optionsContainer.classList.toggle('active');
    [...document.querySelectorAll('.option')].length < 7 ? optionsContainer.style.overflowY = 'hidden' : optionsContainer.style.overflowY = 'scroll';
});

saveContactButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Get form values
    const name = document.querySelector('.addName').value;
    const number = document.querySelector('.addPhoneNumber').value;
    const option = document.querySelector('.selected').innerText;

    const contact = new Contact(name, number, option);

    UI.addContactToAccordion(contact);

    UI.editContactField();

    UI.contactToggleLogic();
});

window.addEventListener("DOMContentLoaded", function() {
    [].forEach.call(document.querySelectorAll('.addPhoneNumber'), function(input) {
        let keyCode;

        function mask(event) {
            event.keyCode && (keyCode = event.keyCode);
            let pos = this.selectionStart;
            if (pos < 3) event.preventDefault();
            let matrix = "+7 (___) ___-__-__",
                i = 0,
                def = matrix.replace(/\D/g, ""),
                val = this.value.replace(/\D/g, ""),
                new_value = matrix.replace(/[_\d]/g, function(a) {
                    return i < val.length ? val.charAt(i++) || def.charAt(i) : a
                });
            i = new_value.indexOf("_");
            if (i != -1) {
                i < 5 && (i = 3);
                new_value = new_value.slice(0, i)
            }
            let reg = matrix.substr(0, this.value.length).replace(/_+/g,
                function(a) {
                    return "\\d{1," + a.length + "}"
                }).replace(/[+()]/g, "\\$&");
            reg = new RegExp("^" + reg + "$");
            if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
            if (event.type == "blur" && this.value.length < 5) this.value = ""
        }

        input.addEventListener("input", mask, false);
        input.addEventListener("focus", mask, false);
        input.addEventListener("blur", mask, false);
        input.addEventListener("keydown", mask, false)

    });

});
