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
                    <h2>Services Management</h2>
                    <p>Manage services here for the hospital system</p>
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

            var statusMap = {
                active: "Active",
                inactive: "Inactive",
            }

            item.innerHTML = `
                <div class="diagnosis_info">
                    <p class="name">${data.name ?? 'Unknown'}</p>
                    <div class="infos_cont">
                        <p class="price">Price: ${data.price ?? '0'}</p>
                        <p class="status ${data.status}">${statusMap[data.status] ?? 'Inactive'}</p>
                    </div>
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


