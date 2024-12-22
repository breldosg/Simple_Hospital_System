
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class AddPatientNotePopUpView {
    constructor() {
        this.category_id = null;
    }

    async PreRender() {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners()
    }

    ViewReturn() {
        return `
        <div class="container add_patient_note_popup">

            <br-form callback="save_patient_note" class="slides">
                <div class="slide">
                    <p class="heading">Add Patient Note</p>

                    <div class="input_group">

                        <br-input name="note" label="Patient Note" value="" type="textarea" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 400px;
                                        padding: 10px;
                                        height: 100px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>

                        <div class="btn_cont">
                        <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                        <br-button loader_width="23" class="btn_next" type="submit">Add</br-button>
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

            this.close()
        });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

}
