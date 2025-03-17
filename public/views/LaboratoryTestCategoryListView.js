import { ALLOW_TO_ADD_UPDATE_TEST_CATEGORY } from "../config/roles.js";
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { currency_formatter, date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class LaboratoryTestCategoryListView {
    constructor() {
        window.laboratory_search_exam_category_list = this.search_medicine.bind(this);
        window.delete_laboratory_category = this.delete_category.bind(this);
        this.row_to_delete = '';
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

        this.main_component = document.querySelector('.radiology_search_exam_category_list');

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

        // Create Radiology Examination Button
        var create_laboratory_examination = this.main_component.querySelector('#open_add_product_popup');
        if (ALLOW_TO_ADD_UPDATE_TEST_CATEGORY.includes(this.role)) {
            create_laboratory_examination.addEventListener('click', () => {
                dashboardController.createLaboratoryCategoryPopUp.PreRender();
            });
        }

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

        const radiologyData = await this.fetchData(); // Fetch data
        this.medicineData = radiologyData || [];

        if (this.medicineData.categoryList && this.medicineData.categoryList.length > 0) {
            this.populateTable(this.medicineData);
        } else {
            this.displayNoDataMessage();
        }

        this.isLoading = false;
        this.page_shift = false;
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


        laboratoryData.categoryList.forEach((category, index) => {
            const row = document.createElement('div');
            row.className = 'tr d_flex flex__c_a';

            row.innerHTML = `
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${category.name}</p>
                    <p class="name">${category.created_by == null ? 'Default' : category.created_by}</p>
                    <p class="remain">${date_formatter(category.created_at)}</p>
                    <p class="status">${category.tests}</p>
                    <div class="action d_flex flex__c_c">
                        <button type="button" id="Delete_btn" class="main_btn error ${category.tests > 0 ? 'disabled' : 'delete_active'}">Delete</button>
                    </div>
            `;

            // row click to update the category
            row.addEventListener('click', () => {
                if (ALLOW_TO_ADD_UPDATE_TEST_CATEGORY.includes(this.role)) {
                    dashboardController.createLaboratoryCategoryPopUp.PreRender(category);
                } else {
                    notify('top_left', 'You are not authorized to update this category.', 'warning');
                }
            });


            // Add event listener to delete button
            const deleteBtn = row.querySelector('#Delete_btn');
            if (deleteBtn) {

                deleteBtn.addEventListener('click', (event) => {
                    console.log(deleteBtn);
                    event.stopPropagation();
                    if (ALLOW_TO_ADD_UPDATE_TEST_CATEGORY.includes(this.role)) {
                        if (deleteBtn.classList.contains('delete_active')) {
                            this.row_to_delete = row;
                            const categoryId = category.id;
                            const categoryName = category.name;

                            dashboardController.confirmDeletePopUpView.PreRender({
                                callback: 'delete_laboratory_category',
                                data: categoryName,
                                title: 'Category',
                                params: categoryId
                            });
                        } else if (deleteBtn.classList.contains('delete_inactive')) {
                            notify('top_left', 'Cannot delete category, it has exams assigned to it.', 'warning');
                        }
                    } else {
                        notify('top_left', 'You are not authorized to delete this category.', 'warning');
                    }
                });
            }

            tableBody.appendChild(row);
        });

        // clear variables
        this.medicineData = [];
    }

    async fetchData() {
        try {
            const response = await fetch('/api/laboratory/search_laboratory_category', {
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

            console.log(result.data);

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
        this.batchNumber = 1; // Reset to first batch on search
        this.page_shift = true;
        await this.fetchAndRenderData();
    }

    loadingContent() {
        const tableBody = this.main_component.querySelector('.table_body');
        tableBody.innerHTML = `
            <div class="start_page deactivate">
                <p>No Exam Found</p>
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

    loading_and_nodata_view() {
        this.main_component.querySelector('.table_body').innerHTML = `
        <div class="start_page deactivate">
            <p>No Category Found</p>
        </div>
        <div class="loader_cont active"><div class="loader"></div></div>
                    `;
    }

    ViewReturn() {
        return `
    <div class="radiology_search_exam_category_list">
    
    <div class="medicine_top closed">
    <div class="heading_cont">
                <h4>Search Exam Category</h4>
                <div class="open_close_filter closed" title="Open Filter" id="open_close_search">
                    <span class='switch_icon_keyboard_arrow_up'></span>
                </div>

            </div>
    <div class="search_containers">
        <br-form callback="radiology_search_exam_category_list">
            <div class="medicine_content">
                <br-input label="Test Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter category name" styles="
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
            <h4>Radiology Exam Category List</h4>
            
            ${ALLOW_TO_ADD_UPDATE_TEST_CATEGORY.includes(this.role) ? `
            <div class="add_btn" title="Create New Exam" id="open_add_product_popup">
                <span class="switch_icon_add"></span>
            </div>
            ` : ''}
        </div>
        <div class="outpatient_table">
    
            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="name">Created By</p>
                <p class="remain">Created At</p>
                <p class="status">Exams</p>
                <div class="action"></div>
            </div>
    
            <div class="table_body d_flex flex__co">
                <div class="start_page deactivate">
                <p>No Exam Found</p>
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

    async delete_category(id) {
        dashboardController.loaderView.render();
        try {
            const response = await fetch('/api/laboratory/delete_laboratory_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
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

            if (result.success) {
                this.row_to_delete.remove();
                notify('top_left', result.message, 'success');
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        } finally {
            dashboardController.loaderView.remove();
        }
    }
}

