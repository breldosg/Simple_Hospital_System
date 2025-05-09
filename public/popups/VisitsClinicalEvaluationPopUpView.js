import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, debounce, notify, searchInArray } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitsClinicalEvaluationPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        window.save_clinical_note = this.save_clinical_note.bind(this);
        applyStyle(this.style(), 'VisitsClinicalEvaluationPopUpView');
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
        this.visit_status = params.visit_status ? params.visit_status : 'checked_out';

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners()
    }

    input_styles() {
        return `
        border-radius: var(--input_main_border_r);
        padding: 10px;
        height: 60px;
        background-color: transparent;
        border: 2px solid var(--input_border);
        `;
    }
    
    input_host_styles() {
        return `
        width:100%;
        `;
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
                        label="Complaint Description" required type="textarea" host_style="${this.input_host_styles()}" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>
                </div>
            </div>


            <div class="section_group">
                <h4>History of Present Illness (HPI)</h4>

                <div class="input_groups">

                    <br-input placeholder="Briefly describe the illness" name="hpi_description"
                    value="${this.evaluation_data.history_of_present_illness ? this.evaluation_data.history_of_present_illness : ''}"
                        label="Illness Description" required type="textarea" host_style="${this.input_host_styles()}" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>
                </div>


            </div>

            <div class="section_group">
                <h4>Review of Systems (ROS)</h4>

                <div class="input_groups">

                    <br-input placeholder="Explain related symptoms" name="ros_symptoms" label="Related Symptoms"
                    value="${this.evaluation_data.review_of_systems ? this.evaluation_data.review_of_systems : ''}"
                        type="textarea" host_style="${this.input_host_styles()}" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>
                </div>
            </div>


            <div class="section_group">
                <h4>General Examination (GE)</h4>

                <div class="input_groups">

                    <br-input placeholder="Any visible or notable physical findings" name="ge_observation"
                    value="${this.evaluation_data.general_exam ? this.evaluation_data.general_exam : ''}"
                        label="Physical Observations" type="textarea" host_style="${this.input_host_styles()}" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>
                </div>


            </div>


            <div class="section_group">
                <h4>Systemic Examination (SE)</h4>

                <div class="input_groups">

                    <br-input placeholder="Key findings in specific systems..." name="se_findings"
                    value="${this.evaluation_data.systemic_exam ? this.evaluation_data.systemic_exam : ''}"
                        label="Focused Findings" require type="textarea" host_style="${this.input_host_styles()}" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>
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

    }

    style() {
        return `
          /* ------------------------------------------------------- */

        .clinical_note_add_popUp {
            width: 80%;
            max-width: 830px;
            height: fit-content;
            max-height: 650px;
            background: var(--pure_white_background);
            border-radius: var(--main_border_r);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 30px;
            padding: 50px;
            position: relative;
            z-index: 1;

            .cont_heading {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .heading {
                    font-size: 17px;
                    font-weight: bold;
                }
            }

            .cont_form {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                gap: 30px;
                height: 100%;
                /* row-gap: 50px; */

                .section_group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    width:45%;

                    h4 {
                        color: var(--light_pri_color);
                        padding-bottom: 10px;
                        border-bottom: 1px var(--active_color) solid;
                    }

                    .input_groups {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;

                        .input_group_group {
                            display: flex;
                            align-items: center;
                            /* justify-content: space-between; */
                            gap: 20px;
                        }
                    }
                }

            }

            .btn_wrapper {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: end;
                gap: 10px;
                margin-top: 30px;

                .card-button {
                    border: none;
                    background-color: var(--pri_color);
                    padding: 10px 35px;
                    font-weight: bold;
                    font-size: 12px;
                    color: var(--white);
                    cursor: pointer;
                    border-radius: var(--input_main_border_r);
                }

                .secondary {
                    background-color: var(--gray_text);
                    color: var(--white);
                }

            }

        }

        `;
    }
}