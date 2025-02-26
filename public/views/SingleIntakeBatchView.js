import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SingleIntakeBatchView {
    constructor() {
        this.batch_id = null;
        this.batch_date = null;
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
        await this.fetch_table_data();

        top_cont.innerHTML = this.top_card_view(batch_data.batch_data);

        // const open_add_product_btn=document.querySelector('#open_add_product_popup').remove();


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
                    parameter: product.id,
                    title: 'Remove Product',
                    sub_heading: `Product Name: ${product.name}?`,
                    description: 'Are sure you want to remove this product?',
                    ok_btn: 'Remove',
                    cancel_btn: 'Cancel'
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
            <p class="name">****************************</p>

        </div>
        <div class="pack_cont">

            <div class="pack">
                <p class="title">Provider</p>
                <p class="description">**************</p>
            </div>

            <div class="pack">
                <p class="title">Received By</p>
                <p class="description">**************</p>
            </div>

            <div class="pack">
                <p class="title">Product</p>
                <p class="description">**************</p>
            </div>
            
            <div class="pack">
                <p class="title">Invoice</p>
                <p class="description">**************</p>
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
        this.top_card_data = data;

        console.log(data.status);

        if (data.status == 'open') {
            const open_add_product_popup = document.querySelector('#open_add_product_popup');
            if (!open_add_product_popup) {
                const in_table_top = document.querySelector('.single_batch_cont .in_table_top');
                if (in_table_top) {
                    const add_btn = document.createElement('div');
                    add_btn.classList.add('add_btn');
                    add_btn.title = 'Add Product';
                    add_btn.setAttribute('id', 'open_add_product_popup');
                    add_btn.innerHTML = `<span class='switch_icon_add'></span>`;

                    add_btn.addEventListener('click', async () => {
                        dashboardController.receiveIntakeBatchPopUpView.PreRender(
                            {
                                id: data.id
                            }
                        );
                    })
                    in_table_top.appendChild(add_btn);
                }
            };
        }
        else {
            const close_add_product_popup = document.querySelector('#open_add_product_popup');
            console.log(close_add_product_popup);

            if (close_add_product_popup) {
                close_add_product_popup.remove();
            }
        }


        try {
            var receive_date = date_formatter(data.receive_date);
            this.batch_date = receive_date;
        }
        catch (e) {
            var receive_date = '';
        }

        var close_btn = `<br-button loader_width="23" class="btn_batch_close" type="close">Close Batch</br-button>`;
        var closed_btn = '<br-button loader_width="23" class="btn_batch_close inactive" >Batch Closed</br-button>';

        return `
        <div class="juu">
            <p class="name">${receive_date}</p>
            <p class="provider"><span class="title">Provider:</span> <span class="description">${data.provider}</span></p>
        </div>

        <div class="pack_cont">
            <div class="pack">
                <p class="title">Received By</p>
                <p class="description">${data.created_by}</p>
            </div>

            <div class="pack">
                <p class="title">Product</p>
                <p class="description">${data.products}</p>
            </div>
            <div class="pack">
                <p class="title">Invoice</p>
                <p class="description">${data.invoice}</p>
            </div>

            <div class="btn">
                ${data.status == 'open' ? close_btn : closed_btn}
            </div>
        </div>
        `;
    }

    attach_listeners() {

        const close_batch_btn = document.querySelector('.btn_batch_close[type="close"]');
        if (close_batch_btn) {
            close_batch_btn.addEventListener('click', () => {
                dashboardController.confirmPopUpView.PreRender({
                    callback: 'close_batch',
                    parameter: { id: this.batch_id, where: 'single_batch_view' },
                    title: 'Close Batch',
                    sub_heading: `Batch Date: ${this.batch_date}`,
                    description: 'Are sure you want to close this Batch?',
                    ok_btn: 'Close',
                    cancel_btn: 'Cancel'

                });
            });
        }

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
        finally {
            this.isLoading = false;
        }
    }


    async remove_product_on_batch(data) {
        dashboardController.loaderView.render();
        try {
            const response = await fetch('/api/pharmacy/remove_product_to_batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    batch_id: this.batch_id,
                    id: data
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
                notify('top_left', result.message, 'success');
                this.query = '';
                await this.fetch_table_data();
            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
        finally {
            dashboardController.loaderView.remove();
        }
    }


    async close_batch(data) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/pharmacy/close_batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    batch_id: data.id,
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
                if (data.where == 'single_batch_view') {
                    this.top_card_data.status = 'close'
                    const top_cont = document.querySelector('.single_batch_cont .top_card');
                    top_cont.innerHTML = this.top_card_view(this.top_card_data);
                }
                else if (data.where == 'view_all_batch') {
                    dashboardController.viewIntakeBatchView.after_success_close_batch_action();
                }
                notify('top_left', result.message, 'success');
            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
        finally {
            dashboardController.loaderView.remove();
        }
    }



}