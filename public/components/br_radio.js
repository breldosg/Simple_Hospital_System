class BrRadio extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        // Cache elements
        this.radioGroup = this.shadowRoot.querySelector('.radio-group');
        this.radioOptions = Array.from(this.querySelectorAll('br-radio-option'));

        // Set the name attribute to each radio button based on the component's name
        const name = this.getAttribute('name');
        this.radioOptions.forEach(option => {
            option.setAttribute('name', name);
        });

        // Handle selecting a radio option
        this.radioGroup.addEventListener('change', (e) => {
            this.selectOption(e.target);
        });
    }

    selectOption(radio) {
        // Mark the selected radio as checked
        this.radioOptions.forEach(option => {
            option.updateCheckedState(radio.getAttribute('value'));
        });

        // Dispatch a custom event to notify about the change
        this.dispatchEvent(new CustomEvent('change', { detail: radio.value }));
    }

    render() {
        const label = this.getAttribute('label') || '';
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .radio-group {
                    display: flex;
                    flex-direction: column;
                }
                .label {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
            </style>
            <div class="label">${label}</div>
            <div class="radio-group">
                <slot></slot>
            </div>
        `;
    }
}

customElements.define('br-radio', BrRadio);
