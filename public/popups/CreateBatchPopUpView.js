import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { getCurrentDate, notify } from "../script/index.js";

export class CreateBatchPopUpView {
    constructor() {
        window.register_intake_batch = this.register_intake_batch.bind(this);
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

    }

    ViewReturn() {
        return `
<div class="container add_intake_batch">

    <br-form callback="register_intake_batch" class="slides">
        <div class="slide">
        <div class="head_cont">
                <p class="heading">Batch information</p>
                
                <div class="close_btn" title="Close PopUp" id="close_create_product_popup">
                    <span class="switch_icon_close"></span>
                </div>

            </div>

            <div class="input_group">
                <br-input required max="${getCurrentDate()}" name="receive_date" label="Receive Date" type="date" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>


                <br-input required name="provider_name" label="Provider name" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>

                <br-input name="invoice_number" label="Invoice Number" type="number" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>

                <div class="btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit" >Submit</br-button>
                </div>  
            </div>

        </div>
    </br-form>
    
</div>
`;
    }

    attachListeners() {
        const cancel_btn = document.querySelector('#close_create_product_popup');

        cancel_btn.addEventListener('click', () => {
            this.close_popup()
        });
    }

    async register_intake_batch(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        try {
            const response = await fetch('/api/pharmacy/register_intake_batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Registration failed. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                this.close_popup()
                dashboardController.viewIntakeBatchView.fetchAndRenderData();
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