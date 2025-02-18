import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { getCurrentDate, notify } from "../script/index.js";

export class UpdateRadiologyTestPricePopUpView {
    constructor() {
        window.update_radiology_test_price_popup_form = this.update_price.bind(this);
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.params = params;

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners()

    }

    ViewReturn() {
        return `
<div class="container update_pharmacy_product_price_popup">

    <br-form callback="update_radiology_test_price_popup_form" class="slides">
        <div class="slide">
        <div class="head_cont">
                <p class="heading">${this.params.name}</p>
                
                <div class="close_btn" title="Close PopUp" id="close_create_product_popup">
                    <span class="switch_icon_close"></span>
                </div>

            </div>

            <div class="input_group">
                <br-input required name="price" label="Price" type="number" value="${this.params.price}" styles="
                                border-radius: var(--input_main_border_r);
                                width: 620px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>

                <div class="btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit" >Update Price</br-button>
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

    async update_price(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        var form_data = {
            ...data,
            product_id: this.params.id,
        }
        console.log(form_data);

        try {
            const response = await fetch('/api/radiology/update_radiology_test_price', {
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

            if (result.success) {
                notify('top_left', result.message, 'success');
                this.close_popup()
                dashboardController.viewBillingRadiologyView.fetchAndRenderData();
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