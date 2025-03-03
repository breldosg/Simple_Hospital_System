import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SinglePatientView {
    constructor() {
        this.patient_id = null;
        this.patient_name = null;

    }
    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.single_patient_cont');
        this.patient_id = params.id;

        console.log(this.main_container);


        // Render patient detail component
        dashboardController.patientDetailComponent.PreRender({
            container: this.main_container,
            patient_id: this.patient_id,
        })

        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
    }

    ViewReturn() {
        return `
<div class="single_patient_cont">

<div class="visit_list">
    <div class="visit_list_top_part">
        <p class="heading">All Visits</p>
    </div>

    <div class="visit_list_bottom_part">
        
    </div>

</div>

</div>
`;
    }

    attach_listeners() {

        // const add_visit_btn = document.querySelector('.create_visit_btn');
        // if (add_visit_btn) {
        //     add_visit_btn.addEventListener('click', async () => {

        //         // CreateVisitPopUpView().PreRender(this.patient_id);
        //         dashboardController.createVisitPopUpView.PreRender(
        //             {
        //                 id: this.patient_id,
        //                 p_name: this.patient_name
        //             });

        //     })
        // }

    }

    async fetchData(id) {
        try {
            const response = await fetch('/api/patient/single_patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patient_id: id,
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



            if (result.success) {
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
