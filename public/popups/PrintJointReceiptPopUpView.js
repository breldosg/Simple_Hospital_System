import { dashboardController } from "../controller/DashboardController.js";
import { joint_receipt_configs } from "../custom/receipt_configs.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { currency_formatter, date_formatter, getCurrentDate, notify, print_div } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class PrintJointReceiptPopUpView {
    constructor() {
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        console.log(params);
        this.params = params;
        this.bill_data = this.params.bills;
        this.receipt_configs = this.params.receipt_configs;

        const cont = document.querySelector('.popup');
        cont.classList.add('active');

        this.render(cont);
    }

    render(cont) {
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.create_invoice_and_pay_bill_popup');

        this.render_items(this.bill_data.items);


        this.attachListeners()
    }

    ViewReturn() {
        return `
<div class="container create_invoice_and_pay_bill_popup">
    
        <div class="receipt-header">
            <div class="top_row">
                <h2>Payment Receipt</h2>

                <div class="close_btn">
                    <span class="switch_icon_close"></span>
                </div>
            </div>
            <div class="receipt-info">
                <p class="invoice_number">Invoice: #INV-${this.bill_data.id ?? ''}</p>
                <p class="date">Date: ${this.bill_data.created_at ?? ''}</p>
                <p class="payment-method">Served by: ${this.bill_data.served_by ?? ''}</p>
            </div>
        </div>

        <div class="receipt-items">
            <div class="item-header">
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
            </div>
            <div class="items-list scroll_bar">


            </div>
        </div>

        <div class="receipt-summary">
            <p class="subtotal">
                <span>Sub Total</span>
                <span>${currency_formatter(this.bill_data.total_price)}</span>
            </p>
            <p class="total">
                <span class="total_label">Total</span>
                <span>${currency_formatter(this.bill_data.total_price)}</span>
            </p>
        </div>
        
        <div class="receipt_footer">
            <br-button loader_width="23" class="btn_primary print_invoice_btn" type="submit">Print Invoice</br-button>
        </div>
</div>
`;
    }

    render_items(items) {
        var items_list = this.main_container.querySelector('.items-list');
        items_list.innerHTML = items.map(item => `
        <p class="item">
            <span>${item.name}</span>
            <span>${item.quantity}</span>
            <span>${currency_formatter(item.total_price, false)}</span>
        </p>
    `).join('');
    }

    attachListeners() {
        const close_btn = this.main_container.querySelector('.close_btn');
        close_btn.addEventListener('click', () => {
            this.close_popup()
        });

        const pay_now_btn = this.main_container.querySelector('.pay_now_btn');
        if (pay_now_btn) {
            pay_now_btn.addEventListener('click', () => {
                this.create_invoice_and_pay_bill()
            });
        }

        const print_invoice_btn = this.main_container.querySelector('.print_invoice_btn');
        if (print_invoice_btn) {
            print_invoice_btn.addEventListener('click', async () => {
                print_div(this.main_container, this.receipt_style());
            });
        }
    }

    async create_invoice_and_pay_bill() {
        const btn_submit = this.main_container.querySelector('.pay_now_btn');
        btn_submit.setAttribute('loading', true);

        var bills = this.bill_data.items.map(bill => ({
            id: bill.id,
            type: bill.type,
        }));

        var form_data = {
            visit_id: this.params.visit_id,
            bills: bills,
        }
        console.log(form_data);

        try {
            const response = await fetch('/api/billing/create_invoice_and_pay_bill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form_data)
            });

            if (!response.ok) {
                throw new Error('Update failed. Server Error');
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
                notify('top_left', result.message, 'success');

                this.PreRender({
                    bills: result.data,
                    visit_id: this.params.visit_id,
                })



                // this.close_popup()
                dashboardController.singleVisitBillingView.render()

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

    close_popup() {
        this.category_select_rows = '';
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    receipt_style() {
        return `

        
        *{
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            font-family: "DM Sans", sans-serif;
            color: var(--main_text);
            transition: all 0.3s ease-in;
        }

    
    .create_invoice_and_pay_bill_popup {
        border-radius: var(--main_border_r);
        background-color: var(--white);
        padding: 10px;
        width: 100%;

        p{
            font-size: 12px;
        }

        .receipt-header {
            /* text-align: center; */
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px dashed #ddd;

            h2 {
                color:var(--pri_color);
                /* margin-bottom: 1rem; */
                /* font-size: 13px; */
            }

            .top_row{
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;

                .close_btn{
                    display: none;
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 5px;
                    flex: none;
                    cursor: pointer;
                    

                    span{
                        font-size: 17px;
                        /* color: var(--btn_hover_color); */
                    }
                }

                .close_btn:hover{
                    background-color: var(--pri_op);
                    span{
                        color: var(--pri_color);
                    }
                }
            }
        }


        .receipt-items {
            margin: 2rem 0;

            .item-header {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr;
                font-weight: bold;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #eee;
                margin-bottom: 1rem;
                padding-right: 10px;

                span:last-child{
                    text-align: end;
                }
            }

            .items-list {
                display: grid;
                gap: 0.5rem;
                padding-right: 10px;
    
                .item {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    padding: 8px 0;
                    gap: 15px;
                    border-bottom: 1px solid #eee;

                    span:last-child{
                        text-align: end;
                    }
                }
        
                .item:last-child {
                    border-bottom: none;
                }
            }
        }


        .receipt-summary {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px dashed #ddd;

            div {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }

            .subtotal {
                display: flex;
                justify-content: space-between;
            }

            .total {
                font-weight: bold;
                margin-top: 0.5rem;
                padding-top: 0.5rem;
                border-top: 1px solid #eee;
                display: flex;
                align-items: end;
                justify-content: space-between;

                .total_label{
                    font-size: 20px;
                    font-weight: bold;
                }
            }

        }

        .receipt_footer{
            display: none;
        }

    }
    `;
    }


}