import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, debounce, notify, searchInArray } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitsPreliminaryDiagnosisPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.added_diagnosis = new Set();
        this.visit_id = '';
        applyStyle(this.style());
        // window.save_clinical_note = this.save_clinical_note.bind(this);
    }

    async PreRender(params = '') {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.visit_id = params.visit_id ? params.visit_id : '';
        this.state = params.state ? params.state : 'creation';
        this.added_diagnosis.clear();
        this.visit_status = params.visit_status ? params.visit_status : 'checked_out';

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners()
    }

    ViewReturn() {
        return `
<div class="container add_preliminary_diagnosis_popUp">

    <div class="cont_heading">
        <p class="heading">Preliminary Diagnosis</p>
        <div class="close_btn" id="confirm_cancel">
            <span class="switch_icon_close"></span>
        </div>
    </div>

    <div class="body">
        <div class="top">
            <br-input placeholder="Enter diagnosis" option="true" label="Enter Diagnosis" type="text" styles="${this.input_styles()}" 
                dropDownStyles="border: 2px solid var(--input_border);" dropDownBorder_radius="var(--input_main_border_r)"
                labelStyles="font-size: 12px;" id="preliminary_diagnosis_input"></br-input>

            <br-button class="card-button" id="add_to_added_list_btn" type="add">Add</br-button>
        </div>

        <div class="down">
            <div class="heading_cont">
                <p class="heading">Added Diagnosis</p>
            </div>
            <div class="card_list">


                <!-- <div class="card">
                    <p class="word">Lorem ipsum dolor sit. lorem20</p>
                    <div class="btns">
                        <div class="remove_btn">
                            <span class="switch_icon_delete"></span>
                        </div>
                    </div>
                </div> -->


                <div class="example">
                    <p class="word">No Diagnosis Added</p>
                </div>



            </div>

            <div class="heading_btn">
                <br-button class="card-button disabled" id="submit_btn" type="submit">Submit</br-button>
            </div>


        </div>


    </div>

</div>

`;
    }

    handleNoDataAdded() {
        const card_list = document.querySelector('.add_preliminary_diagnosis_popUp .card_list');
        const submitBtn = document.querySelector('#submit_btn');
        submitBtn.classList.add('disabled');
        card_list.innerHTML = this.exampleCard();
    }

    handleDataAdded(input_value) {
        const submitBtn = document.querySelector('#submit_btn');
        submitBtn.classList.remove('disabled');

        this.added_diagnosis.add(input_value);
        this.createCard();

    }

    exampleCard() {
        return `<div class="example">
                    <p class="word">No Diagnosis Added</p>
                </div>`;
    }

    createCard() {
        const card_list = document.querySelector('.add_preliminary_diagnosis_popUp .card_list');
        card_list.innerHTML = '';
        this.added_diagnosis.forEach(data => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                        <p class="word">${data}</p>
                        `;
            const cont = document.createElement('div');
            cont.className = 'btns';
            const remove_btn = document.createElement('div');
            remove_btn.className = 'remove_btn';
            remove_btn.innerHTML = `
                                <span class="switch_icon_delete"></span>
                            `;

            remove_btn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.added_diagnosis.delete(data);
                card.remove();

                console.log(this.added_diagnosis);

                if (this.added_diagnosis.size <= 0) {
                    this.handleNoDataAdded()
                }
            });

            cont.appendChild(remove_btn);
            card.appendChild(cont);

            card_list.prepend(card);

        })
    }

    attachListeners() {
        const cancel_btn = document.querySelector('#confirm_cancel');

        cancel_btn.addEventListener('click', () => {
            this.close();
        });

        const preliminary_diagnosis_input = document.querySelector('#preliminary_diagnosis_input');

        const debouncedFunction = debounce(() => {
            let value = preliminary_diagnosis_input.getValue();

            if (value == null) {
                value = '';
            }

            // Call your search function here
            const found_options = searchInArray(diagnosisArray, value, null, 100);
            // console.log(found_options);

            if (found_options.length >= 1) {
                preliminary_diagnosis_input.updateOption(found_options);
            }

        }, 100);

        if (preliminary_diagnosis_input) {
            // set initial options
            preliminary_diagnosis_input.updateOption(searchInArray(diagnosisArray, '', null, 100));

            // add event listener
            preliminary_diagnosis_input.addEventListener('input', () => {
                debouncedFunction();
            });
        }

        const add_to_added_list_btn = document.querySelector('#add_to_added_list_btn');

        add_to_added_list_btn.addEventListener('click', () => {
            var input_value = preliminary_diagnosis_input.getValue();
            preliminary_diagnosis_input.reset();

            if (input_value == null) {
                notify('top_left', 'No diagnosis Selected', 'warning');
                return;
            }

            this.handleDataAdded(input_value)

        })

        const submit_btn = document.querySelector('#submit_btn');
        submit_btn.addEventListener('click', () => { this.save_pre_diagnosis_note() });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async save_pre_diagnosis_note() {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);


        if (this.added_diagnosis.size <= 0) {
            notify('top_left', 'No Added Diagnosis.', 'warning');
            return;
        }

        var formData = {
            action: 'create',
            diagnosis: Array.from(this.added_diagnosis),
            visit_id: this.visit_id
        };


        try {
            const response = await fetch('/api/patient/create_delete_pre_diagnosis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Fail to Save Note. Server Error');
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
                dashboardController.visitPreDiagnosisCardView.PreRender({
                    visit_id: this.visit_id,
                    data: result.data,
                    state: this.state,
                    visit_status: this.visit_status
                });
                notify('top_left', result.message, 'success');
                console.log(result.data);

                this.close();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
        finally {
            btn_submit.removeAttribute('loading');
        }

    }

    input_styles() {
        return `
        border-radius: var(--input_main_border_r);
        width: 440px;
        padding: 10px;
        height: 41px;
        background-color: transparent;
        border: 2px solid var(--input_border);
        `
    }



    style() {
        return `
            .add_preliminary_diagnosis_popUp {
                width: 481px;
                height: fit-content;
                max-height: 650px;
                background: var(--pure_white_background);
                border-radius: var(--main_border_r);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 20px;
                position: relative;
                z-index: 1;

                .cont_heading {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--main_padding);
                    padding-bottom: 0;

                    .heading {
                        font-size: 17px;
                        font-weight: bold;
                    }

                    .close_btn {
                        width: 35px;
                        height: 35px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 5px;
                        flex: none;
                        cursor: pointer;
                    }

                    .close_btn:hover {
                        box-shadow: 0 0 5px 0 #00000019;
                    }
                }

                .body {
                    padding-bottom: var(--main_padding);
                    overflow-y: scroll;
                    display: flex;
                    flex-direction: column;
                    width: 100%;



                    .card-button {
                        border: none;
                        background-color: var(--pri_color);
                        padding: 10px 35px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 12px;
                        color: var(--white);
                        cursor: pointer;
                        border-radius: var(--input_main_border_r);
                        flex: none;

                    }

                    .top {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid var(--border_color_op1);
                        padding-inline: var(--main_padding);

                        #preliminary_diagnosis_input {
                            position: relative;
                            z-index: 2;
                        }
                    }

                    .down {
                        overflow-y: scroll;
                        display: flex;
                        flex-direction: column;
                        /* gap: 10px; */
                        padding-top: 20px;
                        width: 100%;


                        .heading_cont {
                            padding-inline: var(--main_padding);

                            .heading {
                                font-size: 14px;
                                font-weight: bold;
                            }
                        }

                        .card_list {
                            margin-top: 10px;
                            padding-inline: var(--main_padding);
                            /* padding: 5px; */
                            overflow-y: scroll;
                            display: flex;
                            flex-direction: column;
                            min-height: 200px;
                            gap: 10px;
                            width: 100%;
                            border-bottom: 2px solid var(--border_color_op1);
                            padding-bottom: 20px;



                            .card {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                /* border-radius: var(--main_border_r); */
                                border-bottom: 2px solid var(--pri_op);
                                /* box-shadow: 0 0 5px 0 #0000001d; */
                                cursor: pointer;
                                width: 100%;
                                padding: 10px 5px;

                                .word {
                                    width: 85%;
                                    font-size: 14px;
                                    font-weight: 500;
                                    white-space: nowrap;
                                    text-overflow: ellipsis;
                                    overflow: hidden;
                                    display: inline-block;
                                }

                                .remove_btn {
                                    width: 35px;
                                    height: 35px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border-radius: 5px;
                                    flex: none;
                                    cursor: pointer;
                                    background-color: var(--white_error_color_op1);

                                    span {
                                        color: var(--white_error_color);
                                        font-size: 18px;
                                    }
                                }

                                .remove_btn:hover {
                                    span {
                                        color: var(--error_color);
                                    }
                                }
                            }

                            .card:hover{
                                background-color: var(--pri_op1);
                            }

                            .example {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100%;

                                p {
                                    font-size: 14px;
                                    font-weight: 600;
                                    color: var(--black-op2);
                                }
                            }

                        }

                        .heading_btn {
                            padding-inline: var(--main_padding);
                            padding-top: 20px;



                        }
                    }

                }

            }
        `;
    }
}
