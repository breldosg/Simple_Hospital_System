
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, getCurrentDate, decodeHTML, notify } from "../script/index.js";

export class ReceiveIntakeBatchPopUpView {
    constructor() {
        window.Search_medicine_and_consumable = this.Search_medicine_and_consumable.bind(this);
        window.add_to_pending = this.add_to_pending.bind(this);
        this.batch_id = null;
        this.batchNumber = 1; // Keep track of current batch
        this.selected_product = '';
        this.number_pending_data = 0;
        this.load_more_btn = null;

    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.batch_id = params.id;


        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn(params, 'active');

        this.attachListeners()
    }


    ViewReturn() {
        return `
<div class="container receive_intake_batch_popup">

    <div class="left">

        <div class="slider" id="search_slide">
            <p class="heading">Select Product</p>
            <div class="search_cont_cont">

                <br-form callback="Search_medicine_and_consumable">
                    <div class="search_cont">
                        <br-input label="Product Name" name="query" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 13px;"></br-input>

                    </div>
                </br-form>


            </div>

            <div class="result_cont">
                <div class="start_view">
                    <p class="start_view_overlay">Search Now</p>
                </div>
            </div>


        </div>

        <div class="slider" id="input_slide">

            <div class="heading_cont">
                <p class="heading">Add Product Detail</p>

                <div class="btn_back" id="back_btn">
                    <span class='switch_icon_keyboard_arrow_right'></span>
                </div>

            </div>

            <br-form id="more_detail_form" callback="add_to_pending">
                <div class="search_cont">
                    <br-input name="product" label="Product Name" id="product_name_view" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 13px;" disable="true"></br-input>


                    <br-input required name="expire_date" min="${getCurrentDate()}" label="Expire date" type="date" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 13px;"></br-input>


                    <br-input required name="quantity" label="Quantity" type="number" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 13px;"></br-input>

                    <div class="btn">
                        <br-button loader_width="23" class="btn_next" type="submit">Add</br-button>
                    </div>

                </div>
            </br-form>


        </div>

    </div>
    <div class="line"></div>
    <div class="right">
        <div class="heading_cont">
            <p class="heading">Received Product Detail</p>



        </div>
        <div class="pending_data_view">
            <div class="table_head tr d_flex flex__c_a">
                <p class="name">Name</p>
                <p class="category">Category</p>
                <p class="quantity">Quantity</p>
                <p class="date">Expire Date</p>
                <div class="action"></div>
            </div>
            <div class="table_body" id="table_body_for_pending_data" >
                <div class="start_page">
                    <p>No Product Added</p>
                </div>

            </div>
            <div class="btn_cont">
                <br-button loader_width="23" class="btn_next" type="cancel">Cancel</br-button>
                <br-button loader_width="23" class="btn_next" type="submit">Receive</br-button>
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


        const back_btn = document.querySelector('#back_btn');

        back_btn.addEventListener('click', () => {
            this.back_to_search_view();
        });


        const submit_btn = document.querySelector('.pending_data_view br-button[type="submit"]');

        submit_btn.addEventListener('click', async () => {
            await this.receive_product(submit_btn);
        })

    }

    async receive_product(btn) {

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
            const response = await fetch('/api/pharmacy/receive_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    batch_id: this.batch_id,
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
            dashboardController.singleIntakeBatchView.fetch_table_data();

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
        }
    }

    async Search_medicine_and_consumable(query) {
        if (this.load_more_btn == null) this.batchNumber = 1;
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
                    this.open_fill_form(medicine.id, decodeHTML(medicine.name), medicine.type)
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
                    this.Search_medicine_and_consumable(query);
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

    open_fill_form(id, name, category) {
        document.getElementById('input_slide').scrollIntoView({ behavior: 'smooth' });
        const product_name_view = document.querySelector('#product_name_view');
        this.selected_product = {
            name: name,
            id: id,
            category: category
        };
        console.log(name);

        product_name_view.setValue(name);
        product_name_view.setAttribute('shadow_value', id);
    }

    add_to_pending(data) {

        const container = document.getElementById('table_body_for_pending_data');

        // clean the container if is the first row
        if (this.number_pending_data === 0) {
            container.innerHTML = '';
        }

        console.log('p_data: ', this.number_pending_data);


        // check if the data is available to the pending data
        const rows = document.querySelectorAll('#table_body_for_pending_data .tr');

        if (rows.length >= 1) {

            for (let row of rows) {
                var parsed_data = JSON.parse(row.getAttribute('data_src'));

                console.log(parsed_data);


                const { id, quantity, date } = parsed_data;

                console.log(id, this.selected_product.id);

                if (id == this.selected_product.id && quantity == data.quantity && date == data.expire_date) {

                    notify('top_left', 'Product already added', 'warning');
                    return;
                }
            }

        }


        const row = document.createElement('div');
        row.classList.add('tr');
        row.classList.add('d_flex');
        row.classList.add('flex__c_a');
        row.setAttribute('data_src', JSON.stringify({ id: this.selected_product.id, quantity: data.quantity, date: data.expire_date }));
        row.setAttribute('title', this.selected_product.name);

        try {
            var date = date_formatter(data.expire_date);
        } catch (error) {
            var date = '';
        }

        row.innerHTML = `
            <p class="name">${this.selected_product.name}</p>
            <p class="category">${this.selected_product.category}</p>
            <p class="quantity">${data.quantity}</p>
            <p class="date">${date}</p>
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

        this.back_to_search_view();
    }

    back_to_search_view() {
        document.getElementById('search_slide').scrollIntoView({ behavior: 'smooth' });

        var more_detail_form = document.querySelector('#more_detail_form');
        more_detail_form.reset();
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