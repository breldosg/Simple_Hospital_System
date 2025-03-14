import { dashboardController } from "../controller/DashboardController.js";
import { doctor_type, visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { getCurrentDate, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class CreateRadiologyExaminationPopUp {
    constructor() {
        window.CreateRadiologyExaminationPopUp = this.CreateRadiologyExamination.bind(this);
        this.patient_id = null;
        this.isUpdate = false;
        this.radiologyId = null;
    }

    async PreRender(params = '') {
        console.log(params);
        // Set update mode if radiologyId is provided
        this.isUpdate = !!params.id;
        this.radiologyId = params.id;

        this.radiologyData = null;
        if (this.isUpdate) {
            this.radiologyData = {
                id: params.id,
                name: params.name,
                category: params.category,
                status: params.status
            };
        }

        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn('active');

        this.main_container = document.querySelector('.create_radiology_popup');

        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
        const data = await this.fetchData(); // Wait for fetchData to complete


        if (data) {
            const options_elements = (dataArray) => {
                if (!dataArray || !Array.isArray(dataArray)) {
                    return ""; // Return empty string if data is not an array
                }

                var Elem = "";
                dataArray.forEach(item => {
                    Elem += `
                        <br-option type="checkbox" value="${item.id}">${item.name}</br-option>
                    `;
                });
                return Elem;
            };

            // Check the structure of the data and extract categories
            var categories_data = data.categories || data || [];



            // Replace loader and insert the content
            this.main_container.innerHTML = this.update_view_after_loading(
                options_elements(categories_data),
                this.radiologyData
            );
            this.attachListeners();
        } else {
            // Handle case where no data was returned, or an error occurred.
            this.main_container.innerHTML = '<h3>Error fetching data. Please try again.</h3>';
        }
    }

    ViewReturn(loader = '') {
        return `
        <div class="container create_radiology_popup">
            <div class="slides anima" callback="CreateRadiologyExaminationPopUp">
                <div class="slide">
                    <div>
                        <p class="heading"></p>
                    </div>
                    <div class="input_group">

                        <br-input required name="name" label="Name" type="text" value="" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>

                        <br-select search required fontSize="13px" label="Category" name="category" placeholder="Select Category"
                            styles="${this.input_styles()}" labelStyles="font-size: 12px;" value="">
                            
                        </br-select>

                        <br-select required name="status" fontSize="13px" label="Status" placeholder="Select Status" styles="${this.input_styles()}" labelStyles="font-size: 12px;" value="">
                            <br-option type="checkbox" value="active">Active</br-option>
                            <br-option type="checkbox" value="inactive">Deactivate</br-option>
                        </br-select>

                        <div class="btn_cont">
                            <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                            <br-button loader_width="23" class="btn_next" type="submit"></br-button>
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

    update_view_after_loading(categories, radiologyData = null) {
        const title = this.isUpdate ? "Update Radiology Exam" : "Create Radiology Exam";
        const submitText = this.isUpdate ? "Update" : "Submit";

        return `
        <br-form class="slides anima" callback="CreateRadiologyExaminationPopUp">
            <div class="slide">
                <div>
                    <p class="heading">${title}</p>
                </div>
                <div class="input_group">

                    <br-input required name="name" label="Name" type="text" value="${radiologyData?.name || ''}" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>

                    <br-select search required fontSize="13px" label="Category" name="category" placeholder="Select Category"
                        styles="${this.input_styles()}" labelStyles="font-size: 12px;" value="${radiologyData?.category || ''}">
                        ${categories}
                    </br-select>

                    <br-select required name="status" fontSize="13px" label="Status" placeholder="Select Status" styles="${this.input_styles()}" labelStyles="font-size: 12px;" value="${radiologyData?.status || 'active'}">
                    
                        <br-option type="checkbox" value="active">Active</br-option>
                        <br-option type="checkbox" value="inactive">Deactivate</br-option>
                    </br-select>

                    <div class="btn_cont">
                        <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                        <br-button loader_width="23" class="btn_next" type="submit">${submitText}</br-button>
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

    async CreateRadiologyExamination(data) {
        const btn_submit = this.main_container.querySelector('br-button[type="submit"]');
        // btn_submit.setAttribute('loading', true);

        const endpoint = this.isUpdate ? '/api/radiology/update_examination' : '/api/radiology/create_examination';

        if (this.isUpdate) {
            data['id'] = this.radiologyId;
        }
        console.log(data);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${this.isUpdate ? 'update' : 'create'} radiology examination. Server Error`);
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
                this.close_popup();

                // Refresh the radiology view
                dashboardController.radiologyExamsListView.fetchAndRenderData();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            btn_submit.setAttribute('loading', false);
        }
    }

    async fetchData() {
        try {
            const response = await fetch('/api/radiology/get_category', {
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

    close_popup() {
        const popup_cont = document.querySelector('.popup');
        popup_cont.innerHTML = '';
        popup_cont.classList.remove('active');
    }


    input_styles() {
        return `
            border-radius: var(--input_main_border_r);
            width: 400px;
            padding: 10px;
            height: 41px;
            background-color: transparent;
            border: 2px solid var(--input_border);
        `;
    }
}