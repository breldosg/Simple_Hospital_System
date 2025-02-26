import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit, side_slide_selector_data, side_slide_selector_data_role_icon_name } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, getCurrentDate, notify, searchInArray } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitsProcedurePopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.added_diagnosis = new Set();
        this.visit_id = '';
        // window.render_add_procedure_form = this.render_add_procedure_form.bind(this);

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

        this.main_container = document.querySelector('.add_procedure_popUp');


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

                <br-input id="procedure_name" required disable placeholder="Select Procedure" label="Procedure Name" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>
                
                <br-input id="leading_Surgeon" required disable label="Leading Surgeon" placeholder="Select Doctor/Nurse Name" type="text"
                    styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>
                
                
                <br-input id="anesthesiologist" required disable placeholder="Select Anesthesiologist" label="Anesthesiologist" type="text"
                    styles="
                    border-radius: var(--input_main_border_r);
                    width: 440px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>
                
                
                <br-input id="assistants" required disable placeholder="Select Surgeons/Assistants" label="Surgeons/Assistants" type="text"
                    styles="
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

        <div class="top_container  animation">
                

        </div>

    </div>

</div>

`;
    }

    sideSlideSelector(data) {

        const heading_cont = document.createElement("div");
        heading_cont.className = "heading_cont";
        heading_cont.innerHTML = `<p class="heading">${data.heading}</p>`;

        const close_btn = document.createElement("div");
        close_btn.className = "close_btn";
        close_btn.innerHTML = `<span class="switch_icon_close"></span>`;
        close_btn.addEventListener('click', () => {
            console.log('close_clicked');
            this.close_top_container();
        });
        heading_cont.appendChild(close_btn);

        const body_left = document.createElement("div");
        body_left.className = "body_left";

        const search_cont = document.createElement("div");
        search_cont.className = "search_cont";

        const search_inp = document.createElement("input");
        search_inp.className = "search";
        search_inp.placeholder = data.search_inp;
        search_inp.type = "text";
        search_inp.addEventListener('input', () => {
            debounce(this.searchInProcedureItemList(list_cont, json_data[data.search_data_name], search_inp.value, data), 300);
        });
        search_cont.appendChild(search_inp);

        const search_btn = document.createElement("div");
        search_btn.className = "search_btn";
        search_btn.innerHTML = `
                            <span class='switch_icon_magnifying_glass'></span>
                            <div class="loader"></div>
                            `;
        search_btn.addEventListener('click', () => {
            console.log('search_btn_clicked');
        });
        search_cont.appendChild(search_btn);

        body_left.prepend(search_cont);

        const list_cont = document.createElement("div");
        list_cont.className = "list_cont";
        body_left.appendChild(list_cont);


        const btn_cont = document.createElement("div");
        btn_cont.className = "btn_cont";

        const add_btn = document.createElement("br-button");
        add_btn.className = "card-button";
        add_btn.id = "add_to_added_list_btn";
        add_btn.type = "add";
        add_btn.innerHTML = "Add";
        add_btn.addEventListener('click', () => {
            console.log('add_to_added_list_btn_clicked');
        });
        btn_cont.appendChild(add_btn);
        body_left.appendChild(btn_cont);


        const container = this.main_container.querySelector('.top_container');
        container.innerHTML = '';
        container.prepend(heading_cont);
        container.appendChild(body_left);
        container.classList.add('in');

        const json_data = globalStates.getState('add_procedure_form');

        this.searchInProcedureItemList(list_cont, json_data[data.search_data_name], '', data);


    }

    searchInProcedureItemList(container, data_list, query, section_data) {
        container.innerHTML = '';
        var set_name = section_data.selected_data;
        var set_size_limit = section_data.max_data;

        data_list.forEach((item) => {

            if (item.name.toLowerCase().includes(query.toLowerCase())) {
                const item_card = document.createElement('div');
                item_card.className = "item";

                if (this[set_name] && this[set_name].has(item.id)) {
                    item_card.classList.add('selected');
                }

                var role = section_data.search_data_name == 'procedure' ? 'procedure' : item.role.toLowerCase();

                item_card.innerHTML = `
                <div class="icon">
                    <span class='${side_slide_selector_data_role_icon_name[role]}'></span>
                </div>
                <div class="words">
                    <p class="name">${item.name}</p>
                    <p class="sub_word">${item.category || item.role}</p>
                </div>
                `;

                item_card.addEventListener('click', () => {

                    // Check if the variable exists on the instance
                    if (!this[set_name]) {
                        this[set_name] = new Set();
                    }

                    if (!this[set_name].has(item.id) && this[set_name].size < set_size_limit) {
                        this[set_name].add(item.id);
                        console.log('added', item);
                        item_card.classList.add('selected');
                    }
                    else {
                        this[set_name].delete(item.id);
                        console.log('removed', item);
                        item_card.classList.remove('selected');
                    }


                });

                container.appendChild(item_card);
            }
        })








    }

    close_top_container() {
        const container = this.main_container.querySelector('.top_container');
        container.classList.add('out');
        container.addEventListener('animationend', () => {
            container.classList.remove('out');
            container.classList.remove('in');
        }, { once: true });
    }

    handleNoDataAdded() {
        const card_list = this.main_container.querySelector('.card_list');
        const submitBtn = this.main_container.querySelector('#submit_btn');
        submitBtn.classList.add('disabled');
        card_list.innerHTML = this.exampleCard();
    }

    handleDataAdded(input_value) {
        const submitBtn = this.main_container.querySelector('#submit_btn');
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
        const card_list = this.main_container.querySelector('.card_list');
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
        const cancel_btn = this.main_container.querySelector('#confirm_cancel');
        cancel_btn.addEventListener('click', () => {
            this.close();
        });

        const procedure_name = this.main_container.querySelector('#procedure_name');
        procedure_name.addEventListener('click', () => {
            this.sideSlideSelector(side_slide_selector_data.procedure);
        });

        const leading_Surgeon = this.main_container.querySelector('#leading_Surgeon');
        leading_Surgeon.addEventListener('click', () => {
            this.sideSlideSelector(side_slide_selector_data.surgeon);
        });

        const anesthesiologist = this.main_container.querySelector('#anesthesiologist');
        anesthesiologist.addEventListener('click', () => {
            this.sideSlideSelector(side_slide_selector_data.anesthesiologist);
        });

        const assistants = this.main_container.querySelector('#assistants');
        assistants.addEventListener('click', () => {
            this.sideSlideSelector(side_slide_selector_data.assistants);
        });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async save_procedure_note() {
        const btn_submit = this.main_container.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);


        if (this.added_diagnosis.size <= 0) { notify('top_left', 'No Added Diagnosis.', 'warning'); return; } var
            formData = { action: 'create', diagnosis: Array.from(this.added_diagnosis), visit_id: this.visit_id }; try {
                const response = await fetch('/api/patient/create_delete_pre_diagnosis', {
                    method: 'POST', headers:
                        { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
                }); if (!response.ok) {
                    throw new
                        Error('Fail to Save Note. Server Error');
                } const result = await response.json();

                if (result.status == 401) {
                    frontRouter.navigate('/login');
                }

                if (result.success) {
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
