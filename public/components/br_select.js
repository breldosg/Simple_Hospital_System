export class BrCustomSelect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        // Cache DOM elements
        this.selectElement = this.shadowRoot.querySelector('.select-options');
        this.inputElement = this.shadowRoot.querySelector('.select-search');
        this.selectedElement = this.shadowRoot.querySelector('.selected-value');
        this.dropdownElement = this.shadowRoot.querySelector('.select-dropdown');
        this.slotElement = this.shadowRoot.querySelector('slot');
        this.default_value = this.hasAttribute('value') ? this.getAttribute('value') : '';

        // Toggle dropdown
        this.selectedElement.addEventListener('click', () => this.toggleDropdown());

        // Input filtering (if search is present)
        if (this.inputElement) {
            this.inputElement.addEventListener('input', this.debounce(() => this.filterOptions(), 300));
        }

        // Handle selection of an option
        this.selectElement.addEventListener('click', (e) => {
            const tagName = e.target.tagName.toUpperCase();
            if (tagName === 'OPTION' || tagName === 'BR-OPTION') {
                this.selectOption(e.target);
            }
        });

        // Close dropdown when clicking outside
        this.handleOutsideClick = (e) => {
            if (!this.contains(e.target)) {
                this.closeDropdown();
            }
        };

        // Initialize selected option based on default value
        this.updateSelectedOption(this.slotElement.assignedElements());

        // Listen for slot content changes
        this.slotElement.addEventListener('slotchange', () => {
            this.updateSelectedOption(this.slotElement.assignedElements());
        });
    }

    render() {
        const search = this.hasAttribute('search');
        const label = this.hasAttribute('label');
        const error = this.hasAttribute('error') ? 'error' : '';
        const placeholder = this.hasAttribute('placeholder') ? this.getAttribute('placeholder') : '';

        this.shadowRoot.innerHTML = `
            <style>
                ${this.styles()}
            </style>
            ${label ? `<label>${this.getAttribute("label")}</label>` : ''}
            <div class="select-container">
                <div class="selected-value" value=''>${placeholder}</div>
                <div class="select-dropdown ${error}">
                    ${search ? `<input type="text" class="select-search" placeholder="Search...">` : ''}
                    <ul class="select-options">
                        <slot></slot>
                    </ul>
                </div>
            </div>
        `;
    }

    styles() {
        const additionalStyles = this.getAttribute('styles') || '';
        const labelStyles = this.getAttribute('labelStyles') || '';
        const fontSize = this.getAttribute('fontSize') || '';

        return `
            * { box-sizing: border-box; font-size: ${fontSize} !important; color: currentColor; }
            :host { display: block; position: relative; }
            label { ${labelStyles} }
            .selected-value { padding: 10px; border: 1px solid #ccc; cursor: pointer; background: #fff; ${additionalStyles} }
            .select-dropdown { display: none; position: absolute; top: 100%; left: 0; right: 0; border: 1px solid #ccc; background: #fff; max-height: 300px; overflow-y: auto; z-index: 1000; }
            .selected-value.error { border-color: #EE5D50; }
            .select-dropdown.open { display: block; }
            .select-search { width: 100%; padding: 10px; border: none; border-bottom: 1px solid #ccc; outline: none; }
            .select-options { list-style: none; padding: 0; margin: 0; }
            .option { padding: 10px; cursor: pointer; }
            .option:hover { background: #f0f0f0; }
        `;
    }

    debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    toggleDropdown() {
        this.dropdownElement.classList.toggle('open');
        if (this.dropdownElement.classList.contains('open')) {
            document.addEventListener('click', this.handleOutsideClick);
        } else {
            document.removeEventListener('click', this.handleOutsideClick);
        }
    }

    closeDropdown() {
        this.dropdownElement.classList.remove('open');
        document.removeEventListener('click', this.handleOutsideClick);
    }

    filterOptions() {
        const filter = this.inputElement.value.toLowerCase();
        const slotItems = this.slotElement.assignedElements();

        slotItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(filter) ? '' : 'none';
        });
    }

    selectOption(option) {
        const textContent = option.textContent;
        this.selectedElement.textContent = textContent;
        this.selectedElement.setAttribute('value', option.getAttribute('value'));
        this.closeDropdown();
        this.dispatchEvent(new CustomEvent('change', { detail: textContent }));
    }

    updateSelectedOption(elements) {
        const matchedElement = elements.find(el => el.getAttribute('value') === this.default_value);
        if (matchedElement) {
            this.selectedElement.textContent = matchedElement.textContent;
            this.selectedElement.setAttribute('value', matchedElement.getAttribute('value'));
        }
    }

    getValue() {
        return this.selectedElement.getAttribute('value');
    }

    reset() {
        this.selectedElement.textContent = this.getAttribute('placeholder') || '';
        this.selectedElement.setAttribute('value', '');
        if (this.inputElement) {
            this.inputElement.value = '';
        }
        this.filterOptions(); // Reset filtered options if search is enabled
    }

    static get observedAttributes() {
        return ['error'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'error') {
            this.shadowRoot.querySelector('.selected-value').classList.toggle('error', newValue === 'true');
        }
    }
}
