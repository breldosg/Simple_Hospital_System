import { ALLOW_TO_ADD_UPDATE_PRODUCT } from "../config/roles.js";
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewMedicineView {
    constructor() {
        window.search_medicine = this.search_medicine.bind(this);
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

        // get role from global state
        this.role = globalStates.getState('user_data').role;

        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        // Get the current path, default to '/users' if on '/dashboard'
        const rawPath = window.location.pathname.toLowerCase();

        this.side_fetched = rawPath.split('/')[1];

        // Fetch the initial batch of medicine data
        await this.fetchAndRenderData();
        this.attachEventListeners();

    }

    attachEventListeners() {

        // Open Close Filter Section buttons
        var open_close = document.querySelector('.medicine_cont .heading_cont');
        open_close.addEventListener('click', () => {
            const filter_section = document.querySelector('.medicine_cont .medicine_top');
            var open_close_btn = document.querySelector('.medicine_cont #open_close_search');

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
        const add_btn = document.querySelector('.add_btn');
        if (add_btn) {
            add_btn.addEventListener('click', () => {
                dashboardController.createProductPopUpView.PreRender();
            });
        }

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

            document.querySelector('.search_containers').innerHTML = this.searchMedicineView();

            // clear the variables
            this.category_elements = '';
            this.categoryData = '';

        }

        const medicineData = await this.fetchData(); // Fetch data
        this.medicineData = medicineData || [];
        this.render();

        this.isLoading = false;
        this.page_shift = false;
    }

    render() {

        if (this.medicineData.medicineList && this.medicineData.medicineList.length > 0) {
            this.populateTable(this.medicineData);
        } else {
            this.displayNoDataMessage();
        }

    }

    populateTable(medicineData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = '';  // Clear table before populating


        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');
        const current_page = document.querySelector('.current_page');

        show_count.innerText = medicineData.showData;
        total_data.innerText = medicineData.total;
        total_page.innerText = medicineData.pages;
        current_page.innerText = medicineData.batch;
        this.total_page_num = medicineData.pages;

        var activate_btn_class = ALLOW_TO_ADD_UPDATE_PRODUCT.includes(this.role) ? '' : 'disabled';
        var deactivate_btn_class = ALLOW_TO_ADD_UPDATE_PRODUCT.includes(this.role) ? '' : 'disabled';

        medicineData.medicineList.forEach((medicine, index) => {
            var remains = this.side_fetched == 'pharmacy' ? medicine.pharmacy_quantity : medicine.store_quantity;
            const row = `
                <div class="tr d_flex flex__c_a" data_src="${medicine.id}" title="${medicine.name}">
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${medicine.name}</p>
                    <p class="name">${medicine.category == null ? 'No Category' : medicine.category}</p>
                    <p class="type">${medicine.type}</p>
                    <p class="remain">${remains}</p>
                    <p class="status">${medicine.status}</p>
                    <div class="action d_flex flex__c_c">
                        ${medicine.status === 'active' ? `<button id="deactivate_btn" class="main_btn error ${deactivate_btn_class}">Deactivate</button>` : `<button id="activate_btn" class="main_btn ${activate_btn_class}">Activate</button>`}
                    </div>
                </div>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        // clear variables
        this.medicineData = [];

        this.row_listener();
    }

    row_listener() {
        // listeners for each row
        const rows = document.querySelectorAll('.table_body .tr');
        rows.forEach((row) => {
            row.addEventListener('click', async () => {
                const medicineId = row.getAttribute('data_src');
                console.log('medicineId= ', medicineId);
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

        const row_btn = document.querySelectorAll('#deactivate_btn, #activate_btn');

        row_btn.forEach(btn => {
            btn.addEventListener('click', async (event) => {
                if (!ALLOW_TO_ADD_UPDATE_PRODUCT.includes(this.role)) {
                    notify('top_left', 'You are not authorized to edit this product.', 'warning');
                    return;
                }
                // disable propagation
                event.stopPropagation();
                // Get the btn closest with class tr
                const btnParent = btn.closest('.tr');
                const medicineId = btnParent.getAttribute('data_src');


                dashboardController.loaderView.render();

                const action = btn.id === 'deactivate_btn' ? 'deactivate' : 'activate';
                const checkOut_response = await this.activate_deactivate(medicineId, action);

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

    async fetchData() {
        try {
            const response = await fetch('/api/pharmacy/product_list', {
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
            const response = await fetch('/api/pharmacy/get_category', {
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
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = `
            <div class="start_page deactivate">
                <p>No Product Found</p>
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

    searchMedicineView() {
        return `
        <br-form callback="search_medicine">
            <div class="medicine_content">
                <br-input label="Product Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter product name" styles="
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
        document.querySelector('.medicine_cont .table_body').innerHTML = `
        <div class="start_page deactivate">
            <p>No Product Found</p>
        </div>
        <div class="loader_cont active"><div class="loader"></div></div>
                    `;
    }

    ViewReturn() {
        return `
    <div class="medicine_cont">
    
    <div class="medicine_top closed">
    <div class="heading_cont">
                <h4>Search Product</h4>

                <div class="open_close_filter closed" title="Open Filter" id="open_close_search">
                    <span class='switch_icon_keyboard_arrow_up'></span>
                </div>

            </div>
    <div class="search_containers">
        <div>
            <div class="medicine_content">
                <br-input label="Product Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter product name" styles="
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
            <h4>Product List</h4>

            ${ALLOW_TO_ADD_UPDATE_PRODUCT.includes(this.role) ? `
            <div class="add_btn" title="Create Product" id="open_add_product_popup">
                <span class="switch_icon_add"></span>
            </div>
            ` : ''}
        </div>
        <div class="outpatient_table">
    
            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="name">Category</p>
                <p class="type">Type</p>
                <p class="remain">Remain Quantity</p>
                <p class="status">Status</p>
                <div class="action"></div>
            </div>
    
            <div class="table_body d_flex flex__co">
                <div class="start_page deactivate">
                <p>No Product Found</p>
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
