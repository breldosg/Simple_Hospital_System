import { screenCollection } from "../screens/ScreenCollection.js";

export class ConfirmPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.heading = params.title ? params.title : null;
        this.sub_heading = params.sub_heading ? params.sub_heading : null;
        this.description = params.description ? params.description : null;
        this.ok_btn = params.ok_btn ? params.ok_btn : "Ok";
        this.cancel_btn = params.cancel_btn ? params.cancel_btn : 'Cancel';
        this.callback = params.callback ? params.callback : null;
        this.parameter = params.parameter ? params.parameter : null;
        this.condition = params.condition ? params.condition : 'error';

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();

        this.attachListeners()
    }

    ViewReturn() {
        return `
<div class=" container confirm_card">
    <div class="card-content">
        <p class="heading">${this.heading}</p>
        <p class="card-heading">${this.sub_heading}</p>
        <p class="card-description">${this.description}</p>
        
    </div>
    <div class="card-button-wrapper">
        <button id="confirm_cancel" class="card-button secondary">${this.cancel_btn}</button>
        <button id="confirm_delete" class="card-button ${this.condition}">${this.ok_btn}</button>
    </div>
</div>

`;
    }

    attachListeners() {
        const cancel_btn = document.querySelector('#confirm_cancel');

        cancel_btn.addEventListener('click', () => {
            const cont = document.querySelector('.popup');
            cont.classList.remove('active');
            cont.innerHTML = '';

        });


        const delete_btn = document.querySelector('#confirm_delete');
        delete_btn.addEventListener('click', () => {
            const cont = document.querySelector('.popup');
            cont.classList.remove('active');
            cont.innerHTML = '';

            const callbackName = this.callback;
            const data = this.parameter;

            if (callbackName && typeof window[callbackName] === 'function') {
                window[callbackName](data);
            } else {
                console.warn(`Callback function ${callbackName} is not defined or not a function`);
            }
        });
    }
}
