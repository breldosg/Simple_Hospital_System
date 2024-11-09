
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class ReceiveIntakeBatchPopUpView {
    constructor() {
        window.Search_medicine_and_consumable = this.Search_medicine_and_consumable.bind(this);
        window.add_to_pending = this.add_to_pending.bind(this);
        this.batch_id = null;
        this.batchNumber = 1; // Keep track of current batch
        this.selected_product = '';
        this.number_pending_data = 0;

    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.batch_id = params.b_id;


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

            <br-form callback="add_to_pending">
                <div class="search_cont">
                    <br-input name="product" label="Product Name" id="product_name_view" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 13px;" disable="true"></br-input>


                    <br-input required name="expire_date" label="Expire date" type="date" styles="
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
            const cont = document.querySelector('.popup');
            cont.classList.remove('active');
            cont.innerHTML = '';


        });


        const back_btn = document.querySelector('#back_btn');

        back_btn.addEventListener('click', () => {
            document.getElementById('search_slide').scrollIntoView({ behavior: 'smooth' });
        });


        const submit_btn = document.querySelector('.pending_data_view br-button[type="submit"]');

        submit_btn.addEventListener('click', async () => {

            //get all row in table_body_for_pending_data
            const rows = document.querySelectorAll('#table_body_for_pending_data .tr');

            if (rows.length === 0) {
                notify('top_left', 'No product added', 'error');
                return;
            }

            let data_found = [];

            rows.forEach((row) => {
                const row_data_src_raw = row.getAttribute('data_src');
                const row_data_src = row_data_src_raw.split(',');
                const m_id = row_data_src[0];
                const quantity = row_data_src[1];
                const expire_date = row_data_src[2];

                data_found.push({
                    id: m_id,
                    quantity: quantity,
                    expire_date: expire_date
                })

            })

            //call function to receive the product
            await this.receive_product(data_found);
        })

    }

    async receive_product(data_found) {
        console.log(data_found);
    }


    async fetch_data(searchTerm) {
        try {
            const response = await fetch('/api/pharmacy/medicine_list', {
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
        const data = await this.fetch_data(query.query);

        const tableBody = document.querySelector('.result_cont');
        if (!tableBody) {
            return;
        }
        // check if the batch number is 1
        if (this.batchNumber === 1) {
            tableBody.innerHTML = '';
        }

        if (data.medicineList.length > 0) {
            data.medicineList.forEach((medicine) => {
                const row = document.createElement('div');
                row.classList.add('row');
                row.setAttribute('data_src', medicine.id);
                row.setAttribute('title', medicine.name);
                row.innerHTML = `
                    <div class="name">${medicine.name}</div>
                    <div class="type">Medicine</div>
`;
                // Attach click event listener to the row
                row.addEventListener('click', () => {
                    this.open_fill_form(medicine.id, medicine.name, 'medicine')
                });
                tableBody.appendChild(row);
            });
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
        product_name_view.setAttribute('value', name);
        product_name_view.setAttribute('shadow_value', id);
    }

    add_to_pending(data) {

        const container = document.getElementById('table_body_for_pending_data');

        // clean the container if is the first row
        if (this.number_pending_data === 0) {
            container.innerHTML = '';
            console.log('imepita');

        }

        const row = document.createElement('div');
        row.classList.add('tr');
        row.classList.add('d_flex');
        row.classList.add('flex__c_a');
        row.setAttribute('data_src', [this.selected_product.id, data.quantity, data.expire_date]);
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
        document.getElementById('search_slide').scrollIntoView({ behavior: 'smooth' });

    }

    remove_from_pending(row) {
        row.remove();
        this.number_pending_data--;

        if (this.number_pending_data <= 0) {
            document.getElementById('table_body_for_pending_data').innerHTML = this.no_data_view();
        }
    }

}