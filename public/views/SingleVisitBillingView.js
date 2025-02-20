import { dashboardController } from "../controller/DashboardController.js";
import { visit_add_card_btn } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, timeStamp_formatter, uploadWithProgress } from "../script/index.js";

export class SingleVisitBillingView {
    constructor() {
        this.visit_id = null;
        this.selectedBills = new Set();
        this.totalPrice = 0;
    }

    async PreRender(params) {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.visit_id = params.id;

        // Render initial structure
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('active');

        this.main_container = document.querySelector('.single_billing_visit_cont');

        // Render patient detail component
        dashboardController.patientDetailComponent.PreRender({
            container: this.main_container,
            visit_id: this.visit_id,
        })

        this.render();
    }

    async render() {
        const visit_data = await this.fetchData();

        if (!visit_data) return;
        this.render_bills_list(visit_data);
    }

    render_bills_list(bills_list) {
        const body = this.main_container.querySelector('#bills_list_body');
        const confirmBtn = this.main_container.querySelector('.confirm_order');
        const totalPriceElement = this.main_container.querySelector('.total_price_value');
        body.innerHTML = '';

        bills_list.forEach(bill => {
            const row = document.createElement('div');
            row.classList.add('table_row');
            row.dataset.billId = bill.id;
            row.dataset.price = bill.total_price;

            row.innerHTML = `
                <div class="table_cell check_box" id="check_box_all">
                    <span class='switch_icon_check_box_outline_blank'></span>
                </div>
                <div class="table_cell name">
                    <p>${bill.name}</p>
                </div>
                
                <div class="table_cell quantity">
                    <p>${bill.quantity}</p>
                </div>
                <div class="table_cell quantity">
                    <p>${bill.price}</p>
                </div>
                <div class="table_cell">
                    <p>${bill.total_price}</p>
                </div>
                <div class="table_cell">
                    <p>${bill.is_paid ? 'Paid' : 'Unpaid'}</p>
                </div>
                <div class="table_cell">
                    <p>${bill.restriction.status ? 'Active' : 'Inactive'}</p>
                </div>
            `;

            row.addEventListener('click', () => {
                const billId = row.dataset.billId;
                const price = parseFloat(row.dataset.price);
                const checkBox = row.querySelector('.check_box span');

                if (this.selectedBills.has(billId)) {
                    // Unselect
                    this.selectedBills.delete(billId);
                    row.classList.remove('selected');
                    this.totalPrice -= price;
                    checkBox.classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');
                } else {
                    // Select
                    this.selectedBills.add(billId);
                    row.classList.add('selected');
                    this.totalPrice += price;
                    checkBox.classList.replace('switch_icon_check_box_outline_blank', 'switch_icon_check_box');
                }

                // Update total price display with currency formatting
                totalPriceElement.textContent = this.totalPrice.toLocaleString('en-US', 
                    { style: 'currency', currency: 'TZS', minimumFractionDigits: 0, maximumFractionDigits: 0 });

                // Toggle confirm button state
                confirmBtn.classList.toggle('disabled', this.selectedBills.size === 0);
            });

            body.appendChild(row);
        });
    }

    ViewReturn(loader = 'active') {
        return `
<div class="single_billing_visit_cont">
    
    <div class="more_visit_detail">

        <div class="main_card">
            
            <div class="top">
                <h4 class="heading">Assigned Medicine</h4>
            </div>

            <div class="bottom">
                <div class="medicine_list">

                    <div class="medical_table">
                        <div class="table_head">
                            <div class="table_row">
                                <div class="table_cell check_box" id="check_box_all">
                                    <span class='switch_icon_check_box'></span>
                                </div>
                                <div class="table_cell name">
                                    <p>Name</p>
                                </div>
                                <div class="table_cell quantity">
                                    <p>Quantity</p>
                                </div>
                                <div class="table_cell ">
                                    <p>Unit Price</p>
                                </div>
                                <div class="table_cell">
                                    <p>Total Price</p>
                                </div>
                                <div class="table_cell">
                                    <p>Status</p>
                                </div>
                                <div class="table_cell">
                                    <p>Restriction</p>
                                </div>
                            </div>
                        </div>
                        <div class="table_body scroll_bar" id="bills_list_body">

                        


                        </div>
                    </div>

                </div>
                
                <div class="btn_cont">
                    <div class="total_price">
                        <p class="total_price_value">0</p>
                    </div>
                    <button class="btn confirm_order disabled">Confirm Order</button>
                </div>



            </div>


        </div>

        <div class="simple_details">

            <div class="top">
                <div class="section_selection active left_section_switcher" data_src="illness_section">
                    <p>Illness Info</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>
                <div class="section_selection left_section_switcher" data_src="medical_history_section">
                    <p>Medical History</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>
            </div>

            <div class="bottom">

                <div class="section illness_section scroll_bar" id="illness_section">

                </div>

                <div class="section medical_history_section scroll_bar" id="medical_history_section">

                    

                </div>


                


            </div>

        </div>



    </div>

</div>
`;
    }

    render_example() {
        const body = this.main_container.querySelector('.right_card');
        body.innerHTML = `
                <div class="example">
                    <p>No Order Selected</p>
                </div>
            `;

        this.render_orders(this.single_radiology_data);
        this.current_clicked = null;
        this.active_order_data = null;

    }

    async fetchData() {
        try {
            const response = await fetch('/api/billing/get_single_visit_bill_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();
            console.log(result);

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
    update_confirm_order_btn_state() {
        var confirm_order = this.main_container.querySelector('.confirm_order');

        if (this.selected_medicine_list.size > 0) {
            confirm_order.classList.remove('disabled')
        }
        else {
            confirm_order.classList.add('disabled')
        }


    }
    
    change_card_to_select(row) {
        row.classList.add('selected');
        var check_box = row.querySelector('.check_box span');
        check_box.classList.replace('switch_icon_check_box_outline_blank', 'switch_icon_check_box');


        if (this.valid_to_select == this.selected_medicine_list.size) {


            var check_box_all = this.main_container.querySelector('#check_box_all');
            check_box_all.querySelector('span').classList.replace('switch_icon_check_box_outline_blank', 'switch_icon_check_box');
        }
    }

    update_total_price() {
        const total_price = this.main_container.querySelector('.total_price_value');
        var array_of_medicine = Array.from(this.selected_medicine_list);
        total_price.textContent = array_of_medicine.reduce((acc, medicine) =>
            acc + medicine.price * medicine.amount, 0).toLocaleString('en-US',
                { style: 'currency', currency: 'TZS', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    change_card_to_unselect(row) {
        row.classList.remove('selected');
        var check_box = row.querySelector('.check_box span');
        check_box.classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');

        var check_box_all = this.main_container.querySelector('#check_box_all');
        check_box_all.querySelector('span').classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');


    }

}


