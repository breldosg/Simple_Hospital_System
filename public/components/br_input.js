export class BrCustomInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.shadow_value = '';
    }

    connectedCallback() {
        this.inputElement = this.shadowRoot.querySelector('input, textarea');
        this.cont = this.shadowRoot.querySelector('.cont');


        // If type is password, add event listener for the eye icon
        if (this.getAttribute('type') === 'password') {
            const toggleIcon = this.shadowRoot.querySelector('.toggle-visibility');
            toggleIcon.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Add event listener for input validation
        this.inputElement.addEventListener('input', () => {
            this.validateAndSanitize();
        });

        if (this.hasAttribute('option') && this.getAttribute('option') == 'true') {


            this.inputElement.addEventListener('focus', () => {
                this.openOption();
            })

            this.inputElement.addEventListener('input', () => {
                this.filterOptions();
            })


        }


    }

    handleBrInputWindowClick = (e) => {
        if (!this.contains(e.target)) {
            this.closeOption();
        }
    };

    render() {
        let type = this.getAttribute('type') || 'text';
        type = type == 'tel' ? 'number' : type;
        const placeholder = this.hasAttribute('placeholder') ? `placeholder="${this.getAttribute('placeholder')}"` : '';
        const value = this.hasAttribute('value') ? `value="${this.getAttribute('value')}"` : '';
        const required = this.hasAttribute('required') ? 'required' : '';
        const error = this.hasAttribute('error') ? 'error' : '';
        const focus = this.hasAttribute('focus') ? 'autofocus' : '';
        const label = this.hasAttribute('label');
        const min = this.hasAttribute('min') ? `min="${this.getAttribute('min')}"` : '';
        const max = this.hasAttribute('max') ? `max="${this.getAttribute('max')}"` : '';
        const disable = this.hasAttribute('disable') ? (this.getAttribute('disable') == 'true' ? 'readonly' : '') : '';
        const disable_class = this.hasAttribute('disable') ? 'readonly' : '';

        var textarea_value = this.hasAttribute('value') ? this.getAttribute('value') : '';

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.jsdelivr.net/gh/breldosg/Xt-style-pack@main/icons/style.css');
                ${this.styles()}
            </style>
            ${label ? `
                <label>${this.getAttribute("label")}</label>` : ''
            }
            <div class="cont ${error, " ", disable_class}">
                ${type === 'textarea' ? `
                    <textarea ${placeholder} ${required}>${textarea_value}</textarea>
                ` : `
                    <input type="${type}" ${value} ${min} ${max} ${focus} ${disable} ${placeholder} ${required}>
                    ${type === 'password' ? '<span class="switch_icon_remove_red_eye toggle-visibility"></span>' : ''}
                `}

                <div class="drop_option_cont">
                    <hr/>
                    <div class="drop_option">              
                    </div>
                </div>

            </div>
        `;

    }

    styles() {
        const additionalStyles = this.getAttribute('styles') || '';
        const labelStyles = this.getAttribute('labelStyles') || '';
        const dropDownStyles = this.getAttribute('dropDownStyles') || '';
        const dropDownBorder_radius = this.getAttribute('dropDownBorder_radius') || '0';

        return `
            ::-webkit-scrollbar {
                width: 0;
                height: 0;
            }

            ::-webkit-scrollbar-thumb {
                background-color: transparent;
            }
            * {
                box-sizing: border-box;
                color: currentColor;
                font-family: inherit;
                padding: 0;
                margin: 0;
            }
            :root{
                --success_color: #05CD99;
                --error_color: #EE5D50;
                --warning_color: #FFCE20;
            }
            :host {
                display: block;
                width: fit-content;
                box-sizing: border-box;
                font-size: 16px;
                color: currentColor;
                font-family: inherit;
                padding: 0;
                margin: 0;
            }
            label{
                ${labelStyles}
            }
            .cont {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100px;
                border: 1px solid #ccc;
                <!-- overflow: hidden; -->
                field-sizing: content;
                position: relative;

                ${additionalStyles}
            }

            .readonly{
                opacity:0.6;
                pointer-events: none;
            }
            
            .cont.error{
                border-color:  #EE5D50;
            }
            input, textarea {
                background-color: transparent;
                border: none;
                outline: none;
                width: 100%;
                height: 100%;
                resize: none; /* Prevent textarea from being resizable */
            }     
            input[type="number"]::-webkit-inner-spin-button,
            input[type="number"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type="number"] {
                -moz-appearance: textfield;
                appearance: textfield;
            }
            .toggle-visibility {
                cursor: pointer;
                margin-left: 10px;
            }

            .cont.option{
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
                border-bottom: none;

                .drop_option_cont{
                    display: flex;
                }
            }

            .drop_option_cont{
                display: none;
                flex-direction: column;
                align-items: center;
                left: 50%;
                top: 100%;
                transform: translateX(-50%);
                position: absolute;
                background-color: white;
                z-index: 1;
                max-height: 150px;
                overflow-y: auto;
                width: 101%;
                ${dropDownStyles}
                border-top: none !important;
                border-bottom-left-radius: ${dropDownBorder_radius};
                border-bottom-right-radius: ${dropDownBorder_radius};

                hr{
                    width: 98%;
                    height: 1px;
                    border-color: #f3f5f6;
                    opacity:0.2;
                }

                .drop_option{
                    width: 100%;
                    
                    .option {
                        width: 100%;
                        height:37px;
                        padding-inline: 10px;
                        cursor: pointer;
                        font-size:small;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                    }
                    
                    .option:hover {
                        background-color: #f3f5f6;
                    }
                }
            }
            
        `;
    }

    togglePasswordVisibility() {
        console.log('Toggle password visibility');

        const inputType = this.inputElement.getAttribute('type');
        const newType = inputType === 'password' ? 'text' : 'password';
        this.inputElement.setAttribute('type', newType);
    }

    validateAndSanitize() {
        const type = this.getAttribute('type') || 'text';
        let value = this.inputElement.value;

        // Basic sanitization - strip out HTML tags
        value = value.replace(/<[^>]*>/g, '');

        // Custom validation based on the type
        let isValid = false;
        switch (type) {
            case 'text':
            case 'search':
            case 'textarea':
                isValid = value.trim() !== '';
                break;
            case 'password':
                // Password validation rules
                isValid = value.length >= 8 && // Minimum length
                    /[A-Z]/.test(value) && // At least one uppercase letter
                    /[a-z]/.test(value) && // At least one lowercase letter
                    /[0-9]/.test(value) && // At least one digit
                    /[!@#$%^&*(),.?":{}|<>]/.test(value); // At least one special character
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
            case 'url':
                isValid = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(value);
                break;
            case 'number':
                isValid = !isNaN(value) && value.trim() !== '';
                break;
            case 'tel':
                isValid = /^[+]?[0-9]{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(value);
                break;
            case 'date':
                isValid = !isNaN(Date.parse(value));
                break;
            case 'time':
                isValid = /^([01]\d|2[0-3]):?([0-5]\d)$/.test(value);
                break;
            case 'datetime-local':
                isValid = !isNaN(new Date(value).getTime());
                break;
            case 'month':
                isValid = /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
                break;
            case 'week':
                isValid = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(value);
                break;
            case 'color':
                isValid = /^#[0-9A-Fa-f]{6}$/.test(value);
                break;
            default:
                isValid = value.trim() !== '';
                break;
        }

        this.inputElement.setCustomValidity(isValid ? '' : 'Invalid input');
        return isValid ? value : null;
    }

    static get observedAttributes() {
        return ['error', 'value', 'shadow_value'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'error') {
            const contElem = this.shadowRoot.querySelector('.cont');
            if (newValue !== null) {
                contElem.classList.add('error');
            } else {
                contElem.classList.remove('error');
            }
        }
        else if (name == 'value' && newValue !== '') {
            if (this.inputElement) { // Check if inputElement is defined
                this.inputElement.value = newValue;
            }

        }
        else if (name == 'shadow_value' && newValue !== '') {
            this.shadow_value = newValue;
        }
    }

    // Method to retrieve sanitized and validated value
    getValue() {
        if (this.shadow_value) {
            return this.shadow_value;
        }

        if (this.validateAndSanitize()) {
            return this.inputElement.value;
        }


        return null;
    }

    // Method to set a value directly
    reset() {
        this.inputElement.value = '';  // Set the input's internal value
        this.removeAttribute('error'); // Reset error state if any

    }


    setValue(value) {
        this.inputElement.value = value;  // Set the input's internal value
    }

    updateOption(data = []) {
        if (this.hasAttribute('option') && this.getAttribute('option') == 'true') {
            const drop_option = this.cont.querySelector('.drop_option');
            if (drop_option) {
                drop_option.innerHTML = '';
                data.forEach(item => {
                    const option = document.createElement('div');
                    option.classList.add('option');
                    option.textContent = item;
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.inputElement.value = item;
                        this.closeOption();
                    });
                    drop_option.appendChild(option);
                });
            }
        }

    }

    // Method to show/hide option drop down
    openOption() {
        this.cont.classList.add('option');
        window.addEventListener('click', this.handleBrInputWindowClick);
    }

    closeOption() {
        this.cont.classList.remove('option');
        window.removeEventListener('click', this.handleBrInputWindowClick);

    }

    filterOptions() {
        const filter = this.inputElement.value.toLowerCase();
        const divs = this.cont.querySelectorAll('.drop_option .option');

        // const divs = options.getElementsByTagName('div');
        for (let i = 0; i < divs.length; i++) {
            const txtValue = divs[i].textContent || divs[i].innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                divs[i].style.display = '';
            } else {
                divs[i].style.display = 'none';
            }
        }
    }


}

