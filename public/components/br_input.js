export class BrCustomInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.inputElement = this.shadowRoot.querySelector('input, textarea');

        // If type is password, add event listener for the eye icon
        if (this.getAttribute('type') === 'password') {
            const toggleIcon = this.shadowRoot.querySelector('.toggle-visibility');
            toggleIcon.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Add event listener for input validation
        this.inputElement.addEventListener('input', () => {
            this.validateAndSanitize();
        });
    }

    render() {
        let type = this.getAttribute('type') || 'text';
        type = type == 'tel' ? 'number' : type;
        const value = this.getAttribute('value') || '';
        const placeholder = this.getAttribute('placeholder') || '';
        const required = this.hasAttribute('required') ? 'required' : '';
        const error = this.hasAttribute('error') ? 'error' : '';
        const focus = this.hasAttribute('focus') ? 'autofocus' : '';
        const label = this.hasAttribute('label');

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.jsdelivr.net/gh/breldosg/Xt-style-pack@main/icons/style.css');
                ${this.styles()}
            </style>
            ${label ? `
                <label>${this.getAttribute("label")}</label>` : ''
            }
            <div class="cont ${error}">
                ${type === 'textarea' ? `
                    <textarea placeholder="${placeholder}" ${required}>${value}</textarea>
                ` : `
                    <input type="${type}" value="${value}" ${focus} placeholder="${placeholder}" ${required}>
                    ${type === 'password' ? '<span class="switch_icon_remove_red_eye toggle-visibility"></span>' : ''}
                `}
            </div>
        `;
    }

    styles() {
        const additionalStyles = this.getAttribute('styles') || '';
        const labelStyles = this.getAttribute('labelStyles') || '';
        const error_color = this.getAttribute('error-color') || '';

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
                padding: 10px;
                border: 1px solid #ccc;
                overflow: hidden;
                field-sizing: content;
                ${additionalStyles}
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
        return ['error'];
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
    }

    // Method to retrieve sanitized and validated value
    getValue() {
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


}

