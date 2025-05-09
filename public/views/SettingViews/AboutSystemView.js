import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../../config/roles.js";
import { dashboardController } from "../../controller/DashboardController.js";
import { visit_priority, visit_type } from "../../custom/customizing.js";
import { screenCollection } from "../../screens/ScreenCollection.js";
import { applyStyle, date_formatter, decodeHTML, getVisitPriority, getVisitType, notify, timeStamp_formatter } from "../../script/index.js";
import { frontRouter } from "../../script/route.js";

export class AboutSystemView {
    constructor() {
        applyStyle(this.style());
    }

    async PreRender() {
        const check_main_container = document.querySelector('.settings_bottom_cont_right');
        if (!check_main_container) {
            await dashboardController.settingsView.PreRender();
        }

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        // Fetch data and wait for result
        // const response = await this.fetchData();
        // console.log(response);


        const cont = document.querySelector('.settings_bottom_cont_right');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.about_system_container_view');


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
        <div class="about_system_container_view">
            <div class="about_system_card">
                <div class="system_header">
                    <div class="logo_container">
                        <img src="/public/assets/logo/SubMark.png" alt="Hospital System Logo" class="system_logo">
                    </div>
                    <p class="system_title">Hospital Management System</p>
                </div>

                <div class="action_links">
                    <a href="#" class="action_link">
                        <div class="action_content">
                            <p class="action_text">Help Center</p>
                        </div>
                        <span class='switch_icon_open_in_new'></span>
                    </a>
                    
                    <a href="#" class="action_link">
                        <div class="action_content">
                            <p class="action_text">Report an Issue</p>
                        </div>
                        <span class='switch_icon_open_in_new'></span>
                    </a>
                    
                    <a href="#" class="action_link">
                        <div class="action_content">
                            <p class="action_text">Privacy Policy</p>
                        </div>
                        <span class='switch_icon_open_in_new'></span>
                    </a>
                </div>

            </div>
            
            <div class="system_footer">
                <p>Hospital Management System</p>
                <p>Copyright © ${new Date().getFullYear()} All rights reserved.</p>
                <p class="footer_note">Committed to excellence in healthcare management</p>
            </div>
        </div>
        `;
    }



    style() {
        return `
    
        `;
    }
}


