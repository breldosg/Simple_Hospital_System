import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class AddVitalPopUpView {
    constructor() {
        this.visit_id = null;
        window.AddVital = this.AddVital.bind(this);
    }

    async PreRender(params_json) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.visit_id = params_json.visit_id;
        this.params = params_json;
        this.vitalData = params_json.vital_data ? params_json.vital_data : [];


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

                <br-input required name="temperature" label="Temperature (deg C)" value="${this.vitalData.temperature ? this.vitalData.temperature : ''}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>


                <br-input required name="pulse" label="Pulse (bpm)" value="${this.vitalData.pulse ? this.vitalData.pulse : ''}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>


                <br-input required name="o2_saturation" label="O2 Saturation (%)" value="${this.vitalData.o2_saturation ? this.vitalData.o2_saturation : ''}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>



                <br-input required name="blood_pressure" label="Blood Pressure (mmHg)" value="${this.vitalData.blood_pressure ? this.vitalData.blood_pressure : ''}" type="text" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>



                <br-input required name="respiration" label="Respiration (RR)" value="${this.vitalData.respiration ? this.vitalData.respiration : ''}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>


                <br-input name="weight" label="Weight (Kg)" value="${this.vitalData.weight ? this.vitalData.weight : ''}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>


                <br-input name="height" label="Height (cm)" value="${this.vitalData.height ? this.vitalData.height : ''}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>


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

    async AddVital(data_old) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);


        var formData = {
            ...data_old,
            visit_id: this.visit_id
        }

        try {
            const response = await fetch('/api/patient/save_vital', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('failed To update vital. Server Error');
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
                notify('top_left', result.message, 'success');
                dashboardController.patientDetailComponent.render();

                // After successful creation, clear the popup and close it
                dashboardController.addVitalPopUpView.close();

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

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }
}