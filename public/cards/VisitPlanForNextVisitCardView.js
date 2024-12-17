import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter } from "../script/index.js";

export class VisitPlanForNextVisitCardView {

    constructor() {
        // window.save_patient_note = this.save_patient_note.bind(this);
        this.visit_id = null;
        this.data = [];
        this.state = "creation";
    }

    async PreRender(params = []) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.data = params.data ? params.data : "";
        this.visit_id = params.visit_id;
        this.state = params.state ? params.state : "creation";

        console.log(params);


        if (this.data != null) {
            if (this.state == "creation") {
                const cont = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont');
                const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont .add_card_btn');
                if (add_btn) {
                    add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
                }
                else {
                    cont.appendChild(this.ViewReturn());
                }
            }

            this.renderPlanCards()
            dashboardController.singleVisitView.add_to_rendered_card_array('visitPlanForNextVisitPopUpView')
        };
    }

    renderPlanCards() {

        if (this.data == "") return;


        const container = document.querySelector('.next_visit_plan_cont_cont .body_part')

        container.innerHTML = `
            <div class="top">
                <p class="date">${date_formatter(this.data.date)}</p>
                <p class="created_by">${this.data.created_by}</p>
            </div>

            <div class="data">
                <p class="head">Purpose For Next Visit</p>
                <p class="description">${this.data.purpose}</p>
            </div>
            
            <div class="data">
                <p class="head">Instruction For Next Visit</p>
                <p class="description">${this.data.instruction}</p>
            </div>
                    `;


        this.datas = "";

    }

    ViewReturn() {

        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('next_visit_plan_cont_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Plan for Next Visit</h4>

                <div class="add_btn" id="add_next_visit_plan" >
                    <span class='switch_icon_edit'></span>
                </div>
            </div>

            <div class="body_part next_visit_plan_cont">


            </div>

        
            `;


        const edit_btn = card.querySelector('.next_visit_plan_cont_cont #add_next_visit_plan');
        edit_btn.addEventListener('click', () => {
            dashboardController.visitPlanForNextVisitPopUpView.PreRender(
                {
                    visit_id: this.visit_id,
                    data: this.data,
                    state: "update",
                }
            );
        })

        return card;

    }

    // attachListeners() {
    //     //     const cancel_btn = document.querySelector('br-button[type="cancel"]');

    //     //     cancel_btn.addEventListener('click', () => {
    //     //         this.close();
    //     //     });
    // }

    // async save_patient_note(data_old) {
    //     const btn_submit = document.querySelector('br-button[type="submit"]');
    //     btn_submit.setAttribute('loading', true);


    //     var formData = {
    //         ...data_old,
    //         visit_id: this.visit_id,
    //         action: 'create',
    //     }


    //     try {
    //         const response = await fetch('/api/patient/save_update_delete_patient_note', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(formData)
    //         });

    //         if (!response.ok) {
    //             throw new Error('failed To update vital. Server Error');
    //         }

    //         const result = await response.json();

    //         if (result.success) {
    //             notify('top_left', result.message, 'success');
    //             // After successful creation, clear the popup and close it
    //             dashboardController.addPatientNotePopUpView.close();

    //             this.datas = [];
    //             this.datas.push(result.data);

    //             this.renderNoteCards()

    //         } else {
    //             notify('top_left', result.message, 'warning');
    //         }
    //     } catch (error) {
    //         notify('top_left', error.message, 'error');
    //     }
    //     finally {
    //         btn_submit.setAttribute('loading', false);
    //     }
    // }
}
