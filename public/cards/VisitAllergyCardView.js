import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitAllergyCardView {

    constructor() {
        // window.save_patient_note = this.save_patient_note.bind(this);
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
        this.visit_status = null;
        this.edit_mode = false;
        window.remove_allergy_request = this.remove_allergy_request.bind(this);
        this.applyStyle();
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
        this.visit_status = params.visit_status ? params.visit_status : "checked_out";
        this.edit_mode = false;
        if (this.visit_status == "active") {
            this.edit_mode = true;
        }

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


        this.renderAllergyCards();

    }

    renderAllergyCards() {

        const container = document.querySelector('.allergy_card_cont_cont .body_part')

        container.innerHTML = '';


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
                            <div style="display: none;" class="edit_btn btn" id="edit_patient_allergy" >
                                <span class='switch_icon_edit'></span>
                            </div>
                            <div class="delete_btn btn ${this.visit_status == "active" ? "" : "visibility_hidden"}" title="Delete this allergy." id="delete_patient_allergy" >
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

                const delete_btn = card.querySelector('.delete_btn');
                if (this.visit_status == "active") {
                    delete_btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        dashboardController.confirmPopUpView.PreRender({
                            callback: 'remove_allergy_request',
                            parameter: data.id,
                            title: 'Remove Allergy',
                            sub_heading: `Allergy: ${data.allergy_type}`,
                            description: 'Are you sure you want to remove this allergy?',
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
        card.classList.add('allergy_card_cont_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Allergy</h4>

                <div class="add_btn ${this.edit_mode ? "" : "visibility_hidden"}" id="add_patient_allergy" >
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part allergy_card_cont">


            </div>

        
            `;


        const add_btn = card.querySelector('.allergy_card_cont_cont #add_patient_allergy');
        if (this.edit_mode) {
            add_btn.addEventListener('click', () => {
                dashboardController.visitAllergyPopUpView.PreRender(
                    {
                        visit_id: this.visit_id,
                        state: 'modify',
                        visit_status: this.visit_status,
                    }
                );
            })
        }

        return card;

    }

    async remove_allergy_request(id) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_allergy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    allergy_id: id
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

            this.PreRender({
                data: result.data,
                state: 'modify',
                visit_id: this.visit_id
            });
            // if (this.singleSelectedToDelete) {
            //     this.singleSelectedToDelete.remove();
            //     this.singleSelectedToDelete = '';
            // }

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
                    /* ----------------------------------------------------------- */

                        .allergy_card_cont_cont {
                            padding: 10px;

                            .head_part {
                                padding: 19px;
                                padding-top: 10px;
                                padding-bottom: 0px;
                            }

                            .allergy_card_cont {
                                display: flex;
                                flex-direction: column;
                                flex: none;
                                gap: 20px;

                                .allergy_card {
                                    display: flex;
                                    flex-direction: column;
                                    gap: 10px;
                                    width: 100%;
                                    padding: 20px;
                                    border-radius: var(--main_border_r);
                                    border: solid 1px var(--pri_border_color);
                                    cursor: pointer;

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
                                        /* min-height: 40px; */
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

                                    .data:last-child {
                                        border: none;
                                    }

                                }

                                .allergy_card:hover {
                                    background: var(--pri_op1);
                                }
                            }

                        }

        `;
    }
}
