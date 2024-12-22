import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class AddVitalPopUpView {
    constructor() {
        this.visit_id = null;
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

                <br-input required name="temperature" label="Temperature (deg C)" value="${this.vitalData.temperature ? this.vitalData.temperature : '0'}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>

                                        

                <br-input required name="pulse" label="Pulse (bpm)" value="${this.vitalData.pulse ? this.vitalData.pulse : '0'}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>



                <br-input required name="weight" label="Weight (Kg)" value="${this.vitalData.weight ? this.vitalData.weight : '0'}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>



                <br-input required name="o2_saturation" label="O2 Saturation (%)" value="${this.vitalData.o2_saturation ? this.vitalData.o2_saturation : '0'}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>



                <br-input required name="blood_pressure" label="Blood Pressure (mmHg)" value="${this.vitalData.blood_pressure ? this.vitalData.blood_pressure : '0'}" type="text" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>



                <br-input required name="respiration" label="Respiration (RR)" value="${this.vitalData.respiration ? this.vitalData.respiration : '0'}" type="number" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 300px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>



                <br-input required name="height" label="Height (cm)" value="${this.vitalData.height ? this.vitalData.height : '0'}" type="number" styles="
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

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }
}