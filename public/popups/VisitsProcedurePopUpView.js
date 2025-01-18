import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit, visitsProcedurePopUpViewStageDatas, side_slide_selector_data_role_icon_name, visitsProcedurePopUpViewStages } from
    "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, getCurrentDate, notify, searchInArray } from "../script/index.js";

export class VisitsProcedurePopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.added_diagnosis = new Set();
        this.visit_id = '';
        this.currentStage = 0;
        window.add_procedure_form_render_function = this.add_procedure_form_render_function.bind(this);

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
        this.stageUpdater();

    }

    add_procedure_form_render_function() {
        this.searchInProcedureItemList();
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

        <div class="progress_bar_container_out">
            <div class="progress_bar_container">

                <div class="progress_line">
                    <div class="fill_line"></div>
                </div>

                <div class="stages_cont">
                    <div class="stage_out">
                        <div class="stage passed">
                            <div class="stage_dot"></div>
                            <div class="stage_title">Design</div>
                        </div>
                    </div>
                    <div class="stage_out">
                        <div class="stage active">
                            <div class="stage_dot"></div>
                            <div class="stage_title">Graphic</div>
                        </div>
                    </div>
                    <div class="stage_out">
                        <div class="stage">
                            <div class="stage_dot"></div>
                            <div class="stage_title">Pussy</div>
                        </div>

                    </div>
                    <div class="stage_out">
                        <div class="stage">
                            <div class="stage_dot"></div>
                            <div class="stage_title">Fuck</div>
                        </div>
                    </div>
                </div>


            </div>
        </div>

        <div class="body_container">


        </div>

        <div class="btn_cont">
            <br-button class="card-button" id="next_stage">Add</br-button>
        </div>

    </div>

</div>

`;
    }


    stageUpdater() {

        const stage_line = this.main_container.querySelector('.top_stage_line');

        var data = visitsProcedurePopUpViewStageDatas[visitsProcedurePopUpViewStages[this.currentStage]];
        console.log(data);

        const container = this.main_container.querySelector('.body_container');
        container.innerHTML = '';

        const heading_cont = document.createElement("div");
        heading_cont.className = "heading_cont";
        heading_cont.innerHTML = `<p class="heading">${data.heading}</p>`;
        container.appendChild(heading_cont);



        if (data.search.available) {
            const search_cont = document.createElement("div");
            search_cont.className = "search_cont";

            const search_inp = document.createElement("input");
            search_inp.className = "search";
            search_inp.placeholder = data.search.placeholder;
            search_inp.type = "text";
            search_inp.addEventListener('input', () => {
                if (globalStates.hasState('add_procedure_form')) {
                    debounce(this.searchInProcedureItemList(search_inp.value, data), 300);
                }
                else {
                    globalStates.setState({ add_procedure_form_render_function: 'add_procedure_form_render_function' });
                }
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

            container.appendChild(search_cont);
        }

        const list_cont = document.createElement("div");
        list_cont.className = "list_cont";
        container.appendChild(list_cont);

        if (globalStates.hasState('add_procedure_form')) {
            this.searchInProcedureItemList();
        }
        else {
            globalStates.setState({ add_procedure_form_render_function: 'add_procedure_form_render_function' });
        }

    }

    searchInProcedureItemList(query = '') {
        var container = this.main_container.querySelector('.list_cont');
        container.innerHTML = '';
        var section_data = visitsProcedurePopUpViewStageDatas[visitsProcedurePopUpViewStages[this.currentStage]];
        var set_name = section_data.selected_data;
        var set_size_limit = section_data.max_data;
        const json_data = globalStates.getState('add_procedure_form');
        if (section_data.search_data_name == 'other') { 
            
        }
        else {
            var data_list = json_data[section_data.search_data_name];
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
                            console.log('added', item); item_card.classList.add('selected');
                        } else {
                            this[set_name].delete(item.id);
                            console.log('removed', item); item_card.classList.remove('selected');
                        }
                    });
                    container.appendChild(item_card);
                }
            })
        }
    }

    close_top_container() {
        const container = this.main_container.querySelector('.top_container');
        container.classList.add('out'); container.addEventListener('animationend', () => {
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

            card.innerHTML = `<p class="word">${data}</p>`;

            const cont = document.createElement('div');
            cont.className = 'btns';
            const remove_btn = document.createElement('div');
            remove_btn.className = 'remove_btn';
            remove_btn.innerHTML = ` <span class="switch_icon_delete"></span> `;

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

        const next_stage = this.main_container.querySelector('#next_stage');
        next_stage.addEventListener('click', () => {

            console.log(this.currentStage);

            // this.currentStage=next_stage;
            if (this.currentStage < visitsProcedurePopUpViewStages.length - 1) {
                this.currentStage++;
                this.stageUpdater();
            } else {
                // this.save_procedure_note();
                notify('top_left', 'You Have No Stage Remain', 'warning');

            }
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
                } const result = await response.json(); if (result.success) {
                    dashboardController.visitPreDiagnosisCardView.PreRender({
                        visit_id: this.visit_id, data: result.data, state:
                            this.state,
                    }); notify('top_left', result.message, 'success'); console.log(result.data); this.close();
                }
                else { notify('top_left', result.message, 'warning'); }
            } catch (error) {
                notify('top_left', error.message, 'error');
            } finally { btn_submit.removeAttribute('loading'); }
    }
}



/* <div class="top_stage_line">

<div class="back_line">
    <div class="back_line_fill"></div>

    <div class="stage passed active">
        <div class="word_cont">
            <p class="stage_word">Procedure</p>
        </div>
    </div>

    <div class="stage sec">
        <div class="word_cont">
            <p class="stage_word">Surgeon</p>
        </div>
    </div>

    <div class="stage thrd">
        <div class="word_cont">
            <p class="stage_word">Anesthesiologist</p>
        </div>
    </div>

    <div class="stage frth">
        <div class="word_cont">
            <p class="stage_word">Assistants</p>
        </div>
    </div>

    <div class="stage ffth">
        <div class="word_cont">
            <p class="stage_word">Other</p>
        </div>
    </div>

</div>


</div> */