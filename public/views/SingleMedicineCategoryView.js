import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SingleMedicineCategoryView {
    constructor() {
        this.category_id = null;
        this.category_name = null;
        this.category_description = null;
        this.batchNumber = 1;
        this.total_page_num = 1;
        this.total_data_num = 0;
        this.show_count_num = 0;

        this.table_actions = false;

    }
    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('', 'active');

        this.category_id = params.id;
        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
        const cont = document.querySelector('.update_cont');
        const category_data = await this.fetchData(this.category_id); // Wait for fetchData to complete

        this.category_name = category_data.category_detail.name;
        this.category_description = category_data.category_detail.description;

        if (!this.table_actions) {
            if (category_data) {
                cont.innerHTML = this.ViewReturn(category_data.category_detail);
                this.populateTable(category_data.medicine_data);
                this.attach_listeners()
            } else {
                // Handle case where no roles were returned, or an error occurred.
                cont.innerHTML = "<h3>Error fetching roles data. Please try again.</h3>";
            }
        }
        else {
            this.table_actions = false;
            this.loadingContent();
            this.populateTable(category_data.medicine_data);
        }
    }

    populateTable(medicineData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = ''; // Clear table before populating

        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');

        show_count.innerText = medicineData.showData;
        total_data.innerText = medicineData.total;
        total_page.innerText = medicineData.pages;
        this.total_page_num = medicineData.pages;
        this.show_count_num = medicineData.showData;
        this.total_data_num = medicineData.total;

        medicineData.medicineList.forEach((data, index) => {
            const row = `
                <div class="tr d_flex flex__c_a" data_src="${data.id}" title="${data.name}">
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${data.name}</p>
                    <p class="remain">0</p>
                    <p class="status">${data.status}</p>
                    <div class="action d_flex flex__c_c">
                        <button type="button" class="main_btn">Edit</button>
                    </div>
                </div>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        // this.row_listener();
    }


    ViewReturn(data, loader = '') {


        return `
<div class="single_medicine_category_cont">

    <div class="top_card">

        <div class="name_cont">
            <p class="name">${data.name ? data.name : ''}</p>

            <button type="button" data_src="${data == '' ? '' : data.id}" id="edit_category" class="edit_btn">
                <span class='switch_icon_edit'></span>
            </button>

        </div>
        <p class="description">
            ${data.description ? data.description : ''}
        </p>

        <div class="details">
            <p>
                <span class="title">Medicine</span>
                <span class="content">${data.medicine}</span>
            </p>
            <p>
                <span class="title">Created by</span>
                <span class="content">${data.created_by}</span>
            </p>
            <p>
                <span class="title">Created at</span>
                <span class="content">${data.created_at ? this.date_formatter(data.created_at) : ''}</span>
            </p>
        </div>



        <div class="loader_cont ${loader}">
            <div class="loader"></div>
        </div>
    </div>

    <div class="main_section medicine_table_out">

        <div class="in_table_top d_flex flex__u_s">
            <h4>Medicine List</h4>
        </div>
        <div class="outpatient_table">

            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="remain">Remain Quantity</p>
                <p class="status">Status</p>
                <div class="action"></div>
            </div>

            <div class="table_body d_flex flex__co">
                <div class="start_page deactivate">
                    <p>No Medicines Found</p>
                </div>
                <div class="loader_cont ${loader}">
                    <div class="loader"></div>
                </div>
            </div>

            <div class="table_footer d_flex flex__e_b">
                <p>Show <span class='show_count'>${this.show_count_num}</span> data of <span
                        class="total_data">${this.total_data_num}</span></p>
                <div class="pagenation d_flex flex__c_c">
                    <button type="button" class="main_btn prev">Prev</button>
                    <p class="page_no d_flex flex__c_c">${this.batchNumber}/<span
                            class="total_page">${this.total_page_num}</span></p>
                    <button type="button" class="main_btn next">Next</button>
                </div>
            </div>

        </div>

    </div>

</div>
`;
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


    attach_listeners() {

        const edit_category_btn = document.querySelector('#edit_category');
        if (edit_category_btn) {
            edit_category_btn.addEventListener('click', async () => {

                console.log("edit_category_btn ", this.category_id);

                dashboardController.updateCategoryPopUpView.PreRender(
                    {
                        c_id: this.category_id,
                        c_name: this.category_name,
                        c_description: this.category_description
                    }
                );

            })
        }

        // Pagination buttons
        document.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                this.table_actions = true;
                await this.render();
            }
        });

        document.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (this.batchNumber > 1) {
                this.batchNumber -= 1;
                this.table_actions = true;
                await this.render();
            }
        });

    }

    async fetchData(id) {
        try {
            const response = await fetch('/api/pharmacy/single_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category_id: id,
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



            if (result.success) {
                return result.data;
            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    date_formatter(ymd) {
        console.log('date', ymd);

        const dateee = new Date(ymd);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(dateee);
    }

}