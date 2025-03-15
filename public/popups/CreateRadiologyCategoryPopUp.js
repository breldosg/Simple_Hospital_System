import { dashboardController } from "../controller/DashboardController.js";
import { doctor_type, visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { getCurrentDate, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class CreateRadiologyCategoryPopUp {
    constructor() {
        window.CreateRadiologyCategoryPopUpFunction = this.CreateRadiologyCategory.bind(this);
        this.patient_id = null;
        this.isUpdate = false;
        this.categoryId = null;
        this.categoryData = null;
    }

    async PreRender(params = '') {
        console.log(params);
        // Set update mode if radiologyId is provided
        this.isUpdate = !!params.id;
        this.categoryId = params.id;

        this.categoryData = null;
        if (this.isUpdate) {
            this.categoryData = {
                id: params.id,
                name: params.name,
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

        this.main_container = document.querySelector('.create_radiology_category_popup');
        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {


        // Replace loader and insert the content
        this.main_container.innerHTML = this.update_view_after_loading(
            this.categoryData
        );
        this.attachListeners();

    }

    ViewReturn(loader = '') {
        return `
        <div class="container create_radiology_category_popup">
            <div class="slides anima" >
                <div class="slide">
                    <div>
                        <p class="heading"></p>
                    </div>
                    <div class="input_group">

                        <br-input required name="name" label="Name" type="text" value="" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>

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

    update_view_after_loading(categoryData = null) {
        const title = this.isUpdate ? "Update Radiology Category" : "Create Radiology Category";
        const submitText = this.isUpdate ? "Update" : "Submit";

        return `
        <br-form class="slides anima" callback="CreateRadiologyCategoryPopUpFunction">
            <div class="slide">
                <div>
                    <p class="heading">${title}</p>
                </div>
                <div class="input_group">

                    <br-input required name="name" label="Name" type="text" value="${categoryData?.name || ''}" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>

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

    async CreateRadiologyCategory(data) {
        const btn_submit = this.main_container.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        const endpoint = this.isUpdate ? '/api/radiology/update_radiology_category' : '/api/radiology/create_radiology_category';

        if (this.isUpdate) {
            data['id'] = this.categoryId;
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
                throw new Error(`Failed to ${this.isUpdate ? 'update' : 'create'} radiology category. Server Error`);
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
                dashboardController.radiologyExamsCategoryListView.fetchAndRenderData();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            btn_submit.setAttribute('loading', false);
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


    styles() {
        return `
            
     .create_radiology_category_popup {
        padding: 30px;
        border-radius: var(--main_border_r);
        background-color: var(--pure_white_background);
        position: relative;
        min-width: 500px;
        min-height: 200px;

        .loader_cont {
            border-radius: var(--main_border_r);
            position: absolute;
        }

        .slides.anima {
            animation: text-focus-in 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
        }

        .slides {
            display: flex;
            width: 440px;

            .slide {
                display: flex;
                flex-direction: column;
                gap: 20px;
                /* margin-top: 20px; */
                padding: 10px;
                width: 440px;
                flex: none;

                .heading {
                    font-size: 25px;
                    font-weight: bold;
                }

                .input_group {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    width: 100%;

                    .inp_cont {
                        display: flex;
                        flex-direction: column;
                        gap: 2px;

                        label {
                            font-size: 13px;
                            /* font-weight: bold; */
                        }

                        input,
                        select {
                            border-radius: var(--input_main_border_r);
                            width: 300px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                        }

                        .password-container {
                            border-radius: var(--input_main_border_r);
                            background-color: var(--input_background);
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            width: 300px;
                            padding: 10px;
                            height: 41px;
                            overflow: hidden;
                            border: 2px solid var(--input_border);

                            .password-input {
                                width: calc(100% - 40px);
                                padding: 0px;
                                height: 100%;
                                border: none;
                                background: transparent;
                                border-radius: 0;
                            }

                            .toggle-password {
                                cursor: pointer;
                                font-size: 18px;
                                width: 30px;
                                height: 41px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                /* background-color: rebeccapurple; */
                            }
                        }
                    }
                }

                .btn_cont {
                    display: flex;
                    width: 100%;
                    justify-content: end;
                    padding-top: 20px;
                    gap: 20px;

                    .btn_next {
                        border: none;
                        background-color: var(--pri_color);
                        padding: 10px 35px;
                        font-weight: bold;
                        font-size: 12px;
                        color: var(--white);
                        cursor: pointer;
                        border-radius: var(--input_main_border_r);
                    }

                    .cancel {
                        background-color: var(--error_color);
                    }
                }
            }
        }
    }

        `;
    }
}