import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../../config/roles.js";
import { dashboardController } from "../../controller/DashboardController.js";
import { visit_priority, visit_type } from "../../custom/customizing.js";
import { screenCollection } from "../../screens/ScreenCollection.js";
import { applyStyle, date_formatter, decodeHTML, getVisitPriority, getVisitType, notify, timeStamp_formatter } from "../../script/index.js";
import { frontRouter } from "../../script/route.js";

// component for Pre-Final Diagnosis Codes

export class ServicesManagementSettingView {
    constructor() {
        this.batchNumber = 1;
        this.searchTerm = '';
        applyStyle(this.style());

        // clean item container before insert 
        this.reset_container = true;

        window.delete_service_in_setting = this.delete_item.bind(this);

    }

    async PreRender() {
        const check_main_container = document.querySelector('.settings_bottom_cont_right');


        if (!check_main_container) {
            await dashboardController.settingsView.PreRender();
        }

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        // reset to default
        this.batchNumber = 1;
        this.reset = true;
        const cont = document.querySelector('.settings_bottom_cont_right');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.services_setting_container');

        await this.render()
        this.attachListeners()
    }

    async render() {

        var dataSet = await this.fetchData();

        console.log(dataSet);

        if (dataSet) {
            this.renderItems(dataSet.servicesList)
        }

    }

    async fetchData() {
        try {
            const response = await fetch('/api/billing/search_all_services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,
                    batch: this.batchNumber,
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

            return result.success ? result.data : false;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return false;
        }
    }

    ViewReturn() {
        return `
        <div class="services_setting_container">
            <div class="diagnosis_header">
                <div class="header_text">
                    <h2>Diagnosis Codes Management</h2>
                    <p>Manage preliminary and final diagnosis codes for the hospital system</p>
                </div>
                
                <div class="search_container">
                    
                        <input type="text" placeholder="Search diagnosis codes or names..." value="${this.searchTerm}" class="search_input">
                        <button class="search_btn">
                            <span class='switch_icon_magnifying_glass'></span>
                        </button>
                    
                    <button class="add_diagnosis_btn">
                        <span class='switch_icon_add'></span>
                    </button>
                </div>
            </div>

            <div class="diagnosis_content scroll_bar">

            </div>
        </div>
        `;
    }

    attachListeners() {

        // add btn listener
        const add_btn = this.main_container.querySelector('.add_diagnosis_btn');

        add_btn.addEventListener('click', () => {
            dashboardController.createServicePopUp.PreRender();
        })

        // search input listener
        const search_input = this.main_container.querySelector('.search_input')
        search_input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.render();
            }
            console.log(e);


            console.log(search_input.value);
            this.searchTerm = search_input.value;
        })



    }

    renderItems(dataSet = []) {
        const container = this.main_container.querySelector('.diagnosis_content');
        if (this.reset_container) container.innerHTML = '';

        dataSet.forEach((data) => {
            const item = document.createElement('div');
            item.className = 'diagnosis_card';

            item.innerHTML = `
                <div class="diagnosis_info">
                    <div class="code">${data.id ?? 'N/A'}</div>
                    <div class="name">${data.name ?? 'Unknown'}</div>
                </div>
                <div class="diagnosis_actions">
                    <button class="edit_btn" title="Edit">
                        <span class="switch_icon_mode_edit"></span>
                    </button>
                    <button class="delete_btn" title="Delete">
                        <span class="switch_icon_delete"></span>
                    </button>
                </div>
            `

            // add listeners
            var delete_btn = item.querySelector('.delete_btn');
            delete_btn.addEventListener('click', (e) => {
                e.stopPropagation()

                dashboardController.confirmPopUpView.PreRender({
                    callback: 'delete_service_in_setting',
                    parameter: data.id,
                    title: 'Delete Service',
                    sub_heading: `Service Name: ${data.name}`,
                    description: 'Are you sure you want to delete this service?',
                    ok_btn: 'Delete',
                    cancel_btn: 'Cancel'
                });

            })

            var edit_btn = item.querySelector('.edit_btn');
            edit_btn.addEventListener('click', (e) => {
                e.stopPropagation()
                dashboardController.createServicePopUp.PreRender({
                    id: data.id,
                    name: data.name,
                    status: data.status
                });
            })

            container.appendChild(item);
        })

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

    delete_item(data) {

        console.log(data);


    }

    async handleRadiologyExamRequest(ids, state = 'single') {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_radiology_test_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    radiology_order_id: ids,
                    state
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

            if (state === 'single' && this.singleSelectedToDelete) {
                this.singleSelectedToDelete.remove();
                this.data = this.data.filter(item => item.id != this.singleSelectedToDelete_id);
                this.singleSelectedToDelete = '';
                this.singleSelectedToDelete_id = '';
            } else {
                // Update the view with new data for bulk deletion
                this.PreRender({
                    visit_id: this.visit_id,
                    state: 'modify',
                    data: result.data,
                    visit_status: this.visit_status

                });

                // Exit selection mode
                this.exitSelectionMode();
            }

            // Clear selected IDs after successful deletion
            this.selectedIds.clear();

        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            dashboardController.loaderView.remove();
        }
    }

    style() {
        return `
        .services_setting_container {

        }
        `;
    }
}


