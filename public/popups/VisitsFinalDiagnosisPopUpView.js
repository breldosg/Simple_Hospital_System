import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, notify, searchInArray } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitFinalDiagnosisPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.added_diagnosis = new Set();
        this.visit_id = '';
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

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners()
    }

    ViewReturn() {
        return `
<div class="container final_diagnosis_popUp">

    <div class="cont_heading">
        <p class="heading">Final Diagnosis</p>
        <div class="close_btn" id="confirm_cancel">
            <span class="switch_icon_close"></span>
        </div>
    </div>

    <div class="body">
        <div class="top">
            <br-input placeholder="Enter diagnosis" option="true" label="Enter Diagnosis"
                type="text" styles="
        border-radius: var(--input_main_border_r);
        width: 440px;
        padding: 10px;
        height: 41px;
        background-color: transparent;
        border: 2px solid var(--input_border);
        " dropDownStyles="border: 2px solid var(--input_border);" dropDownBorder_radius="var(--input_main_border_r)"
                labelStyles="font-size: 12px;" id="final_diagnosis_input"></br-input>

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
        const card_list = document.querySelector('.final_diagnosis_popUp .card_list');
        const submitBtn = document.querySelector('.final_diagnosis_popUp #submit_btn');
        submitBtn.classList.add('disabled');
        card_list.innerHTML = this.exampleCard();
    }

    handleDataAdded(input_value) {
        const submitBtn = document.querySelector('.final_diagnosis_popUp #submit_btn');
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
        const card_list = document.querySelector('.final_diagnosis_popUp .card_list');
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
        const cancel_btn = document.querySelector('.final_diagnosis_popUp #confirm_cancel');

        cancel_btn.addEventListener('click', () => {
            this.close();
        });

        const final_diagnosis_input = document.querySelector('.final_diagnosis_popUp #final_diagnosis_input');

        const debouncedFunction = debounce(() => {
            let value = final_diagnosis_input.getValue();

            if (value == null) {
                value = '';
            }

            // Call your search function here
            const found_options = searchInArray(diagnosisArray, value, null, 100);
            // console.log(found_options);

            if (found_options.length >= 1) {
                final_diagnosis_input.updateOption(found_options);
            }

        }, 800);

        final_diagnosis_input.addEventListener('input', () => {

            debouncedFunction();

        });

        const add_to_added_list_btn = document.querySelector('.final_diagnosis_popUp #add_to_added_list_btn');

        add_to_added_list_btn.addEventListener('click', () => {
            var input_value = final_diagnosis_input.getValue();
            final_diagnosis_input.reset();

            if (input_value == null) {
                notify('top_left', 'No diagnosis Selected', 'warning');
                return;
            }

            this.handleDataAdded(input_value)

        })

        const submit_btn = document.querySelector('.final_diagnosis_popUp #submit_btn');
        submit_btn.addEventListener('click', () => { this.save_final_diagnosis_note() });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async save_final_diagnosis_note() {
        const btn_submit = document.querySelector('.final_diagnosis_popUp br-button[type="submit"]');
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
            const response = await fetch('/api/patient/create_delete_final_diagnosis', {
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
                dashboardController.visitFinalDiagnosisCardView.PreRender({
                    visit_id: this.visit_id,
                    data: result.data,
                    state: this.state,
                });
                console.log('final');

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
}
