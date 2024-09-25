class BrRadioOption extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.radioInput = this.shadowRoot.querySelector('input[type="checkbox"]');
        this.radioInput.addEventListener('change', () => {
            if (this.radioInput.checked) {
                this.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    updateCheckedState(selectedValue) {
        this.radioInput.checked = this.radioInput.value === selectedValue;
    }

    render() {
        const value = this.getAttribute('value') || '';
        const checked = this.hasAttribute('checked') ? 'checked' : '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 5px;
                }
                .radio-option {
                    display: flex;
                    align-items: center;
                }
                label {
                    margin-left: 5px;
                }
            </style>
            <div class="radio-option">
                <input type="checkbox" value="${value}" ${checked}>
                <label><slot></slot></label>
            </div>
        `;
    }
}

customElements.define('br-radio-option', BrRadioOption);
