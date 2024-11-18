import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class SingleIntakeBatchView {
    constructor() {
        this.batch_id = null;
        this.batch_name = null;
        this.query = '';
        this.batchNumber = 1;
        this.total_page_num = 1;
        this.total_data_num = 0;
        this.show_count_num = 0;
        this.isLoading = false;

        // define function to global
        window.remove_product_on_batch = this.remove_product_on_batch.bind(this);
        window.close_batch = this.close_batch.bind(this);

    }
    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('active');

        this.batch_id = params.id;
        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
        const top_cont = document.querySelector('.single_batch_cont .top_card');
        const batch_data = await this.fetchData(); // Wait for fetchData to complete

        this.batch_name = batch_data.batch_data.name;

        top_cont.innerHTML = this.top_card_view(batch_data.batch_data);
        await this.fetch_table_data();

        this.attach_listeners();
    }

    async fetch_table_data() {
        if (this.isLoading) return;  // Prevent multiple fetches
        this.isLoading = true;
        this.loading_and_nodata_view();

        // fetch table data
        const productData = await this.table_data_fetch(); // Fetch data
        this.productData = productData || [];

        if (this.productData.productList && this.productData.productList.length > 0) {
            this.populateTable(this.productData);
        } else {
            this.displayNoDataMessage();
        }
    }


    populateTable(productData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = '';  // Clear table before populating



        document.querySelector('.show_count').innerText = productData.showData;
        document.querySelector('.total_data').innerText = productData.total;
        document.querySelector('.total_page').innerText = productData.pages;
        document.querySelector('.current_page').innerText = productData.batch;
        this.total_page_num = productData.pages;

        productData.productList.forEach((product, index) => {
            try {
                var expireDate = date_formatter(product.expire_date)
            } catch (error) {
                var expireDate = '';
            }


            const row = document.createElement('div');
            row.classList.add('tr');
            row.classList.add('d_flex');
            row.classList.add('flex__c_a');
            row.setAttribute('title', product.name);

            row.innerHTML = `
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${product.name}</p>
                    <p class="type">${product.type}</p>
                    <p class="quantity">${product.quantity}</p>
                    <p class="name">${product.created_by}</p>
                    <p class="date">${expireDate}</p>
                    <div class="action d_flex flex__c_c">
                        <button id="remove_btn" class="main_btn error">Remove</button>
                    </div>
            `;

            // select element my id
            const row_remove_btn = row.querySelector('#remove_btn');
            row_remove_btn.addEventListener('click', () => {
                dashboardController.confirmPopUpView.PreRender({
                    callback: 'remove_product_on_batch',
                    params: product.id,
                    data: product.name,
                    title: 'Product',
                    action: 'remove'
                });
            });

            tableBody.appendChild(row);


        });

        // clear variables
        this.productData = [];
    }

    ViewReturn() {
        return `
<div class="single_batch_cont">

    <div class="top_card">

        <div class="juu">
            <p class="name">Medium Load</p>

        </div>
        <div class="pack_cont">

            <div class="pack">
                <span class="switch_icon_calendar_check"></span>
                <p class="date">**************</p>
            </div>

            <div class="pack">
                <span class='switch_icon_cart_shopping'></span>
                <p class="date">**************</p>
            </div>

            <div class="pack">
                <span class='switch_icon_user_pen'></span>
                <p class="date">**************</p>
            </div>

            <div class="btn">
                <br-button loader_width="23" class="btn_batch_close" type="submit">Close Batch</br-button>
                <!-- <br-button loader_width="23" class="btn_batch_close inactive" type="submit">Batch Closed</br-button> -->
            </div>
        </div>
<div class="loader_cont active"><div class="loader"></div></div>
    </div>

    <div class="main_section batch_table_out">

        <div class="in_table_top d_flex">
            <h4>Product List</h4>

            <div class="add_btn" title="Add Product" id="open_add_product_popup">
                <span class='switch_icon_add'></span>
            </div>
        </div>
        <div class="outpatient_table">

            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="type">Type</p>
                <p class="quantity">Quantity</p>
                <p class="name">Received By</p>
                <p class="date">Expire Date</p>
                <div class="action"></div>
            </div>

            <div class="table_body d_flex flex__co">

                <div class="start_page">
                    <p>No Product Found</p>
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
                    <p class="page_no d_flex flex__c_c"><span class="current_page" >${this.batchNumber}</span>/<span
                            class="total_page">${this.total_page_num}</span></p>
                    <button type="button" class="main_btn next">Next</button>
                </div>
            </div>

        </div>

    </div>

</div>
`;
    }

    top_card_view(data) {
        try {
            var receive_date = date_formatter(data.receive_date);
        }
        catch (e) {
            var receive_date = '';
        }

        var close_btn = `<br-button loader_width="23" class="btn_batch_close" type="close">Close Batch</br-button>`;
        var closed_btn = '<br-button loader_width="23" class="btn_batch_close inactive" >Batch Closed</br-button>';

        return `
        <div class="juu">
            <p class="name">${data.name}</p>

        </div>
        <div class="pack_cont">

            <div class="pack">
                <span class="switch_icon_calendar_check"></span>
                <p class="date">${receive_date}</p>
            </div>

            <div class="pack">
                <span class='switch_icon_cart_shopping'></span>
                <p class="date">${data.provider}</p>
            </div>

            <div class="pack">
                <span class='switch_icon_user_pen'></span>
                <p class="date">${data.created_by}</p>
            </div>

            <div class="btn">
                ${data.status == 'open' ? close_btn : closed_btn}
            </div>
        </div>
        `;
    }

    attach_listeners() {

        const open_add_product_popup = document.querySelector('#open_add_product_popup');

        open_add_product_popup.addEventListener('click', async () => {
            dashboardController.receiveIntakeBatchPopUpView.PreRender(
                {
                    id: this.batch_id
                }
            );
        })

        const close_batch_btn = document.querySelector('.btn_batch_close[type="close"]');
        close_batch_btn.addEventListener('click', () => {
            dashboardController.confirmPopUpView.PreRender({
                callback: 'close_batch',
                params: this.batch_id,
                data: this.batch_name,
                title: 'Batch',
                action: 'close'
            });
        });

        // Pagination buttons
        document.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                await this.fetch_table_data();
            }
        });

        document.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber > 1) {
                this.batchNumber -= 1;
                await this.fetch_table_data();
            }
        });

    }


    displayNoDataMessage() {
        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');
        const current_page = document.querySelector('.current_page');
        show_count.innerText = 0;
        total_data.innerText = 0;
        total_page.innerText = 1;
        current_page.innerText = 1;
        document.querySelector('.start_page').style.display = 'flex';
        document.querySelector('.table_body .loader_cont').classList.remove('active');
    }

    loading_and_nodata_view() {
        document.querySelector('.single_batch_cont .table_body').innerHTML = `
        <div class="start_page deactivate">
            <p>No Product Found</p>
        </div>
        <div class="loader_cont active"><div class="loader"></div></div>
                    `;
    }

    async fetchData() {
        try {
            const response = await fetch('/api/pharmacy/single_batch_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: this.batch_id,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

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


    async table_data_fetch() {
        try {
            const response = await fetch('/api/pharmacy/single_batch_product_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    batch_id: this.batch_id,
                    query: this.query,
                    batch: this.batchNumber,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

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
        finally {
            this.isLoading = false;
        }
    }


    remove_product_on_batch(data) {
        console.log(data);
        console.log('ffsfs');


        // try {
        //     const response = await fetch('/api/pharmacy/single_batch_product_list', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             batch_id: this.batch_id,
        //             query: this.query,
        //             batch: this.batchNumber,
        //         })
        //     });

        //     if (!response.ok) {
        //         throw new Error('Server Error');
        //     }

        //     const result = await response.json();

        //     if (result.success) {
        //         return result.data;
        //     } else {
        //         notify('top_left', result.message, 'warning');
        //         return null;
        //     }
        // } catch (error) {
        //     notify('top_left', error.message, 'error');
        //     return null;
        // }
        // finally {
        //     this.isLoading = false;
        // }
    }


    close_batch(data) {
        console.log(data);
        console.log('ffsfs');


        // try {
        //     const response = await fetch('/api/pharmacy/single_batch_product_list', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             batch_id: this.batch_id,
        //             query: this.query,
        //             batch: this.batchNumber,
        //         })
        //     });

        //     if (!response.ok) {
        //         throw new Error('Server Error');
        //     }

        //     const result = await response.json();

        //     if (result.success) {
        //         return result.data;
        //     } else {
        //         notify('top_left', result.message, 'warning');
        //         return null;
        //     }
        // } catch (error) {
        //     notify('top_left', error.message, 'error');
        //     return null;
        // }
        // finally {
        //     this.isLoading = false;
        // }
    }



}