import { dashboardController } from "../controller/DashboardController.js";
import { visit_add_card_btn } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, timeStamp_formatter, uploadWithProgress } from "../script/index.js";

export class SingleVisitBillingView {
    constructor() {
        this.visit_id = null;
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
        // const visit_data = await this.fetchData();

        // if (!visit_data) return;
    }

    ViewReturn(loader = '') {
        return `
<div class="single_billing_visit_cont">
    
    <div class="more_visit_detail">

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
            const response = await fetch('/api/radiology/single_visit_with_radiology_order_detail', {
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


                this.single_radiology_data = result.data.radiology_orders;
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
}


