import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, timeStamp_formatter, uploadWithProgress } from "../script/index.js";

export class SingleVisitPharmacyView {
    constructor() {
        // window.delete_pharmacy_report_attachment = this.delete_pharmacy_report_attachment.bind(this);
        this.visit_id = null;
        this.single_pharmacy_visit_data = null;
        this.selected_medicine_list = new Set();
        this.valid_to_select = 0;
    }

    async PreRender(params) {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // Update state but don't trigger render yet
        this.current_clicked = null;
        this.single_laboratory_data = null;
        this.active_order_data = null;
        this.on_uploading_cards = [];
        this.card_to_delete = null;

        this.rendered_card = [];
        this.visit_id = params.id;

        // Render initial structure
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('active');

        this.main_container = document.querySelector('.single_pharmacy_visit_cont');


        // Render patient detail component
        dashboardController.patientDetailComponent.PreRender({
            container: this.main_container,
            visit_id: this.visit_id,
        })

        this.render(this.visit_id);
        this.add_listeners();

    }

    async render() {
        const visit_data = await this.fetchData();

        if (!visit_data) return;




        // Render orders
        this.render_medicine_list(visit_data.pharmacy_orders);
        this.render_illness_info(visit_data.illness);
    }

    add_listeners() {

        var left_section_switcher = this.main_container.querySelectorAll('.left_section_switcher');
        left_section_switcher.forEach(btn => btn.addEventListener('click', () => {
            this.main_container.querySelector('.left_section_switcher.active').classList.remove('active');
            btn.classList.add('active');
            const src = btn.getAttribute('data_src');

            this.main_container.querySelector('#' + src).scrollIntoView({ behavior: 'smooth' });
        }));

        var check_box_all = this.main_container.querySelector('#check_box_all');
        check_box_all.addEventListener('click', () => {
            this.check_box_all_clicked(check_box_all);
        });


        var confirm_invoice = this.main_container.querySelector('.confirm_invoice');
        confirm_invoice.addEventListener('click', () => {
            this.confirm_invoice();
        });


    }

    ViewReturn() {
        return `
<div class="single_pharmacy_visit_cont">
    

    <div class="more_visit_detail">

        <div class="main_card">

            <!-- <div class="example">
                <p>No Order Selected</p>
            </div> -->
            
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
                                    <p>Product</p>
                                </div>
                                <div class="table_cell quantity">
                                    <p>Quantity</p>
                                </div>
                                <div class="table_cell quantity">
                                    <p>Stock</p>
                                </div>
                                <div class="table_cell">
                                    <p>Price (Per Unit)</p>
                                </div>
                                <div class="table_cell">
                                    <p>Total Price</p>
                                </div>
                            </div>
                        </div>
                        <div class="table_body scroll_bar" id="medicine_list_body">

                        </div>
                    </div>

                </div>
                
                <div class="btn_cont">

                    <button class="btn confirm_invoice">Confirm Invoice</button>
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

    render_medicine_list(medicine_list, uncheck_all = false) {
        const body = this.main_container.querySelector('#medicine_list_body');
        body.innerHTML = '';

        this.valid_to_select = 0;
        medicine_list.forEach(medicine => {
            const hasEnoughStock = medicine.pharmacy_total_quantity >= medicine.amount;
            if (hasEnoughStock) {
                this.valid_to_select++;
            }


            const row = document.createElement('div');
            row.className = 'table_row';


            if (hasEnoughStock && !uncheck_all) {
                row.classList.add('selected');
                this.selected_medicine_list.add(medicine);
            }
            else {
                this.selected_medicine_list.delete(medicine);
            }



            if (medicine.given == 'true') {
                row.classList.add('disabled');
            }




            row.innerHTML = `
        <div class="table_cell check_box">

            ${hasEnoughStock && !uncheck_all ? `<span class='switch_icon_check_box'></span>` : `<span class='switch_icon_check_box_outline_blank'></span>`}



        </div>

        <div class="table_cell name">
            <div class="name_cont">
                <p class="product_name">${medicine.product_name}</p>
                <p class="instruction">Instruction: <span>${medicine.instruction}</span></p>
                <p class="duration">Duration: <span>${medicine.duration} days</span></p>
            </div>


        </div>
        <div class="table_cell quantity">
            <p>${medicine.amount}</p>
        </div>
        <div class="table_cell quantity">
            <p>${medicine.pharmacy_total_quantity}</p>


        </div>
        <div class="table_cell">
            <p>${medicine.price.toLocaleString('en-US', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
        <div class="table_cell">
            <p>${(medicine.price * medicine.amount).toLocaleString('en-US', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
            `;

            if (medicine.given == 'false') {
                row.addEventListener('click', () => {
                    if (hasEnoughStock) {
                        if (row.classList.contains('selected')) {
                            this.selected_medicine_list.delete(medicine);
                            this.change_card_to_unselect(row);
                        } else {
                            this.selected_medicine_list.add(medicine);
                            this.change_card_to_select(row);
                        }

                    } else {
                        notify('top_left', `Insufficient stock.`, 'warning');
                    }
                });

            }
            body.appendChild(row);
        });



    }


    render_illness_info(illness) {
        const body = this.main_container.querySelector('#illness_section');

        body.innerHTML = '';

        // render symptoms 
        const symptoms = document.createElement('div');
        symptoms.classList.add('illness_card');
        symptoms.innerHTML = `
            <p class="head">Symptoms</p>
            <ul>
                <li>${illness.symptoms}</li>
            </ul>
        `;
        body.appendChild(symptoms);

        // render diagnosis
        const diagnosis = document.createElement('div');
        diagnosis.classList.add('illness_card');
        diagnosis.innerHTML = `
            <p class="head">Diagnosis</p>
            <ul>
                ${illness.diagnosis.map(item => `<li>${item.diagnosis}</li>`).join('')}
            </ul>
        `;
        body.appendChild(diagnosis);


    }

    render_example() {
        const body = this.main_container.querySelector('.right_card');
        body.innerHTML = `
                <div class="example">
                    <p>No Order Selected</p>
                </div>
            `;

        this.render_orders(this.single_laboratory_data);
        this.current_clicked = null;
        this.active_order_data = null;

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

    change_card_to_unselect(row) {
        row.classList.remove('selected');
        var check_box = row.querySelector('.check_box span');
        check_box.classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');

        var check_box_all = this.main_container.querySelector('#check_box_all');
        check_box_all.querySelector('span').classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');


    }

    async fetchData() {
        try {


            const response = await fetch('/api/pharmacy/single_pharmacy_visit_detail', {
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

            if (result.success) {
                this.single_pharmacy_visit_data = result.data;
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

    check_box_all_clicked(check_box_all) {
        var check_box_all_span = check_box_all.querySelector('span');
        if (check_box_all_span.classList.contains('switch_icon_check_box')) {
            // change all card to unselect
            this.render_medicine_list(this.single_pharmacy_visit_data.pharmacy_orders, true)
            check_box_all_span.classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');
        } else {
            // change all card to select
            this.render_medicine_list(this.single_pharmacy_visit_data.pharmacy_orders)
            check_box_all_span.classList.replace('switch_icon_check_box_outline_blank', 'switch_icon_check_box');
        }
    }


    async confirm_invoice() {
        console.log(this.selected_medicine_list);
        // try {

        //     const response = await fetch('/api/pharmacy/confirm_invoice', {
        //         method: 'POST',


        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             visit_id: this.visit_id,
        //             medicine_list: this.selected_medicine_list,
        //         })
        //     });

        //     if (!response.ok) {
        //         throw new Error('Server Error');
        //     }

        //     const result = await response.json();

        //     if (result.success) {
        //         notify('top_left', result.message, 'success');
        //         this.single_laboratory_data = result.data;


        //         // clear all constructor and run example view
        //         this.render_example();

        //     } else {
        //         notify('top_left', result.message, 'warning');
        //         return null;
        //     }
        // } catch (error) {
        //     notify('top_left', error.message, 'error');
        //     return null;
        // }
    }

}
