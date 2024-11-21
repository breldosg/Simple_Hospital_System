import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, getCurrentDate, decodeHTML, notify } from "../script/index.js";

export class PlaceOrderPopUpView {
    constructor() {
        window.Search_medicine_and_consumable_on_place_order_popup = this.Search_medicine_and_consumable_on_place_order_popup.bind(this);
        window.add_to_pending = this.add_to_pending.bind(this);
        this.batch_id = null;
        this.batchNumber = 1; // Keep track of current batch
        this.selected_product = '';
        this.number_pending_data = 0;
        this.load_more_btn = null;

    }

    async PreRender() {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.batch_id = 1;


        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn('active');

        this.attachListeners()
    }


    ViewReturn() {
        return `
<div class="container place_order_batch_popup">

    <div class="left">

        <div class="slider" id="search_slide">
            <p class="heading">Search Product</p>
            <div class="search_cont_cont">

                <br-form callback="Search_medicine_and_consumable_on_place_order_popup">
                    <div class="search_cont">
                        <br-input label="Product Name" name="query" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 350px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 13px;"></br-input>


                        <br-button loader_width="23" class="btn_search" type="submit">
                            <span class='switch_icon_magnifying_glass'></span>
                        </br-button>


                    </div>
                </br-form>


            </div>

            <div class="result_cont">
                <div class="start_view">
                    <p class="start_view_overlay">Search Now</p>
                </div>
            </div>


        </div>

    </div>
    <div class="line"></div>
    <div class="right">
        <div class="heading_cont">
            <p class="heading">Product Order List</p>



        </div>
        <div class="pending_data_view">
            <div class="table_head tr d_flex flex__c_a">
                <p class="name">Name</p>
                <p class="category">Category</p>
                <div class="action"></div>
            </div>
            <div class="table_body" id="table_body_for_pending_data">
                <div class="start_page">
                    <p>No Product Added</p>
                </div>

            </div>
            <div class="btn_cont">
                <br-button loader_width="23" class="btn_next" type="cancel">Cancel</br-button>
                <br-button loader_width="23" class="btn_next" type="submit">Place Your Order</br-button>
            </div>
        </div>




    </div>

</div>
`;
    }

    no_data_view() {
        return `
<div class="start_page">
    <p>No Product Added</p>
</div>`;
    }

    attachListeners() {
        const cancel_btn = document.querySelector('.pending_data_view br-button[type="cancel"]');

        cancel_btn.addEventListener('click', () => {
            this.close_pop_up();
        });

        const submit_btn = document.querySelector('.pending_data_view br-button[type="submit"]');

        submit_btn.addEventListener('click', async () => {
            await this.place_pharmacy_order(submit_btn);
        })

    }

    async place_pharmacy_order(btn) {

        btn.setAttribute('loading', true);

        //get all row in table_body_for_pending_data
        const rows = document.querySelectorAll('#table_body_for_pending_data .tr');

        if (rows.length === 0) {
            notify('top_left', 'No Product Added', 'warning');
            btn.removeAttribute('loading');
            return;
        }

        let product_list = [];

        rows.forEach((row) => {
            const row_data_src_raw = row.getAttribute('data_src');

            product_list.push(JSON.parse(row_data_src_raw));

        })

        try {
            const response = await fetch('/api/pharmacy/receive_order_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_list: product_list,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }
            notify('top_left', 'Product Received Successfully.', 'success');
            this.close_pop_up();
            dashboardController.viewOrderListView.fetchAndRenderData();

        } catch (error) {
            console.error('Error:', error);
            notify('top_left', 'Fail To Receive Products.', 'error');
            return null;
        }
        finally {
            btn.removeAttribute('loading');
        }
    }

    async fetch_data(searchTerm) {
        try {
            const response = await fetch('/api/pharmacy/product_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: searchTerm,
                    batch: this.batchNumber,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        } finally {
            this.search_btn.removeAttribute('loading');
        }
    }

    async Search_medicine_and_consumable_on_place_order_popup(query) {

        if (this.load_more_btn == null) {
            this.batchNumber = 1;
            this.search_btn = document.querySelector('.search_cont .btn_search[type=submit]')
            this.search_btn.setAttribute('loading', true)
        }
        const data = await this.fetch_data(query.query);

        const tableBody = document.querySelector('.result_cont');
        if (!tableBody) {
            this.PreRender({
                id: this.batch_id
            });
            return;
        }

        // check if the batch number is 1
        if (this.batchNumber === 1) {
            tableBody.innerHTML = '';
        }

        if (data.medicineList.length > 0) {
            if (this.load_more_btn) { this.load_more_btn.remove(); }
            this.load_more_btn = null;


            data.medicineList.forEach((medicine) => {
                const row = document.createElement('div');
                row.classList.add('row');
                row.setAttribute('data_src', medicine.id);
                row.setAttribute('title', decodeHTML(medicine.name));
                row.innerHTML = `
<div class="name">${medicine.name}</div>
<div class="type">${medicine.type}</div>
`;
                // Attach click event listener to the row
                row.addEventListener('click', () => {
                    this.add_to_pending({ id: medicine.id, name: decodeHTML(medicine.name), type: medicine.type })
                });
                tableBody.appendChild(row);
            });

            if (data.pages > this.batchNumber) {

                const btn_cont = document.createElement('div');
                btn_cont.classList.add('more_btn_cont');

                btn_cont.innerHTML = `
<br-button loader_width="22" class="more_btn" title="Load More">Load More</br-button>
`;
                const btn = btn_cont.querySelector('.more_btn');
                btn.addEventListener('click', () => {
                    this.batchNumber += 1;
                    btn.setAttribute('loading', 'true');
                    this.load_more_btn = btn_cont;
                    this.Search_medicine_and_consumable_on_place_order_popup(query);
                });


                tableBody.appendChild(btn_cont);
            }

        } else {
            tableBody.innerHTML = `
<div class="start_view">
    <p class="start_view_overlay">No Results Found</p>
</div>
`;
        }
    }


    add_to_pending(data) {

        const container = document.getElementById('table_body_for_pending_data');

        // clean the container if is the first row
        if (this.number_pending_data === 0) {
            container.innerHTML = '';
        }

        // check if the data is available to the pending data
        const rows = document.querySelectorAll('#table_body_for_pending_data .tr');

        if (rows.length >= 1) {

            for (let row of rows) {
                var data_src = row.getAttribute('data_src');

                if (data_src == data.id) {
                    notify('top_left', 'Product already added', 'warning');
                    return;
                }
            }

        }


        const row = document.createElement('div');
        row.classList.add('tr');
        row.classList.add('d_flex');
        row.classList.add('flex__c_a');
        row.setAttribute('data_src', data.id);
        row.setAttribute('title', this.selected_product.name);

        row.innerHTML = `
<p class="name">${data.name}</p>
<p class="category">${data.type}</p>
<div class="action d_flex flex__c_c">
    <button class="btn_remove">Remove</button>
</div>
`;

        // Attach click event listener to the remove button
        const remove_btn = row.querySelector('.btn_remove');
        remove_btn.addEventListener('click', () => {
            this.remove_from_pending(row);
        });

        // set it into the top of the table
        container.insertBefore(row, container.firstChild);

        this.number_pending_data++;
    }


    remove_from_pending(row) {
        row.remove();
        this.number_pending_data--;

        if (this.number_pending_data <= 0) {
            document.getElementById('table_body_for_pending_data').innerHTML = this.no_data_view();
        }
    }


    close_pop_up() {
        this.number_pending_data = 0;
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }
}