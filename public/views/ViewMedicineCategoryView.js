import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewMedicineCategoryView {
    constructor() {
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

        // Fetch the initial batch of medicineCategory data
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

    row_listener() {
        // listeners for each row
        const rows = document.querySelectorAll('.table_body .tr');
        rows.forEach((row) => {
            row.addEventListener('click', async () => {
                const medicineCategoryId = row.getAttribute('data_src');
                console.log('view single medicine category with id '+ medicineCategoryId);
                
                frontRouter.navigate('/medicine/viewcategory/' + medicineCategoryId);
            })
        });
    }

    async fetchAndRenderData() {
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn(); // Show loader
        const medicineCategoryData = await this.fetchData(); // Fetch data with search term and batch number

        this.medicineCategoryData = medicineCategoryData || [];
        this.render();
        this.attachEventListeners();
    }

    render() {
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        if (this.medicineCategoryData.categoryList && this.medicineCategoryData.categoryList.length > 0) {
            this.populateTable(this.medicineCategoryData);
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

    populateTable(medicineCategoryData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = ''; // Clear table before populating

        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');

        show_count.innerText = medicineCategoryData.showData;
        total_data.innerText = medicineCategoryData.total;
        total_page.innerText = medicineCategoryData.pages;
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
                </div>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        this.row_listener();
    }

    async fetchData() {
        try {
            const response = await fetch('/api/medicine/search_medicine_category', {
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
        <div class="main_section outMedicineCategory_table_out">
            <div class="in_table_top d_flex flex__u_b">
                <h4>Medicine Category List</h4>
                <div class="search_cont">
                    <input type="text" placeholder="Search by name or id" value="${this.searchTerm}">
                </div>
            </div>
            <div class="outpatient_table">
                <div class="table_head tr d_flex flex__c_a">
                    <p class="id">SN</p>
                    <p class="name">Name</p>
                    <p class="number">Medicine</p>
                    <p class="name">Created By</p>
                    <p class="date">Created Date</p>
                </div>
                <div class="table_body d_flex flex__co">
                    <div class="start_page deactivate">
                        <p>There Is No Any Patient Registered</p>
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

