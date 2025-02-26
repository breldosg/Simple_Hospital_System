import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { currency_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewBillingConsultationView {
    constructor() {
        window.consumable_search_medicine = this.search_medicine.bind(this);
        window.delete_consultation_price = this.deleteData.bind(this);
        this.medicineData = [];
        this.batchNumber = 1;
        this.total_page_num = 1;
        this.total_data_num = 0;
        this.show_count_num = 0;
        this.searchTerm = '';
        this.category_value = '';
        this.isLoading = false;  // Prevent multiple fetch calls at the same time
        this.page_shift = false;  // Prevent multiple fetch calls at the same time
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();
        this.main_container = document.querySelector('.visit_price_container_view_table');

        // Get the current path, default to '/users' if on '/dashboard'
        const rawPath = window.location.pathname.toLowerCase();

        this.side_fetched = rawPath.split('/')[1];

        // Fetch the initial batch of radiology data
        await this.fetchAndRenderData();
        this.attachEventListeners();

    }

    attachEventListeners() {

        // Open Close Filter Section buttons
        var open_close = this.main_container.querySelector('.heading_cont');
        open_close.addEventListener('click', () => {
            const filter_section = this.main_container.querySelector('.medicine_top');
            var open_close_btn = this.main_container.querySelector('#open_close_search');

            if (open_close_btn.classList.contains('closed')) {
                open_close_btn.classList.remove('closed');
                filter_section.classList.remove('closed');
            }
            else {
                open_close_btn.classList.add('closed');
                filter_section.classList.add('closed');
            }

        });


        // add btn
        document.querySelector('.add_btn').addEventListener('click', () => {
            dashboardController.createVisitPricePopUp.PreRender();
        });

        // Pagination buttons
        document.querySelector('.main_btn.next').addEventListener('click', async () => {


            if (!this.isLoading && this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                this.page_shift = true;
                await this.fetchAndRenderData();
            }
        });

        document.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber > 1) {
                this.batchNumber -= 1;
                this.page_shift = true;
                await this.fetchAndRenderData();
            }
        });
    }

    async fetchAndRenderData() {
        if (this.isLoading) return;  // Prevent multiple fetches
        this.isLoading = true;
        this.loading_and_nodata_view();


        const consultationData = await this.fetchData(); // Fetch data
        this.medicineData = consultationData || [];
        this.render();

        this.isLoading = false;
        this.page_shift = false;
    }

    render() {

        if (this.medicineData.consultationList && this.medicineData.consultationList.length > 0) {
            this.populateTable(this.medicineData);
        } else {
            this.displayNoDataMessage();
        }

    }

    populateTable(consultationData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = '';  // Clear table before populating


        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');
        const current_page = document.querySelector('.current_page');

        show_count.innerText = consultationData.showData;
        total_data.innerText = consultationData.total;
        total_page.innerText = consultationData.pages;
        current_page.innerText = consultationData.batch;
        this.total_page_num = consultationData.pages;


        consultationData.consultationList.forEach((consultation, index) => {
            const row = document.createElement('div');
            row.className = 'tr';
            row.setAttribute('title', consultation.doctorRole);

            row.innerHTML = `
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${consultation.name}</p>
                    <p class="role">${consultation.role_name}</p>
                    <p class="type">${consultation.visit_type.toUpperCase()}</p>
                    <p class="name">${consultation.department_name}</p>
                    <p class="priority">${consultation.priority.toUpperCase()}</p>
                    <p class="price">${currency_formatter(consultation.price)}</p>
                    <div class="action">
                            <button class="main_btn edit_price_btn">Edit Price</button>
                            <button class="main_btn error delete_price_btn">Delete</button>
                    </div>
            `;

            // add event listener to the edit price btn
            row.querySelector('.edit_price_btn').addEventListener('click', () => {
                dashboardController.updateConsultationPricePopUpView.PreRender(consultation);
                console.log('edit price btn clicked', consultation);
            });

            // add event listener to the delete price btn
            row.querySelector('.delete_price_btn').addEventListener('click', () => {
                dashboardController.confirmPopUpView.PreRender({
                    callback: 'delete_consultation_price',
                    parameter: consultation.id,
                    title: 'Remove Consultation Price',
                    sub_heading: `Consultation For: ${consultation.name}`,
                    description: 'Are you sure you want to remove this consultation price?',
                    ok_btn: 'Remove',
                    cancel_btn: 'Cancel'
                });
            });


            tableBody.appendChild(row);
        });

        // clear variables
        this.medicineData = [];
    }

    async fetchData() {
        try {
            const response = await fetch('/api/billing/search_consultation_for_billing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,
                    batch: this.batchNumber,
                    category: this.category_value
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

    async deleteData(consultationId) {
        try {
            const response = await fetch('/api/billing/delete_consultation_price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: consultationId
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


            console.log(result);
            if (result.success) {
                notify('top_left', result.message, 'success');
                this.PreRender();
            }
            else {
                notify('top_left', result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
        }
    }

    async search_medicine(data) {
        this.loadingContent();
        this.searchTerm = data.query;
        this.category_value = data.category;
        this.batchNumber = 1; // Reset to first batch on search
        this.page_shift = true;
        await this.fetchAndRenderData();
    }

    loadingContent() {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = `
            <div class="start_page deactivate">
                <p>No Test Found</p>
            </div>
            <div class="loader_cont active"><div class="loader"></div></div>
        `;
    }

    displayNoDataMessage() {
        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');
        const current_page = document.querySelector('.current_page');

        current_page.innerText = 1;
        show_count.innerText = 0;
        total_data.innerText = 0;
        total_page.innerText = 1;
        document.querySelector('.start_page').style.display = 'flex';
        document.querySelector('.table_body .loader_cont').classList.remove('active');
        this.total_page_num = 1;
    }


    loading_and_nodata_view() {
        this.main_container.querySelector('.table_body').innerHTML = `
        <div class="start_page deactivate">
            <p>No Consultation Found</p>
        </div>
        <div class="loader_cont active"><div class="loader"></div></div>
                    `;
    }

    ViewReturn() {
        return `
    <div class="visit_price_container_view_table">
    
    <div class="medicine_top closed">
    <div class="heading_cont">
                <h4>Search Consultation</h4>

                <div class="open_close_filter closed" title="Open Filter" id="open_close_search">
                    <span class='switch_icon_keyboard_arrow_up'></span>
                </div>

            </div>
    <div class="search_containers">
        <br-form callback="consumable_search_medicine">
            <div class="medicine_content">
                <br-input label="Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter name" styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>

                <div class="med_btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit" >Search</br-button>
                </div> 


            </div>
        </br-form>
    </div>
    
    </div>
    
    <div class="main_section medicine_table_out">
    
        <div class="in_table_top d_flex flex__u_s">
            <h4>Consultation List</h4>

            <div class="add_btn" title="Create Test" id="open_add_product_popup">
                <span class="switch_icon_add"></span>
            </div>
        </div>
        <div class="outpatient_table">
    
            <div class="table_head tr">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="role">Doctor Role</p>
                <p class="type">Visit Type</p>
                <p class="name">Department</p>
                <p class="priority">Priority</p>
                <p class="price">Price</p>
                <div class="action"></div>
            </div>
    
            <div class="table_body">
                <div class="start_page deactivate">
                <p>No Test Found</p>
            </div>
            <div class="loader_cont active"><div class="loader"></div></div>
            </div>
    
            <div class="table_footer d_flex flex__e_b">
                <p>Show <span class='show_count'>${this.show_count_num}</span> data of <span class="total_data">${this.total_data_num}</span></p>
                <div class="pagenation d_flex flex__c_c">
                    <button type="button" class="main_btn prev">Prev</button>
                    <p class="page_no d_flex flex__c_c"><span class="current_page" >${this.batchNumber}</span>/<span class="total_page" >${this.total_page_num}</span></p>
                    <button type="button" class="main_btn next">Next</button>
                </div>
            </div>
    
        </div>
    
    </div>
    
    </div>
        `;
    }
}
