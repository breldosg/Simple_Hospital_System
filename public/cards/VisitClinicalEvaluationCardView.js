import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter } from "../script/index.js";

export class VisitClinicalEvaluationCardView {

    constructor() {
        // window.save_patient_note = this.save_patient_note.bind(this);
        this.visit_id = null;
        this.data = [];
        this.edit_mode = false;
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }
        console.log(params);


        this.data = params.data ? params.data : [];
        this.visit_id = params.visit_id;
        this.state = params.state ? params.state : "creation";
        this.visit_status = params.visit_status ? params.visit_status : "checked_out";
        this.edit_mode = false;
        if (this.visit_status == "active") {
            this.edit_mode = true;
        }
        if (this.state == "creation") {
            const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont.add_card_btn');
            if (add_btn) {
                add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
            }
            else {
                const cont = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont');
                cont.appendChild(this.ViewReturn());
            }

            dashboardController.singleVisitView.add_to_rendered_card_array('visitsClinicalEvaluationPopUpView')

        }

        this.renderClinicalEvaluationCards();

    }


    renderClinicalEvaluationCards() {

        if (this.data == "") return;





        const container = document.querySelector('.clinical_note_cont_cont .body_part');

        container.innerHTML = `
<div class="clinical_note_card">

    <div class="incard_top">
        <p class="date">${date_formatter(this.data.created_at)}</p>
        <p class="created_by">${this.data.created_by}</p>
    </div>

    <div class="clinical_note_card_in">
        <div class="clinical_note_card_section">
            <div class="top">
                <p class="head">Chief Complaints (CC)</p>
            </div>

            <div class="clinical_evaluation_card_section_body">

                <div class="card">
                    <div class="data complaint">
                        <p class="head">Complaint Description</p>
                        <p class="description">${this.data.chief_complaints}</p>
                    </div>

                </div>


            </div>
        </div>

        <div class="clinical_note_card_section">
            <div class="top">
                <p class="head">History of Present Illness (HPI)</p>
            </div>

            <div class="clinical_evaluation_card_section_body">

                <div class="card">
                    <div class="data complaint">
                        <p class="head">Illness Description</p>
                        <p class="description">${this.data.history_of_present_illness}</p>
                    </div>

                </div>


            </div>
        </div>

    ${this.data.review_of_systems != null ? `
        <div class="clinical_note_card_section">
            <div class="top">
                <p class="head">Review of Systems (ROS)</p>
            </div>

            <div class="clinical_evaluation_card_section_body">

                <div class="card">

                    <div class="data complaint">
                        <p class="head">Related Symptoms</p>
                        <p class="description">${this.data.review_of_systems}</p>
                    </div>

                </div>


            </div>
        </div>`: ``
            }

    ${this.data.general_exam != null ? `
        <div class="clinical_note_card_section">
            <div class="top">
                <p class="head">General Examination (GE)</p>
            </div>

            <div class="clinical_evaluation_card_section_body">

                <div class="card">
                    <div class="data complaint">
                        <p class="head">Physical Observations</p>
                        <p class="description">${this.data.general_exam}</p>

                    </div>

                </div>


            </div>
        </div>`: ``
            }

    ${this.data.systemic_exam != null ? `
        <div class="clinical_note_card_section">
            <div class="top">
                <p class="head">Systemic Examination (SE)</p>
            </div>

            <div class="clinical_evaluation_card_section_body">

                <div class="card">

                    <div class="data complaint">
                        <p class="head">Focused Findings</p>
                        <p class="description">${this.data.systemic_exam}</p>

                    </div>

                </div>


            </div>
        </div>`: ``
            }
    </div>

</div>
        `;


        this.datas = "";

    }

    ViewReturn() {

        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('clinical_note_cont_cont');

        card.innerHTML = `
<div class="head_part">
    <h4 class="heading">Clinical Evaluation</h4>

    
        <div class="add_btn ${this.edit_mode ? "" : "visibility_hidden"}" id="add_patient_clinical_note">
            <span class='switch_icon_edit'></span>
        </div>
        
</div>

<div class="body_part clinical_note_cont">



</div>


`;


        const edit_btn = card.querySelector('.clinical_note_cont_cont #add_patient_clinical_note');
        if (this.edit_mode) {
            edit_btn.addEventListener('click', () => {
                dashboardController.visitsClinicalEvaluationPopUpView.PreRender(
                    {
                        visit_id: this.visit_id,
                        data: this.data,
                        state: "update",
                        visit_status: this.visit_status,
                    }
                );
            })
        }
        return card;
    }

    attachListeners() {
    }


}
