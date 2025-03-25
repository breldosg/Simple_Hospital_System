import { dashboardController } from "../controller/DashboardController.js";
import { visit_add_card_btn } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { currency_formatter, date_formatter, notify, timeStamp_formatter, uploadWithProgress } from "../script/index.js";
import { frontRouter } from "../script/route.js";

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
            location: 'other_pages',
        })

        this.render();
    }

    async render() {
        this.selectedBills.clear();
        this.pre_render_bills_list();
        this.render_invoices()
    }

    async pre_render_bills_list() {
        this.render_loader('#bills_list_body');
        const visit_data = await this.fetchData();

        if (!visit_data) {
            this.render_no_bill_data();
            return;
        }
        await this.render_bills_list(visit_data);

        this.add_listeners();

    }

    async render_bills_list(bills_list, uncheck_all = false) {
        const body = this.main_container.querySelector('#bills_list_body');
        body.innerHTML = '';

        if (uncheck_all) {
            this.selectedBills.clear();
        }

        this.valid_to_select = 0;

        bills_list.forEach(bill => {
            const isPaid = bill.is_paid == 1;
            const is_restricted = isPaid ? false : bill.restriction.status;
            const row = document.createElement('div');

            row.classList.add('table_row');
            row.dataset.billId = bill.id;
            row.dataset.price = bill.total_price;


            if (!isPaid && !is_restricted) {
                this.valid_to_select++;
            }


            if (!isPaid && !uncheck_all && !is_restricted) {
                row.classList.add('selected');
                this.selectedBills.add(bill);
            }

            row.innerHTML = `
                <div class="table_cell check_box" id="check_box_all">
                    ${!isPaid && !uncheck_all && !is_restricted ? `<span class='switch_icon_check_box'></span>` : `<span class='switch_icon_check_box_outline_blank'></span>`}
                </div>
                <div class="table_cell name">
                    <p>${bill.name}</p>
                </div>
                
                <div class="table_cell quantity">
                    <p>${bill.quantity}</p>
                </div>
                <div class="table_cell quantity">
                    <p>${currency_formatter(bill.price, false)}</p>
                </div>
                <div class="table_cell">
                    <p>${currency_formatter(bill.total_price, false)}</p>
                </div>
                <div class="table_cell">
                    ${bill.is_paid ? `<p class="pill paid">Paid</p>` : `<p class="pill unpaid">Unpaid</p>`}
                </div>
                <div class="table_cell info_icon ${is_restricted ? 'restricted' : ''}" 
                    ">
                    <div class="tooltip_icon_cont">
                        <span class='switch_icon_info_outline'></span>
                    </div>
                    <div class="tooltip">${is_restricted ? bill.restriction.message : 'No restrictions'}</div>
                </div>
            `;

            row.addEventListener('click', () => {

                if (is_restricted) {
                    notify('top_left', bill.restriction.message, 'warning');
                }
                else {
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

                            <div class="loader_cont active">
                                <div class="loader"></div>
                            </div>


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
                <h4 class="heading">All Invoices</h4>
            </div>
            <div class="middle invoices_list scroll_bar">
                
                <div class="loader_cont active">
                    <div class="loader"></div>
                </div>
            </div>
            <div class="bottom">
                <p class="total_paid"></p>
            </div>

        </div>



    </div>

</div>
`;
    }

    render_no_invoice_data() {
        const body = this.main_container.querySelector('.invoices_list');
        body.innerHTML = `
                <div class="example">
                    <p>No Invoice Found</p>
                </div>
                `;
    }

    render_no_bill_data() {
        const body = this.main_container.querySelector('#bills_list_body');
        body.innerHTML = `
                <div class="example">
                    <p>No Bill Found</p>
                </div>
            `;
    }

    render_loader(class_name) {
        const body = this.main_container.querySelector(class_name);
        body.innerHTML = `
            <div class="loader_cont active">
                <div class="loader"></div>
            </div>
        `;
    }


    async render_invoices() {
        // render loader
        this.render_loader('.invoices_list');

        // fetch data
        const invoices_data = await this.fetch_single_visit_invoices();

        // render invoices
        const body = this.main_container.querySelector('.invoices_list');
        body.innerHTML = '';
        const total_paid = this.main_container.querySelector('.total_paid');

        if (!invoices_data || invoices_data.length == 0) {
            this.render_no_invoice_data();
            total_paid.textContent = currency_formatter(0);
            return;
        }



        // calculate total paid
        var total_paid_value = 0;

        // render invoices
        invoices_data.forEach(invoice => {
            const invoice_card = document.createElement('div');
            invoice_card.classList.add('invoice_card');

            invoice_card.innerHTML = `
                        <div class="invoice_header">
                            <div class="left">
                                <div class="invoice_number">#INV-${invoice.id}</div>
                                <div class="date">${timeStamp_formatter(invoice.created_at)}</div>
                            </div>
                            <div class="right">
                                <span class="status ${invoice.status.toLowerCase()}">${invoice.status.toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="invoice_body">
                            <div class="total">
                                <span class="amount">${currency_formatter(invoice.total_price)}</span>
                            </div>
                        </div>
                `
            invoice_card.addEventListener('click', () => {
                dashboardController.createInvoiceAndPayBillPopUpView.PreRender({
                    visit_id: this.visit_id,
                    bills: invoice,
                });
            });
            total_paid_value += parseFloat(invoice.total_price);
            body.appendChild(invoice_card);
        });

        // render total paid
        total_paid.textContent = currency_formatter(total_paid_value);

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


            console.log(result);

            if (result.success) {
                this.single_billing_visit_data = result;
                return result.data;
            } else {
                notify('top_left', result.message, 'warning');
                return false;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return false;
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

    async fetch_single_visit_invoices() {
        try {
            const response = await fetch('/api/billing/get_single_visit_invoices', {
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


            console.log(result);

            if (result.success) {
                this.single_billing_visit_invoices = result;
                return result.data;
            } else {
                notify('top_left', result.message, 'warning');
                return false;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return false;
        }
    }

}


