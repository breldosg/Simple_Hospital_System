export class BrCustomAlert extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    render() {
        const message = this.getAttribute('message') || 'No message available';
        const status = this.getAttribute('status') || 'success';

        let icon = "<span class='switch_icon_check_circle success_color'></span>";
        let host_border_color = 'var(--success_color)';

        if (status == 'success') {
            icon = "<span class='switch_icon_check_circle success_color'></span>";
            host_border_color = 'var(--success_color)';
        } else if (status == 'warning') {
            icon = "<span class='switch_icon_circle_exclamation warning_color'></span>";
            host_border_color = 'var(--warning_color)';
        } else if (status == 'error') {
            icon = "<span class='switch_icon_triangle_exclamation error_color'></span>";
            host_border_color = 'var(--error_color)';
        }

        this.shadowRoot.innerHTML = `
<style>
    @import url('https://cdn.jsdelivr.net/gh/breldosg/Xt-style-pack@main/icons/style.css');

    * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        font-family: inherit;
    }

    :host {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: rgb(80, 80, 80);
        gap: 5px;
        height: 70px;
        border-radius: 5px;
        overflow: hidden;
        padding: 3px;
        border-left: 5px solid ${host_border_color};
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s, transform 0.5s;
        flex:none;
    }

    :host(.visible) {
        opacity: 1;
        transform: translateY(0);
    }

    :host(.closing) {
        opacity: 0;
        transform: translateY(-20px);
    }

    .icon,
    .msg,
    .close {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .icon {
        width: 70px;
        span {
            font-size: 25px;
        }
        .warning_color {
            color: var(--warning_color);
        }
        .success_color {
            color: var(--success_color);
        }
        .error_color {
            color: var(--error_color);
        }
    }

    .msg {
        width: calc(100% - 140px);
        color: var(--white);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        font-size: 14px;
        height:auto;
    }

    .close {
        cursor: pointer;
        width: 70px;
        border-left: var(--white-op2) solid 1px;
        span {
            color: var(--white);
        }
    }
</style>

<div class="icon">${icon}</div>
<p class="msg">${message}</p>
<div class="close">
    <span class='switch_icon_close'></span>
</div>
`;

        // Automatically show the alert with an opening animation
        requestAnimationFrame(() => {
            this.classList.add('visible');
        });

        // Add close button event listener
        this.shadowRoot.querySelector('.close').addEventListener('click', () => {
            this.closeAlert();
        });

        // Listen mouse over the element then clear timeout
        this.addEventListener('mouseover', () => {
            clearTimeout(this.timeout);
        });
        // Listen mouse leave the element then to start timeout
        this.addEventListener('mouseleave', () => {
            this.timeout = setTimeout(() => {
                this.closeAlert();
            }, 5000); // Match the desired duration (5s)
        });

        // Automatically close the alert after a certain amount of time
        this.timeout = setTimeout(() => {
            this.closeAlert();
        }, 5000); // Match the desired duration (5s)

    }

    closeAlert() {
        // Add closing class to trigger the CSS animation
        this.classList.remove('visible');  // Remove visible class for closing
        this.classList.add('closing');

        // Wait for the animation to finish before removing the element
        setTimeout(() => {
            this.remove();
        }, 500); // Match the animation duration (0.5s)
    }
}




