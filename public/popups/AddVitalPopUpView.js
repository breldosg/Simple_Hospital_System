import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class AddVitalPopUpView {
    constructor() {
        window.AddVital = this.AddVital.bind(this);
        this.visit_id = null;
    }

    async PreRender(data) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // this.visit_id = params.c_id;
        this.params = data;

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();

        // Replace loader and insert the content
        this.attachListeners()
    }

    ViewReturn() {
        return `
<div class="container add_vital_data_pop">

    <br-form callback="AddVital">
        <div class="slide">
            <p class="heading">Add Vital Information</p>

            <div class="input_group">

                <br-input required name="temp" label="Temperature (deg C)" value="" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 13px;"></br-input>

                                        

                <br-input required name="bpm" label="Pulse (bpm)" value="" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 13px;"></br-input>



                <br-input required name="weight" label="Weight (Kg)" value="" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 13px;"></br-input>



                <br-input required name="o2" label="O2 Saturation (%)" value="" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 13px;"></br-input>



                <br-input required name="blood_pressure" label="Blood Pressure (mmHg)" value="" type="text" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 13px;"></br-input>



                <br-input required name="respiration" label="Respiration (RR)" value="" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 13px;"></br-input>



                <br-input required name="height" label="Height (cm)" value="" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 13px;"></br-input>


                <div class="btn_cont">
                    <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                    <br-button loader_width="23" class="btn_next" type="submit">Update</br-button>
                </div>
            </div>

        </div>
    </br-form>
</div>
            `;
    }

    attachListeners() {
        const cancel_btn = document.querySelector('br-button[type="cancel"]');

        cancel_btn.addEventListener('click', () => {
            this.close();
        });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async AddVital(data_old) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);


        var data = {
            ...data_old,
            visit_id: 5
        }
        // var data = {
        //     ...data_old,
        //     visit_id: this.visit_id
        // }



        try {
            const response = await fetch('/api/patient/save_vital', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('failed To create visit. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                // After successful creation, clear the popup and close it
                const popup_cont = document.querySelector('.popup');
                popup_cont.innerHTML = ''; // Clear the popup and close it
                popup_cont.classList.remove('active');

                dashboardController.singleMedicineCategoryView.PreRender(
                    {
                        id: this.visit_id
                    });

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