import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, notify, searchInArray } from "../script/index.js";
import { frontRouter } from "../script/route.js";

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
        this.evaluation_data = params.data ? params.data : '';
        this.state = params.state ? params.state : 'creation';

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners()
    }

    ViewReturn() {
        return `
<div class="container clinical_note_add_popUp">

    <div class="cont_heading">
        <p class="heading">Clinical Evaluation</p>
    </div>

    <br-form callback="save_clinical_note">
        <div class="cont_form">


            <div class="section_group">
                <h4>Chief Complaints (CC)</h4>

                <div class="input_groups">

                    <br-input placeholder="Briefly describe the main issue" name="cc_description"
                    value="${this.evaluation_data.chief_complaints ? this.evaluation_data.chief_complaints : ''}"
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
                    value="${this.evaluation_data.history_of_present_illness ? this.evaluation_data.history_of_present_illness : ''}"
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
                    value="${this.evaluation_data.review_of_systems ? this.evaluation_data.review_of_systems : ''}"
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
                <h4>General Examination (GE)</h4>

                <div class="input_groups">

                    <br-input placeholder="Any visible or notable physical findings" name="ge_observation"
                    value="${this.evaluation_data.general_exam ? this.evaluation_data.general_exam : ''}"
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
                    value="${this.evaluation_data.systemic_exam ? this.evaluation_data.systemic_exam : ''}"
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

    async save_clinical_note(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        data = {
            ...data,
            action: this.state == 'update' ? 'update' : 'create',
            evaluation_id: this.state == 'update' ? this.evaluation_data.id : '',
            visit_id: this.visit_id
        };



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
                dashboardController.visitClinicalEvaluationCardView.PreRender({
                    visit_id: this.visit_id,
                    data: result.data,
                    state: this.state,
                });
                notify('top_left', result.message, 'success');
                this.close();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        }

    }
}