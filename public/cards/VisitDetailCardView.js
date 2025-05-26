import { dashboardController } from "../controller/DashboardController.js";
import { visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitDetailCardView {
    constructor() {
        this.visit_id = null;
        this.data = [];
        this.edit_mode = false;
        applyStyle(this.style(), "visit_detail_card_style");
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.data = params.data ? params.data : [];
        this.visit_id = params.visit_id;
        this.edit_mode = false;
        this.visit_status = params.visit_status ? params.visit_status : "checked_out";

        if (this.visit_status == "active") {
            this.edit_mode = true;
        }

        const cont = document.querySelector('.single_visit_cont .more_visit_detail');
        cont.classList.add('active');
        cont.prepend(this.ViewReturn());
    }

    ViewReturn() {
        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('visit_detail_card_style');

        // Parse created_at date
        const visitDate = new Date(this.data.created_at);
        const day = visitDate.getDate();
        const month = visitDate.toLocaleString('default', { month: 'short' }).toUpperCase();
        const year = visitDate.getFullYear();

        var visit_type_title=visit_type.filter(item=>item.value==this.data.visit_type)[0].label;
        var visit_priority_title=visit_priority.filter(item=>item.value==this.data.visit_priority)[0].label;

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Visit Detail</h4>

                <div class="add_btn " id="add_patient_clinical_note">
                    <span class="switch_icon_edit"></span>
                </div>

            </div>

            <div class="body_part visit_detail_card">
                <div class="date_style">
                    <p class="date_large">${day}</p>
                    <p class="date_small">${month} ${year}</p>
                    <p class="date_label">Visit Date</p>
                </div>

                <div class="visit_info_cont_main">
                    <div class="visit_info_cont">
                        <p class="visit_info">Dr. ${this.data.doctor_name}</p>
                        <p class="visit_info_label">Doctor</p>
                    </div>

                    <div class="visit_info_cont">
                        <p class="visit_info">${this.data.department_name}</p>
                        <p class="visit_info_label">Department</p>
                    </div>

                    <div class="visit_info_cont">
                        <p class="visit_info">${visit_priority_title}</p>
                        <p class="visit_info_label">Priority</p>
                    </div>

                    <div class="visit_info_cont">
                        <p class="visit_info">${visit_type_title}</p>
                        <p class="visit_info_label">Visit Type</p>
                    </div>
                    
                    <div class="visit_info_cont">
                        <p class="visit_info">${this.data.checkout_time || 'Not checked out'}</p>
                        <p class="visit_info_label">Check Out Time</p>
                    </div>
                </div>
            </div>
            `;

        return card;
    }

    attachListeners() {

    }

    style() {
        return `
        .visit_detail_card_style {
            scroll-snap-align: start;
            background-color: var(--pri_back) !important;
            border-radius: var(--main_border_r);
            padding: var(--main_padding);

            .add_btn{
                visibility: hidden;
                opacity: 0;
                transition: all 0.3s ease;
            }

            .visit_detail_card {
                display: flex;
                flex-direction: row !important;
                gap: 20px !important;

                .date_style{
                    padding: 5px 10px;
                    border-radius: 10px;
                    background-color: var(--pri_color);
                    width: fit-content;
                    display:flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;

                    .date_large{
                        color:var(--visit_card_text);
                        font-size:100px;
                        line-height:130px;
                        font-weight: 900;
                    }

                    .date_small{
                        color:var(--visit_card_text);
                        font-size:20px;
                        font-weight: 900;
                    }
                    
                    .date_label{
                        color:var(--visit_card_text);
                        font-size:13px;
                    }
                }

                .visit_info_cont_main{
                    display:flex;
                    flex-direction: column;
                    gap: 5px;

                    .visit_info_cont{

                        .visit_info{
                            font-size:15px;
                            font-weight:700;
                        }

                        .visit_info_label{
                        }

                    }
                }
            }
        }

        @media screen and (max-width: 850px) {
            .visit_detail_card_style {
                width: 100%;
                flex:none;
            }
        }
        `
    }
}