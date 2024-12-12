import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class VisitPlanForNextVisitPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        window.save_next_visit_plan = this.save_next_visit_plan.bind(this);
    }

    async PreRender(params = '') {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.visit_id = params.visit_id ? params.visit_id : '';


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

    <br-form callback="save_next_visit_plan">
        <div class="cont_form">


            <br-input name="plan_date" label="Next Visit Date" required
                type="date" styles="
                border-radius: var(--input_main_border_r);
                width: 440px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>


            <br-input placeholder="Enter the purpose of the next visit (e.g., Follow-up, Lab Results, Check-Up)" name="plan_purpose" label="Purpose of Next Visit" required
                type="textarea" styles="
                border-radius: var(--input_main_border_r);
                width: 440px;
                padding: 10px;
                height: 100px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>



            <br-input placeholder="Enter any instructions for the patient (e.g., fasting, tests to bring)" name="plan_instruction" label="Instructions for Patient"
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

    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }
    

    async save_next_visit_plan(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        data = {
            ...data,
            visit_id: this.visit_id
        };

        try {
            const response = await fetch('/api/patient/save_next_visit_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Fail to Save Note. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                this.close();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
        finally {
            btn_submit.setAttribute('loading', false);
        }
    }

}