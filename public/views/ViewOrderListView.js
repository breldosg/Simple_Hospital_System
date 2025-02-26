import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewOrderListView {
    constructor() {
        window.search_order_list = this.search_order_list.bind(this);
        window.remove_order_request = this.remove_order_request.bind(this);
        window.receive_order_request = this.receive_order_request.bind(this);
        window.deny_order_request = this.deny_order_request.bind(this);
        this.medicineData = [];
        this.batchNumber = 1;
        this.total_page_num = 1;
        this.total_data_num = 0;
        this.show_count_num = 0;
        this.searchTerm = '';
        this.from_value = '';
        this.to_value = '';
        this.isLoading = false; // Prevent multiple fetch calls at the same time

    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.update_cont');

        const rawPath = window.location.pathname.toLowerCase();
        this.side_fetched = rawPath.split('/')[1];

        cont.innerHTML = this.ViewReturn();


        // Fetch the initial batch of medicine data
        await this.fetchAndRenderData();
        this.attachEventListeners();
    }

    attachEventListeners() {

        // add btn
        document.querySelector('#open_add_order_popup').addEventListener('click', () => {
            dashboardController.placeOrderPopUpView.PreRender();
        });


        // Open Close Filter Section buttons
        var open_close = document.querySelector('.order_view_list .heading_cont');
        open_close.addEventListener('click', () => {
            const filter_section = document.querySelector('.order_view_list .intake_batch_top');
            var open_close_btn = document.querySelector('.order_view_list #open_close_search');

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
        document.querySelector('.main_btn.next').addEventListener('click', async () => {

            if (!this.isLoading && this.batchNumber < this.total_page_num) {
                this.batchNumber += 1; await this.fetchAndRenderData();
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
        if (this.isLoading) return; // Prevent multiple fetches
        this.isLoading = true;

        this.loadingContent();

        const batchData = await this.fetchData(); // Fetch data
        this.batchData = batchData || [];
        this.render();

        this.isLoading = false;
    }

    render() {

        if (this.batchData.orderList && this.batchData.orderList.length > 0) {
            this.populateTable(this.batchData);
        } else {
            this.displayNoDataMessage();
        }

    }

    populateTable(rowRequestData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = ''; // Clear table before populating

        document.querySelector('.show_count').innerText = rowRequestData.showData;
        document.querySelector('.total_data').innerText = rowRequestData.total;
        document.querySelector('.total_page').innerText = rowRequestData.pages;
        document.querySelector('.current_page').innerText = rowRequestData.batch;
        this.total_page_num = rowRequestData.pages;

        // insert data in the table
        rowRequestData.orderList.forEach((rowRequest, index) => {
            try {
                var date = date_formatter(rowRequest.created_at)
            } catch (error) {
                var date = '';
            }


            const row = document.createElement('tr');
            row.classList.add('tr')
            row.classList.add('d_flex')
            row.classList.add('flex__c_a')
            row.setAttribute('title', rowRequest.name);

            // pharmacy btn
            var removeBtn = '<button id="remove_order_btn" class="main_btn error">Remove</button>';
            var receiveBtn = '<button id="receive_order_btn" class="main_btn">Receive</button>';


            // store btn
            var approveBtn = '<button id="approve_order_btn" class="main_btn ">Approve</button>';
            var updateBtn = '<button id="update_order_btn" class="main_btn full_btn">Update</button>';
            var denyBtn = '<button id="deny_order_btn" class="main_btn error" >Deny</button>';
            var deniedBtn = '<button id="denied_order_btn" class="main_btn denied full_btn no_click" >Denied</button>';
            var approvedBtn = `<button id="approved_order_btn" class="main_btn received full_btn no_click">${rowRequest.status}</button>`;

            var action_btn = '';
            var validQuantity = '';

            if (this.side_fetched == 'pharmacy') {
                action_btn = rowRequest.status === 'pending' ? removeBtn : (rowRequest.status === 'approved' ? receiveBtn : rowRequest.status);
                validQuantity = rowRequest.pharmacy_total_quantity;
            }
            else if (this.side_fetched == 'store') {
                validQuantity = rowRequest.store_total_quantity;

                if (rowRequest.status === 'pending') {
                    action_btn = approveBtn + denyBtn;
                }
                else if (rowRequest.status === 'approved') {
                    action_btn = updateBtn;
                }
                else {
                    action_btn = rowRequest.status === 'denied' ? deniedBtn : approvedBtn;
                }

                console.log(rowRequest.status);


            }



            row.innerHTML = `
                        <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                        <p class="name">${rowRequest.name}</p>
                        <p class="number">${rowRequest.quantity}</p>
                        <p class="number">${validQuantity}</p>
                        <p class="name">${rowRequest.staff_name}</p>
                        <p class="date">${date}</p>
                        <p class="status">${rowRequest.status}</p>
                        <div class="action ${this.side_fetched} d_flex flex__c_c">
                            ${action_btn}
                        </div>
                        `;

            var remove_order_btn = row.querySelector('#remove_order_btn');
            if (remove_order_btn) {
                remove_order_btn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'remove_order_request',
                        parameter: rowRequest.id,
                        title: 'Remove Order Request',
                        sub_heading: `Order For: ${rowRequest.name}`,
                        description: 'Are you sure you want to remove this order?',
                        ok_btn: 'Remove',
                        cancel_btn: 'Cancel'
                    });

                    this.row_to_remove = row;
                });
            }

            var receive_order_btn = row.querySelector('#receive_order_btn');
            if (receive_order_btn) {
                receive_order_btn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'receive_order_request',
                        parameter: rowRequest.id,
                        title: 'Receive Order Request',
                        sub_heading: `Order For: ${rowRequest.name}`,
                        description: `Are you sure you receive ${rowRequest.quantity} product?`,
                        ok_btn: 'Receive',
                        condition: 'success',
                        cancel_btn: 'Cancel'
                    });

                });
            }

            var deny_order_btn = row.querySelector('#deny_order_btn');
            if (deny_order_btn) {
                deny_order_btn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'deny_order_request',
                        parameter: rowRequest.id,
                        title: 'Deny Order Request',
                        sub_heading: `Order For: ${rowRequest.name}`,
                        description: 'Are you sure you want to deny this order?',
                        ok_btn: 'Deny',
                        cancel_btn: 'Cancel',
                    });

                    this.row_to_remove = row;
                });
            }

            var approve_btn = row.querySelector('#approve_order_btn');
            if (approve_btn) {
                approve_btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dashboardController.approvePharmacyOrderPopUpView.PreRender({
                        order_id: rowRequest.id,
                        order_name: rowRequest.name,
                        store_quantity: rowRequest.store_total_quantity,
                        pharmacy_quantity: rowRequest.pharmacy_total_quantity,
                        action: 'approve'
                    });
                });
            }

            var approvedBtn = row.querySelector('#update_order_btn');
            if (approvedBtn) {
                approvedBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dashboardController.approvePharmacyOrderPopUpView.PreRender({
                        order_id: rowRequest.id,
                        order_name: rowRequest.name,
                        store_quantity: rowRequest.store_total_quantity,
                        pharmacy_quantity: rowRequest.pharmacy_total_quantity,
                        quantity: rowRequest.quantity,
                        action: 'update'
                    });
                });
            }

            tableBody.appendChild(row);

        })


        // clear variables
        this.batchData = [];

    }

    async fetchData() {
        try {
            const response = await fetch('/api/pharmacy/search_order_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,
                    batch: this.batchNumber,
                    from: this.from_value,
                    to: this.to_value,
                    side_fetched: this.side_fetched
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


            return result.data;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    async remove_order_request(order_id) {
        dashboardController.loaderView.render();
        try {
            const response = await fetch('/api/pharmacy/remove_order_request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_id: order_id
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


            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }
            this.fetchAndRenderData();
            notify('top_left', result.message, 'success');
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
        finally {
            dashboardController.loaderView.remove();
        }
    }

    async deny_order_request(order_id) {

        dashboardController.loaderView.render();
        try {
            const response = await fetch('/api/pharmacy/deny_approve_pharmacy_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_id: order_id,
                    action: 'deny'
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


            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }
            this.fetchAndRenderData();
            notify('top_left', result.message, 'success');
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
        finally {
            dashboardController.loaderView.remove();
        }
    }

    async receive_order_request(order_id) {
        dashboardController.loaderView.render();
        try {
            const response = await fetch('/api/pharmacy/receive_order_request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_id: order_id
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


            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }
            this.fetchAndRenderData();
            notify('top_left', result.message, 'success');
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
        finally {
            dashboardController.loaderView.remove();
        }
    }

    async search_order_list(data) {
        var from_v = data.from;
        var to_v = data.to;
        if (from_v > to_v) {
            document.querySelector('#from_inp').setAttribute('error', true);
            document.querySelector('#to_inp').setAttribute('error', true);;

            notify('top_left', 'Start date cannot be greater than end date', 'error');
            return;
        }

        this.searchTerm = data.query;
        this.from_value = data.from;
        this.to_value = data.to;
        this.batchNumber = 1; // Reset to first batch on search
        await this.fetchAndRenderData();
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
        this.total_page_num = 1;
        document.querySelector('.start_page').style.display = 'flex';
        document.querySelector('.table_body .loader_cont').classList.remove('active');
    }

    loadingContent() {
        const tableBody = document.querySelector('.order_view_list .table_body');
        tableBody.innerHTML = `
    <div class="start_page deactivate">
        <p>No Order Found</p>
    </div>
    <div class="loader_cont active">
        <div class="loader"></div>
    </div>
    `;
    }

    ViewReturn() {
        return `
    <div class="order_view_list">

        <div class="intake_batch_top closed">

            <div class="heading_cont">
                <h4>Search Product</h4>

                <div class="open_close_filter closed" title="Open Filter" id="open_close_search">
                    <span class='switch_icon_keyboard_arrow_up'></span>
                </div>

            </div>
            <br-form callback="search_order_list" class="intake_batch_content_container">
                <div class="intake_batch_content">
                    <br-input label="Product Name" name="query" type="text"
                        value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter product name"
                        styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>

                    <br-input label="From Date" id="from_inp" name="from" type="date"
                        value="${this.searchTerm == null ? '' : this.searchTerm}" styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>


                    <br-input label="To Date" name="to" id="to_inp" type="date"
                        value="${this.searchTerm == null ? '' : this.searchTerm}" styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>


                    <div class="med_btn_cont">
                        <br-button loader_width="23" class="btn_next" type="submit">Search</br-button>
                    </div>

                </div>
            </br-form>

        </div>

        <div class="main_section medicine_table_out">

            <div class="in_table_top d_flex flex__u_s">
                <h4>Order List</h4>

                <div class="add_btn" title="Create Orders" id="open_add_order_popup">
                    <span class="switch_icon_add"></span>
                </div>
            </div>
            <div class="outpatient_table">

                <div class="table_head tr d_flex flex__c_a">
                    <p class="id">SN</p>
                    <p class="name">Name</p>
                    <p class="number">Quantity</p>
                    <p class="number">${this.side_fetched} Quantity</p>
                    <p class="name">Create By</p>
                    <p class="date">Created Date</p>
                    <p class="status">Status</p>
                    <div class="action"></div>
                </div>

                <div class="table_body d_flex flex__co">
                    <div class="start_page deactivate">
                        <p>No Order Found</p>
                    </div>
                    <div class="loader_cont active">
                        <div class="loader"></div>
                    </div>
                </div>

                <div class="table_footer d_flex flex__e_b">
                    <p>Show <span class='show_count'>${this.show_count_num}</span> data of <span
                            class="total_data">${this.total_data_num}</span></p>
                    <div class="pagenation d_flex flex__c_c">
                        <button type="button" class="main_btn prev">Prev</button>
                        <p class="page_no d_flex flex__c_c"><span class="current_page">${this.batchNumber}</span>/<span
                                class="total_page">${this.total_page_num}</span></p>
                        <button type="button" class="main_btn next">Next</button>
                    </div>
                </div>

            </div>

        </div>

    </div>
    `;
    }

}