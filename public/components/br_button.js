export class BrCustomButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    render() {

        this.shadowRoot.innerHTML = `
            <style>
                ${this.styles()}
            </style>
            
            <div class="br_loader_cont">
                <div class="br_loader"></div>
            </div>
            <slot></slot>
            
        `;

    }

    // styles return function
    styles() {
        const loader_width = this.getAttribute('loader_width') || 30;
        const border_width = this.getAttribute('border_width') || 5;
        return `
        *{
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            transition: all 0.5s ease;
            color:var(--white);
        }
        :host {
            display: block;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        :host(.inactive) {
            pointer-events: none;
        }
        .br_loader_cont {
            position: absolute;
            top: 0%;
            left: 0%;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            z-index:1;
        }

        .br_loader_cont.active {
            background-color:var(--pri_color);
            opacity: 1;
        }

        .br_loader {
            width: ${loader_width}px;
            aspect-ratio: 1;
            display: grid;
            animation: l14 4s infinite;
        }

        .br_loader::before,
        .br_loader::after {
            content: "";
            grid-area: 1/1;
            border: ${border_width}px solid;
            border-radius: 50%;
            border-color: #fff #fff #0000 #0000;
            mix-blend-mode: darken;
            animation: l14 1s infinite linear;
        }

        .br_loader::after {
            border-color: #0000 #0000 #ffffff4a #ffffff4a;
            animation-direction: reverse;
        }

        @keyframes l14 {
            100% {
                transform: rotate(1turn)
            }
        }

        
        `;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'loading') {
            // Check if the attribute value is 'true' or 'false'
            var check = this.getAttribute('loading') === 'true';

            if (check) {
                // If loading is true, add the 'active' and 'inactive' classes
                this.shadowRoot.querySelector('.br_loader_cont').classList.add('active');
                this.classList.add('inactive');
            } else {
                // If loading is false, remove the 'active' and 'inactive' classes
                this.shadowRoot.querySelector('.br_loader_cont').classList.remove('active');
                this.classList.remove('inactive');
            }
        }
    }

    static get observedAttributes() {
        return ['loading'];
    }
}