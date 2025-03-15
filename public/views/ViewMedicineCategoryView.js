import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewMedicineCategoryView {
    constructor() {
        window.delete_category = this.delete_category.bind(this);
        this.row_to_delete = '';
        this.medicineCategoryData = [];
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

        this.main_container = document.querySelector('.outMedicineCategory_table_out');


        // Fetch the initial batch of medicineCategory data
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

        var search_btn = this.main_container.querySelector('.btn_search');
        if (search_btn) {
            search_btn.addEventListener('click', async () => {
                this.searchTerm = searchInput.value;
                this.batchNumber = 1; // Reset to batch 1 when searching
                await this.fetchAndRenderData();
            })
        }

        var add_btn = this.main_container.querySelector('.add_btn');
        if (add_btn) {
            add_btn.addEventListener('click', () => {
                dashboardController.createRadiologyCategoryPopUp.PreRender();
                console.log('add btn clicked');

            })
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

    row_listener() {
        // listeners for each row
        const rows = document.querySelectorAll('.table_body .tr');
        rows.forEach((row) => {
            row.addEventListener('click', async () => {
                const medicineCategoryId = row.getAttribute('data_src');
                console.log('view single medicine category with id ' + medicineCategoryId);

                frontRouter.navigate('/pharmacy/viewcategory/' + medicineCategoryId);
            })
        });

        const Delete_btn = document.querySelectorAll('#Delete_btn');
        Delete_btn.forEach(btn => {
            btn.addEventListener('click', async (event) => {
                // disable propagation
                event.stopPropagation();

                if (btn.classList.contains('delete_active')) {
                    const btnParent = btn.closest('.tr');
                    this.row_to_delete = btnParent;
                    const medicineCategoryId = btnParent.getAttribute('data_src');
                    const medicineCategoryName = btnParent.getAttribute('title');

                    dashboardController.confirmDeletePopUpView.PreRender(
                        {
                            callback: 'delete_category',
                            data: medicineCategoryName,
                            title: 'Category',
                            params: medicineCategoryId
                        }
                    );
                }
                else if (btn.classList.contains('delete_inactive')) {
                    notify('top_left', 'Cannot delete category, it has medicines assigned to it.', 'warning');
                }


            })
        })

    }

    async fetchAndRenderData() {
        this.loadingContent();
        const medicineCategoryData = await this.fetchData(); // Fetch data with search term and batch number

        this.medicineCategoryData = medicineCategoryData || [];
        this.render();
    }

    render() {

        if (this.medicineCategoryData.categoryList && this.medicineCategoryData.categoryList.length > 0) {
            this.populateTable(this.medicineCategoryData);
        } else {
            const show_count = this.main_container.querySelector('.show_count');
            const total_data = this.main_container.querySelector('.total_data');
            const total_page = this.main_container.querySelector('.total_page');
            const current_page = this.main_container.querySelector('.current_page');

            current_page.innerText = 1;
            show_count.innerText = 0;
            total_data.innerText = 0;
            total_page.innerText = 1;
            this.total_page_num = 1;
            this.show_count_num = 0;
            this.total_data_num = 0;
            this.main_container.querySelector('.start_page').style.display = 'flex'; // No data message
        }
        // document.querySelector('.loader_cont').classList.remove('active');
    }

    populateTable(medicineCategoryData) {
        const tableBody = this.main_container.querySelector('.table_body');
        tableBody.innerHTML = ''; // Clear table before populating

        const show_count = this.main_container.querySelector('.show_count');
        const total_data = this.main_container.querySelector('.total_data');
        const total_page = this.main_container.querySelector('.total_page');
        const current_page = this.main_container.querySelector('.current_page');

        show_count.innerText = medicineCategoryData.showData;
        total_data.innerText = medicineCategoryData.total;
        total_page.innerText = medicineCategoryData.pages;
        current_page.innerText = medicineCategoryData.batch;

        this.total_page_num = medicineCategoryData.pages;
        this.show_count_num = medicineCategoryData.showData;
        this.total_data_num = medicineCategoryData.total;

        medicineCategoryData.categoryList.forEach((medicineCategory, index) => {
            const row = `
                <div class="tr d_flex flex__c_a" data_src="${medicineCategory.id}" title="${medicineCategory.name}">
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${medicineCategory.name}</p>
                    <p class="number">${medicineCategory.medicine}</p>
                    <p class="name">${medicineCategory.created_by}</p>
                    <p class="date">${this.date_formatter(medicineCategory.created_at)}</p>
                    <div class="action d_flex flex__c_c">
                        <button type="button" id="Delete_btn" class="main_btn ${medicineCategory.medicine > 0 ? 'delete_inactive' : 'delete_active'}">Delete</button>
                    </div>
                </div>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        this.row_listener();
    }

    async fetchData() {
        try {
            const response = await fetch('/api/pharmacy/search_medicine_category', {
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


    async delete_category(id) {

        dashboardController.loaderView.render();
        try {
            const response = await fetch('/api/pharmacy/delete_medicine_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,  // Send search term
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
            }
            else {
                notify('top_left', result.message, 'warning');
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

    loadingContent() {
        const tableBody = this.main_container.querySelector('.table_body');
        tableBody.innerHTML = `
            <div class="start_page deactivate">
                <p>No Category Found</p>
            </div>
            <div class="loader_cont active"><div class="loader"></div></div>
        `;
    }


    date_formatter(ymd) {
        const dateee = new Date(ymd);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(dateee);
    }

    ViewReturn() {
        return `
        <div class="main_section outMedicineCategory_table_out">
            <div class="in_table_top d_flex flex__u_b">
                <h4>Medicine Category List</h4>
                <div class="search_cont">
                    <input type="text" placeholder="Search by name or id" value="${this.searchTerm}">

                    <br-button loader_width="23" class="btn_search" type="submit">
                            <span class="switch_icon_magnifying_glass"></span>
                    </br-button>
                    <div class="add_btn" title="Create Category" id="open_add_category_popup"> <span class="switch_icon_add"></span></div>
                </div>
            </div>
            <div class="outpatient_table">
                <div class="table_head tr d_flex flex__c_a">
                    <p class="id">SN</p>
                    <p class="name">Name</p>
                    <p class="number">Medicine</p>
                    <p class="name">Created By</p>
                    <p class="date">Created Date</p>
                    <p class="action"></p>
                </div>
                <div class="table_body d_flex flex__co">
                    <div class="start_page deactivate">
                        <p>No Category Found</p>
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
        </div>`;
    }

}

