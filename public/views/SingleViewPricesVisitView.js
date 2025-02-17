import { dashboardController } from "../controller/DashboardController.js";
import { view_price_cards } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, timeStamp_formatter, uploadWithProgress } from "../script/index.js";

export class SingleViewPricesVisitView {
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
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.view_price_cont');

        await this.render();
    }

    async render() {
        // const visit_data = await this.fetchData();

        // if (!visit_data) return;
    }

    add_listeners() {

    }

    ViewReturn() {
        return `
<div class="view_price_cont">

    ${view_price_cards.map(card => `
    <div class="card">

        <div class="icon">
            <span class='${card.icon}'></span>
        </div>

        <div class="title_cont">
            <p>${card.title}</p>
        </div>

    </div>
    `).join('')}
</div>
`;
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
}