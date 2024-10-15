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
            this.inputElement.addEventListener('input', () => this.filterOptions());
        }

        // Handle selection of an option
        this.selectElement.addEventListener('click', (e) => {
            const tagName = e.target.tagName.toUpperCase();
            if (tagName === 'OPTION' || tagName === 'BR-OPTION') {
                this.selectOption(e.target);
            } else {

            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Handle assigned elements
        const elements = this.slotElement.assignedElements();


        elements.forEach(element => {
            const value = element.getAttribute('value');
            if (value == this.default_value) {
                // Set initial selected value
                this.selectedElement.textContent = element.textContent;
                this.selectedElement.setAttribute('value', value);
            }
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
            <label></label>
            ${label ? `
                <label>${this.getAttribute("label")}</label>` : ''
            }
            <div class="select-container">
                <div class="selected-value" value=''>${placeholder}</div>
                <div class="select-dropdown ${error}">
                ${search ? `
                        <input type="text" class="select-search" autofocus placeholder="Search...">
                    ` : ''
            }
                    <ul class="select-options">
                        <slot></slot>
                    </ul>
                </div>
            </div>
        `;
    }

    // dropdown styles
    styles() {

        const additionalStyles = this.getAttribute('styles') || '';
        const labelStyles = this.getAttribute('labelStyles') || '';
        const fontSize = this.getAttribute('fontSize') || '';

        return `
                * {
                    box-sizing: border-box;
                    font-size: ${fontSize} !important;
                    color: currentColor;
                    font-family: inherit;
                    padding: 0;
                    margin: 0;
                }
                :host {
                    display: block;
                    position: relative;
                }
                ::-webkit-scrollbar {
                    width: 0;
                    height: 0;
                }
                label{
                    ${labelStyles}
                }
                ::-webkit-scrollbar-thumb {
                    background-color: transparent;
                }
                .selected-value {
                    padding: 10px;
                    border: 1px solid #ccc;
                    cursor: pointer;
                    background: #fff;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    display: inline-block;
                    ${additionalStyles}

                }
                .select-dropdown {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    border: 1px solid #ccc;
                    background: #fff;
                    z-index: 1000;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .selected-value.error{
                    border-color:  #EE5D50;
                }
                .select-dropdown.open {
                    display: block;
                }
                .select-search {
                    width: 100%;
                    padding: 10px;
                    box-sizing: border-box;
                    border: none;
                    border-bottom: 1px solid #ccc;
                    outline: none;
                }
                .select-options {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .option {
                    padding: 10px;
                    cursor: pointer;
                }
                .option:hover {
                    background: #f0f0f0;
                }`;
    }

    // check if atrribute changed
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'error') {
            this.shadowRoot.querySelector('.selected-value').classList.toggle('error', newValue === 'true');
        }
    }

    static get observedAttributes() {
        return ['error'];
    }

    // attributeChangedCallback(name, oldValue, newValue) {
    //     if (name === 'error') {
    //         const contElem = this.shadowRoot.querySelector('.select-dropdown');
    //         if (newValue !== null) {
    //             contElem.classList.add('error');
    //         } else {
    //             contElem.classList.remove('error');
    //         }
    //     }
    // }

    toggleDropdown() {
        this.dropdownElement.classList.toggle('open');
    }

    closeDropdown() {
        this.dropdownElement.classList.remove('open');
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
        const text_content = option.textContent;   // Get the text inside the selected option
        this.selectedElement.textContent = text_content;  // Update the display to show the selected text
        this.selectedElement.setAttribute('value', option.getAttribute('value')); // Set the 'value' attribute based on the selected option's value
        this.closeDropdown();  // Close the dropdown menu

        // Dispatch a custom 'change' event so external listeners can react to the selection
        this.dispatchEvent(new CustomEvent('change', { detail: text_content }));
    }


    getValue() {
        return this.selectedElement.getAttribute('value');
    }
}


