import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter } from "../script/index.js";

export class VisitRadiologyExamCardView {

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

        console.log(params);

        this.datas = params.data ? params.data : [];
        this.visit_id = params.visit_id;
        this.state = params.state ? params.state : "creation";


        if (this.state == "creation") {
            const cont = document.querySelector('.single_visit_cont .more_visit_cards #diagnosis_group .card_group_cont');
            const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #diagnosis_group .card_group_cont .add_card_btn');
            if (add_btn) {
                add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
            }
            else {
                cont.appendChild(this.ViewReturn());
            }
            dashboardController.singleVisitView.add_to_rendered_card_array('visitAllergyPopUpView');
        }

        if (this.datas.length >= 1) {
            this.renderRadiologyCards();
        }
    }

    renderRadiologyCards() {

        const container = document.querySelector('.radiology_exam_cont_cont .body_part')

        if (this.datas.length > 0) {
            container.innerHTML = '';
            this.datas.forEach((data) => {
                const card = document.createElement('div');
                card.className = 'radiology_exam_card';

                card.innerHTML = `
                    <div class="left">
                        <p class="title">${data.name}</p>
                        <p class="created_by">${data.created_by}</p>
                        <p class="date">${date_formatter(data.created_at)}</p>
                    </div>
                    <div class="right">

                        <div class="more_btn">
                            <span class='switch_icon_more_vert'></span>
                        </div>

                        <p class="status ${data.status}">${data.status}</p>
                    </div>

                    `;

                container.prepend(card);
            })
            this.datas = []; // Clear the data array to prevent duplication
        }
    }

    ViewReturn() {

        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('radiology_exam_cont_cont');



        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Radiology Exam</h4>

                <div class="add_btn" id="add_radiology_exam" >
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part radiology_exam_cont">

            </div>

        
            `;


        const edit_btn = card.querySelector('.radiology_exam_cont_cont #add_radiology_exam');
        edit_btn.addEventListener('click', () => {
            dashboardController.visitRadiologyExamPopUpView.PreRender(
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