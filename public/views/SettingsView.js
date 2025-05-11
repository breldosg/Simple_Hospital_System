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
                start_active: false
            },
            {
                type: 'link',
                title: 'Company Information',
                path: '/settings/company_information',
                component: 'companyInformationView',
                start_active: false
            },
            {
                type: 'link',
                title: 'Appearance',
                path: '/settings/appearance',
                start_active: false
            },
            {
                type: 'title',
                title: 'Default Attribute Settings',
            },
            {
                type: 'link',
                title: 'Pre-Final Diagnosis Customization',
                path: '/settings/pre_final_diagnosis_codes',
                start_active: false
            },
            {
                type: 'link',
                title: 'Other Service Customization',
                path: '/settings/other_service_customization',
                start_active: false
            },
            // {
            //     type: 'link',
            //     title: 'Pharmacy Units',
            //     path: '/settings/pharmacy_units',
            //     start_active: false
            // },

        ]
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        const cont = document.querySelector('.update_cont');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = this.ViewReturn();
        this.main_container = document.querySelector('.main_settings_container');
        this.renderSettingMenu();
        this.render_example_view();
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
                if (item.start_active) {
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

        `;
    }
}


