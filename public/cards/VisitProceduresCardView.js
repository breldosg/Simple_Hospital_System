import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitProceduresCardView {
    constructor() {
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
        this.edit_mode = false;
        window.remove_procedure_order_request = this.remove_procedure_order_request.bind(this);
    }

    async PreRender(params = []) {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.datas = params.data ? params.data : [];
        this.visit_id = params.visit_id;
        this.state = params.state ? params.state : "creation";
        this.visit_status = params.visit_status ? params.visit_status : "checked_out";
        this.edit_mode = false;
        if (this.visit_status == "active") {
            this.edit_mode = true;
        }

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


        this.renderProcedureCards();

    }

    renderProcedureCards() {
        const container = document.querySelector('.procedure_order_card_cont_cont .body_part')

        container.innerHTML = '';

        if (this.datas.length > 0) {
            this.datas.forEach((data) => {

                const card = document.createElement('div');
                card.className = 'procedure_card';

                const top = document.createElement('div');
                top.className = 'top';
                top.innerHTML = `
                    <div class="left">
                        <p class="date">${data.procedure_name}</p>
                        <p class="created_by">${date_formatter(data.procedure_date)}</p>
                    </div>
                        `;

                const right = document.createElement('div');
                right.className = 'right';

                const delete_btn = document.createElement('div');
                delete_btn.className = 'delete_btn btn';
                if (!this.edit_mode) {
                    delete_btn.classList.add("visibility_hidden");
                }
                delete_btn.id = 'delete_patient_device';
                delete_btn.innerHTML = '<span class="switch_icon_delete"></span>';
                if (this.edit_mode) {
                    delete_btn.addEventListener('click', () => {
                        dashboardController.confirmPopUpView.PreRender({
                            callback: 'remove_procedure_order_request',
                            parameter: data.id,
                            title: 'Remove Procedure Order',
                            sub_heading: `Order For: ${data.procedure_name}`,
                            description: 'Are you sure you want to remove this procedure order?',
                            ok_btn: 'Remove',
                            cancel_btn: 'Cancel'
                        });

                        this.singleSelectedToDelete = card;
                    });
                }
                right.appendChild(delete_btn);

                top.appendChild(right);

                card.innerHTML = `
                <div class="data">
                    <p class="head">Leading Surgeon:</p>
                    <p class="description">${data.surgeon}</p>
                </div>

                <div class="data">
                    <p class="head">Anesthesiologist Name:</p>
                    <p class="description">${data.anesthesiologist}</p>
                </div>

                <div class="data pills">
                    <p class="head">Assistants</p>
                    <div class="pills_cont">
                        ${data.assistance.map(assistant => `
                            <span class="pill">${assistant}</span>
                        `).join('')}
                    </div>
                </div>

                ${data.note ? `
                <div class="data note">
                    <p class="head">Note</p>
                    <p class="description scroll_bar">${data.note}</p>
                </div>
                    ` : ''}
                
                `;
                card.prepend(top);



                container.appendChild(card);
            })
        }

        this.datas = [];
    }

    ViewReturn() {
        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('procedure_order_card_cont_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Procedure Orders</h4>

                <div class="add_btn ${this.edit_mode ? "" : "visibility_hidden"}" id="add_procedure_order">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part procedure_card_cont">
            </div>
        `;

        const add_btn = card.querySelector('.procedure_order_card_cont_cont #add_procedure_order');
        if (this.edit_mode) {
            add_btn.addEventListener('click', () => {
                dashboardController.visitsProcedurePopUpView.PreRender(
                    {
                        visit_id: this.visit_id,
                        state: 'modify',
                    }
                );
            })
        }

        return card;
    }

    async remove_procedure_order_request(ids) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_procedure_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    procedure_id: ids,
                    state: 'single',
                })
            });

            if (!response.ok) throw new Error('Server Error');

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

    style() {
        return `
            
        `;
    }
}