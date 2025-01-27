import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit, visitsProcedurePopUpViewStageDatas, side_slide_selector_data_role_icon_name, visitsProcedurePopUpViewStages } from
    "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, debounce, getCurrentDate, notify, searchInArray } from "../script/index.js";

export class VisitsProcedurePopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.visit_id = '';
        this.currentStage = 0;
        this.is_add_procedure_side = false;
        this.selected_data_list = new Set();
        window.add_procedure_form_render_function = this.add_procedure_form_render_function.bind(this);

        // window.save_clinical_note = this.save_clinical_note.bind(this);
    }

    async PreRender(params = '') {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }
        this.currentStage = 0;

        this.visit_id = params.visit_id ? params.visit_id : '';
        this.state = params.state ? params.state : 'creation';
        this.selected_data_list.clear();

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.add_procedure_popUp');


        this.attachListeners();
        this.render_selected_list_view();

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
    </div>

</div>

`;
    }

    render_selected_list_view() {
        this.is_add_procedure_side = false;

        const container = this.main_container.querySelector('.body');
        container.classList.add('body_on_list');
        if (container.classList.contains('body_when_add')) {
            container.classList.remove('body_when_add');
        }
        container.innerHTML = '';

        const heading_cont = document.createElement('div');
        heading_cont.className = 'heading_cont';
        heading_cont.innerHTML = `<p class="heading">Added Procedure (${this.selected_data_list.size})</p>`;
        // heading_cont.innerHTML = `<p class="heading">Selected Procedure (0)</p>`;
        const add_btn = document.createElement('div');
        add_btn.className = 'add_btn';
        add_btn.innerHTML = `<span class="switch_icon_add"></span>`;
        add_btn.addEventListener('click', () => {
            this.render_add_procedure_view();
            this.stageUpdater();
        });
        heading_cont.appendChild(add_btn);
        container.appendChild(heading_cont);

        const selected_procedures_cont = document.createElement('div');
        selected_procedures_cont.className = 'selected_procedures_cont';
        selected_procedures_cont.innerHTML = `
                    <div class="example">
                        <p class="word">No Procedure Added</p>
                    </div>
        `;

        const btn_cont = document.createElement('div');
        btn_cont.className = 'btn_cont';

        const save_btn = document.createElement('button');
        save_btn.className = 'card-button';
        // add id
        save_btn.id = 'confirm_save';
        save_btn.setAttribute('type', 'submit');
        if (this.selected_data_list.size <= 0) {
            save_btn.classList.add('disabled');
        }
        save_btn.id = 'save_btn';
        save_btn.innerHTML = `Save`;
        save_btn.addEventListener('click', () => {
            this.save_procedure_note();
        });
        btn_cont.appendChild(save_btn);
        container.appendChild(selected_procedures_cont);
        container.appendChild(btn_cont);


        if (this.selected_data_list.size >= 1) {
            this.render_selected_procedure_card();

        }

    }

    render_selected_procedure_card() {

        const container = this.main_container.querySelector('.selected_procedures_cont');
        container.innerHTML = '';


        async function fetch_toJson_data(side, data, compare_data) {
            const json_data = globalStates.getState('add_procedure_form');
            return json_data[side].filter(item => item.id == data[compare_data])[0].name;
        }

        async function renderAssistants(assistants) {
            const pills = await Promise.all(
                assistants.map(async (assistant) => {
                    const name = await fetch_toJson_data('staff', { assistant }, 'assistant');
                    return `<div class="pill">${name}</div>`;
                })
            );

            return pills.join('');
        }

        this.selected_data_list.forEach(async (data) => {
            const procedure_card = document.createElement('div');
            procedure_card.className = 'procedure_card';

            const top = document.createElement('div');
            top.className = 'top';
            top.innerHTML = `
                    <div class="left">
                        <p class="date">${await fetch_toJson_data('procedure', data, 'procedure')}</p>
                        <p class="created_by">${date_formatter(data.other_date)}</p>
                    </div>
                        `;

            const right = document.createElement('div');
            right.className = 'right';

            const delete_btn = document.createElement('div');
            delete_btn.className = 'delete_btn btn';
            delete_btn.id = 'delete_patient_device';
            delete_btn.innerHTML = '<span class="switch_icon_delete"></span>';
            delete_btn.addEventListener('click', () => {
                this.selected_data_list.delete(data);
                this.render_selected_list_view();
            });
            right.appendChild(delete_btn);

            top.appendChild(right);

            procedure_card.innerHTML = `
                <div class="data">
                    <p class="head">Leading Surgeon:</p>
                    <p class="description">${await fetch_toJson_data('staff', data, 'surgeon')}</p>
                </div>

                <div class="data">
                    <p class="head">Anesthesiologist Name:</p>
                    <p class="description">${await fetch_toJson_data('staff', data, 'anesthesiologist')}</p>
                </div>

                <div class="data pills">
                    <p class="head">Assistants</p>
                    <div class="pills_cont">
                        ${await renderAssistants(data.assistants)}
                    </div>
                </div>

                <div class="data note">
                    <p class="head">Note</p>
                    <p class="description scroll_bar">${data.other_note}</p>
                </div>
                `;
            procedure_card.prepend(top);

            container.appendChild(procedure_card);
        });

    }

    render_add_procedure_view() {
        this.currentStage = 0;
        this.is_add_procedure_side = true;

        visitsProcedurePopUpViewStages.forEach((stage, index) => {
            if (stage == 'other') {
                this.other_note = '';
                this.other_date = getCurrentDate();
            } else {
                this[visitsProcedurePopUpViewStageDatas[stage].selected_data] = new Set();
            }
        })

        const container = this.main_container.querySelector('.body');
        container.classList.add('body_when_add');
        if (container.classList.contains('body_on_list')) {
            container.classList.remove('body_on_list');
        }
        container.innerHTML = '';

        const progress_bar_container_out = document.createElement('div');
        progress_bar_container_out.className = 'progress_bar_container_out';

        const progress_bar_container = document.createElement('div');
        progress_bar_container.className = 'progress_bar_container';

        const progress_line = document.createElement('div');
        progress_line.className = 'progress_line';

        const fill_line = document.createElement('div');
        fill_line.className = 'fill_line';

        var stages = visitsProcedurePopUpViewStages;


        progress_line.appendChild(fill_line);
        const stages_cont = document.createElement('div');
        stages_cont.className = 'stages_cont';


        stages.forEach((stage_data, index) => {
            const stage = document.createElement('div');
            stage.className = "stage_out";
            stage.innerHTML = `
                <div class="stage ${this.currentStage == index ? 'passed' : ''} ${index == 0 ? 'active' : ''} index_${index}">
                    <div class="stage_dot"></div>
                    <div class="stage_title">${stage_data}</div>
                </div>`;

            stage.addEventListener('click', () => {
                this.currentStage = index;
                this.stageUpdater();
                // console.log(this.main_container.querySelector(`.stage.index_${this.currentStage}`));
            })

            stages_cont.appendChild(stage);

        });
        progress_bar_container.appendChild(stages_cont);



        progress_bar_container.appendChild(progress_line);
        progress_bar_container_out.appendChild(progress_bar_container);

        container.appendChild(progress_bar_container_out);

        const body_container = document.createElement('div');
        body_container.className = 'body_container';

        container.appendChild(body_container);

        const btn_cont = document.createElement('div');
        btn_cont.className = 'btn_cont';

        const previous_stage = document.createElement('button');
        previous_stage.className = 'card-button';
        previous_stage.id = 'previous_stage';
        previous_stage.innerHTML = `<span class='switch_icon_keyboard_arrow_left'></span> Back`;
        previous_stage.addEventListener('click', () => {
            if (this.currentStage > 0) {
                this.currentStage--;
                this.stageUpdater();
            }
        });



        const next_stage = document.createElement('button');
        next_stage.className = 'card-button';
        next_stage.id = 'next_stage';
        next_stage.innerHTML = `Next <span class='switch_icon_keyboard_arrow_right'>`;
        next_stage.addEventListener('click', () => {
            // this.currentStage=next_stage;
            if (this.currentStage < visitsProcedurePopUpViewStages.length - 1) {
                this.currentStage++;
                this.stageUpdater();
            } else {
                this.add_validate_to_selected_data();
            }
        });

        btn_cont.appendChild(previous_stage);
        btn_cont.appendChild(next_stage);
        container.appendChild(btn_cont);
    }

    add_validate_to_selected_data() {
        var array = {};
        var fail = false;

        this.main_container.querySelectorAll('.stage').forEach((stage) => {
            stage.classList.remove('error');
        });

        visitsProcedurePopUpViewStages.forEach((stage, index) => {
            if (stage == 'other') {
                if (!this.other_date == '') {
                    array = {
                        ...array,
                        other_note: this.other_note || '',
                        other_date: this.other_date
                    };
                } else {
                    fail = true;
                    this.main_container.querySelector(`.stage.index_${index}`).classList.add('error');
                    console.warn('No other value found');
                }

            } else {
                var data_store = visitsProcedurePopUpViewStageDatas[stage].selected_data;

                if (this[data_store] && this[data_store].size > 0) {
                    // console.log(this[data_store]);Array.from(this.added_diagnosis)
                    array = {
                        ...array,
                        [stage]: Array.from(this[data_store])
                    }
                }
                else {
                    fail = true;
                    this.main_container.querySelector(`.stage.index_${index}`).classList.add('error');
                }

            }
        })
        if (!fail) {
            this.selected_data_list.add(array);
            this.render_selected_list_view();
        }
    }

    update_next_btn_to_finish(type) {
        if (type == 'finish') {
            this.main_container.querySelector('#next_stage').innerHTML = `Add <span class='switch_icon_add'></span>`;
        } else if (type == 'next') {
            this.main_container.querySelector('#next_stage').innerHTML = `Next <span class='switch_icon_keyboard_arrow_right'>`;
        }
    }

    stageUpdater() {
        this.update_stage_bar()
        var data = visitsProcedurePopUpViewStageDatas[visitsProcedurePopUpViewStages[this.currentStage]];

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
            this.render_other_information_view(container);
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

                        if (this[set_name].has(item.id)) {
                            this[set_name].delete(item.id);
                            item_card.classList.remove('selected');
                        }
                        else {
                            if (this[set_name].size >= set_size_limit) {
                                if (set_size_limit == 1) {
                                    this.main_container.querySelector('.item.selected').classList.remove('selected');
                                    this[set_name].clear();
                                    this[set_name].add(item.id);
                                    item_card.classList.add('selected')
                                }
                                else {
                                    notify('top_left', 'You Have Reach The Max Amount.', 'warning');
                                }
                            }
                            else {
                                this[set_name].add(item.id);
                                item_card.classList.add('selected');
                            }
                        }
                    });
                    container.appendChild(item_card);
                }
            })
        }
    }

    update_stage_bar() {
        const fill_line = this.main_container.querySelector('.fill_line');

        // update width of fill_line based on current stage and total stages
        var interval = (this.currentStage / (visitsProcedurePopUpViewStages.length - 1)) * 100;

        this.interval_add = (1 / (visitsProcedurePopUpViewStages.length - 1)) * 100 / 2;
        var width = interval + this.interval_add;
        if (width > 100) {
            width = 100;
        }

        fill_line.style.width = `${width}%`;
        this.main_container.querySelector('.stage.active').classList.remove('active');

        if (this.currentStage == visitsProcedurePopUpViewStages.length - 1) {
            this.update_next_btn_to_finish('finish');
        }
        else {
            this.update_next_btn_to_finish('next');
        }

        if (this.currentStage == 0) {
            this.main_container.querySelector('#previous_stage').classList.add('hide');
        }
        else {
            this.main_container.querySelector('#previous_stage').classList.remove('hide');
        }

        var stage = this.main_container.querySelector(`.stage.index_${this.currentStage}`);
        stage.classList.add('active');
        if (!stage.classList.contains('passed')) {
            stage.classList.add('passed');
        }
    }

    exampleCard() {
        return `<div class="example">
                    <p class="word">No Diagnosis Added</p>
                </div>
                `;
    }

    render_other_information_view(container) {

        const note = document.createElement('br-input');
        note.setAttribute('placeholder', 'Add any instructions');
        note.setAttribute('label', 'Notes');
        note.setAttribute('type', 'textarea');
        note.setAttribute('styles', `
                                border-radius: var(--input_main_border_r);
                                width: 920px;
                                padding: 10px;
                                height: 210px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                `);
        note.setAttribute('labelStyles', `font-size: 12px;`);
        if (!this.other_note) {
            this.other_note = '';
        }
        note.addEventListener('input', () => {
            this.other_note = note.getValue();
        })


        const procedure_date = document.createElement('br-input');
        procedure_date.setAttribute('type', 'date');
        procedure_date.setAttribute('label', 'Procedure Date');
        procedure_date.setAttribute('styles', `
            border-radius: var(--input_main_border_r);
            width: 920px;
            padding: 10px;
            height: 41px;
            background-color: transparent;
            border: 2px solid var(--input_border);
            `);
        procedure_date.setAttribute('value', getCurrentDate());
        procedure_date.setAttribute('min', getCurrentDate());
        procedure_date.setAttribute('labelStyles', `font-size: 12px;`);

        procedure_date.addEventListener('input', () => {
            this.other_date = procedure_date.getValue();
        })

        container.appendChild(note);
        container.appendChild(procedure_date);
        note.setValue(this.other_note)
        if (!this.other_date) {
            this.other_date = getCurrentDate();
        } else {
            procedure_date.setValue(this.other_date)
        }

    }

    attachListeners() {
        const cancel_btn = this.main_container.querySelector('#confirm_cancel');
        cancel_btn.addEventListener('click', () => {
            if (this.is_add_procedure_side) {
                this.render_selected_list_view();
            } else {
                this.close();
            }
        });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async save_procedure_note() {
        const btn_submit = this.main_container.querySelector('#save_btn[type="submit"]');
        btn_submit.setAttribute('loading', true);


        if (this.selected_data_list.size <= 0) {
            notify('top_left', 'No Added Procedure.', 'warning');
            return;
        }
        var formData = {
            procedures: Array.from(this.selected_data_list),
            visit_id: this.visit_id
        };

        console.log(formData);


        try {
            const response = await fetch('/api/patient/save_procedure_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                throw new Error('Fail to Save Note. Server Error');
            }
            const result = await response.json();
            if (result.success) {
                dashboardController.visitProceduresCardView.PreRender({
                    visit_id: this.visit_id,
                    data: result.data,
                    state: this.state,
                });
                notify('top_left', result.message, 'success');
                console.log(result.data);
                this.close();
            }
            else { notify('top_left', result.message, 'warning'); }
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            btn_submit.removeAttribute('loading');
        }
    }
}

