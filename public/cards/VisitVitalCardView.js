import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class VisitVitalCardView {
    constructor() {
        window.AddVital = this.AddVital.bind(this);
        this.visit_id = null;
        this.data = [];
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.data = params.data.vital_data ? params.data.vital_data : [];
        this.visit_id = params.visit_id;

        const cont = document.querySelector('.single_visit_cont .more_visit_detail');
        cont.classList.add('active');
        cont.prepend(this.ViewReturn());

        this.updateVitalView();
    }

    updateVitalView() {

        const container = document.querySelector('.vital_card_cont .vital_card')

        container.innerHTML = `
                <div class="value_cont">
                    <p class="name">Temperature:</p>
                    <p class="value">${this.data.temperature ? this.data.temperature : '0'} deg C</p>
                </div>
                <div class="value_cont">
                    <p class="name">Pulse:</p>
                    <p class="value">${this.data.pulse ? this.data.pulse : '0'} bpm</p>
                </div>
                <div class="value_cont">
                    <p class="name">Weight:</p>
                    <p class="value">${this.data.weight ? this.data.weight : '0'} Kg</p>
                </div>
                <div class="value_cont">
                    <p class="name">O2 Saturation:</p>
                    <p class="value">${this.data.o2_saturation ? this.data.o2_saturation : '0'} %</p>
                </div>
                <div class="value_cont">
                    <p class="name">Blood Pressure:</p>
                    <p class="value">${this.data.blood_pressure ? this.data.blood_pressure : '0'} mmHg</p>
                </div>
                <div class="value_cont">
                    <p class="name">Respiration:</p>
                    <p class="value">${this.data.respiration ? this.data.respiration : '0'}  RR</p>
                </div>
                <div class="value_cont">
                    <p class="name">Height:</p>
                    <p class="value">${this.data.height ? this.data.height : '0'}  cm</p> 
                </div>
                `;

    }

    ViewReturn() {

        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('vital_card_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Vital Sign</h4>

                <div class="add_btn" id="edit_vital_sign">
                    <span class='switch_icon_mode_edit'></span>
                </div>
            </div>

            <div class="body_part vital_card">

                
            </div>
            `;

        const edit_btn = card.querySelector('#edit_vital_sign');
        edit_btn.addEventListener('click', () => {
            dashboardController.addVitalPopUpView.PreRender({
                visit_id: this.visit_id,
                vital_data: this.data
            })
        })

        return card;

    }

    attachListeners() {
        const cancel_btn = document.querySelector('br-button[type="cancel"]');

        cancel_btn.addEventListener('click', () => {
            this.close();
        });
    }

    async AddVital(data_old) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);


        var formData = {
            ...data_old,
            visit_id: this.visit_id
        }


        try {
            const response = await fetch('/api/patient/save_vital', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('failed To update vital. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                // After successful creation, clear the popup and close it
                dashboardController.addVitalPopUpView.close();
                this.data = data_old;
                this.updateVitalView();

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
}