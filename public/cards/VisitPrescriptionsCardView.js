import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class VisitPrescriptionsCardView {
    constructor() {
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
        window.remove_prescription_order_request = this.remove_prescription_order_request.bind(this);
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
            dashboardController.singleVisitView.add_to_rendered_card_array('visitsProcedurePopUpView');
        }

        this.main_container = document.querySelector('.prescription_order_card_cont_cont');

        this.renderPrescriptionCards();

    }

    renderPrescriptionCards() {
        const container = this.main_container.querySelector('.body_part')
        console.log(this.datas);


        container.innerHTML = '';

        if (this.datas.length > 0) {
            this.datas.forEach((data) => {


                const card = document.createElement('div');
                card.classList.add('procedure_card');
                card.innerHTML = `
            <div class="top">
                <div class="card_left">
                    <p class="date">${data.product_name}</p>
                    <p class="created_by">${date_formatter(data.created_at)}</p>
                </div>
                <div class="card_right">
                    <div class="delete_btn btn" title="Delete this prescription.">
                        <span class="switch_icon_delete"></span>
                    </div>
                </div>
            </div>

            <div class="data">
                <p class="head">Amount:</p>
                <p class="description">${data.amount}</p>
            </div>

            <div class="data">
                <p class="head">Duration:</p>
                <p class="description">${data.duration} days</p>
            </div>

                
            <div class="data note">
                <p class="head">Instruction</p>
                <p class="description scroll_bar">${data.instruction}</p>
            </div>
                    `;
                card.setAttribute('title', data.product_name);


                const remove_btn = card.querySelector('.delete_btn');
                remove_btn.addEventListener('click', () => {

                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'remove_prescription_order_request',
                        parameter: data.id,
                        title: 'Remove Procedure Order',
                        sub_heading: `Order For: ${data.procedure_name}`,
                        description: 'Are you sure you want to remove this procedure order?',
                        ok_btn: 'Remove',
                        cancel_btn: 'Cancel'
                    });

                    this.singleSelectedToDelete = card;

                });


                container.prepend(card);
            })
        }

        this.datas = [];
    }

    ViewReturn() {
        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('prescription_order_card_cont_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Prescription Orders</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part prescription_card_cont">

            </div>
        `;

        const add_btn = card.querySelector('.add_btn');
        add_btn.addEventListener('click', () => {
            dashboardController.visitsPrescriptionPopUpView.PreRender(
                {
                    visit_id: this.visit_id,
                    state: 'modify',
                }
            );
        })

        return card;
    }

    async remove_prescription_order_request(id) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_prescription_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    prescription_id: id,
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