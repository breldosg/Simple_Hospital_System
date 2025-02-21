import { dashboardController } from "../controller/DashboardController.js";
import { visit_add_card_btn } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { currency_formatter, date_formatter, notify, timeStamp_formatter, uploadWithProgress } from "../script/index.js";

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
        this.add_listeners();
    }

    render_bills_list(bills_list, uncheck_all = false) {
        const body = this.main_container.querySelector('#bills_list_body');
        body.innerHTML = '';

        if (uncheck_all) {
            this.selectedBills.clear();
        }

        this.valid_to_select = 0;

        bills_list.forEach(bill => {
            const isPaid = bill.is_paid == 1;
            const row = document.createElement('div');
            row.classList.add('table_row');
            row.dataset.billId = bill.id;
            row.dataset.price = bill.total_price;


            if (!isPaid) {
                this.valid_to_select++;
            }

            if (!isPaid && !uncheck_all) {
                row.classList.add('selected');
                this.selectedBills.add(bill);
            }

            row.innerHTML = `
                <div class="table_cell check_box" id="check_box_all">
                    ${!isPaid && !uncheck_all ? `<span class='switch_icon_check_box'></span>` : `<span class='switch_icon_check_box_outline_blank'></span>`}
                </div>
                <div class="table_cell name">
                    <p>${bill.name}</p>
                </div>
                
                <div class="table_cell quantity">
                    <p>${bill.quantity}</p>
                </div>
                <div class="table_cell quantity">
                    <p>${currency_formatter(bill.price)}</p>
                </div>
                <div class="table_cell">
                    <p>${currency_formatter(bill.total_price)}</p>
                </div>
                <div class="table_cell">
                    <p>${bill.is_paid ? 'Paid' : 'Unpaid'}</p>
                </div>
                <div class="table_cell">
                    <p>${bill.restriction.status ? 'Active' : 'Inactive'}</p>
                </div>
            `;

            row.addEventListener('click', () => {

                if (isPaid) {
                    notify('top_left', `Bill is already paid.`, 'warning');
                }
                else {
                    if (row.classList.contains('selected')) {
                        this.selectedBills.delete(bill);
                        this.change_card_to_unselect(row);
                        this.update_total_price()
                        this.update_confirm_order_btn_state()
                    } else {
                        this.selectedBills.add(bill);
                        this.change_card_to_select(row);
                        this.update_total_price()
                        this.update_confirm_order_btn_state()
                    }
                }


            });

            body.appendChild(row);
        });

        this.update_total_price()
        this.update_confirm_order_btn_state()
    }

    add_listeners() {

        // var left_section_switcher = this.main_container.querySelectorAll('.left_section_switcher');
        // left_section_switcher.forEach(btn => btn.addEventListener('click', () => {
        //     this.main_container.querySelector('.left_section_switcher.active').classList.remove('active');
        //     btn.classList.add('active');
        //     const src = btn.getAttribute('data_src');

        //     this.main_container.querySelector('#' + src).scrollIntoView({ behavior: 'smooth' });
        // }));

        var check_box_all = this.main_container.querySelector('#check_box_all');
        check_box_all.addEventListener('click', () => {
            this.check_box_all_clicked(check_box_all);
        });

        var confirm_order = this.main_container.querySelector('.confirm_order');
        confirm_order.addEventListener('click', () => {
            if (this.selectedBills.size == 0) {
                notify('top_left', 'Please select at least one bill', 'warning');
                return;
            }

            var total_price = Array.from(this.selectedBills).reduce((acc, bill) => acc + parseFloat(bill.total_price), 0);

            dashboardController.createInvoiceAndPayBillPopUpView.PreRender({
                visit_id: this.visit_id,
                bills: {
                    status: 'not_paid',
                    total_price: total_price,
                    items: [...this.selectedBills],
                },
            });
        });
    }

    ViewReturn() {
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
                    <button class="btn confirm_order disabled">Confirm Bill</button>
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
                this.single_billing_visit_data = result;
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

        if (this.selectedBills.size > 0) {
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


        if (this.valid_to_select == this.selectedBills.size) {


            var check_box_all = this.main_container.querySelector('#check_box_all');
            check_box_all.querySelector('span').classList.replace('switch_icon_check_box_outline_blank', 'switch_icon_check_box');
        }
    }

    update_total_price() {
        const total_price = this.main_container.querySelector('.total_price_value');
        var array_of_bills = Array.from(this.selectedBills);
        var total = array_of_bills.reduce((acc, bill) => acc + parseFloat(bill.total_price), 0);
        total_price.textContent = currency_formatter(total);
    }

    change_card_to_unselect(row) {
        row.classList.remove('selected');
        var check_box = row.querySelector('.check_box span');
        check_box.classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');

        var check_box_all = this.main_container.querySelector('#check_box_all');
        check_box_all.querySelector('span').classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');
    }

    check_box_all_clicked(check_box_all) {
        var check_box_all_span = check_box_all.querySelector('span');
        if (check_box_all_span.classList.contains('switch_icon_check_box')) {
            console.log(this.single_billing_visit_data);
            // change all card to unselect
            this.render_bills_list(this.single_billing_visit_data.data, true)
            check_box_all_span.classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');
        } else {
            // change all card to select
            this.render_bills_list(this.single_billing_visit_data.data)
            check_box_all_span.classList.replace('switch_icon_check_box_outline_blank', 'switch_icon_check_box');
        }
    }
}


