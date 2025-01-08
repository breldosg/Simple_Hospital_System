import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, getCurrentDate, notify, searchInArray } from "../script/index.js";

export class VisitsProcedurePopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.added_diagnosis = new Set();
        this.visit_id = '';
        window.render_add_procedure_form = this.render_add_procedure_form.bind(this);

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

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();

        this.render_add_procedure_form()

        this.attachListeners()
    }

    ViewReturn() {
        return `
<div class="container add_procedure_popUp">

    <div class="cont_heading">
        <p class="heading">Procedure</p>
        <div class="close_btn" id="confirm_cancel">
            <span class="switch_icon_close"></span>
        </div>
    </div>

    <div class="body">
        <div class="left">
            <div class="heading_cont">
                <p class="heading">Procedure Form</p>
            </div>
            <div class="body_left">

                <div class="add_procedure_pop_loader_cont">
                    <div class="loader"></div>
                </div>

                <br-select required fontSize="13px" search="true" label="Procedure Type"  name="type" placeholder="Select Procedure"
                    styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;">
                    
                </br-select>

                <br-select required fontSize="13px" search="true" label="Leading Surgeon"  name="type" placeholder="Select Doctor/Nurse Name"
                    styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;">
                </br-select>
                
                <br-input placeholder="Select Anesthesiologist" label="Anesthesiologist" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>


                <br-input placeholder="Select Surgeons/Assistants" label="Surgeons/Assistants" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

                <br-input placeholder="Add any instructions" label="Notes" type="textarea" styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 61px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

                <br-input type="date" label="Procedure Date" styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " value="${getCurrentDate()}" min="${getCurrentDate()}" labelStyles="font-size: 12px;"></br-input>

                <div class="btn_cont">
                    <br-button class="card-button" id="add_to_added_list_btn" type="add">Add</br-button>
                </div>

            </div>

        </div>
        
        <div class="line">
        </div>

        <div class="right">
            <div class="heading_cont">
                <p class="heading">Added Procedure</p>
            </div>
            <div class="card_list">


                <div class="card">
                    <div class="words">
                        <p class="word">Procedure type</p>
                        <div class="sub_words_cont">
                            <p class="sub_word">Kelvin Leader</p>
                            </div>
                    </div>
                    <div class="btns">
                        <div class="remove_btn">
                            <span class="switch_icon_delete"></span>
                        </div>
                    </div>
                </div>


                <!-- <div class="example">
                    <p class="word">No Diagnosis Added</p>
                </div> -->



            </div>

            <div class="heading_btn">
                <br-button class="card-button disabled" id="submit_btn" type="submit">Submit</br-button>
            </div>


        </div>


    </div>

</div>

`;
    }

    render_add_procedure_form() {
        if (globalStates.getState('add_procedure_form_exists')) {
            this.render_add_from_with_data();

        }
        else {
            globalStates.setState({ add_procedure_form_render_function: 'render_add_procedure_form' });
        }
    }

    async render_add_from_with_data() {
        const container = document.querySelector('.add_procedure_popUp .body .left');

        console.log(globalStates.getState('add_procedure_form'));
        const data = globalStates.getState('add_procedure_form');

        var staff_data = data.staff;
        var procedure_data = data.procedure;

        // create the map that create the options to be load in the component but add await
        var procedure_options = await new Promise((resolve) => {
                resolve(procedure_data.map((data) => { return `<br-option type="checkbox" value="${data.id}">${data.name}</br-option>` }).join(''));
        });

        // ${procedure_data.map((data) => { return `<br-option type="checkbox" value="${data.id}">${data.name}</br-option>` }).join('')}
        console.log(procedure_options);
        

        var form = `
        <div class="heading_cont">
                <p class="heading">Procedure Form</p>
        </div>
        <div class="body_left animation">

                <br-select required fontSize="13px" search="true" label="Procedure Type"  name="type" placeholder="Select Procedure"
                    styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;">
                    ${procedure_options}
                </br-select>

                <br-select required fontSize="13px" search="true" label="Leading Surgeon"  name="type" placeholder="Select Doctor/Nurse Name"
                    styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;">
                    ${staff_data.map((data) => { return `<br-option type="checkbox" value="${data.id}">${data.name}  (${data.role})</br-option>` }).join('')}

                </br-select>
                
                <br-input placeholder="Select Anesthesiologist" label="Anesthesiologist" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>


                <br-input placeholder="Select Surgeons/Assistants" label="Surgeons/Assistants" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

                <br-input placeholder="Add any instructions" label="Notes" type="textarea" styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 61px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

                <br-input type="date" label="Procedure Date" styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " value="${getCurrentDate()}" min="${getCurrentDate()}" labelStyles="font-size: 12px;"></br-input>

                <div class="btn_cont">
                    <br-button class="card-button" id="add_to_added_list_btn" type="add">Add</br-button>
                </div>

            </div>
        `;

        container.innerHTML = form;

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

                if (this.added_diagnosis.size <= 0) { this.handleNoDataAdded() }
            }); cont.appendChild(remove_btn);
            card.appendChild(cont); card_list.prepend(card);
        })
    }

    attachListeners() {
        const
            cancel_btn = document.querySelector('#confirm_cancel'); cancel_btn.addEventListener('click', () => {
                this.close();
            });

        // const preliminary_diagnosis_input = document.querySelector('#preliminary_diagnosis_input');

        // const debouncedFunction = debounce(() => {
        //     let value = preliminary_diagnosis_input.getValue();

        //     if (value == null) {
        //         value = '';
        //     }

        //     // Call your search function here
        //     const found_options = searchInArray(diagnosisArray, value, null, 100);
        //     // console.log(found_options);

        //     if (found_options.length >= 1) {
        //         preliminary_diagnosis_input.updateOption(found_options);
        //     }

        // }, 800);

        // preliminary_diagnosis_input.addEventListener('input', () => {

        //     debouncedFunction();

        // });

        // const add_to_added_list_btn = document.querySelector('#add_to_added_list_btn');

        // add_to_added_list_btn.addEventListener('click', () => {
        //     var input_value = preliminary_diagnosis_input.getValue();
        //     preliminary_diagnosis_input.reset();

        //     if (input_value == null) {
        //         notify('top_left', 'No diagnosis Selected', 'warning');
        //         return;
        //     }

        //     this.handleDataAdded(input_value)

        // })

        // const submit_btn = document.querySelector('#submit_btn');
        // submit_btn.addEventListener('click', () => { this.save_pre_diagnosis_note() });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async save_pre_diagnosis_note() {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);


        if (this.added_diagnosis.size <= 0) { notify('top_left', 'No Added Diagnosis.', 'warning'); return; } var
            formData = { action: 'create', diagnosis: Array.from(this.added_diagnosis), visit_id: this.visit_id }; try {
                const response = await fetch('/api/patient/create_delete_pre_diagnosis', {
                    method: 'POST', headers:
                        { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
                }); if (!response.ok) {
                    throw new
                        Error('Fail to Save Note. Server Error');
                } const result = await response.json(); if (result.success) {
                    dashboardController.visitPreDiagnosisCardView.PreRender({
                        visit_id: this.visit_id, data: result.data, state:
                            this.state,
                    }); notify('top_left', result.message, 'success'); console.log(result.data); this.close();
                } else {
                    notify('top_left', result.message, 'warning');
                }
            } catch (error) {
                notify('top_left', error.message, 'error');
            } finally { btn_submit.removeAttribute('loading'); }
    }
}