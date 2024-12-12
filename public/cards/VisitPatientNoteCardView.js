import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class VisitPatientNoteCardView {
    constructor() {
        window.save_patient_note = this.save_patient_note.bind(this);
        this.visit_id = null;
        this.datas = [];
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.datas = params.data.note_data ? params.data.note_data : [];
        this.visit_id = params.visit_id;

        const cont = document.querySelector('.single_visit_cont .more_visit_detail');
        cont.classList.add('active');
        cont.appendChild(this.ViewReturn());


        this.renderNoteCards();
    }

    renderNoteCards() {

        const container = document.querySelector('.patient_note_cards_cont_cont .body_part')

        const start_cont = container.querySelector('.start_cont');


        if (this.datas.length < 1) {
            if (start_cont) {
                start_cont.remove();
            }
        }

        this.datas.forEach((data) => {
            const card = document.createElement('div');
            card.className = 'note_card';

            card.innerHTML = `
                        <div class="card_head">
                        <p class="date">${date_formatter(data.created_at)}</p>
                        <p class="title">${data.created_by}</p>
                        </div>
                        <p class="detail">
                            ${data.note}
                        </p>
                    `;

            container.prepend(card);
        })

        this.datas = [];

    }

    ViewReturn() {

        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('patient_note_cards_cont_cont');

        card.innerHTML = `
        <!-- add active to open full screen -->
    <div class="full_screen_overlay ">
        <div class="full_screen">
            <div class="head_part">
                <h4 class="heading">Patient Note</h4>

                <div class="add_btn" id="add_patient_note_btn" >
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">

                <!-- no note show -->
                <div class="start_cont">
                    <p class="start_view_overlay">No Patient Note Found</p>
                </div>

            </div>

        </div>
    </div>
        
            `;


        const edit_btn = card.querySelector('#add_patient_note_btn');
        edit_btn.addEventListener('click', () => {
            console.log('add Note Btn');
            dashboardController.addPatientNotePopUpView.PreRender();
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

// P/SP/0024