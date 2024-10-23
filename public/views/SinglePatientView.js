import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

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
        cont.innerHTML = this.ViewReturn('', 'active');

        this.patient_id = params.id;
        // Now call render which will fetch data and populate it
        this.render(params.id);
    }

    async render(id) {
        const cont = document.querySelector('.update_cont');
        const patient_data = await this.fetchData(id); // Wait for fetchData to complete

        this.patient_name=patient_data.name;

        if (patient_data) {
            cont.innerHTML = this.ViewReturn(patient_data);
            this.attach_listeners()
        } else {
            // Handle case where no roles were returned, or an error occurred.
            cont.innerHTML = '<h3>Error fetching roles data. Please try again.</h3>';
        }
    }

    ViewReturn(data, loader = '') {


        return `
<div class="single_patient_cont">

    <div class="top_card">

        <div class="Patient_imag">
            <img src="${data == '' ? '' : data.Patient_img}" alt="">
        </div>

        <div class="patient_detail">
            <div class="card name_card">
                <p class="name">${data == '' ? '' : data.name} (<span>${data == '' ? '' : data.id}</span>)</p>

                <button type="button" data_src="${data == '' ? '' : data.id}" class="edit_btn"><span
                        class='switch_icon_edit'></span></button>

            </div>
            <div class="card">
                <div class="icon_card">
                    <span class='switch_icon_user'></span>
                    <p>${data == '' ? '' : data.gender}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_calendar_check'></span>
                    <p>${this.date_formatter(data == '' ? '2001-02-01' : data.dob)} (${data == '' ? '' : data.age}
                        years)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_location_dot'></span>
                    <p>${data == '' ? '' : data.address} (<span>${data == '' ? '' : data.nationality}</span>)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_phone'></span>
                    <p>${data == '' ? '' : data.phone} <span>/</span> ${data == '' ? '' : data.alt_phone}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_briefcase'></span>
                    <p>${data == '' ? '' : data.occupation}</p>
                </div>

            </div>

            <div class="card vital">

                <div class="vital_card">
                    <p class="main_ms">22.4</p>
                    <div class="dist">
                        <p>BMI</p>
                        <div class="range down">
                            <span class='switch_icon_arrow_drop_down'></span>
                            <p>10</p>
                        </div>
                    </div>
                </div>

                <div class="vital_card">
                    <p class="main_ms">90 <span>kg</span></p>
                    <div class="dist">
                        <p>WEIGHT</p>
                        <div class="range up">
                            <span class='switch_icon_arrow_drop_down'></span>
                            <p>10</p>
                        </div>
                    </div>
                </div>

                <div class="vital_card">
                    <p class="main_ms">190 <span>cm</span></p>
                    <div class="dist">
                        <p>HEIGHT</p>
                        <div class="range up">
                            <span class='switch_icon_arrow_drop_down'></span>
                            <p>10</p>
                        </div>
                    </div>
                </div>

                <div class="vital_card">
                    <p class="main_ms">120/80</p>
                    <div class="dist">
                        <p>Blood pressure</p>
                        <div class="range up">
                            <span class='switch_icon_arrow_drop_down'></span>
                            <p>10</p>
                        </div>
                    </div>
                </div>

                <button type="button" class="btn_main create_visit_btn">Create Visit</button>
            </div>


        </div>

        <div class="loader_cont ${loader}">
            <div class="loader"></div>
        </div>
    </div>

</div>
`;
    }

    attach_listeners() {

        const add_visit_btn = document.querySelector('.create_visit_btn');
        if (add_visit_btn) {
            add_visit_btn.addEventListener('click', async () => {

                // CreateVisitPopUpView().PreRender(this.patient_id);
                dashboardController.createVisitPopUpView.PreRender(
                    {
                        id: this.patient_id,
                        p_name: this.patient_name
                    });

            })
        }

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

    date_formatter(ymd) {
        console.log('date', ymd);

        const dateee = new Date(ymd);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(dateee);
    }

}