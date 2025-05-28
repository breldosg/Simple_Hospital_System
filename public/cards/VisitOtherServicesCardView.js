import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitOtherServicesCardView {
    constructor() {
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
        this.edit_mode = false;
        window.remove_other_service_request = this.remove_other_service_request.bind(this);

        applyStyle(this.style());
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
            dashboardController.singleVisitView.add_to_rendered_card_array('visitsOtherServicePopUpView');
        }

        this.main_container = document.querySelector('.other_services_card_cont_cont');

        this.renderServiceCards();
    }

    renderServiceCards() {
        const container = this.main_container.querySelector('.body_part')

        container.innerHTML = '';

        if (this.datas.length > 0) {
            this.datas.forEach((data) => {

                // construct status based on is_paid
                let status = data.is_paid === "true" ? 'completed' : 'pending';

                const card = document.createElement('div');
                card.classList.add('service_card');
                card.innerHTML = `
            <div class="top">
                <div class="card_left">
                    <div class="info_top">
                        <p class="name">${data.name}</p>
                    </div>
                    <p class="created_by">${date_formatter(data.created_at)}</p>
                </div>
                <div class="card_right">
                    <div class="delete_btn btn ${this.edit_mode ? "" : "visibility_hidden"}" title="Delete this service.">
                        <span class="switch_icon_delete"></span>
                    </div>
                </div>
            </div>

            <div class="data">
                <p class="head">Quantity:</p>
                <p class="description">${data.quantity}</p>
            </div>

            <div class="data">
                <p class="head">Status:</p>
                <p class="description ${status}">${status === 'completed' ? 'Paid' : 'Not Paid'}</p>
            </div>
                    `;
                card.setAttribute('title', data.name);

                const remove_btn = card.querySelector('.delete_btn');
                if (this.edit_mode) {
                    remove_btn.addEventListener('click', () => {
                        dashboardController.confirmPopUpView.PreRender({
                            callback: 'remove_other_service_request',
                            parameter: data.id,
                            title: 'Remove Service',
                            sub_heading: `Service: ${data.name}`,
                            description: 'Are you sure you want to remove this service?',
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
        card.classList.add('other_services_card_cont_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Other Services</h4>

                <div class="add_btn ${this.edit_mode ? "" : "visibility_hidden"}">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part services_card_cont">

            </div>
        `;

        const add_btn = card.querySelector('.add_btn');
        if (this.edit_mode) {
            add_btn.addEventListener('click', () => {
                dashboardController.visitsOtherServicePopUpView.PreRender(
                    {
                        visit_id: this.visit_id,
                        state: 'modify',
                    }
                );
            })
        }

        return card;
    }

    async remove_other_service_request(id) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_other_service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    order_id: id,
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
        .other_services_card_cont_cont {
            padding: 10px !important;

            .head_part {
                padding: 19px;
                padding-top: 10px;
                padding-bottom: 0px;
            }

            .services_card_cont {
                display: flex;
                flex-direction: column;
                flex: none;
                gap: 5px !important;

                .service_card {
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

                        .card_left {
                            width: 70%;

                            .info_top {
                                display: flex;
                                align-items: center;
                                gap: 5px;
                            }

                            .name {
                                font-size: 14px;
                                font-weight: 900;
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

                            &.completed {
                                color: var(--success_color);
                            }

                            &.pending {
                                color: var(--error_color);
                            }
                        }
                    }

                    .data:last-child {
                        border: none;
                    }
                }

                .service_card:hover {
                    background: var(--pri_op1);
                }
            }
        }
        `
    }
}