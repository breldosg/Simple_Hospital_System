import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class CreateProductPopUpView {
    constructor() {
        window.open_next_create_form = this.open_next_create_form.bind(this);
        window.create_product_send_req = this.create_product_send_req.bind(this);
        this.product_type = '';
        this.category_select_rows = '';
    }

    async PreRender() {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }
        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();

        this.attachListeners()

        // now all function fetch future data
        const category_raw = await this.fetchData(); // Wait for fetchData to complete

        const roles = (category_raw) => {
            var rolesElem = "";
            category_raw.forEach(data => {
                rolesElem += `
                        <br-option type="checkbox" value="${data.id}">${data.name}</br-option>
                    `;
            });
            return rolesElem;
        };

        this.category_select_rows = roles(category_raw);
    }

    ViewReturn() {
        return `
<div class="container create_product_popup">

    <div class="slides">
        <div class="slide">
            <div class="head_cont">
                <p class="heading">Create Pharmacy Product</p>

                <div class="close_btn" title="Close PopUp" id="close_create_product_popup">
                    <span class="switch_icon_close"></span>
                </div>

            </div>

            <div class="input_group" id="create_product_container">

                <div class="form_cont">
                    <br-form callback="open_next_create_form">
                        <br-select required name="type" fontSize="13px" label="Product Type"
                                                    placeholder="Select Product Type" styles="
                                            border-radius: var(--input_main_border_r);
                                            width: 100%;
                                            padding: 10px;
                                            height: 41px;
                                            background-color: transparent;
                                            border: 2px solid var(--input_border);
                                            " labelStyles="font-size: 14px !important;">

                            <br-option type="checkbox" value="consumable">Consumable</br-option>
                            <br-option type="checkbox" value="medicine">Medicine</br-option>

                        </br-select>

                        <div class="btn_cont next_btn_cont">
                            <br-button loader_width="23" class="btn_next" type="submit">Next</br-button>
                        </div>
                    </br-form> 
                </div>
            </div>

        </div>
    </div>


</div>
`;
    }

    create_consumable_form() {
        return `
<br-form callback="create_product_send_req">
    <div class="input_group">


        <br-input required name="name" label="Consumable Name" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 300px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>


        <br-input required name="price" label="Consumable Price" type="number" styles="
                    border-radius: var(--input_main_border_r);
                    width: 300px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

        <br-input required name="patient_to_use" label="Patient usage" value="1" type="number" styles="
                    border-radius: var(--input_main_border_r);
                    width: 300px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

    </div>
    <div class="btn_cont">
        <br-button loader_width="23" class="btn_next" type="submit">Create Consumable</br-button>
    </div>
</br-form>
`;
    }

    create_medicine_form() {
        return `
<br-form callback="create_product_send_req" class="slides">
    <div class="input_group">

        <br-input required name="name" label="Medicine Name" type="text" styles="
            border-radius: var(--input_main_border_r);
            width: 300px;
            padding: 10px;
            height: 41px;
            background-color: transparent;
            border: 2px solid var(--input_border);
            " labelStyles="font-size: 12px;"></br-input>


        <br-select search required name="category" fontSize="13px" label="Category name"
            placeholder="Select Category Name" styles="
            border-radius: var(--input_main_border_r);
            width: 300px;
            padding: 10px;
            height: 41px;
            background-color: transparent;
            border: 2px solid var(--input_border);
            " labelStyles="font-size: 12px;">

${this.category_select_rows}

        </br-select>

        <br-select required name="quantity_unit" fontSize="13px" label="Unit" placeholder="Select Quantity Unit" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;">

            <br-option type="checkbox" value="bottle">Bottle</br-option>
            <br-option type="checkbox" value="cards">Cards</br-option>
            <br-option type="checkbox" value="pills">Pills</br-option>

        </br-select>


        <br-input required name="price" label="Sale Price (Price/One Unit)" type="number" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>

        <br-input required name="min_quantity" label="Amount To Trigger Low Stock Alert" placeholder="Unit"
            type="number" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>
        
        <br-input required name="patient_to_use" label="Patient usage" value="1" type="number" styles="
                    border-radius: var(--input_main_border_r);
                    width: 300px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>
    </div>

    <div class="btn_cont">
        <br-button loader_width="23" class="btn_next" type="submit">Create Medicine</br-button>
    </div>
</br-form>
`;
    }

    open_next_create_form(data) {

        const cont = document.querySelector('#create_product_container');
        const btn_submit = cont.querySelector('.next_btn_cont br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);
        console.log(btn_submit);


        if (data.type == "medicine") {
            cont.innerHTML = this.create_medicine_form();
        }
        else if (data.type == "consumable") {
            cont.innerHTML = this.create_consumable_form();
        }

        this.product_type = data.type;
    }


    attachListeners() {
        const cancel_btn = document.querySelector('#close_create_product_popup');

        cancel_btn.addEventListener('click', () => {
            this.close_popup()
        });
    }

    async create_product_send_req(data_old) {
        const btn_submit = document.querySelector('.create_product_popup br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        var data = {
            ...data_old,
            type: this.product_type
        }


        try {
            const response = await fetch('/api/pharmacy/create_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('failed To create visit. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                // After successful creation, clear the popup and close it
                this.close_popup()

                await dashboardController.viewMedicineView.fetchAndRenderData();

            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
        finally {
            btn_submit.setAttribute('loading', false);
        }
    }

    async fetchData() {
        try {
            const response = await fetch('/api/pharmacy/get_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
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

    close_popup() {
        this.category_select_rows = '';
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

}