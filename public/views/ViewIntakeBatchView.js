import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewIntakeBatchView {
    constructor() {
        window.search_intake_batch = this.search_intake_batch.bind(this);
        this.medicineData = [];
        this.batchNumber = 1;
        this.total_page_num = 1;
        this.total_data_num = 0;
        this.show_count_num = 0;
        this.searchTerm = '';
        this.from_value = '';
        this.to_value = '';
        this.isLoading = false;  // Prevent multiple fetch calls at the same time
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        // Fetch the initial batch of medicine data
        await this.fetchAndRenderData();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Pagination buttons
        document.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                await this.fetchAndRenderData();
            }
        });

        document.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber > 1) {
                this.batchNumber -= 1;
                await this.fetchAndRenderData();
            }
        });
    }

    async fetchAndRenderData() {
        if (this.isLoading) return;  // Prevent multiple fetches
        this.isLoading = true;

        const batchData = await this.fetchData(); // Fetch data
        this.batchData = batchData || [];
        this.render();

        this.isLoading = false;
    }

    render() {

        if (this.batchData.batchList && this.batchData.batchList.length > 0) {
            this.populateTable(this.batchData);
        } else {
            this.displayNoDataMessage();
        }

    }

    populateTable(batchData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = '';  // Clear table before populating

        document.querySelector('.show_count').innerText = batchData.showData;
        document.querySelector('.total_data').innerText = batchData.total;
        document.querySelector('.total_page').innerText = batchData.pages;
        this.total_page_num = batchData.pages;

        batchData.batchList.forEach((batch, index) => {
            const row = `
                <div class="tr d_flex flex__c_a" data_src="${batch.id}" title="${batch.name}">
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${batch.name}</p>
                    <p class="name">${batch.provider}</p>
                    <p class="date">${this.date_formatter(batch.receive_date)}</p>
                    <p class="name">${batch.created_by}</p>
                    <p class="status">${batch.status}</p>
                    <div class="action d_flex flex__c_c">
                        ${batch.status === 'open' ? '<button id="deactivate_btn" class="main_btn error">Close</button>' : 'Closed'}
                    </div>
                </div>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        // clear variables
        this.batchData = [];

        this.row_listener();
    }

    row_listener() {
        // listeners for each row
        const rows = document.querySelectorAll('.table_body .tr');
        rows.forEach((row) => {
            row.addEventListener('click', async () => {
                const batchId = row.getAttribute('data_src');

                frontRouter.navigate('/pharmacy/viewinatakebatch/' + batchId);
            })
        });

        const createVisit_btn = document.querySelectorAll('#createVisit_btn');

        createVisit_btn.forEach(btn => {
            btn.addEventListener('click', async (event) => {
                // disable propagation
                event.stopPropagation();

                // get the btn closest with class tr
                const btnParent = btn.closest('.tr');
                const patientId = btnParent.getAttribute('data_src');
                const patientName = btnParent.getAttribute('title');

                dashboardController.createVisitPopUpView.PreRender(
                    {
                        id: patientId,
                        p_name: patientName,
                    })

            })
        });


    }

    async activate_deactivate(id, action) {
        try {
            const response = await fetch('/api/pharmacy/change_medicine_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    medicine_id: id,
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
            const response = await fetch('/api/pharmacy/search_intake_batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,
                    batch: this.batchNumber,
                    from: this.from_value,
                    to: this.to_value
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

    async search_intake_batch(data) {
        var from_v = data.from;
        var to_v = data.to;
        if (from_v > to_v) {
            document.querySelector('#from_inp').setAttribute('error', true);
            document.querySelector('#to_inp').setAttribute('error', true);;

            notify('top_left', 'Start date cannot be greater than end date', 'error');
            return;
        }

        this.loadingContent();
        this.searchTerm = data.query;
        this.from_value = data.from;
        this.to_value = data.to;
        this.batchNumber = 1; // Reset to first batch on search
        await this.fetchAndRenderData();
    }

    loadingContent() {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = `
            <div class="start_page deactivate">
                <p>No Medicines Found</p>
            </div>
            <div class="loader_cont active"><div class="loader"></div></div>
        `;
    }

    displayNoDataMessage() {
        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');
        show_count.innerText = 0;
        total_data.innerText = 0;
        total_page.innerText = 1;
        document.querySelector('.start_page').style.display = 'flex';
        document.querySelector('.table_body .loader_cont').classList.remove('active');
    }

    ViewReturn() {
        return `
    <div class="intake_batch_cont">
    
    <div class="intake_batch_top">
    
        <h4>Search Batch</h4>
        <br-form callback="search_intake_batch">
            <div class="intake_batch_content">
                <br-input label="Batch Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter batch name" styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>

                <br-input label="From Date" id="from_inp" name="from" type="date" value="${this.searchTerm == null ? '' : this.searchTerm}" styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>


                <br-input label="To Date" name="to" id="to_inp" type="date" value="${this.searchTerm == null ? '' : this.searchTerm}"styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>

        
                <div class="med_btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit" >Search</br-button>
                </div> 


            </div>
        </br-form>
    
    </div>
    
    <div class="main_section medicine_table_out">
    
        <div class="in_table_top d_flex flex__u_s">
            <h4>Batch List</h4>
        </div>
        <div class="outpatient_table">
    
            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="name">Provider</p>
                <p class="date">Receive Date</p>
                <p class="name">Create By</p>
                <p class="status">Status</p>
                <div class="action"></div>
            </div>
    
            <div class="table_body d_flex flex__co">
                <div class="start_page deactivate">
                <p>No Intake Batch Found</p>
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
    
    </div>
        `;
    }

    date_formatter(ymd) {
        const dateee = new Date(ymd);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(dateee);
    }
}




