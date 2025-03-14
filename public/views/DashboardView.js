import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../config/roles.js";
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, decodeHTML, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class DashboardView {
    constructor() {


    }

    async PreRender() {

        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        // get user role in global state
        this.user_data = globalStates.getState('user_data');


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.outpatient_table_out');

    }


    async fetchData() {
        try {
            const response = await fetch('/api/patient/search_patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,  // Send search term
                    batch: this.batchNumber // Send current batch number
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


            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }


    ViewReturn() {
        return `
        <div class=" main_dashboard">
        </div>
        `;
    }
}

