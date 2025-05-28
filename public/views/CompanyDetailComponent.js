import { INSTITUTION_ADDRESS, INSTITUTION_COUNTRY_EMBLEM, INSTITUTION_EMAIL, INSTITUTION_LOGO, INSTITUTION_MOTO, INSTITUTION_NAME, INSTITUTION_PHONE, INSTITUTION_WEBSITE } from "../config/config.js";
import { dashboardController } from "../controller/DashboardController.js";
import { applyStyle, date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";


export class CompanyDetailComponent {
    constructor() {

        applyStyle(this.style());
    }

    async PreRender(params) {
        this.location = params.location ?? 'patient_history';
        this.container = params.container ?? null;
        if (this.container == null) {
            // throw new Error
            throw new Error('container is required');
        }

        // Render initial structure
        this.container.insertAdjacentHTML('afterbegin', this.ViewReturn(''));

        this.main_container = document.querySelector('.top_card_company_info_cont');

        this.render();
    }

    async render() {

    }

    ViewReturn() {
        return `
    <div class="top_card_company_info_cont">
        <div class="logo_cont">
            <img src="${INSTITUTION_LOGO}" alt="company logo">
        </div>
        <div class="company_info_cont">
            <p class="company_moto">${INSTITUTION_MOTO}</p>
            <p class="company_name">${INSTITUTION_NAME}</p>
            <p class="company_address">${INSTITUTION_ADDRESS}</p>
            <div class="company_contact_info">
                <p class="small_text company_phone">${INSTITUTION_PHONE}</p>
                <p class="small_text company_email">${INSTITUTION_EMAIL}</p>
                <p class="small_text company_website">${INSTITUTION_WEBSITE}</p>
            </div>
        </div>

        <div class="logo_cont">
            <img src="${INSTITUTION_COUNTRY_EMBLEM}" alt="country emblem">
        </div>
    </div>
        `;
    }

    style() {
        return `
            .top_card_company_info_cont {
                width: 100%;
                background-color: var(--pure_white_background);
                /* height: 100px; */
                border-radius: 10px;
                padding: 20px;
                display: flex;
                gap: 40px;
                position: relative;
                flex:none;

            }

            /* -------------- Mobile -------------- */
            @media (max-width: 500px) {
                .top_card_company_info_cont {

                }
            }
            
            
            /* -------------- Print -------------- */
            @media print {
                .top_card_company_info_cont {
                    
                }
            }

            
        `;
    }
}

