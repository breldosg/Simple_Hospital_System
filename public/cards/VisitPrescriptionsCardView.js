import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitPrescriptionsCardView {
    constructor() {
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
        this.edit_mode = false;
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
        this.edit_mode = false;
        this.visit_status = params.visit_status ? params.visit_status : "checked_out";
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
            dashboardController.singleVisitView.add_to_rendered_card_array('visitsPrescriptionPopUpView');
        }

        this.main_container = document.querySelector('.prescription_order_card_cont_cont');

        this.renderPrescriptionCards();

    }

    renderPrescriptionCards() {
        const container = this.main_container.querySelector('.body_part')

        container.innerHTML = '';

        if (this.datas.length > 0) {
            this.datas.forEach((data) => {

 

                // construct if status is base on is_paid and is_given
                let status = '';
                if (data.is_paid == "true" && data.is_given == "true") {
                    status = 'completed';
                } else if (data.is_paid == "true" && data.is_given == "false") {
                    status = 'approved';
                } else {
                    status = 'pending';
                }

                const card = document.createElement('div');
                card.classList.add('procedure_card');
                card.innerHTML = `
            <div class="top">
                <div class="card_left">
                    <div class="info_top">
                        <p class="date">${data.product_name} </p>
                    </div>
                    <p class="created_by">${date_formatter(data.created_at)}</p>
                </div>
                <div class="card_right">
                    <div class="delete_btn btn ${this.edit_mode ? "" : "visibility_hidden"}" title="Delete this prescription.">
                        <span class="switch_icon_delete"></span>
                    </div>
                </div>
            </div>

            <div class="data">
                <p class="head">Quantity:</p>
                <p class="description">${data.amount} ${data.unit ?? ''}</p>
            </div>

            <div class="data">
                <p class="head">Duration:</p>
                <p class="description">${data.duration} days</p>
            </div>

            <div class="data">
                <p class="head">Status:</p>
                <p class="description ${status}">${status === 'completed' ? 'Paid and Given' : status === 'approved' ? 'Paid but Not Given' : 'Not Paid'}</p>
            </div>

                
            <div class="data note">
                <p class="head">Instruction</p>
                <p class="description scroll_bar">${data.instruction}</p>
            </div>
                    `;
                card.setAttribute('title', data.product_name);


                const remove_btn = card.querySelector('.delete_btn');
                if (this.edit_mode) {
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
                }


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

                <div class="add_btn ${this.edit_mode ? "" : "visibility_hidden"}">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part prescription_card_cont">

            </div>
        `;

        const add_btn = card.querySelector('.add_btn');
        if (this.edit_mode) {
            add_btn.addEventListener('click', () => {
                dashboardController.visitsPrescriptionPopUpView.PreRender(
                    {
                        visit_id: this.visit_id,
                        state: 'modify',
                    }
                );
            })
        }

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
          /* -------------------------------------------------------- */

        .prescription_order_card_cont_cont {
            padding: 10px;

            .head_part {
                padding: 19px;
                padding-top: 10px;
                padding-bottom: 0px;
            }

            .prescription_card_cont {
                display: flex;
                flex-direction: column;
                flex: none;
                gap: 20px;

                .procedure_card {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 20px;
                    border-radius: var(--main_border_r);
                    border: solid 1px var(--pri_border_color);
                    width: 100%;

                    .top {
                        border: none;
                        display: flex;
                        justify-content: space-between;
                        /* align-items: center; */

                        .card_left {
                            width: 70%;

                            .info_top{
                                display: flex;
                                align-items: center;
                                gap: 5px;

                                .status_dot{
                                    padding: 2px 2px;
                                    border-radius: 50%;
                                    flex: none;

                                    &.completed{
                                        background-color: var(--success_color);
                                    }

                                    &.approved{
                                        background-color: var(--warning_color);
                                    }
                                    &.pending{
                                        background-color: var(--error_color);
                                    }
                                }
                            }
                        }

                        .card_right {
                            display: flex;
                            gap: 10px;

                            .btn {
                                width: 35px;
                                height: 35px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border-radius: 5px;
                                flex: none;
                                cursor: pointer;

                                span {
                                    font-size: 16px;
                                }
                            }

                            .btn:hover {
                                background-color: var(--pri_op);

                                span {
                                    color: var(--pri_color);
                                }
                            }

                            .delete_btn:hover {
                                background-color: var(--white_error_color_op1);

                                span {
                                    color: var(--error_color);
                                }
                            }
                        }

                        .date {
                            font-size: 14px;
                            font-weight: 900;
                        }


                    }

                    .data {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-block: 5px;
                        border-bottom: 1px solid var(--input_border);

                        .head {
                            font-weight: 500;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            display: inline-block;
                        }

                        .description {
                            width: 40%;
                            font-weight: 600;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            display: inline-block;
                        }
                    }

                    .note {
                        flex-direction: column;
                        gap: 10px;
                        height: 100%;
                        overflow: auto;

                        .head {
                            font-weight: 700;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            display: inline-block;
                            width: 100%;
                            flex: none;
                        }

                        .description {
                            width: 100%;
                            font-weight: 400;
                            white-space: unset;
                            text-overflow: unset;
                            overflow: unset;
                            display: unset;
                            word-break: break-all;
                            overflow-y: scroll;
                            height: 100%;
                        }
                    }

                    .data:last-child {
                        border: none;
                    }
                }

                .procedure_card:hover {
                    /* box-shadow: 0 0 5px 0 #0000003e; */
                    background: var(--pri_op1);
                }
            }
        }
        `
    }

}