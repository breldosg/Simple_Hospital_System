import { dashboardController } from "../controller/DashboardController.js";
import { view_price_cards } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, timeStamp_formatter, uploadWithProgress } from "../script/index.js";
import { frontRouter } from "../script/route.js";

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

        this.render_cards()

    }


    ViewReturn() {
        return `
<div class="view_price_cont">

</div>
`;
    }

    render_cards() {

        this.main_container.innerHTML = '';

        view_price_cards.forEach((card_data) => {
            const card = document.createElement('div');
            card.className = "card";

            card.innerHTML = `
                <div class="icon">
                    <span class='${card_data.icon}'></span>
                </div>

                <div class="title_cont">
                    <p>${card_data.title}</p>
                </div>
            `
            card.addEventListener('click', (e) => {
                frontRouter.navigate('/billing/viewprices/' + card_data.link);
            })


            this.main_container.appendChild(card)
        })

    }

}