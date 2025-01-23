import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, getCurrentDate, decodeHTML, notify } from "../script/index.js";

export class VisitsPrescriptionPopUpView {
    constructor() {
        window.Prescription_comp_Search_medicine_and_consumable = this.Prescription_comp_Search_medicine_and_consumable.bind(this);
        window.add_to_prescription_pending = this.add_to_prescription_pending.bind(this);
        this.visit_id = null;
        this.batchNumber = 1;
        this.selected_medicine = '';
        this.number_pending_data = 0;
        this.load_more_btn = null;
    }

    async PreRender(params) {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.visit_id = params.id;

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn(params, 'active');

        this.attachListeners();
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
                        <br-input label="Medicine Name" name="query" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>
                    </div>
                </br-form>
            </div>

            <div class="result_cont">
                <div class="start_view">
                    <p class="start_view_overlay">Search Medicine</p>
                </div>
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
                    <br-input name="medicine" label="Medicine Name" id="medicine_name_view" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;" disable="true"></br-input>

                    <br-input required name="instruction" label="Instruction" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

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
            <div class="table_body" id="table_body_for_pending_data">
                
            </div>
            <div class="btn_cont">
                <br-button loader_width="23" class="btn_next" type="cancel">Cancel</br-button>
                <br-button loader_width="23" class="btn_next" type="submit">Save Prescription</br-button>
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
            this.close_pop_up();
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

        const rows = document.querySelectorAll('#table_body_for_pending_data .tr');

        if (rows.length === 0) {
            notify('top_left', 'No Medicines Added', 'warning');
            btn.removeAttribute('loading');
            return;
        }

        let prescription_list = [];
        rows.forEach((row) => {
            const row_data_src_raw = row.getAttribute('data_src');
            prescription_list.push(JSON.parse(row_data_src_raw));
        });

        try {
            const response = await fetch('/api/visits/save_prescription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    prescriptions: prescription_list,
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
            notify('top_left', 'Prescription Saved Successfully.', 'success');
            this.close_pop_up();
            dashboardController.visitsView.fetch_table_data();

        } catch (error) {
            console.error('Error:', error);
            notify('top_left', 'Failed To Save Prescription.', 'error');
        } finally {
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

    async Prescription_comp_Search_medicine_and_consumable(query) {
        if (this.load_more_btn == null) this.batchNumber = 1;
        const data = await this.fetch_data(query.query);

        const tableBody = document.querySelector('.result_cont');
        if (!tableBody) {
            this.PreRender({
                id: this.visit_id
            });
            return;
        }

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
        document.getElementById('input_slide').scrollIntoView({ behavior: 'smooth' });
        const medicine_name_view = document.querySelector('#medicine_name_view');
        this.selected_medicine = {
            name: name,
            id: id,
            type: type
        };
        medicine_name_view.setValue(name);
        medicine_name_view.setAttribute('shadow_value', id);
    }

    add_to_prescription_pending(data) {
        const container = document.getElementById('table_body_for_pending_data');

        if (this.number_pending_data === 0) {
            container.innerHTML = '';
        }

        const rows = document.querySelectorAll('#table_body_for_pending_data .tr');

        if (rows.length >= 1) {
            for (let row of rows) {
                const parsed_data = JSON.parse(row.getAttribute('data_src'));
                if (parsed_data.id == this.selected_medicine.id) {
                    notify('top_left', 'Medicine already added', 'warning');
                    return;
                }
            }
        }

        const row = document.createElement('div');
        row.classList.add('tr');
        row.classList.add('d_flex');
        row.classList.add('flex__c_a');
        row.setAttribute('data_src', JSON.stringify({
            id: this.selected_medicine.id,
            instruction: data.instruction,
            amount: data.amount,
            duration: data.duration
        }));
        row.setAttribute('title', this.selected_medicine.name);

        row.innerHTML = `
            <p class="name">${this.selected_medicine.name}</p>
            <p class="dosage">${data.instruction}</p>
            <p class="frequency">${data.amount}</p>
            <p class="duration">${data.duration} days</p>
            <div class="action d_flex flex__c_c">
                <button class="btn_remove">Remove</button>
            </div>
        `;

        const remove_btn = row.querySelector('.btn_remove');
        remove_btn.addEventListener('click', () => {
            this.remove_from_pending(row);
        });

        container.insertBefore(row, container.firstChild);
        this.number_pending_data++;
        this.back_to_search_view();
    }

    back_to_search_view() {
        document.getElementById('search_slide').scrollIntoView({ behavior: 'smooth' });
        document.querySelector('#more_detail_form').reset();
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





