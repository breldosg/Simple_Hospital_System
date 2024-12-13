import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";

export class VisitClinicalEvaluationCardView {

    constructor() {
        // window.save_patient_note = this.save_patient_note.bind(this);
        this.visit_id = null;
        this.datas = [];
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // this.datas = params.data.note_data ? params.data.note_data : [];
        this.visit_id = params.visit_id;

        const cont = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont');
        const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont.add_card_btn');
        if (add_btn) {
            add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
        }
        else {
            cont.appendChild(this.ViewReturn());
        }


        // this.renderNoteCards();
    }

    // renderNoteCards() {

    // const container = document.querySelector('.patient_note_cards_cont_cont .body_part')

    // const start_cont = container.querySelector('.start_cont');

    // // console.log();


    // if (this.datas.length < 0) { // if (start_cont) { // start_cont.remove(); // } // } // this.datas.forEach((data)=> {
    // const card = document.createElement('div');
    // card.className = 'note_card';

    // card.innerHTML = `
    // <div class="card_head">
    // <p class="title">${data.created_by}</p>
    // <p class="date">${date_formatter(data.created_at)}</p>
    // </div>
    // <p class="detail">
    // ${data.note}
    // </p>
    // `;

    // container.prepend(card);
    // })

    // this.datas = [];

    // }

    ViewReturn() {

        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('clinical_note_cont_cont');

        card.innerHTML = `
    <div class="head_part">
        <h4 class="heading">Clinical note</h4>

        <div class="add_btn" id="add_patient_clinical_note">
            <span class='switch_icon_add'></span>
        </div>
    </div>

    <div class="body_part clinical_note_cont">

        <div class="clinical_note_card">

            <div class="clinical_note_card_section">
                <div class="top">
                    <p class="head">Chief Complaints (CC)</p>
                </div>

                <div class="clinical_note_card_section_body">

                    <div class="card">
                        <div class="incard_top">
                            <p class="date">Dec 12, 2024</p>
                            <p class="created_by">Kelvin Godliving</p>
                        </div>

                        <div class="data complaint">
                            <p class="head">Complaint Description</p>
                            <p class="description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore,
                                similique.</p>
                        </div>

                    </div>


                </div>
            </div>
            
            <div class="clinical_note_card_section">
                <div class="top">
                    <p class="head">History of Present Illness (HPI)</p>
                </div>

                <div class="clinical_note_card_section_body">

                    <div class="card">
                        <div class="incard_top">
                            <p class="date">Dec 12, 2024</p>
                            <p class="created_by">Kelvin Godliving</p>
                        </div>

                        <div class="data complaint">
                            <p class="head">Complaint Description</p>
                            <p class="description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore,
                                similique.</p>
                        </div>

                    </div>


                </div>
            </div>
            
            <div class="clinical_note_card_section">
                <div class="top">
                    <p class="head">Review of Systems (ROS)</p>
                </div>

                <div class="clinical_note_card_section_body">

                    <div class="card">
                        <div class="incard_top">
                            <p class="date">Dec 12, 2024</p>
                            <p class="created_by">Kelvin Godliving</p>
                        </div>

                        <div class="data complaint">
                            <p class="head">Complaint Description</p>
                            <p class="description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore,
                                similique.</p>
                        </div>

                    </div>


                </div>
            </div>
            
            <div class="clinical_note_card_section">
                <div class="top">
                    <p class="head">General Examination (GE)</p>
                </div>

                <div class="clinical_note_card_section_body">

                    <div class="card">
                        <div class="incard_top">
                            <p class="date">Dec 12, 2024</p>
                            <p class="created_by">Kelvin Godliving</p>
                        </div>

                        <div class="data complaint">
                            <p class="head">Complaint Description</p>
                            <p class="description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore,
                                similique.</p>
                        </div>

                    </div>


                </div>
            </div>

            <div class="clinical_note_card_section">
                <div class="top">
                    <p class="head">Preliminary Diagnosis (Dx)</p>
                </div>

                <div class="clinical_note_card_section_body">

                    <div class="card">
                        <div class="incard_top">
                            <p class="date">Dec 12, 2024</p>
                            <p class="created_by">Kelvin Godliving</p>
                        </div>

                        <div class="data complaint">
                            <p class="head">Complaint Description</p>
                            <p class="description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore,
                                similique.</p>
                        </div>

                    </div>


                </div>
            </div>
            
            
            <div class="clinical_note_card_section">
                <div class="top">
                    <p class="head">Systemic Examination (SE)</p>
                </div>

                <div class="clinical_note_card_section_body">

                    <div class="card">
                        <div class="incard_top">
                            <p class="date">Dec 12, 2024</p>
                            <p class="created_by">Kelvin Godliving</p>
                        </div>

                        <div class="data complaint">
                            <p class="head">Complaint Description</p>
                            <p class="description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore,
                                similique.</p>
                        </div>

                    </div>


                </div>
            </div>
            
        </div>

    </div>


    `;


        const edit_btn = card.querySelector('.clinical_note_cont_cont #add_patient_clinical_note');
        edit_btn.addEventListener('click', () => {
            dashboardController.visitsClinicalNotePopUpView.PreRender(
                {
                    visit_id: this.visit_id,
                }
            );
        })

        return card;

    }

    attachListeners() {
        // const cancel_btn = document.querySelector('br-button[type="cancel"]');

        // cancel_btn.addEventListener('click', () => {
        // this.close();
        // });
    }

    // async save_patient_note(data_old) {
    // const btn_submit = document.querySelector('br-button[type="submit"]');
    // btn_submit.setAttribute('loading', true);


    // var formData = {
    // ...data_old,
    // visit_id: this.visit_id,
    // action: 'create',
    // }


    // try {
    // const response = await fetch('/api/patient/save_update_delete_patient_note', {
    // method: 'POST',
    // headers: {
    // 'Content-Type': 'application/json'
    // },
    // body: JSON.stringify(formData)
    // });

    // if (!response.ok) {
    // throw new Error('failed To update vital. Server Error');
    // }

    // const result = await response.json();

    // if (result.success) {
    // notify('top_left', result.message, 'success');
    // // After successful creation, clear the popup and close it
    // dashboardController.addPatientNotePopUpView.close();

    // this.datas = [];
    // this.datas.push(result.data);

    // this.renderNoteCards()

    // } else {
    // notify('top_left', result.message, 'warning');
    // }
    // } catch (error) {
    // notify('top_left', error.message, 'error');
    // }
    // finally {
    // btn_submit.setAttribute('loading', false);
    // }
    // }
}