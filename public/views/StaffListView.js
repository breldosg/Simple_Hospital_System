import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class StaffListView {
    constructor() {
        this.staffData = [];
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

        // Fetch the initial batch of staff data
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
        const staffData = await this.fetchData(); // Fetch data with search term and batch number

        this.staffData = staffData || [];
        this.render();
        this.attachEventListeners();
    }

    render() {
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        if (this.staffData.staffList && this.staffData.staffList.length > 0) {
            this.populateTable(this.staffData);
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

    populateTable(staffData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = ''; // Clear table before populating

        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');

        show_count.innerText = staffData.showData;
        total_data.innerText = staffData.total;
        total_page.innerText = staffData.pages;
        this.total_page_num = staffData.pages;
        this.show_count_num = staffData.showData;
        this.total_data_num = staffData.total;

        const activate_btn = `<button type="button" id="activate_btn" class="main_btn">Activate</button>`;
        const deactivate_btn = `<button type="button" id="deactivate_btn" class="main_btn error">Deactivate</button>`;


        staffData.staffList.forEach((staff, index) => {
            const row = `
                <div class="tr d_flex flex__c_a" data_src="${staff.id}" title="${staff.name}">
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${staff.name}</p>
                    <p class="gender">${staff.gender}</p>
                    <p class="phone">${staff.phone}</p>
                    <p class="role">${staff.role_name}</p>
                    <p class="date">${this.date_formatter(staff.created_at)}</p>
                    <p class="status">${staff.status}</p>
                    <div class="action d_flex flex__c_c">
                        ${staff.status == 'active' ? deactivate_btn : activate_btn}
                    </div>
                </div>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        this.row_listener();
    }

    row_listener() {
        // listeners for each row
        const rows = document.querySelectorAll('.table_body .tr');
        rows.forEach((row) => {
            row.addEventListener('click', async () => {
                const staffId = row.getAttribute('data_src');
                console.log('staffId= ', staffId);

                // frontRouter.navigate('/patient/viewpatient/' + patientId);
            })
        });



        const row_btn = document.querySelectorAll('#deactivate_btn, #activate_btn');

        row_btn.forEach(btn => {
            btn.addEventListener('click', async (event) => {
                // disable propagation
                event.stopPropagation();

                // Get the btn closest with class tr
                const btnParent = btn.closest('.tr');
                const staffId = btnParent.getAttribute('data_src');


                dashboardController.loaderView.render();

                const action = btn.id === 'deactivate_btn' ? 'deactivate' : 'activate';
                const checkOut_response = await this.activate_deactivate(staffId, action);

                if (checkOut_response.success) {
                    notify('top_left', checkOut_response.message, 'success');
                    await this.fetchAndRenderData();

                    dashboardController.loaderView.remove();

                } else {
                    notify('top_left', checkOut_response.message, 'error');
                }


            })
        });


    }

    async activate_deactivate(id, action) {
        try {
            const response = await fetch('/api/users/change_user_account_state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    action: action,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }


    async fetchData() {
        try {
            const response = await fetch('/api/users/search_staff', {
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
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    date_formatter(ymd) {
        const dateee = new Date(ymd);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(dateee);
    }

    ViewReturn() {
        return `
        <div class="main_section outpatient_table_out">
            <div class="in_table_top d_flex flex__u_b">
                <h4>Staff List</h4>
                <div class="search_cont">
                    <input type="text" placeholder="Search by name or id" value="${this.searchTerm}">
                </div>
            </div>
            <div class="outpatient_table">
                <div class="table_head tr d_flex flex__c_a">
                    <p class="id">SN</p>
                    <p class="name">Name</p>
                    <p class="gender">Gender</p>
                    <p class="phone">Phone Number</p>
                    <p class="role">Role</p>
                    <p class="date">Created Date</p>
                    <p class="status">Status</p>
                    <div class="action"></div>
                </div>
                <div class="table_body d_flex flex__co">
                    <div class="start_page deactivate">
                        <p>There Is No Any Staff Registered</p>
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
        </div>`;
    }
}
