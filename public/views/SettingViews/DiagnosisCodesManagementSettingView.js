import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../../config/roles.js";
import { dashboardController } from "../../controller/DashboardController.js";
import { visit_priority, visit_type } from "../../custom/customizing.js";
import { screenCollection } from "../../screens/ScreenCollection.js";
import { applyStyle, date_formatter, decodeHTML, getVisitPriority, getVisitType, notify, timeStamp_formatter } from "../../script/index.js";
import { frontRouter } from "../../script/route.js";

// component for Pre-Final Diagnosis Codes

export class DiagnosisCodesManagementSettingView {
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

        this.main_container = document.querySelector('.pre_final_diagnosis_setting_container');


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
        <div class="pre_final_diagnosis_setting_container">
            <div class="diagnosis_header">
                <div class="header_text">
                    <h2>Diagnosis Codes Management</h2>
                    <p>Manage preliminary and final diagnosis codes for the hospital system</p>
                </div>
                
                <div class="search_container">
                    
                        <input type="text" placeholder="Search diagnosis codes or names..." class="search_input">
                        <button class="search_btn">
                            <span class='switch_icon_magnifying_glass'></span>
                        </button>
                    
                    <button class="add_diagnosis_btn">
                        <span class='switch_icon_add'></span>
                    </button>
                </div>
            </div>

            <div class="diagnosis_content scroll_bar">
                ${this.getDemoDiagnosis().map(diagnosis => `
                    <div class="diagnosis_card">
                        <div class="diagnosis_info">
                            <div class="code">${diagnosis.code}</div>
                            <div class="name">${diagnosis.name}</div>
                        </div>
                        <div class="diagnosis_actions">
                            <button class="edit_btn" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="delete_btn" title="Delete">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    getDemoDiagnosis() {
        return [
            { code: "A01.0", name: "Typhoid fever" },
            { code: "B27.0", name: "Infectious mononucleosis" },
            { code: "E11.9", name: "Type 2 diabetes mellitus" },
            { code: "I10", name: "Essential hypertension" },
            { code: "J18.9", name: "Pneumonia, unspecified" },
            { code: "K29.7", name: "Gastritis, unspecified" },
            { code: "M54.5", name: "Low back pain" },
            { code: "N39.0", name: "Urinary tract infection" },
            { code: "R51", name: "Headache" },
            { code: "T14.90", name: "Injury, unspecified" },
            { code: "G43.9", name: "Migraine, unspecified" },
            { code: "F41.1", name: "Generalized anxiety disorder" },
            { code: "L20.9", name: "Atopic dermatitis" },
            { code: "H26.9", name: "Cataract, unspecified" },
            { code: "D64.9", name: "Anemia, unspecified" },
            { code: "C50.9", name: "Breast cancer" },
            { code: "K21.9", name: "Gastro-esophageal reflux disease" },
            { code: "M17.9", name: "Osteoarthritis of knee" },
            { code: "J45.909", name: "Unspecified asthma" },
            { code: "E78.5", name: "Dyslipidemia" }
        ];
    }

    style() {
        return `
        
        `;
    }
}


