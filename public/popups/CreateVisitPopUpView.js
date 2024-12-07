
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class CreateVisitPopUpView {
    constructor() {
        window.CreateVisit = this.CreateVisit.bind(this);
        this.patient_id = null;
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.patient_id = params.id;
        this.patient_name = params.p_name;

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn('', '', 'active');

        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
        const cont = document.querySelector('.popup');
        const data = await this.fetchData(); // Wait for fetchData to complete

        if (data) {
            const options_elements = (data) => {
                var Elem = "";
                data.forEach(data => {
                    Elem += `
                        <br-option type="checkbox" value="${data.id}">${data.name}</br-option>
                    `;
                });
                return Elem;
            };

            var departments_data = data.department;
            var doctors_data = data.doctors;

            // Replace loader and insert the content
            cont.innerHTML = this.ViewReturn(options_elements(departments_data), options_elements(doctors_data), '');
            this.attachListeners()
        } else {
            // Handle case where no roles were returned, or an error occurred.
            cont.innerHTML = '<3>Error fetching roles data. Please try again.</3>';
        }
    }

    ViewReturn(departments, doctors, loader = '') {
        return `
        <div class="container create_visit_popup">

    <br-form class="slides" callback="CreateVisit">
        <div class="slide">
            <div>
                <p class="heading">Create Visit</p>
                <p class="subHead">${this.patient_name}</p>

            </div>
            <div class="input_group">


                <br-select required fontSize="13px" label="Visit Type" name="type" placeholder="Select Visit Type"
                    styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
            " labelStyles="font-size: 13px;">
                    <br-option type="checkbox" value="out_patient">Out Patient</br-option>
                    <br-option type="checkbox" value="in_patient">In Patient</br-option>
                    <br-option type="checkbox" value="emergency">Emergency</br-option>
                    <br-option type="checkbox" value="waking">Waking</br-option>
                </br-select>
                
                
                <br-select required fontSize="13px" label="Visit Priority" name="priority" placeholder="Select Visit Type"
                    styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
            " labelStyles="font-size: 13px;">
                    <br-option type="checkbox" value="normal">Normal</br-option>
                    <br-option type="checkbox" value="fast">Fast</br-option>
                </br-select>

                
                <br-select required fontSize="13px" label="Department" name="department" placeholder="Select Department"
                    styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
            " labelStyles="font-size: 13px;">
                    ${departments ? departments : ''}
                </br-select>


                <br-select required fontSize="13px" label="Doctors" name="doctors" placeholder="Select Doctors" styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
            " labelStyles="font-size: 13px;">
                    ${doctors ? doctors : ''}
                </br-select>


                <div class="btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit">Submit</br-button>
                    <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                </div>


            </div>
        </div>
    </br-form>
    <div class="loader_cont ${loader}">
        <div class="loader"></div>
    </div>

</div>
        `;
    }

    attachListeners() {
        const cancel_btn = document.querySelector('br-button[type="cancel"]');

        cancel_btn.addEventListener('click', () => {
            const cont = document.querySelector('.popup');
            cont.classList.remove('active');
            cont.innerHTML = '';

        });
    }

    async CreateVisit(data_old) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        var data = {
            ...data_old,
            patient_id: this.patient_id
        }

        try {
            const response = await fetch('/api/patient/create_visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('failed To create visit. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                // After successful creation, clear the popup and close it
                const popup_cont = document.querySelector('.popup');
                popup_cont.innerHTML = ''; // Clear the popup and close it
                popup_cont.classList.remove('active');

                dashboardController.viewPatientView.PreRender();
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

    async fetchData() {
        try {
            const response = await fetch('/api/patient/get_create_visit_open_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
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
}
