import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../config/roles.js";
import { dashboardController } from "../controller/DashboardController.js";
import { visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, decodeHTML, getVisitPriority, getVisitType, notify, timeStamp_formatter } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SettingsView {
    constructor() {
        this.applyStyle();
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        // Fetch data and wait for result
        // const response = await this.fetchData();
        // console.log(response);


        const cont = document.querySelector('.update_cont');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.main_settings_container');

    }


    async fetchData() {
        try {
            const response = await fetch('/api/users/get_dashboard_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

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

            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }


    ViewReturn() {
        return `
        <div class="main_settings_container">

        </div>
        `;
    }


    applyStyle() {
        const styleElement = document.createElement('style');
        styleElement.textContent = this.style();
        document.head.appendChild(styleElement);
    }

    style() {
        return `

        .main_settings_container {
            width: 100%;
            height: 100%;
            overflow-y: auto;
            background: var(--pure_white_background);
            padding: 20px;
            border-radius: var(--main_border_r);
        }
        `;
    }
}


