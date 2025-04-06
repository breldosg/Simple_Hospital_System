import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../config/roles.js";
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, decodeHTML, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewPatientView {
    constructor() {
        this.PatientData = [];
        this.batchNumber = 1; // Keep track of current batch
        this.total_page_num = 1; // Keep track of current batch
        this.total_data_num = 0; // Keep track of current batch
        this.show_count_num = 0; // Keep track of current batch
        this.searchTerm = '';  // Store the current search term
        window.checkout_request = this.checkout_request.bind(this);

    }

    async PreRender() {

        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        // get user role in global state
        this.user_data = globalStates.getState('user_data');


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.outpatient_table_out');

        // Fetch the initial batch of Patient data
        await this.fetchAndRenderData();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Search input event listener
        const searchInput = this.main_container.querySelector('.search_cont input');
        searchInput.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                this.searchTerm = searchInput.value;
                this.batchNumber = 1; // Reset to batch 1 when searching
                await this.fetchAndRenderData();
            }
        });

        const searchBtn = this.main_container.querySelector('.btn_search');
        searchBtn.addEventListener('click', async () => {
            this.searchTerm = searchInput.value;
            this.batchNumber = 1; // Reset to batch 1 when searching
            await this.fetchAndRenderData();
        });

        const add_patient = this.main_container.querySelector('#open_add_patient_popup');
        if (add_patient) {
            add_patient.addEventListener('click', () => {
                dashboardController.addPatientViewPopup.PreRender();
            });
        }

        // Pagination buttons
        this.main_container.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                await this.fetchAndRenderData();
            }
            // this.batchNumber += 1;
            // await this.fetchAndRenderData();
        });

        this.main_container.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (this.batchNumber > 1) {
                this.batchNumber -= 1;
                await this.fetchAndRenderData();
            }
        });
    }


    async fetchAndRenderData() {
        this.loadingContent();
        const PatientData = await this.fetchData(); // Fetch data with search term and batch number

        this.PatientData = PatientData || [];
        this.render();
    }

    render() {

        if (this.PatientData.PatientList && this.PatientData.PatientList.length > 0) {
            this.populateTable(this.PatientData);
        } else {
            const show_count = this.main_container.querySelector('.show_count');
            const total_data = this.main_container.querySelector('.total_data');
            const total_page = this.main_container.querySelector('.total_page');
            show_count.innerText = 0;
            total_data.innerText = 0;
            total_page.innerText = 1;
            this.total_page_num = 1;
            this.show_count_num = 0;
            this.total_data_num = 0;
            this.main_container.querySelector('.start_page').style.display = 'flex'; // No data message
            this.main_container.querySelector('.loader_cont').classList.remove('active'); // No data message
        }
        // this.main_container.querySelector('.loader_cont').classList.remove('active');
    }

    populateTable(PatientData) {
        const tableBody = this.main_container.querySelector('.table_body');
        tableBody.innerHTML = ''; // Clear table before populating

        const show_count = this.main_container.querySelector('.show_count');
        const total_data = this.main_container.querySelector('.total_data');
        const total_page = this.main_container.querySelector('.total_page');
        const current_page = this.main_container.querySelector('.current_page');

        show_count.innerText = PatientData.showData;
        total_data.innerText = PatientData.total;
        total_page.innerText = PatientData.pages;
        current_page.innerText = PatientData.batch;
        this.total_page_num = PatientData.pages;
        this.show_count_num = PatientData.showData;
        this.total_data_num = PatientData.total;


        var buttons = {
            checkout: '<button type="button" id="checkOut_btn" class="main_btn error co_visit">CheckOut</button>',
            view_visit: '<button type="button" id="viewVisit_btn" class="main_btn v_visit">View Visit</button>',
            create_visit: '<button type="button" id="createVisit_btn" class="main_btn c_visit">Create Visit</button>',
            view_patient: '<button type="button" id="viewPatient_btn" class="main_btn v_patient">View Patient</button>'
        }


        const allowed_btns = VIEW_PATIENT_BTNS[this.user_data.role].btn_role;


        PatientData.PatientList.forEach((patient, index) => {
            const row = document.createElement('div');
            row.classList.add('tr');
            row.classList.add('d_flex');
            row.classList.add('flex__c_a');

            row.setAttribute('title', decodeHTML(patient.name));

            try {
                var date = date_formatter(patient.created_at);
            } catch (error) {
                var date = '';
            }


            row.innerHTML = `
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${patient.name}</p>
                    <p class="gender">${patient.gender}</p>
                    <p class="phone">${patient.phone}</p>
                    <p class="name">${patient.created_by}</p>
                    <p class="date">${date}</p>
                    <div class="action d_flex flex__c_c">
                            ${patient.visit_status === 'active' ?
                    (allowed_btns.includes('view_visit') ? buttons.view_visit : '') +
                    (allowed_btns.includes('checkout') ? buttons.checkout : '') :
                    allowed_btns.includes('create_visit') ? buttons.create_visit : buttons.view_patient}
                    </div>
            `;

            // set listeners
            if (row.querySelector('#checkOut_btn')) {
                row.querySelector('#checkOut_btn').addEventListener('click', async (event) => {
                    event.stopPropagation();

                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'checkout_request',
                        parameter: patient.latest_visit_id,
                        title: 'CheckOut Patient',
                        sub_heading: `CheckOut : ${patient.name}`,
                        description: 'Are you sure you want to checkout this patient?',
                        ok_btn: 'CheckOut',
                        cancel_btn: 'Cancel',
                    });


                });
            }

            if (row.querySelector('#viewVisit_btn')) {
                row.querySelector('#viewVisit_btn').addEventListener('click', async (event) => {
                    event.stopPropagation();
                    frontRouter.navigate('/patient/activevisit/' + patient.latest_visit_id);
                });
            }

            if (row.querySelector('#createVisit_btn')) {
                row.querySelector('#createVisit_btn').addEventListener('click', async (event) => {
                    event.stopPropagation();

                    dashboardController.createVisitPopUpView.PreRender(
                        {
                            id: patient.id,
                            p_name: patient.name,
                        })

                });


            }
            row.addEventListener('click', () => {
                frontRouter.navigate('/patient/viewpatient/' + patient.id);
            })

            tableBody.appendChild(row);

        });


        // this.row_listener();
    }

    async fetchData() {
        try {
            const response = await fetch('/api/patient/search_patient', {
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

    loadingContent() {
        const tableBody = this.main_container.querySelector('.table_body');
        tableBody.innerHTML = `
    <div class="start_page deactivate">
        <p>No Patient Found</p>
    </div>
    <div class="loader_cont active">
        <div class="loader"></div>
    </div>
    `;
    }

    async checkout_request(visit_id) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/check_out_patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patient_id: '',
                    visit_id: visit_id,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const checkOut_response = await response.json();
            if (checkOut_response.success) {
                notify('top_left', checkOut_response.message, 'success');
                await this.fetchAndRenderData();

            } else {
                notify('top_left', checkOut_response.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
        finally {
            dashboardController.loaderView.remove();
        }
    }


    ViewReturn() {
        return `
        <div class="main_section outpatient_table_out">
            <div class="in_table_top d_flex flex__u_b">
                <h4>Patient List</h4>
                <div class="search_cont">

                    <input type="text" placeholder="Search by name or id" value="${this.searchTerm}">

                    <br-button loader_width="23" class="btn_search" type="submit">
                            <span class="switch_icon_magnifying_glass"></span>
                    </br-button>
    
                    ${ALLOW_TO_ADD_PATIENT.includes(this.user_data.role) ?
                '<div class="add_btn" title="Create Patient" id="open_add_patient_popup"> <span class="switch_icon_add"></span></div>' : ''}
                </div>
            </div>
            <div class="outpatient_table">
                <div class="table_head tr d_flex flex__c_a">
                    <p class="id">SN</p>
                    <p class="name">Name</p>
                    <p class="gender">Gender</p>
                    <p class="phone">Phone Number</p>
                    <p class="name">Created By</p>
                    <p class="date">Join Date</p>
                    <div class="action"></div>
                </div>
                <div class="table_body d_flex flex__co">
                    <div class="start_page deactivate">
                        <p>No Patient Found</p>
                    </div>
                    <div class="loader_cont active">
                        <div class="loader"></div>
                    </div>
                </div>
                <div class="table_footer d_flex flex__e_b">
                    <p>Show <span class='show_count'>${this.show_count_num}</span> data of <span
                            class="total_data">${this.total_data_num}</span></p>
                    <div class="pagenation d_flex flex__c_c">
                        <button type="button" class="main_btn prev">Prev</button>
                        <p class="page_no d_flex flex__c_c"><span class="current_page">${this.batchNumber}</span>/<span
                                class="total_page">${this.total_page_num}</span></p>
                        <button type="button" class="main_btn next">Next</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

