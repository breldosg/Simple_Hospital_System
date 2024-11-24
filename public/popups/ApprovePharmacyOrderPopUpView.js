import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { getCurrentDate, notify } from "../script/index.js";

export class ApprovePharmacyOrderPopUpView {
    constructor() {
        window.approve_order = this.approve_order.bind(this);
        window.update_order = this.update_order.bind(this);
        this.order_id = null;
        this.orderName = '';
        this.storeQuantity = 0;
        this.pharmacyQuantity = 0;
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }
        const cont = document.querySelector('.popup');

        this.order_id = params.order_id;
        this.orderName = params.order_name;
        this.storeQuantity = params.store_quantity;
        this.pharmacyQuantity = params.pharmacy_quantity;
        this.action = params.action;
        this.quantity = params.quantity ? params.quantity : '';


        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();



        this.attachListeners()

    }

    ViewReturn() {

        return `
<div class="container approve_order">

    <br-form callback="${this.action == 'update' ? 'update_order' : 'approve_order'}" class="slides">
        <div class="slide">
            <div class="head_cont">
                <p class="heading">Order For: ${this.orderName}</p>

                <div class="close_btn" title="Close PopUp" id="close_approve_order_product_popup">
                    <span class="switch_icon_close"></span>
                </div>

            </div>

            <div class="input_group">
                <br-input required max="${this.storeQuantity}" value="${this.quantity}" min="0" name="quantity" label="Quantity" type="number" styles="
                                border-radius: var(--input_main_border_r);
                                width: 620px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>

                <div class="info_cont">

                    <div class="info">
                        <p class="head">Store Quantity</p>
                        <p class="quantity">${this.storeQuantity}</p>
                    </div>


                    <div class="info">
                        <p class="head">Pharmacy Quantity</p>
                        <p class="quantity">${this.pharmacyQuantity}</p>
                    </div>

                </div>

                <div class="btn_cont">
                    <br-button loader_width="23" title="Cancel" class="btn_next" type="cancel">Cancel</br-button>
                    <br-button loader_width="23" title="submit" class="btn_next" type="submit">${this.action}</br-button>
                </div>
            </div>

        </div>
    </br-form>

</div>
`;
    }

    attachListeners() {
        const cancel_btns = document.querySelectorAll('#close_approve_order_product_popup,.btn_next[type="cancel"]');

        cancel_btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.close_popup()
            });
        });
    }

    async approve_order(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        if (data.quantity > this.storeQuantity) {
            notify('top_left', 'Quantity should not exceed store quantity', 'warning');
            btn_submit.setAttribute('loading', false);
            return;
        }

        try {

            const response = await fetch('/api/pharmacy/approve_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        order_id: this.order_id,
                        quantity: data.quantity,
                        action: 'approve'
                    }
                )
            });

            if (!response.ok) {
                throw new Error('Registration failed. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                this.close_popup()
                dashboardController.viewOrderListView.fetchAndRenderData();
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


    async update_order(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        if (data.quantity > this.storeQuantity) {
            notify('top_left', 'Quantity should not exceed store quantity', 'warning');
            btn_submit.setAttribute('loading', false);
            return;
        }

        try {

            const response = await fetch('/api/pharmacy/update_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        order_id: this.order_id,
                        quantity: data.quantity,
                    }
                )
            });

            if (!response.ok) {
                throw new Error('Registration failed. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                this.close_popup()
                dashboardController.viewOrderListView.fetchAndRenderData();
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

}