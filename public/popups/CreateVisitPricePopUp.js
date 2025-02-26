import { dashboardController } from "../controller/DashboardController.js";
import { doctor_type, visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { getCurrentDate, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class CreateVisitPricePopUp {
    constructor() {
        window.CreateVisitPricePopUp = this.CreateVisitPrice.bind(this);
        this.patient_id = null;
    }

    async PreRender() {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn('active');

        this.main_container = document.querySelector('.create_visit_price_popup');

        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
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
            this.main_container.innerHTML = this.update_view_after_loading(options_elements(departments_data), options_elements(doctors_data), '');
            this.attachListeners()
        } else {
            // Handle case where no roles were returned, or an error occurred.
            this.main_container.innerHTML = '<3>Error fetching roles data. Please try again.</3>';
        }
    }

    ViewReturn(loader = '') {
        return `
        <div class="container create_visit_price_popup">

        <div class="slides" >
        <div class="slide">
            <div>
                <p class="heading">Create Visit Price</p>

            </div>
            <div class="input_group">

                
                <br-input required name="name" label="Name" type="text"  styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>


                <br-select name="doctor_type" fontSize="13px" label="Doctor Type" placeholder="Select Doctor Type" styles="
                                    border-radius: var(--input_main_border_r);
                                    width: 300px;
                                    padding: 10px;
                                    height: 41px;
                                    background-color: transparent;
                                    border: 2px solid var(--input_border);
                                    " labelStyles="font-size: 12px;">


                    </br-select>

                <br-select  name="visit_type" fontSize="13px" label="Visit Type" placeholder="Select Visit Type" styles="
                                    border-radius: var(--input_main_border_r);
                                    width: 300px;
                                    padding: 10px;
                                    height: 41px;
                                    background-color: transparent;
                                    border: 2px solid var(--input_border);
                                    " labelStyles="font-size: 12px;">


                    </br-select>

                <br-select required fontSize="13px" label="Visit Priority" name="priority" placeholder="Select Visit Priority"
                    styles="
                    border-radius: var(--input_main_border_r);
                    width: 300px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;

                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;">
                    </br-select>

                
                <br-select required fontSize="13px" label="Department" name="department" placeholder="Select Department"
                    styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
            " labelStyles="font-size: 12px;">
                </br-select>

                <br-input required name="price" label="Price" type="number"  styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>




                <div class="btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit">Submit</br-button>
                    <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                </div>


            </div>
        </div>
    </div>

    <div class="loader_cont ${loader}">
        <div class="loader"></div>
    </div>

</div>
        `;
    }

    update_view_after_loading(departments, doctors) {

        return `
        <br-form class="slides anima" callback="CreateVisitPricePopUp">
        <div class="slide">
            <div>
                <p class="heading">Create Visit Price</p>

            </div>
            <div class="input_group">

                <br-input required name="name" label="Name" type="text"  styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>


                <br-select required name="doctor_type" fontSize="13px" label="Doctor Type" placeholder="Select Doctor Type" styles="
                                    border-radius: var(--input_main_border_r);
                                    width: 300px;
                                    padding: 10px;
                                    height: 41px;
                                    background-color: transparent;
                                    border: 2px solid var(--input_border);
                                    " labelStyles="font-size: 12px;">

                ${doctor_type.map(type => `<br-option type="checkbox" value="${type.value}">${type.label}</br-option>`).join('')}


                    </br-select>

                <br-select required name="visit_type" fontSize="13px" label="Visit Type" placeholder="Select Visit Type" styles="
                                    border-radius: var(--input_main_border_r);
                                    width: 300px;
                                    padding: 10px;
                                    height: 41px;
                                    background-color: transparent;
                                    border: 2px solid var(--input_border);
                                    " labelStyles="font-size: 12px;">

                ${visit_type.map(type => `<br-option type="checkbox" value="${type.value}">${type.label}</br-option>`).join('')}


                    </br-select>

                <br-select required fontSize="13px" label="Visit Priority" name="priority" placeholder="Select Visit Priority"
                    styles="
                    border-radius: var(--input_main_border_r);
                    width: 300px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;

                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;">
                        ${visit_priority.map(priority => `<br-option type="checkbox" value="${priority.value}">${priority.label}</br-option>`).join('')}
                    </br-select>

                
                <br-select search required fontSize="13px" label="Department" name="department" placeholder="Select Department"
                    styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
            " labelStyles="font-size: 12px;">
                    ${departments ? departments : ''}
                </br-select>

                <br-input required name="price" label="Price" type="number"  styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>


                <div class="btn_cont">
                    <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                    <br-button loader_width="23" class="btn_next" type="submit">Submit</br-button>
                </div>


            </div>
            </div>
        </br-form>
            `;

    }

    attachListeners() {
        const cancel_btn = this.main_container.querySelector('br-button[type="cancel"]');

        cancel_btn.addEventListener('click', () => {

            this.close();

        });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async CreateVisitPrice(data_old) {
        const btn_submit = this.main_container.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        var data = {
            ...data_old,
        }

        console.log(data);


        try {
            const response = await fetch('/api/billing/create_visit_price', {
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
                notify('top_left', result.message, 'success');
                // After successful creation, clear the popup and close it
                const popup_cont = document.querySelector('.popup');
                popup_cont.innerHTML = ''; // Clear the popup and close it
                popup_cont.classList.remove('active');

                dashboardController.viewBillingConsultationView.PreRender();
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