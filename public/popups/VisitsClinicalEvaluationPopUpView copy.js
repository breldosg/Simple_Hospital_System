import { diagnosisArray, duration_unit } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, notify, searchInArray } from "../script/index.js";

export class VisitsClinicalEvaluationPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        window.save_clinical_note = this.save_clinical_note.bind(this);
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
<div class="container clinical_note_add_popUp">

    <div class="cont_heading">
        <p class="heading">Clinical Note</p>
    </div>

    <br-form callback="save_clinical_note">
        <div class="cont_form">


            <div class="section_group">
                <h4>Chief Complaints (CC)</h4>

                <div class="input_groups">

                    <br-input placeholder="Briefly describe the main issue" name="cc_description"
                        label="Complaint Description" required type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>

                </div>


            </div>


            <div class="section_group">
                <h4>History of Present Illness (HPI)</h4>

                <div class="input_groups">



                    <br-input placeholder="Briefly describe the illness" name="hpi_description"
                        label="Illness Description" required type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>


                </div>


            </div>

            <div class="section_group">
                <h4>Review of Systems (ROS)</h4>

                <div class="input_groups">

                    <br-input placeholder="Explain related symptoms" name="ros_symptoms" label="Related Symptoms"
                        type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>


                </div>


            </div>

            <div class="section_group">
                <h4>Preliminary Diagnosis (Dx)</h4>

                <div class="input_groups">

                    <br-input placeholder="Enter initial diagnosis..." option="true" name="dx_diagnosis" required
                        label="Provisional Diagnosis" require type="text" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " dropDownStyles="border: 2px solid var(--input_border);"
                        dropDownBorder_radius="var(--input_main_border_r)" labelStyles="font-size: 12px;"
                        id="preliminary_diagnosis_input"></br-input>


                    <br-input placeholder="Any additional notes or observations..." name="dx_note"
                        label="Doctor's Notes" require type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>


                </div>


            </div>


            <div class="section_group">
                <h4>General Examination (GE)</h4>

                <div class="input_groups">

                    <br-input placeholder="Any visible or notable physical findings" name="ge_observation"
                        label="Physical Observations" type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>


                </div>


            </div>


            <div class="section_group">
                <h4>Systemic Examination (SE)</h4>

                <div class="input_groups">

                    <br-input placeholder="Key findings in specific systems..." name="se_findings"
                        label="Focused Findings" require type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>


                </div>


            </div>







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


        const preliminary_diagnosis_input = document.querySelector('#preliminary_diagnosis_input');

        const debouncedFunction = debounce(() => {
            let value = preliminary_diagnosis_input.getValue();

            if (value == null) {
                value = '';
            }

            // Call your search function here
            const found_options = searchInArray(diagnosisArray, value, null, 5);
            // console.log(found_options);

            if (found_options.length >= 1) {
                preliminary_diagnosis_input.updateOption(found_options);
            }

        }, 800);

        preliminary_diagnosis_input.addEventListener('input', () => {

            debouncedFunction();

        });

    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async save_clinical_note(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        data = {
            ...data,
            visit_id: this.visit_id
        };
        // console.log(data);

        // add visit_id in data json

        try {
            const response = await fetch('/api/patient/save_clinical_note', {
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