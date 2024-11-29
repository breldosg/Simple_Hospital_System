import { screenCollection } from "../screens/ScreenCollection.js";

export class PatientIllnessNotePopUpView {
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
<div class="chief_complain_add_popUp">

    <div class="cont_heading">
        <p class="heading">Patient Illness Note</p>
    </div>

    <div class="cont_form">
        <br-form callback="register_chief_complain">


            <!-- <br-input required name="description" label="Description" type="text" styles="
                border-radius: var(--input_main_border_r);
                width: 400px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input> -->


            <br-input required name="chief_complain" label="Chief Complaints" type="textarea" styles="
                border-radius: var(--input_main_border_r);
                width: 400px;
                padding: 10px;
                height: 90px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>


            <br-input required name="presented_illness" label="Presented Illness" type="textarea" styles="
                border-radius: var(--input_main_border_r);
                width: 400px;
                padding: 10px;
                height: 90px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>


            <br-input required name="other_system_review" label="Review Of Other System" type="textarea" styles="
                border-radius: var(--input_main_border_r);
                width: 400px;
                padding: 10px;
                height: 90px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>

            <div class="btn_wrapper">
                <button id="confirm_cancel" class="card-button secondary">Cancel</button>
                <button class="card-button">Save</button>
            </div>

        </br-form>
    </div>



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