import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { currency_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewBillingLaboratoryView {
    constructor() {
        window.laboratory_search_medicine = this.search_medicine.bind(this);
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

        this.main_component = document.querySelector('.billing_table_laboratory_cont');

        // Get the current path, default to '/users' if on '/dashboard'
        const rawPath = window.location.pathname.toLowerCase();

        this.side_fetched = rawPath.split('/')[1];

        // Fetch the initial batch of radiology data
        await this.fetchAndRenderData();
        this.attachEventListeners();

    }

    attachEventListeners() {

        // Open Close Filter Section buttons
        var open_close = this.main_component.querySelector('.heading_cont');
        open_close.addEventListener('click', () => {
            const filter_section = this.main_component.querySelector('.medicine_top');
            var open_close_btn = this.main_component.querySelector('#open_close_search');

            if (open_close_btn.classList.contains('closed')) {
                open_close_btn.classList.remove('closed');
                filter_section.classList.remove('closed');
            }
            else {
                open_close_btn.classList.add('closed');
                filter_section.classList.add('closed');
            }

        });

        // Pagination buttons
        this.main_component.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                this.page_shift = true;
                await this.fetchAndRenderData();
            }
        });

        this.main_component.querySelector('.main_btn.prev').addEventListener('click', async () => {
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


        if (!this.page_shift) {
            const categoryData = await this.fetchCategory(); // Fetch category data only once
            this.categoryData = categoryData || [];


            const roles = (category_raw) => {
                var rolesElem = `
                <br-option type="checkbox" value=" ">Select Category</br-option>
                `;
                category_raw.forEach(data => {
                    rolesElem += `
                    <br-option type="checkbox" value="${data.id}">${data.name}</br-option>
                `;
                });
                return rolesElem;
            };
            this.category_elements = roles(this.categoryData);

            this.main_component.querySelector('.search_containers').innerHTML = this.searchRadiologyView();

            // clear the variables
            this.category_elements = '';
            this.categoryData = '';

        }

        const laboratoryData = await this.fetchData(); // Fetch data
        this.medicineData = laboratoryData || [];
        this.render();

        this.isLoading = false;
        this.page_shift = false;
    }

    render() {

        if (this.medicineData.laboratoryList && this.medicineData.laboratoryList.length > 0) {
            this.populateTable(this.medicineData);
        } else {
            this.displayNoDataMessage();
        }

    }

    populateTable(laboratoryData) {
        const tableBody = this.main_component.querySelector('.table_body');
        tableBody.innerHTML = '';  // Clear table before populating


        const show_count = this.main_component.querySelector('.show_count');
        const total_data = this.main_component.querySelector('.total_data');
        const total_page = this.main_component.querySelector('.total_page');
        const current_page = this.main_component.querySelector('.current_page');

        show_count.innerText = laboratoryData.showData;
        total_data.innerText = laboratoryData.total;
        total_page.innerText = laboratoryData.pages;
        current_page.innerText = laboratoryData.batch;
        this.total_page_num = laboratoryData.pages;


        laboratoryData.laboratoryList.forEach((test, index) => {
            const row = document.createElement('div');
            row.className = 'tr d_flex flex__c_a';
            row.setAttribute('title', test.name);

            row.innerHTML = `
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${test.name}</p>
                    <p class="name">${test.category == null ? 'No Category' : test.category}</p>
                    <p class="remain">${currency_formatter(test.price)}</p>
                    <p class="status">${test.status}</p>
                    <div class="action d_flex flex__c_c">
                        <button class="main_btn edit_price_btn">Edit Price</button>
                    </div>
            `;

            // add event listener to the edit price btn
            row.querySelector('.edit_price_btn').addEventListener('click', () => {
                dashboardController.updateLaboratoryTestPricePopUpView.PreRender(test);
                console.log('edit price btn clicked', test);
            });

            tableBody.appendChild(row);
        });

        // clear variables
        this.medicineData = [];
    }

    async fetchData() {
        try {
            const response = await fetch('/api/billing/search_laboratory_test_on_billing', {
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

    async fetchCategory() {
        try {
            const response = await fetch('/api/laboratory/get_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
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

    async search_medicine(data) {
        this.loadingContent();
        this.searchTerm = data.query;
        this.category_value = data.category;
        this.batchNumber = 1; // Reset to first batch on search
        this.page_shift = true;
        await this.fetchAndRenderData();
    }

    loadingContent() {
        const tableBody = this.main_component.querySelector('.table_body');
        tableBody.innerHTML = `
            <div class="start_page deactivate">
                <p>No Test Found</p>
            </div>
            <div class="loader_cont active"><div class="loader"></div></div>
        `;
    }

    displayNoDataMessage() {
        const show_count = this.main_component.querySelector('.show_count');
        const total_data = this.main_component.querySelector('.total_data');
        const total_page = this.main_component.querySelector('.total_page');
        const current_page = this.main_component.querySelector('.current_page');

        current_page.innerText = 1;
        show_count.innerText = 0;
        total_data.innerText = 0;
        total_page.innerText = 1;
        this.main_component.querySelector('.start_page').style.display = 'flex';
        this.main_component.querySelector('.table_body .loader_cont').classList.remove('active');
        this.total_page_num = 1;
    }

    searchRadiologyView() {
        return `
        <br-form callback="laboratory_search_medicine">
            <div class="medicine_content">
                <br-input label="Test Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter test name" styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>

                
                <br-select search name="category" fontSize="13px" label="Category" value="${this.category_value}" placeholder="Select Category" styles="
                                    border-radius: var(--input_main_border_r);
                                    width: 400px;
                                    padding: 10px;
                                    height: 41px;
                                    background-color: transparent;
                                    border: 2px solid var(--input_border);
                                    " labelStyles="font-size: 12px;">

                                    ${this.category_elements}

                    </br-select>
        
                <div class="med_btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit" >Search</br-button>
                </div> 


            </div>
        </br-form>
            `;
    }

    loading_and_nodata_view() {
        this.main_component.querySelector('.table_body').innerHTML = `
        <div class="start_page deactivate">
            <p>No Test Found</p>
        </div>
        <div class="loader_cont active"><div class="loader"></div></div>
                    `;
    }

    ViewReturn() {
        return `
    <div class="billing_table_laboratory_cont">
    
    <div class="medicine_top closed">
    <div class="heading_cont">
                <h4>Search Test</h4>

                <div class="open_close_filter closed" title="Open Filter" id="open_close_search">
                    <span class='switch_icon_keyboard_arrow_up'></span>
                </div>

            </div>
    <div class="search_containers">
        <div>
            <div class="medicine_content">
                <br-input label="Test Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter test name" styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>

                
                <br-select search name="category" fontSize="13px" label="Category" value="${this.category_value}" placeholder="Select Category" styles="
                                    border-radius: var(--input_main_border_r);
                                    width: 400px;
                                    padding: 10px;
                                    height: 41px;
                                    background-color: transparent;
                                    border: 2px solid var(--input_border);
                                    " labelStyles="font-size: 12px;">

                                    ${this.category_elements}

                    </br-select>
        
                <div class="med_btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit" >Search</br-button>
                </div> 

                <div class="loader_cont active"><div class="loader"></div></div>

            </div>
        </div>
    </div>
    
    </div>
    
    <div class="main_section medicine_table_out">
    
        <div class="in_table_top d_flex flex__u_s">
            <h4>Laboratory Test List</h4>
        </div>
        <div class="outpatient_table">
    
            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="name">Category</p>
                <p class="remain">Price</p>
                <p class="status">Status</p>
                <div class="action"></div>
            </div>
    
            <div class="table_body d_flex flex__co">
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
