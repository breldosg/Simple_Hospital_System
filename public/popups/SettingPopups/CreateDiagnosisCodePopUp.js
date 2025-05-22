import { applyStyle } from "../../script/index.js";
import { dashboardController } from "../../controller/DashboardController.js";
import { screenCollection } from "../../screens/ScreenCollection.js";
import { notify } from "../../script/index.js";
import { frontRouter } from "../../script/route.js";

export class CreateDiagnosisCodePopUp {
    constructor() {
        window.CreateDiagnosisCodePopUp = this.CreateDiagnosisCode.bind(this);
        this.patient_id = null;
        this.isUpdate = false;
        this.serviceId = null;

        applyStyle(this.style());
    }

    async PreRender(params = '') {
        console.log(params);
        // Set update mode if serviceId is provided
        this.isUpdate = !!params.id;
        this.serviceId = params.id;

        this.serviceData = false;
        if (this.isUpdate) {
            this.serviceData = {
                id: params.id,
                description: params.description,
                code: params.code
            };
        }

        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn('');

        this.main_container = document.querySelector('.create_diagnosis_code_popup');

        // Now call render which will fetch data and populate it
        this.render();
        this.attachListeners();

    }

    async render() {
        // No need to fetch categories, just render the form
    }

    ViewReturn(loader = '') {
        const title = this.isUpdate ? "Update Diagnosis Code" : "Create Diagnosis Code";
        const submitText = this.isUpdate ? "Update" : "Submit";
        return `
        <div class="container create_diagnosis_code_popup">
            <br-form class="slides anima" callback="CreateDiagnosisCodePopUp">
                <div class="slide">
                    <div>
                        <p class="heading">${title}</p>
                    </div>
                    <div class="input_group">
                        <br-input required name="code" label="Code" type="text" value="${this.serviceData?.code || ''}" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>
                        <br-input required name="description" label="Description" type="text" value="${this.serviceData?.description || ''}" styles="${this.input_styles()}" labelStyles="font-size: 12px;"></br-input>
                        <div class="btn_cont">
                            <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                            <br-button loader_width="23" class="btn_next" type="submit">${submitText}</br-button>
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

    async CreateDiagnosisCode(data) {
        const btn_submit = this.main_container.querySelector('br-button[type="submit"]');
        const endpoint = this.isUpdate ? '/api/patient/update_diagnosis_code' : '/api/patient/create_diagnosis_code';

        if (this.isUpdate) {
            data['id'] = this.serviceId;
        }
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Failed to ${this.isUpdate ? 'update' : 'create'} service. Server Error`);
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
                this.close_popup();
                // Refresh the service view (update this to your actual service list view)
                if (dashboardController.diagnosisCodesManagementSettingView) {
                    dashboardController.diagnosisCodesManagementSettingView.render();
                }
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


    style() {
        return `
    .create_diagnosis_code_popup {
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