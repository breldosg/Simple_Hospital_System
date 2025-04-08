import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitVaccineCardView {
    constructor() {
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
        this.edit_mode = false;
        window.remove_vaccine_request = this.remove_vaccine_request.bind(this);
        this.applyStyle();
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
                            <div class="delete_btn btn ${this.edit_mode ? "" : "visibility_hidden"}" id="delete_patient_vaccine">
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
                if (this.edit_mode) {
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
                }

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

                <div class="add_btn ${this.edit_mode ? "" : "visibility_hidden"}" id="add_patient_vaccine">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part vaccine_card_cont">
            </div>
        `;

        const add_btn = card.querySelector('.vaccine_card_cont_cont #add_patient_vaccine');
        if (this.edit_mode) {
            add_btn.addEventListener('click', () => {
                dashboardController.visitsVaccinePopUpView.PreRender(
                    {
                        visit_id: this.visit_id,
                        state: 'modify',
                    }
                );
            })
        }

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

    applyStyle() {
        const styleElement = document.createElement('style');
        styleElement.textContent = this.style();
        document.head.appendChild(styleElement);
    }

    style() {
        return `
              /* -------------------------------------------------------- */

                        .vaccine_card_cont_cont {
                            .vaccine_card_cont {
                                display: flex;
                                flex-direction: column;
                                flex: none;
                                gap: 20px;

                                .vaccine_card {
                                    display: flex;
                                    flex-direction: column;
                                    gap: 10px;
                                    width: 100%;
                                    padding: 20px;
                                    border-radius: var(--main_border_r);
                                    border: solid 1px var(--pri_border_color);

                                    .top {
                                        border: none;
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;

                                        .left {
                                            width: 70%;
                                        }

                                        .right {
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
                                            font-size: 20px;
                                            font-weight: 900;
                                        }

                                        .created_by {
                                            font-size: 13px;
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
                                        align-items: left;
                                        flex-direction: column;
                                        gap: 10px;

                                        .head {
                                            font-weight: 700;
                                            white-space: nowrap;
                                            text-overflow: ellipsis;
                                            overflow: hidden;
                                            display: inline-block;
                                            width: 100%;
                                        }

                                        .description {
                                            width: 100%;
                                            font-weight: 400;
                                            white-space: unset;
                                            text-overflow: unset;
                                            overflow: unset;
                                            display: unset;
                                            word-break: break-all;
                                        }
                                    }

                                    .data:last-child {
                                        border: none;
                                    }
                                }

                                .vaccine_card:hover {
                                    background: var(--pri_op1);
                                }
                            }
                        }

        `;
    }

}