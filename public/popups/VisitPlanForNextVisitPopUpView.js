import { screenCollection } from "../screens/ScreenCollection.js";

export class VisitPlanForNextVisitPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
    }

    async PreRender(params = '') {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.heading = params.title ? params.title : null;


        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners()
    }

    ViewReturn() {
        return `
<div class="container next_visit_plan_popUp">

    <div class="cont_heading">
        <p class="heading">Plan for Next Visit</p>
    </div>

    <br-form callback="register_chief_complainsss">
        <div class="cont_form">


            <br-input name="chief_complain" label="Next Visit Date" required
                type="date" styles="
                border-radius: var(--input_main_border_r);
                width: 440px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>


            <br-input placeholder="Enter the purpose of the next visit (e.g., Follow-up, Lab Results, Check-Up)" name="chief_complain" label="Purpose of Next Visit" required
                type="textarea" styles="
                border-radius: var(--input_main_border_r);
                width: 440px;
                padding: 10px;
                height: 100px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>



            <br-input placeholder="Enter any instructions for the patient (e.g., fasting, tests to bring)" name="chief_complain" label="Instructions for Patient"
                type="textarea" styles="
                border-radius: var(--input_main_border_r);
                width: 440px;
                padding: 10px;
                height: 100px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>




            <div class="btn_wrapper">
                <br-button id="confirm_cancel" class="card-button secondary">Cancel</br-button>
                <br-button class="card-button" type="submit">Save</br-button>
            </div>



        </div>
    </br-form>



</div>

`;
    }

    attachListeners() {
        const cancel_btn = document.querySelector('#confirm_cancel');

        cancel_btn.addEventListener('click', () => {
            this.close();

        });


        // const delete_btn = document.querySelector('#confirm_delete');
        // delete_btn.addEventListener('click', () => {
        // const cont = document.querySelector('.popup');
        // cont.classList.remove('active');
        // cont.innerHTML = '';

        // const callbackName = this.callback;
        // const data = this.parameter;

        // if (callbackName && typeof window[callbackName] === 'function') {
        // window[callbackName](data);
        // } else {
        // console.warn(`Callback function ${callbackName} is not defined or not a function`);
        // }
        // });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }
}