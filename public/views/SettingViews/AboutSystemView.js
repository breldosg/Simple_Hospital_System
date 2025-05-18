import { SYSTEM_MAIN_LOGO, SYSTEM_NAME } from "../../config/config.js";
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
                        <img src="${SYSTEM_MAIN_LOGO}" alt="${SYSTEM_NAME} Logo" class="system_logo">
                    </div>
                    <p class="system_title">${SYSTEM_NAME}</p>
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
        .about_system_container_view {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;

            .about_system_card {
                padding: var(--main_padding);
                border-radius: var(--main_border_r);
                background-color: var(--pure_white_background);
                width: 100%;


                .system_header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                    border-bottom: 1px solid var(--border_color);

                    .logo_container {
                        width: auto;
                        height: 40px;
                        flex: none;

                        img {
                            width: auto;
                            height: 100%;
                            object-fit: contain;
                            object-position: center;
                        }
                    }

                    .system_title {
                        font-size: 30px;
                        font-weight: 900;
                    }
                }

                .action_links {
                    display: grid;
                    gap: 5px;


                    .action_link {
                        display: flex;
                        justify-content: space-between;
                        text-decoration: none;
                        padding: 10px;
                        border-radius: var(--main_border_r);
                        /* border-bottom: 1px solid var(--border_color); */

                        &:hover {
                            background-color: var(--pri_op2);
                        }

                        .action_text {
                            font-size: 14px;
                            font-weight: 500;
                        }
                    }


                }
            }

            .system_footer {
                padding: var(--main_padding);
                border-radius: var(--main_border_r);
                background-color: var(--pure_white_background);
                margin-top: 5rem;
                text-align: center;
                padding-top: 2rem;


                p {
                    margin: 0.5rem 0;
                    color: var(--text_secondary);
                }

                .footer_note {
                    margin-top: 1rem;
                    font-style: italic;
                    color: var(--text_secondary);
                }
            }
        }
        `;
    }
}


