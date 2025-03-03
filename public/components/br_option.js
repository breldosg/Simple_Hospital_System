export class BrCustomOption extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    render() {
        const styles = this.getAttribute('styles') || '';
        const HoverStyle = this.getAttribute('HoverStyles') || '';
        const option_style = this.hasAttribute('option_style') ? this.getAttribute('option_style') : '';
        const checked = this.hasAttribute('selected') ? 'checked' : '';

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.jsdelivr.net/gh/breldosg/Xt-style-pack@main/icons/style.css');
                *{
                    padding: 0;
                    margin: 0;
                    box-sizing: border-box;
                }
                :host {
                    display: block;
                    cursor: pointer;
                    width: 100%;
                    padding: 10px !important;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    display: inline-block;
                    ${styles}
                    }
                    :host(:hover) {
                        background:var(--pri_op);
                        transform: scale(1.001);
                        ${HoverStyle}
                    }
                    .br_option_cont{
                        display:flex;
                        gap:5px;
                    }
                    .checkbox{
                        span{
                            font-size:8px !important;
                            opacity:0;
                        }
                        span.checked{
                            opacity:1;
                        }
                    }
            </style>
            <div class="br_option_cont">
            ${option_style ? (option_style == 'checkbox' ? `
                <div class="checkbox">
                        <span class='switch_icon_done ${checked}'></span>                  
                    </div>`: '') : ''

            }
            
            <slot></slot>
            </div>
        `;
    }


    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'selected') {
            this.shadowRoot.querySelector('.checkbox span').classList.toggle('checked', newValue === 'true');
        }
    }

    static get observedAttributes() {
        return ['selected'];
    }




}



