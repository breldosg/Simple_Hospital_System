import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { currency_formatter, notify } from "../script/index.js";

export class ViewBillingDefaultPriceView {
    constructor() {
        this.defaultPricesData = [];
        this.batchNumber = 1;
        this.totalPageNum = 1;
        this.totalDataNum = 0;
        this.showCountNum = 0;
        this.isLoading = false;  // Prevent multiple fetch calls at the same time
        this.pageShift = false;  // Prevent multiple fetch calls at the same time
    }

    async PreRender() {
        const checkDashboard = document.querySelector('.update_cont');
        if (!checkDashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();
        this.mainContainer = document.querySelector('.billing_default_price_container_view_table');

        // Get the current path, default to '/users' if on '/dashboard'
        const rawPath = window.location.pathname.toLowerCase();

        this.sideFetched = rawPath.split('/')[1];

        // Fetch the initial batch of default prices data
        await this.fetchAndRenderData();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Pagination buttons
        document.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber < this.totalPageNum) {
                this.batchNumber += 1;
                this.pageShift = true;
                await this.fetchAndRenderData();
            }
        });

        document.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber > 1) {
                this.batchNumber -= 1;
                this.pageShift = true;
                await this.fetchAndRenderData();
            }
        });
    }

    async fetchAndRenderData() {
        if (this.isLoading) return;  // Prevent multiple fetches
        this.isLoading = true;
        this.loading_and_nodata_view();

        const defaultPricesData = await this.fetchData(); // Fetch data
        this.defaultPricesData = defaultPricesData || [];
        this.render();

        this.isLoading = false;
        this.pageShift = false;
    }

    render() {
        if (this.defaultPricesData.defaultPricesList && this.defaultPricesData.defaultPricesList.length > 0) {
            this.populateTable(this.defaultPricesData);
        } else {
            this.displayNoDataMessage();
        }
    }

    populateTable(defaultPricesData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = '';  // Clear table before populating

        const showCount = document.querySelector('.show_count');
        const totalData = document.querySelector('.total_data');
        const totalPage = document.querySelector('.total_page');
        const currentPage = document.querySelector('.current_page');

        showCount.innerText = defaultPricesData.showData;
        totalData.innerText = defaultPricesData.total;
        totalPage.innerText = defaultPricesData.pages;
        currentPage.innerText = defaultPricesData.batch;
        this.totalPageNum = defaultPricesData.pages;

        defaultPricesData.defaultPricesList.forEach((defaultPrice, index) => {
            const row = document.createElement('div');
            row.className = 'tr';
            row.setAttribute('title', defaultPrice.name);

            row.innerHTML = `
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${defaultPrice.name}</p>
                    <p class="price">${currency_formatter(defaultPrice.price)}</p>
                    <div class="action">
                            <button class="main_btn edit_price_btn">Edit Price</button>
                    </div>
            `;

            // add event listener to the edit price btn
            row.querySelector('.edit_price_btn').addEventListener('click', () => {
                dashboardController.updateDefaultPricePopUpView.PreRender(defaultPrice);
            });

            tableBody.appendChild(row);
        });

        // clear variables
        this.defaultPricesData = [];
    }

    async fetchData() {
        try {
            const response = await fetch('/api/billing/search_default_prices_for_billing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    batch: this.batchNumber
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();
            console.log(result);
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    displayNoDataMessage() {
        const showCount = document.querySelector('.show_count');
        const totalData = document.querySelector('.total_data');
        const totalPage = document.querySelector('.total_page');
        const currentPage = document.querySelector('.current_page');

        currentPage.innerText = 1;
        showCount.innerText = 0;
        totalData.innerText = 0;
        totalPage.innerText = 1;
        document.querySelector('.start_page').style.display = 'flex';
        document.querySelector('.table_body .loader_cont').classList.remove('active');
        this.totalPageNum = 1;
    }

    loading_and_nodata_view() {
        this.mainContainer.querySelector('.table_body').innerHTML = `
        <div class="start_page deactivate">
            <p>No Default Prices Found</p>
        </div>
        <div class="loader_cont active"><div class="loader"></div></div>
        `;
    }

    ViewReturn() {
        return `
    <div class="billing_default_price_container_view_table">
    
    <div class="main_section medicine_table_out">
    
        <div class="in_table_top d_flex flex__u_s">
            <h4>Default Price List</h4>
        </div>
        <div class="outpatient_table">
    
            <div class="table_head tr">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="price">Price</p>
                <div class="action"></div>
            </div>
    
            <div class="table_body">
                <div class="start_page deactivate">
                <p>No Default Prices Found</p>
            </div>
            <div class="loader_cont active"><div class="loader"></div></div>
            </div>
    
            <div class="table_footer d_flex flex__e_b">
                <p>Show <span class='show_count'>${this.showCountNum}</span> data of <span class="total_data">${this.totalDataNum}</span></p>
                <div class="pagenation d_flex flex__c_c">
                    <button type="button" class="main_btn prev">Prev</button>
                    <p class="page_no d_flex flex__c_c"><span class="current_page" >${this.batchNumber}</span>/<span class="total_page" >${this.totalPageNum}</span></p>
                    <button type="button" class="main_btn next">Next</button>
                </div>
            </div>
    
        </div>
    
    </div>
    
    </div>
        `;
    }
}
