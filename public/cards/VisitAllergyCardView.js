import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter } from "../script/index.js";

export class VisitAllergyCardView {

    constructor() {
        // window.save_patient_note = this.save_patient_note.bind(this);
        this.visit_id = null;
        this.datas = [];
    }

    async PreRender(params = []) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.datas = params.data.allergy_data ? params.data.allergy_data : [];
        this.visit_id = params.visit_id;


        const cont = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont');
        const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont .add_card_btn');
        if (add_btn) {
            add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
        }
        else {
            cont.appendChild(this.ViewReturn());
        }

        if (this.datas.length >= 1) {
            this.renderAllergyCards();
        }
    }

    renderAllergyCards() {

        const container = document.querySelector('.allergy_card_cont_cont .body_part')

        this.datas.forEach((data) => {
            const card = document.createElement('div');
            card.className = 'allergy_card';

            card.innerHTML = `
                    <div class="top">
                        <p class="date">${date_formatter(data.created_at)}</p>
                        <p class="created_by">${data.created_by}</p>
                    </div>

                    <div class="data">
                        <p class="head">Allergen Type:</p>
                        <p class="description">${data.allergy_type}</p>
                    </div>
                    
                    
                    <div class="data">
                        <p class="head">Reaction Type:</p>
                        <p class="description">${data.allergy_reaction}</p>
                    </div>
                    
                    
                    <div class="data specific_allergy">
                        <p class="head">Specific Allergen:</p>
                        <p class="description">${data.allergy_specific}</p>
                    </div>
                    
                    
                    <div class="data">
                        <p class="head">Allergy Severity:</p>
                        <p class="description">${data.allergy_severity}</p>
                    </div>
                    
                    
                    <div class="data">
                        <p class="head">Allergy Condition:</p>
                        <p class="description">${data.allergy_condition}</p>
                    </div>

                    `;

            container.prepend(card);
        })

        this.datas = [];

    }

    ViewReturn() {

        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('allergy_card_cont_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Allergy</h4>

                <div class="add_btn" id="add_patient_allergy" >
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part allergy_card_cont">


            </div>

        
            `;


        const edit_btn = card.querySelector('.allergy_card_cont_cont #add_patient_allergy');
        edit_btn.addEventListener('click', () => {
            dashboardController.visitAllergyPopUpView.PreRender(
                {
                    visit_id: this.visit_id,
                }
            );
        })

        return card;

    }

    attachListeners() {
        //     const cancel_btn = document.querySelector('br-button[type="cancel"]');

        //     cancel_btn.addEventListener('click', () => {
        //         this.close();
        //     });
    }

    async save_patient_note(data_old) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);


        var formData = {
            ...data_old,
            visit_id: this.visit_id,
            action: 'create',
        }


        try {
            const response = await fetch('/api/patient/save_update_delete_patient_note', {
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

            if (result.success) {
                notify('top_left', result.message, 'success');
                // After successful creation, clear the popup and close it
                dashboardController.addPatientNotePopUpView.close();

                this.datas = [];
                this.datas.push(result.data);

                this.renderNoteCards()

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


