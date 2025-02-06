import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, getCurrentDate, decodeHTML, notify } from "../script/index.js";

export class VisitsPrescriptionPopUpView {
    constructor() {
        window.Prescription_comp_Search_medicine_and_consumable = this.Prescription_comp_Search_medicine_and_consumable.bind(this);
        window.add_to_prescription_pending = this.add_to_prescription_pending.bind(this);
        this.visit_id = null;
        this.batchNumber = 1;
        this.selected_product = '';
        this.pending_data = new Set();
        this.load_more_btn = null;
    }

    async PreRender(params) {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        console.log(params);

        this.visit_id = params.visit_id;

        // Clear all constructor variables
        this.selected_product = '';
        this.pending_data.clear;
        this.load_more_btn = null;
        this.batchNumber = 1;

        // Render the initial structure with the loader
        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn(params, 'active');


        this.main_container = document.querySelector('.prescription_popup');

        this.attachListeners();
        this.Prescription_comp_Search_medicine_and_consumable('');
    }

    ViewReturn() {
        return `
<div class="container prescription_popup">
    <div class="left">
        <div class="slider" id="search_slide">
            <p class="heading">Select Medicine</p>
            <div class="search_cont_cont">
                <br-form callback="Prescription_comp_Search_medicine_and_consumable">
                    <div class="search_cont">
                        <br-input label="Medicine/Consumable Name" name="query" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 350px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

                    <br-button loader_width="23" class="btn_search" type="submit">
                        <span class='switch_icon_magnifying_glass'></span>
                    </br-button>

                    </div>
                </br-form>
                
            </div>

            <div class="result_cont scroll_bar">
                ${this.loader_view()}
            </div>
        </div>

        <div class="slider" id="input_slide">
            <div class="heading_cont">
                <p class="heading">Add Prescription Detail</p>
                <div class="btn_back" id="back_btn">
                    <span class='switch_icon_keyboard_arrow_right'></span>
                </div>
            </div>

            <br-form id="more_detail_form" callback="add_to_prescription_pending">
                <div class="search_cont">
                    <br-input name="product" label="Medicine/Consumable Name" id="medicine_name_view" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;" disable="true"></br-input>

                    <br-input required name="amount" label="Amount" type="number" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

                    <br-input required name="duration" label="Duration (days)" type="number" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

                    <br-input required name="instruction" label="Instruction" type="textarea" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 61px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

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
            <p class="heading">Prescription Details</p>
        </div>
        <div class="pending_data_view">
            <div class="pending_data_body scroll_bar" id="table_body_for_pending_data">
                <div class="start_page">
                    <p>No Medicines/Consumable Added</p>
                </div>
            </div>
            <div class="btn_cont">
                <br-button loader_width="23" class="btn_next" type="cancel">Cancel</br-button>
                <br-button loader_width="23" class="btn_next submit_btn disabled" type="submit">Save Prescription</br-button>
            </div>
        </div>
    </div>
</div>
`;
    }

    no_data_view() {
        return `
        <div class="start_page">
            <p>No Medicines Added</p>
        </div>`;
    }

    attachListeners() {
        const cancel_btn = document.querySelector('.pending_data_view br-button[type="cancel"]');
        cancel_btn.addEventListener('click', () => {
            this.close();
        });

        const back_btn = document.querySelector('#back_btn');
        back_btn.addEventListener('click', () => {
            this.back_to_search_view();
        });

        const submit_btn = document.querySelector('.pending_data_view br-button[type="submit"]');
        submit_btn.addEventListener('click', async () => {
            await this.save_prescription(submit_btn);
        });
    }

    async save_prescription(btn) {
        btn.setAttribute('loading', true);

        if (this.pending_data.size <= 0) {
            notify('top_left', 'No Medicines Added.', 'warning');
            btn.removeAttribute('loading');
            return;
        }

        console.log(this.visit_id);

        var body_form = {
            visit_id: this.visit_id,
            prescriptions: Array.from(this.pending_data),
        };
        console.log(body_form);


        try {
            const response = await fetch('/api/patient/save_prescription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body_form)
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }
            notify('top_left', 'Prescription Saved Successfully.', 'success');
            this.close();
            dashboardController.visitsView.fetch_table_data();

        } catch (error) {
            console.error('Error:', error);
            notify('top_left', 'Failed To Save Prescription.', 'error');
        } finally {
            btn.removeAttribute('loading');
        }
    }

    async fetch_data(searchTerm) {
        // btn_search
        // const 

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

    loader_view() {
        return `
                <div class="loader_cont active">
                    <div class="loader"></div>
                </div>
        `;
    }

    async Prescription_comp_Search_medicine_and_consumable(query) {
        if (this.load_more_btn == null) this.batchNumber = 1;

        const tableBody = document.querySelector('.result_cont');
        if (this.batchNumber == 1) {
            tableBody.innerHTML = this.loader_view();
        }

        const data = await this.fetch_data(query.query);

        if (this.batchNumber === 1) {
            tableBody.innerHTML = '';
        }

        if (data.medicineList && data.medicineList.length > 0) {
            if (this.load_more_btn) { this.load_more_btn.remove(); }
            this.load_more_btn = null;

            data.medicineList.forEach((medicine) => {
                const row = document.createElement('div');
                row.classList.add('row');
                row.setAttribute('data_src', medicine.id);
                row.setAttribute('title', decodeHTML(medicine.name));
                row.innerHTML = `
                    <p class="name">${medicine.name}</p>
                    <p class="type">${medicine.type}</p>
                `;
                row.addEventListener('click', () => {
                    this.open_fill_form(medicine.id, decodeHTML(medicine.name), medicine.type);
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
                    this.Prescription_comp_Search_medicine_and_consumable(query);
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

    open_fill_form(id, name, type) {
        const check_if_exist = [...this.pending_data].some(data => data.product == id);

        if (check_if_exist) {
            notify('top_left', 'Medicine already exists in the prescription.', 'warning');
            return;
        }

        document.getElementById('input_slide').scrollIntoView({ behavior: 'smooth' });
        const medicine_name_view = document.querySelector('#medicine_name_view');
        this.selected_product = {
            name: name,
            id: id,
            type: type
        };
        medicine_name_view.setValue(name);
        medicine_name_view.setAttribute('shadow_value', id);
    }

    add_to_prescription_pending(data) {
        data = {
            product_name: this.selected_product.name,
            ...data
        };

        this.selected_product = '';

        this.pending_data.add(data);

        this.render_cards();
        this.back_to_search_view();
    }

    render_cards() {
        const container = this.main_container.querySelector('#table_body_for_pending_data');
        container.innerHTML = '';
        const submit_btn = this.main_container.querySelector('.submit_btn[type="submit"]');

        if (this.pending_data.size <= 0) {
            container.innerHTML = this.no_data_view();
            submit_btn.classList.add('disabled');
            return;
        }
        submit_btn.classList.remove('disabled');

        this.pending_data.forEach((data) => {

            const card = document.createElement('div');
            card.classList.add('procedure_card');
            card.innerHTML = `
            <div class="top">
                <div class="card_left">
                    <p class="date">${data.product_name}</p>
                    <!-- <p class="created_by">Jan 24, 2025</p> -->
                </div>
                <div class="card_right">
                    <div class="delete_btn btn">
                        <span class="switch_icon_delete"></span>
                    </div>
                </div>
            </div>

            <div class="data">
                <p class="head">Amount:</p>
                <p class="description">${data.amount}</p>
            </div>

            <div class="data">
                <p class="head">Duration:</p>
                <p class="description">${data.duration} days</p>
            </div>

                
            <div class="data note">
                <p class="head">Instruction</p>
                <p class="description scroll_bar">${data.instruction}</p>
            </div>
                    `;
            card.setAttribute('title', data.product_name);


            const remove_btn = card.querySelector('.delete_btn');
            remove_btn.addEventListener('click', () => {
                this.remove_from_pending(data);
            });


            container.prepend(card);

        });
    }

    remove_from_pending(data) {
        this.pending_data.delete(data);
        this.render_cards();
    }

    back_to_search_view() {
        document.getElementById('search_slide').scrollIntoView({ behavior: 'smooth' });
        document.querySelector('#more_detail_form').reset();
    }

    close() {
        this.pending_data.clear();
        this.selected_product = '';
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

}





