import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class VisitAllergyCardView {

    constructor() {
        // window.save_patient_note = this.save_patient_note.bind(this);
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
    }

    async PreRender(params = []) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.datas = params.data ? params.data : [];
        this.visit_id = params.visit_id;
        this.state = params.state ? params.state : "creation";

        if (this.state == "creation") {
            const cont = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont');
            const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont .add_card_btn');
            if (add_btn) {
                add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
            }
            else {
                cont.appendChild(this.ViewReturn());
            }
            dashboardController.singleVisitView.add_to_rendered_card_array('visitAllergyPopUpView');
        }

        if (this.datas.length >= 1) {
            this.renderAllergyCards();
        }
    }

    renderAllergyCards() {

        const container = document.querySelector('.allergy_card_cont_cont .body_part')

        if (this.state == 'creation') {
            container.innerHTML = '';
        }

        if (this.datas.length > 0) {
            this.datas.forEach((data) => {
                const card = document.createElement('div');
                card.className = 'allergy_card';

                card.innerHTML = `
                    <div class="top">
                        <div class="left">
                            <p class="date">${date_formatter(data.created_at)}</p>
                            <p class="created_by">${data.created_by}</p>
                        </div>
                        <div class="right">
                            <div class="edit_btn btn" id="edit_patient_allergy" >
                                <span class='switch_icon_edit'></span>
                            </div>
                            <div class="delete_btn btn" id="delete_patient_allergy" >
                                <span class='switch_icon_delete'></span>
                            </div>
                        </div>
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


        const add_btn = card.querySelector('.allergy_card_cont_cont #add_patient_allergy');
        add_btn.addEventListener('click', () => {
            dashboardController.visitAllergyPopUpView.PreRender(
                {
                    visit_id: this.visit_id,
                    state: 'modify',
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
}

