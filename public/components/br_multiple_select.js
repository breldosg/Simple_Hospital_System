export class BrCustomMultipleSelect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.selectedValues = []; // Track selected values
        this.choiceElements = []; // Track choice elements for easy reset
        this.render();
    }

    connectedCallback() {
        this.addEventListeners();
    }

    render() {
        const label = this.hasAttribute('label') ? this.getAttribute('label') : false;
        const search = this.hasAttribute('search');

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.jsdelivr.net/gh/breldosg/Xt-style-pack@main/icons/style.css');
                ${this.styles()}
            </style>
            ${label ? `<label>${label}</label>` : ''}
            <div id="show" class="show"></div>
            <div class="selections_out">
                ${search ? `<input type="text" id="search" placeholder="Search...">` : ''}
                <div class="options">
                    <slot></slot>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const showContainer = this.shadowRoot.querySelector('.show');
        showContainer.addEventListener('click', () => this.openDropdown());

        const searchInput = this.shadowRoot.querySelector('#search');
        if (searchInput) searchInput.addEventListener('input', (e) => this.filterOptions(e));

        const slot = this.shadowRoot.querySelector('slot');
        slot.addEventListener('slotchange', () => this.initOptions());

        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) this.closeDropdown();
        });
    }

    openDropdown() {
        this.shadowRoot.querySelector('.selections_out').classList.add('active');
    }

    closeDropdown() {
        this.shadowRoot.querySelector('.selections_out').classList.remove('active');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'error') {
            this.shadowRoot.querySelector('.show').classList.toggle('error', newValue === 'true');
        }
    }

    static get observedAttributes() {
        return ['error'];
    }

    filterOptions(event) {
        const searchValue = event.target.value.toLowerCase();
        const options = this.shadowRoot.querySelector('slot').assignedElements();
        options.forEach(option => {
            option.style.display = option.textContent.toLowerCase().includes(searchValue) ? 'block' : 'none';
        });
    }

    initOptions() {
        const options = this.shadowRoot.querySelector('slot').assignedElements();
        options.forEach(option => {
            option.addEventListener('click', () => this.selectOption(option));
            if (option.hasAttribute('selected') || option.hasAttribute('Selected')) {
                this.selectOption(option);
            }
        });
    }

    selectOption(option) {
        option.setAttribute('selected', 'true');
        const value = option.getAttribute('value');
        const text = option.textContent;

        if (!this.selectedValues.includes(value)) {
            this.selectedValues.push(value);
            this.addSelectedChoice(text, value);
        }
    }

    addSelectedChoice(text, value) {
        const showContainer = this.shadowRoot.querySelector('.show');
        const choice = document.createElement('div');
        choice.classList.add('choice');
        choice.innerHTML = `
            <p>${text}</p>
            <div class="close"><span class="switch_icon_close"></span></div>
        `;
        this.choiceElements.push(choice);

        choice.querySelector('.close').addEventListener('click', () => {
            this.removeChoice(value, choice);
        });

        showContainer.appendChild(choice);
    }

    removeChoice(value, choiceElement) {
        this.selectedValues = this.selectedValues.filter(val => val !== value);
        choiceElement.remove();

        const options = this.shadowRoot.querySelector('slot').assignedElements();
        options.forEach(option => {
            if (option.getAttribute('value') === value) {
                option.removeAttribute('selected');
            }
        });
    }

    getValue() {
        return this.selectedValues;
    }

    // Method to reset the component
    reset() {
        this.selectedValues = [];
        
        const options = this.shadowRoot.querySelector('slot').assignedElements();
        options.forEach(option => option.removeAttribute('selected'));

        const showContainer = this.shadowRoot.querySelector('.show');
        this.choiceElements.forEach(choiceElement => showContainer.removeChild(choiceElement));
        
        this.choiceElements = [];
    }

    styles() {
        return `
            :host {
                width: fit-content;
                position: relative;
            }

            ::-webkit-scrollbar { width: 10px; }
            ::-webkit-scrollbar-thumb { background-color: #dbdbdb; border-radius: 5px; }

            .show {
                width: 350px;
                min-height: 30px;
                border: 1px solid #ccc;
                padding: 5px;
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }

            .show.error { border-color: #EE5D50; }

            .choice {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 10px;
                height: 30px;
                border-radius: 7px;
                background-color: #dbdbdb;
                gap: 10px;
                width: fit-content;
                max-width: 150px;
            }

            .choice p {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                margin: 0;
            }

            .close {
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .selections_out {
                z-index: 1;
                top: 100%;
                left: 0;
                position: absolute;
                width: 100%;
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
                background-color: white;
            }

            .selections_out.active {
                max-height: 300px;
                overflow: visible;
                border: 1px solid #ccc;
            }

            #search {
                width: 100%;
                padding: 10px;
                box-sizing: border-box;
                margin-bottom: 5px;
                border: 1px solid #ccc;
            }

            .options {
                max-height: 250px;
                overflow-y: auto;
            }
        `;
    }
}
