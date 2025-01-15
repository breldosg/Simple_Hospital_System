import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class VisitVaccineCardView {
    constructor() {
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
        window.remove_vaccine_request = this.remove_vaccine_request.bind(this);
    }

    async PreRender(params = []) {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.datas = params.data ? params.data : [];
        this.visit_id = params.visit_id;
        this.state = params.state ? params.state : "creation";

        if (this.state == "creation") {
            const cont = document.querySelector('.single_visit_cont .more_visit_cards #treatment_group .card_group_cont');
            const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #treatment_group .card_group_cont .add_card_btn');
            if (add_btn) {
                add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
            }
            else {
                cont.appendChild(this.ViewReturn());
            }
            dashboardController.singleVisitView.add_to_rendered_card_array('visitsVaccinePopUpView');
        }

        if (this.datas.length >= 1) {
            this.renderVaccineCards();
        }
    }

    renderVaccineCards() {
        const container = document.querySelector('.vaccine_card_cont_cont .body_part')

        container.innerHTML = '';

        if (this.datas.length > 0) {
            this.datas.forEach((data) => {
                const card = document.createElement('div');
                card.className = 'vaccine_card';

                card.innerHTML = `
                    <div class="top">
                        <div class="left">
                            <p class="date">${date_formatter(data.created_at)}</p>
                            <p class="created_by">${data.created_by}</p>
                        </div>
                        <div class="right">
                            <div class="delete_btn btn" id="delete_patient_vaccine">
                                <span class='switch_icon_delete'></span>
                            </div>
                        </div>
                    </div>

                    <div class="data">
                        <p class="head">Vaccine Name:</p>
                        <p class="description">${data.vaccine_name}</p>
                    </div>
                    
                    <div class="data">
                        <p class="head">Given Date:</p>
                        <p class="description">${date_formatter(data.given_date)}</p>
                    </div>
                    
                    ${data.note ? `
                    <div class="data note">
                        <p class="head">Note</p>
                        <p class="description">${data.note}</p>
                    </div>
                    ` : ''}
                `;

                // delete listener
                const delete_btn = card.querySelector('.delete_btn');
                delete_btn.addEventListener('click', () => {

                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'remove_vaccine_request',
                        parameter: data.id,
                        title: 'Remove Vaccine Record',
                        sub_heading: `Vaccine: ${data.vaccine_name}`,
                        description: 'Are you sure you want to remove this vaccine record?',
                        ok_btn: 'Remove',
                        cancel_btn: 'Cancel'
                    });

                    this.singleSelectedToDelete = card;

                });

                container.prepend(card);
            })

            this.datas = [];
        }

        this.datas = [];
    }

    ViewReturn() {
        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('vaccine_card_cont_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Vaccines</h4>

                <div class="add_btn" id="add_patient_vaccine">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part vaccine_card_cont">
            </div>
        `;

        const add_btn = card.querySelector('.vaccine_card_cont_cont #add_patient_vaccine');
        add_btn.addEventListener('click', () => {
            dashboardController.visitsVaccinePopUpView.PreRender(
                {
                    visit_id: this.visit_id,
                    state: 'modify',
                }
            );
        })

        return card;
    }

    async remove_vaccine_request(ids) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_vaccine_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    vaccine_ids: [ids],
                    state: 'single',
                })
            });

            if (!response.ok) throw new Error('Server Error');

            const result = await response.json();
            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }

            notify('top_left', result.message, 'success');

            if (this.singleSelectedToDelete) {
                this.singleSelectedToDelete.remove();
                this.singleSelectedToDelete = '';
            }

        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            dashboardController.loaderView.remove();
        }
    }

}