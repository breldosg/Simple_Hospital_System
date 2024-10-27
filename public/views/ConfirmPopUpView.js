import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

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

        this.callback = params.callback;
        this.parameter = params.params;
        this.data = params.data;

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn(params);

        this.attachListeners()
    }

    ViewReturn(params) {
        return `
<div class="confirm_card">
    <div class="card-content">
        <p class="heading">Delete ${params.title}</p>
        <p class="card-heading">${params.title} name: ${params.data}?</p>
        <p class="card-description">Are sure you want to permanently delete this ${params.title}?</p>
        
    </div>
    <div class="card-button-wrapper">
        <button id="confirm_cancel" class="card-button secondary">Cancel</button>
        <button id="confirm_delete" class="card-button primary">Delete</button>
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