import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitPlanForNextVisitPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        window.save_update_next_visit_plan = this.save_update_next_visit_plan.bind(this);
        this.state = "creation";
    }

    async PreRender(params = '') {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.visit_id = params.visit_id ? params.visit_id : '';
        this.state = params.state ? params.state : "creation";
        this.plan_data = params.data ? params.data : '';
        this.visit_status = params.visit_status ? params.visit_status : 'checked_out';

        console.log(params);


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

    <br-form callback="save_update_next_visit_plan">
        <div class="cont_form">


            <br-input name="plan_date" label="Next Visit Date" value="${this.plan_data.date ? this.plan_data.date : ''}" required
                type="date" styles="
                border-radius: var(--input_main_border_r);
                width: 440px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 12px;"></br-input>


            <br-input placeholder="Enter the purpose of the next visit (e.g., Follow-up, Lab Results, Check-Up)" name="plan_purpose" label="Purpose of Next Visit" required
                value="${this.plan_data.purpose ? this.plan_data.purpose : ''}"
                type="textarea" styles="
                border-radius: var(--input_main_border_r);
                width: 440px;
                padding: 10px;
                height: 100px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 12px;"></br-input>



            <br-input placeholder="Enter any instructions for the patient (e.g., fasting, tests to bring)" name="plan_instruction" label="Instructions for Patient"
                value="${this.plan_data.instruction ? this.plan_data.instruction : ''}"
                type="textarea" styles="
                border-radius: var(--input_main_border_r);
                width: 440px;
                padding: 10px;
                height: 100px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 12px;"></br-input>




            <div class="btn_wrapper">
                <br-button id="confirm_cancel" class="card-button secondary">Cancel</br-button>
                <br-button class="card-button" type="submit">${this.state == "update" ? "Update" : "Save"}</br-button>
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


    async save_update_next_visit_plan(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        var formData = {
            visit_id: this.visit_id,
            action: this.state == 'update' ? 'update' : 'create',
            plan_id: this.state == 'update' ? this.plan_data.id : '',
            ...data
        };

        console.log(formData);

        try {
            const response = await fetch('/api/patient/save_next_visit_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Fail to Save Note. Server Error');
            }

            const result = await response.json();

            if (result.status == 401) {
                setTimeout(() => {
                    document.body.style.transition = 'opacity 0.5s ease';
                    document.body.style.opacity = '0';
                    setTimeout(() => {
                        frontRouter.navigate('/login');
                        document.body.style.opacity = '1';
                    }, 500);
                }, 500);
            }



            if (result.success) {
                dashboardController.visitPlanForNextVisitCardView.PreRender({
                    visit_id: this.visit_id,
                    data: result.data,
                    state: this.state,
                    visit_status: this.visit_status
                });
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