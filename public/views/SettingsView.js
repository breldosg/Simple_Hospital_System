import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../config/roles.js";
import { dashboardController } from "../controller/DashboardController.js";
import { visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, date_formatter, decodeHTML, getVisitPriority, getVisitType, notify, timeStamp_formatter } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SettingsView {
    constructor() {
        applyStyle(this.style());

        this.settingMenu = [
            {
                type: 'title',
                title: 'System Settings',
            },
            {
                type: 'link',
                title: 'About System',
                path: '/settings/about_system',
                component: 'aboutSystemView',
            },
            {
                type: 'link',
                title: 'Company Information',
                path: '/settings/company_information',
                component: 'companyInformationView',
            },
            {
                type: 'link',
                title: 'Appearance',
                path: '/settings/appearance',
            },
            {
                type: 'title',
                title: 'Default Attribute Settings',
            },
            {
                type: 'link',
                title: 'Diagnosis Codes Management',
                path: '/settings/diagnosis_codes_management',
            },
            {
                type: 'link',
                title: 'Services Management',
                path: '/settings/services_management'
            },
            // {
            //     type: 'link',
            //     title: 'Pharmacy Units',
            //     path: '/settings/pharmacy_units'
            // },

        ]
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }
        // Get the current path, default to '/users' if on '/dashboard'
        this.rawPath = window.location.pathname.toLowerCase();

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        const cont = document.querySelector('.update_cont');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = this.ViewReturn();
        this.main_container = document.querySelector('.main_settings_container');
        this.renderSettingMenu();
        this.render_example_view();
    }


    ViewReturn() {
        return `
        <div class="main_settings_container">

            <div class="settings_top_cont">
                <div class="logo_cont">
                    <img src="/public/assets/logo/Primary_logo.svg" alt="logo">
                </div>
                <div class="settings_top_cont_right">
                    <p class="settings_top_cont_right_title">System Settings <span>Admin</span></p>
                    <p class="settings_top_cont_right_description">Manage your system settings here</p>
                </div>
            </div>

            <div class="settings_bottom_cont">
                <div class="settings_bottom_cont_left">
                    
                </div>
                <div class="settings_bottom_cont_right">


                </div>
            </div>

        </div>
        `;
    }

    render_example_view() {
        const cont = document.querySelector('.settings_bottom_cont_right');
        cont.innerHTML = `
        <div class="settings_bottom_cont_right_example_view">
            <div class="example_logo_cont">
                <img src="/public/assets/logo/SubMark.png" alt="logo">
            </div>
            <h3>System Settings</h3>
            <p>Manage your system settings here</p>
        </div>
        `;
    }

    renderSettingMenu() {
        const settingMenu = this.main_container.querySelector('.settings_bottom_cont_left');
        this.settingMenu.forEach(item => {
            if (item.type === 'title') {
                var component = document.createElement('p');
                component.className = 'settings_bottom_cont_left_title';
                component.innerHTML = item.title;
            } else {
                var component = document.createElement('a');
                component.href = item.path;
                component.className = 'choice_item';
                component.innerHTML = item.title;
                component.setAttribute('setting_link', item.path);
                if (this.rawPath == item.path) {
                    component.classList.add('active');
                }

                component.addEventListener('click', (e) => {
                    if (component.hasAttribute('setting_link')) {
                        e.preventDefault();

                        // remove active class from all components
                        settingMenu.querySelectorAll('a.active').forEach(component => {
                            component.classList.remove('active');
                        });
                        component.classList.add('active');

                        // pre render the component
                        // dashboardController[item.component].PreRender();
                        frontRouter.navigate(item.path);
                    }
                });
            }
            settingMenu.appendChild(component);
        });
    }

    style() {
        return `
            
        .main_settings_container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow: auto;

            .settings_top_cont {
                display: none;
                align-items: center;
                gap: 10px;
                padding: 20px;
                background-color: var(--pure_white_background_op);
                border-radius: var(--main_border_r);

                .logo_cont {
                    width: auto;
                    height: 50px;
                    display: flex;
                    align-items: center;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }
                }

                .settings_top_cont_right {
                    .settings_top_cont_right_title {
                        /* display: flex; */
                        /* align-items: flex-start; */
                        gap: 10px;
                        /* color: var(--gray_text); */
                        font-size: 25px;
                        font-weight: 500;

                        span {
                            font-size: var(--main_font_size_sm);
                            font-weight: 700;
                            color: var(--light_pri_color);
                            padding: 3px 10px;
                            border-radius: 10px;
                            background-color: var(--pri_op);
                        }

                    }

                    .settings_top_cont_right_description {
                        color: var(--gray_text);
                    }


                }




            }

            .settings_bottom_cont {
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 20px;
                height: 100%;
                flex: none;

                .settings_bottom_cont_left {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    width: 100%;
                    height: 100%;
                    background-color: var(--pure_white_background_op);
                    border-radius: var(--main_border_r);
                    overflow-y: scroll;
                    flex: none;

                    .settings_bottom_cont_left_title {
                        font-size: 16px;
                        font-weight: 900;
                        color: var(--gray_text);
                        padding: var(--main_padding) 0 0 var(--main_padding);

                    }

                    .choice_item {
                        font-size: 14px;
                        padding-block: 10px;
                        padding-inline: var(--main_padding);
                        border-left: 2px solid transparent;
                    }

                    .choice_item.active {
                        border-left-color: var(--light_pri_color);
                        background-color: var(--pri_op2);
                        color: var(--light_pri_color);

                    }

                }

                .settings_bottom_cont_right {
                    width: 100%;
                    height: 100%;
                    overflow-y: scroll;

                    /* ------------------------------------------- */
                    .settings_bottom_cont_right_example_view {
                        border-radius: var(--main_border_r);
                        background-color: var(--pure_white_background_op);
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        /* gap: 10px; */

                        .example_logo_cont {
                            width: 80px;
                            height: 80px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: relative;
                            margin-bottom: 10px;

                            img {
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
                                filter: grayscale(100%);
                                opacity: 0.7;
                            }

                        }

                        h3 {
                            font-size: 25px;
                            font-weight: 700;
                            color: var(--gray_text);
                        }

                        p {
                            color: var(--gray_text);
                            width: 300px;
                            text-align: center;
                        }
                    }


                }

            }

        }

        `;
    }
}


