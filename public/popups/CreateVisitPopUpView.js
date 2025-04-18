import { dashboardController } from "../controller/DashboardController.js";
import { visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class CreateVisitPopUpView {
    constructor() {
        window.CreateVisit = this.CreateVisit.bind(this);
        this.patient_id = null;
        this.mode = 'create'; // 'create' or 'update'
        this.visit_data = null;
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.patient_id = params.id;
        this.patient_name = params.p_name;
        this.mode = params.mode || 'create';
        this.visit_data = params.visit_data;

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn('active');

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
            cont.querySelector('.create_visit_popup').innerHTML = this.update_view_after_loading(options_elements(departments_data), options_elements(doctors_data), '');
            this.attachListeners();

            // // If in update mode, pre-fill the form with existing data
            // if (this.mode === 'update' && this.visit_data) {
            //     this.prefillForm(this.visit_data);
            // }
        } else {
            // Handle case where no roles were returned, or an error occurred.
            cont.innerHTML = '<h3>Error fetching roles data. Please try again.</h3>';
        }
    }

    ViewReturn(loader = '') {
        const title = this.mode === 'create' ? 'Create Visit' : 'Update Visit';
        return `
        <div class="container create_visit_popup">

        <br-form class="slides" callback="CreateVisit">
        <div class="slide">
            <div>
                <p class="heading">${title}</p>
                <p class="subHead">${this.patient_name}</p>
            </div>
            <div class="input_group">

            <br-select required fontSize="13px" label="Visit Type" name="type" placeholder="Select Visit Type"
                    styles="
                ${this.input_style()}
            " labelStyles="font-size: 12px;">
            </br-select>
                
                
            <br-select required fontSize="13px" label="Visit Priority" name="priority" placeholder="Select Visit Priority"
                    styles="
                ${this.input_style()}
            " labelStyles="font-size: 12px;">
            </br-select>

                
                <br-select required fontSize="13px" label="Department" name="department" placeholder="Select Department"
                    styles="
                    ${this.input_style()}
            " labelStyles="font-size: 12px;">
            </br-select>


                <br-select required fontSize="13px" label="Doctors" name="doctors" placeholder="Select Doctors" styles="
                ${this.input_style()}
            " labelStyles="font-size: 12px;">
                </br-select>


                <div class="btn_cont">
                <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                <br-button loader_width="23" class="btn_next" type="submit">${this.mode === 'create' ? 'Submit' : 'Update'}</br-button>
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

    update_view_after_loading(departments, doctors) {
        const title = this.mode === 'create' ? 'Create Visit' : 'Update Visit';
        return `
        <br-form class="slides anima" callback="CreateVisit">
        <div class="slide">
            <div>
                <p class="heading">${title}</p>
                <p class="subHead">${this.patient_name}</p>

            </div>
            <div class="input_group">


                <br-select ${this.mode === 'update' ? 'value="' + (this.visit_data.type??'') + '"' : ''} required fontSize="13px" label="Visit Type" name="type" placeholder="Select Visit Type"
                    styles="
                    ${this.input_style()}
            " labelStyles="font-size: 12px;">
                    ${visit_type.map(type => `<br-option type="checkbox" value="${type.value}">${type.label}</br-option>`).join('')}
                </br-select>
                
                
                <br-select ${this.mode === 'update' ? 'value="' + (this.visit_data.priority??'') + '"' : ''} required fontSize="13px" label="Visit Priority" name="priority" placeholder="Select Visit Priority"
                    styles="
                    ${this.input_style()}
            " labelStyles="font-size: 12px;">
                    ${visit_priority.map(priority => `<br-option type="checkbox" value="${priority.value}">${priority.label}</br-option>`).join('')}
                </br-select>



                <br-select ${this.mode === 'update' ? 'value="' + (this.visit_data.department_id??'') + '"' : ''} required fontSize="13px" search='true' label="Department" name="department" placeholder="Select Department"
                    styles="
                    ${this.input_style()}
            " labelStyles="font-size: 12px;">
                    ${departments ? departments : ''}
                </br-select>


                <br-select ${this.mode === 'update' ? 'value="' + (this.visit_data.doctor_id??'') + '"' : ''} required fontSize="13px" search='true' label="Doctors" name="doctors" placeholder="Select Doctors" styles="
                ${this.input_style()}
            " labelStyles="font-size: 12px;">
                    ${doctors ? doctors : ''}
                </br-select>


                <div class="btn_cont">
                <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                <br-button loader_width="23" class="btn_next" type="submit">${this.mode === 'create' ? 'Submit' : 'Update'}</br-button>
                </div>


            </div>
        </div>
    </br-form>`;
    }

    // prefillForm(visitData) {
    //     // Helper function to set select value
    //     const setSelectValue = (name, value) => {
    //         const select = document.querySelector(`br-select[name="${name}"]`);
    //         if (select) {
    //             select.setAttribute('value', value);
    //         }
    //     };

    //     // Pre-fill form fields with visit data
    //     setSelectValue('type', visitData.type);
    //     setSelectValue('priority', visitData.priority);
    //     setSelectValue('department', visitData.department_id);
    //     setSelectValue('doctors', visitData.doctor_id);
    // }

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

        if (this.mode === 'update') {
            data.visit_id = this.visit_data.id;
        }

        try {
            const endpoint = this.mode === 'create' ? '/api/patient/create_visit' : '/api/patient/update_visit';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${this.mode} visit. Server Error`);
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
                // After successful creation/update, clear the popup and close it
                const popup_cont = document.querySelector('.popup');
                popup_cont.innerHTML = ''; // Clear the popup and close it
                popup_cont.classList.remove('active');

                if (this.mode === 'create') {
                    dashboardController.viewPatientView.PreRender();
                } else {
                    // Refresh the current visit view
                    dashboardController.singleVisitView.PreRender({ id: this.visit_data.id });
                }
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

    input_style() {
        return `
            border-radius: var(--input_main_border_r);
            width: 300px;
            padding: 10px;
            height: 41px;
            background-color: transparent;
            border: 2px solid var(--input_border);
                `;
    }
}
