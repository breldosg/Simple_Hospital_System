export class BrCustomForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.formElement = this.shadowRoot.querySelector('form');
        this.slotElement = this.shadowRoot.querySelector('slot'); // Access the slot element
        this.submit_btn = this.shadowRoot.host.querySelector('br-button[type="submit"]')

        // Fix: Pass a function reference, not an invocation
        this.submit_btn.addEventListener('click', (event) => {
            event.preventDefault();
            this.handleSubmit();
        });
        // add event listener for press enter key
        this.formElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                // check if the enter pressed when is in textarea input
                if (event.target.getAttribute('type') == 'textarea') {
                    return;
                }
                this.formElement.dispatchEvent(new Event('submit')); // Simulate form submission when Enter key is pressed
            }
        });
    }



    render() {
        const btn_class = this.hasAttribute('btn_class') ? this.getAttribute('btn_class') : 'btn_main';
        this.shadowRoot.innerHTML = `
            <style>
                ${this.styles()}
            </style>
            <form>
                <slot></slot> <!-- Slot for custom inputs -->
            </form>
        `;
    }

    styles() {
        // Add custom styles here
        const additionalStyles = this.getAttribute('styles') || '';
        return `
        
            ::-webkit-scrollbar {
                width: 0;
                height: 0;
            }

            ::-webkit-scrollbar-thumb {
                background-color: transparent;
            }

            form {
            display: flex;
            flex-direction: column;
                ${additionalStyles}
            }
        `;
    }

    handleSubmit() {
        let data = {};
        let isValid = true;
        const inputs = this.shadowRoot.host.querySelectorAll('br-input,br-select,br-multiple-select'); // Get elements assigned to the slot


        inputs.forEach(input => {

            if (input.tagName.toLowerCase() === 'br-input') {
                const value = input.getValue();
                const required = input.hasAttribute('required');

                // Check if input is required and has no value
                if (required && (value === null || value.trim() === '')) {
                    input.setAttribute('error', 'true'); // Set error attribute if value is empty
                    isValid = false;
                } else {
                    input.removeAttribute('error'); // Remove error attribute if value is valid
                    data[input.getAttribute('name')] = value; // Add input value to data object for easy access
                }
            }
            else if (input.tagName.toLowerCase() === 'br-select') {
                const value = input.getValue();
                const required = input.hasAttribute('required');

                // Check if input is required and has no value
                if (required && (value === null || value.trim() === '')) {
                    input.setAttribute('error', 'true'); // Set error attribute if value is empty
                    isValid = false;
                } else {
                    input.removeAttribute('error'); // Remove error attribute if value is valid
                    data[input.getAttribute('name')] = value; // Add input value to data object for easy access
                }
            }
            else if (input.tagName.toLowerCase() === 'br-multiple-select') {
                const value = input.getValue();
                const required = input.hasAttribute('required');

                // Check if input is required and has no value
                if (required && (value === null || value.length <= 0)) {
                    input.setAttribute('error', 'true'); // Set error attribute if value is empty
                    isValid = false;
                } else {
                    input.removeAttribute('error'); // Remove error attribute if value is valid
                    data[input.getAttribute('name')] = value; // Add input value to data object for easy access
                }
            }
        });

        if (isValid) {
            // Call the callback function if specified
            const callbackName = this.getAttribute('callback');
            if (callbackName && typeof window[callbackName] === 'function') {
                window[callbackName](data);
            } else {
                console.warn(`Callback function ${callbackName} is not defined or not a function`);
            }
        } else {
            console.warn(`Form validation failed.`);
        }
    }

}

