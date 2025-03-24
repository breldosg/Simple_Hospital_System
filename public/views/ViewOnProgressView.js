import { VIEW_PATIENT_BTNS } from "../config/roles.js";
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { getVisitPriority, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewOnProgressView {
    constructor() {
        this.PatientData = [];
        this.batchNumber = 1; // Keep track of current batch
        this.total_page_num = 1; // Keep track of current batch
        this.total_data_num = 0; // Keep track of current batch
        this.show_count_num = 0; // Keep track of current batch
        this.searchTerm = '';  // Store the current search term
    }

    async PreRender() {

        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        // Fetch the initial batch of Patient data
        await this.fetchAndRenderData();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Search input event listener
        const searchInput = document.querySelector('.search_cont input');
        searchInput.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                this.searchTerm = searchInput.value;
                this.batchNumber = 1; // Reset to batch 1 when searching
                await this.fetchAndRenderData();
            }
        });

        const searchBtn = document.querySelector('.btn_search');
        searchBtn.addEventListener('click', async () => {
            this.searchTerm = searchInput.value;
            this.batchNumber = 1; // Reset to batch 1 when searching
            await this.fetchAndRenderData();
        });

        // Pagination buttons
        document.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                await this.fetchAndRenderData();
            }
            // this.batchNumber += 1;
            // await this.fetchAndRenderData();
        });

        document.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (this.batchNumber > 1) {
                this.batchNumber -= 1;
                await this.fetchAndRenderData();
            }
        });
    }

    async fetchAndRenderData() {
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn(); // Show loader
        const PatientData = await this.fetchData(); // Fetch data with search term and batch number

        this.PatientData = PatientData || [];
        this.render();
        this.attachEventListeners();
    }

    render() {
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        if (this.PatientData.VisitList && this.PatientData.VisitList.length > 0) {
            this.populateTable(this.PatientData);
        } else {
            const show_count = document.querySelector('.show_count');
            const total_data = document.querySelector('.total_data');
            const total_page = document.querySelector('.total_page');
            show_count.innerText = 0;
            total_data.innerText = 0;
            total_page.innerText = 1;
            this.total_page_num = 1;
            this.show_count_num = 0;
            this.total_data_num = 0;
            document.querySelector('.start_page').style.display = 'flex'; // No data message
        }
        document.querySelector('.loader_cont').classList.remove('active');
    }

    populateTable(PatientData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = ''; // Clear table before populating

        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');


        show_count.innerText = PatientData.showData;
        total_data.innerText = PatientData.total;
        total_page.innerText = PatientData.pages;
        this.total_page_num = PatientData.pages;
        this.show_count_num = PatientData.showData;
        this.total_data_num = PatientData.total;

        var buttons = {
            checkout: '<button type="button" id="checkOut_btn" class="main_btn co_visit error">CheckOut</button>',
            view_visit: '<button type="button" id="viewVisit_btn" class="main_btn">View Visit</button>',
            create_visit: '<button type="button" id="createVisit_btn" class="main_btn">Create Visit</button>',
            view_patient: '<button type="button" id="viewPatient_btn" class="main_btn v_patien">View Patient</button>'
        }

        // get user role in global state
        var user_data = globalStates.getState('user_data');

        const allowed_btns = VIEW_PATIENT_BTNS[user_data.role].btn_role;
        const allowed_actions = VIEW_PATIENT_BTNS[user_data.role].btn_action;

        console.log(PatientData);

        PatientData.VisitList.forEach((patient, index) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = "tr d_flex flex__c_a";
            rowDiv.setAttribute('data_src', patient.patient_id);
            rowDiv.setAttribute('data_src_v', patient.id);
            rowDiv.setAttribute('title', patient.patient_name);

            rowDiv.innerHTML = `
                <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                <p class="name">${patient.patient_name}</p>
                <p class="gender">${getVisitPriority(patient.visit_priority)}</p>
                <p class="name">${patient.doctor_name}</p>
                <p class="phone">${patient.waiting_time}</p>
                <p class="date">${patient.department_name}</p>
                <div class="action d_flex flex__c_c">
                    ${patient.visit_status === 'active' ? allowed_btns.includes('checkout') ? buttons.checkout : '' : ''}
                    ${buttons.view_patient}
                </div>
            `;

            rowDiv.addEventListener('click', async () => {
                if (allowed_actions.includes('view_visit')) {
                    frontRouter.navigate('/patient/activevisit/' + patient.id);
                }
                else if (allowed_actions.includes('view_patient')) {
                    frontRouter.navigate('/patient/viewpatient/' + patient.patient_id);
                }
            });

            rowDiv.querySelector('#viewPatient_btn').addEventListener('click', async (event) => {
                event.stopPropagation();
                frontRouter.navigate('/patient/viewpatient/' + patient.patient_id);
            });

            const checkOut_btn = rowDiv.querySelector('#checkOut_btn');
            if (checkOut_btn) {
                checkOut_btn.addEventListener('click', async (event) => {
                    // disable propagation
                    event.stopPropagation();
                    // Get the btn closest with class tr
                    const btnParent = rowDiv.closest('.tr');
                    const patientId = btnParent.getAttribute('data_src');

                    dashboardController.loaderView.render();

                    const checkOut_response = await this.checkout_request(patientId);

                    if (checkOut_response.success) {
                        notify('top_left', checkOut_response.message, 'success');
                        await this.fetchAndRenderData();

                    } else {
                        notify('top_left', checkOut_response.message, 'error');
                    }

                    dashboardController.loaderView.remove();


                })
            }




            tableBody.appendChild(rowDiv);
        });

    }

    async fetchData() {
        try {
            const response = await fetch('/api/patient/onprogress_visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,  // Send search term
                    batch: this.batchNumber // Send current batch number
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

    async checkout_request(id) {
        try {
            const response = await fetch('/api/patient/check_out_patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patient_id: '',
                    visit_id: id
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


            return result;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    ViewReturn() {
        return `
        <div class="main_section outpatient_table_out">
            <div class="in_table_top d_flex flex__u_b">
                <h4>Active Visit List</h4>
                <div class="search_cont">
                    <input type="text" placeholder="Search by name or id" value="${this.searchTerm}">
                    <br-button loader_width="23" class="btn_search" type="submit">
                            <span class="switch_icon_magnifying_glass"></span>
                    </br-button>
                </div>
            </div>
            <div class="outpatient_table">
                <div class="table_head tr d_flex flex__c_a">
                    <p class="id">SN</p>
                    <p class="name">Patient Name</p>
                    <p class="gender">Priority</p>
                    <p class="name">Doctor Name</p>
                    <p class="phone">Waiting Time</p>
                    <p class="date">Department</p>
                    <div class="action"></div>
                </div>
                <div class="table_body d_flex flex__co">
                    <div class="start_page deactivate">
                        <p>There Is No Any Active Visit</p>
                    </div>
                    <div class="loader_cont active"><div class="loader"></div></div>
                </div>
                <div class="table_footer d_flex flex__e_b">
                    <p>Show <span class='show_count'>${this.show_count_num}</span> data of <span class="total_data">${this.total_data_num}</span></p>
                    <div class="pagenation d_flex flex__c_c">
                        <button type="button" class="main_btn prev">Prev</button>
                        <p class="page_no d_flex flex__c_c">${this.batchNumber}/<span class="total_page" >${this.total_page_num}</span></p>
                        <button type="button" class="main_btn next">Next</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

