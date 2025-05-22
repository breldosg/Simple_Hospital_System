import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../../config/roles.js";
import { dashboardController } from "../../controller/DashboardController.js";
import { applyStyle, date_formatter, decodeHTML, getVisitPriority, getVisitType, notify, timeStamp_formatter } from "../../script/index.js";
import { frontRouter } from "../../script/route.js";

// component for Pre-Final Diagnosis Codes

export class DiagnosisCodesManagementSettingView {
    constructor() {
        applyStyle(this.style());
        this.batchNumber = 1;
        this.searchTerm = '';
        applyStyle(this.style());
        this.singleSelectedToDelete = '';

        // clean item container before insert 
        this.reset_container = true;

        window.delete_diagnosis_in_setting = this.delete_item.bind(this);

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
        this.singleSelectedToDelete = '';
        const cont = document.querySelector('.settings_bottom_cont_right');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.pre_final_diagnosis_setting_container');

        await this.render()
        this.attachListeners()
    }

    async fetchData() {
        try {
            const response = await fetch('/api/patient/search_diagnosis_code', {
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

    async render() {

        var dataSet = await this.fetchData();

        console.log(dataSet);

        if (dataSet) {
            this.renderItems(dataSet.diagnosisList)
        }

    }

    attachListeners() {

        // add btn listener
        const add_btn = this.main_container.querySelector('.add_diagnosis_btn');

        add_btn.addEventListener('click', () => {
            dashboardController.createDiagnosisCodePopUp.PreRender();
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

    ViewReturn() {
        return `
        <div class="pre_final_diagnosis_setting_container">
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

    renderItems(dataSet = []) {
        const container = this.main_container.querySelector('.diagnosis_content');
        if (this.reset_container) container.innerHTML = '';

        dataSet.forEach((data) => {
            const item = document.createElement('div');
            item.className = 'diagnosis_card';

            var date = date_formatter(data.created_at);

            item.innerHTML = `
                <div class="diagnosis_info">
                    <p class="name">${data.name ?? 'Unknown'}</p>
                    <div class="infos_cont">
                        <p class="price">Created at: ${date ?? 'N/A'}</p>
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
                this.singleSelectedToDelete = item;
                dashboardController.confirmPopUpView.PreRender({
                    callback: 'delete_diagnosis_in_setting',
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
                dashboardController.createDiagnosisCodePopUp.PreRender({
                    id: data.id,
                    description: data.description,
                    code: data.code 
                });
            })

            container.appendChild(item);
        })

    }

    async delete_item(id) {

        console.log(id);
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_diagnosis_code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
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

            // remove item from view
            this.singleSelectedToDelete.remove();
            this.singleSelectedToDelete = '';



        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            dashboardController.loaderView.remove();
        }

    }

    style() {
        return `
        
        `;
    }
}

