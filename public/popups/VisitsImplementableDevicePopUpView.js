import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, getCurrentDate, notify, searchInArray } from "../script/index.js";

export class VisitsImplementableDevicePopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.added_diagnosis = new Set();
        this.visit_id = '';
        window.add_implementable_device_in_right_section = this.add_implementable_device_in_right_section.bind(this);
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
<div class="container add_implementable_device_popUp">

    <div class="cont_heading">
        <p class="heading">Implantable Devices</p>
        <div class="close_btn" id="confirm_cancel">
            <span class="switch_icon_close"></span>
        </div>
    </div>

    <div class="body">
        <div class="left">
            <div class="heading_cont">
                <p class="heading">Device Form</p>
            </div>
            <br-form callback="add_implementable_device_in_right_section" class="slides">
                <div class="body_left animation">

                    <br-input required placeholder="Enter device name" name="name" label="Device Name" type="text"
                        styles="${this.input_style()}" labelStyles="font-size: 12px;"></br-input>

                    <br-input required placeholder="Enter device number/serial number" name="device_identity" label="Unique Device Identifier"
                        type="text" styles="${this.input_style()}" labelStyles="font-size: 12px;"></br-input>

                    <br-input placeholder="Add any instructions" name="note" label="Notes" type="textarea" styles="${this.text_area_style()}" labelStyles="font-size: 12px;"></br-input>

                    <br-input required type="date" name="implanted_date" label="Implant Date" styles="${this.input_style()}" value="${getCurrentDate()}" labelStyles="font-size: 12px;"></br-input>

                    <div class="btn_cont">
                        <br-button class="card-button" type="submit">Add</br-button>
                    </div>

                </div>
            </br-form>
        </div>

        <div class="line">
        </div>

        <div class="right">
            <div class="heading_cont">
                <p class="heading">Added Device</p>
            </div>
            <div class="card_list">

                <div class="example">
                    <p class="word">No Device Added</p>
                </div>



            </div>

            <div class="heading_btn">
                <br-button class="card-button disabled" id="submit_btn" type="submit">Submit</br-button>
            </div>


        </div>


    </div>

</div>`;
    }

    add_implementable_device_in_right_section(data) {
        console.log(data);

        this.handleDataAdded(data);

    }

    handleNoDataAdded() {
        const card_list = document.querySelector('.add_implementable_device_popUp .card_list');
        const submitBtn = document.querySelector('.add_implementable_device_popUp #submit_btn');
        submitBtn.classList.add('disabled');
        card_list.innerHTML = this.exampleCard();
    }

    handleDataAdded(input_value) {
        const submitBtn = document.querySelector('.add_implementable_device_popUp #submit_btn');
        submitBtn.classList.remove('disabled');

        this.added_diagnosis.add(input_value);
        this.createCard();

    }

    input_style() {
        return `
        border-radius: var(--input_main_border_r);
        width: 440px;
        padding: 10px;
        height: 41px;
        background-color: transparent;
        border: 2px solid var(--input_border);
        `;
    }

    text_area_style() {
        return `
        border-radius: var(--input_main_border_r);
        width: 440px;
        padding: 10px;
        height: 61px;
        background-color: transparent;
        border: 2px solid var(--input_border);
        `;
    }

    exampleCard() {
        return `<div class="example">
                    <p class="word">No Diagnosis Added</p>
                </div>`;
    }

    createCard() {
        const card_list = document.querySelector('.add_implementable_device_popUp .card_list');
        card_list.innerHTML = '';
        this.added_diagnosis.forEach(data => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                    <div class="words">
                        <p class="word">${data.name}</p>
                        <div class="sub_words_cont">
                            <p class="sub_id">${data.device_identity}</p>
                            <p class="sub_word">${data.implanted_date}</p>
                        </div>
                    </div>`;
            const cont = document.createElement('div');
            cont.className = 'btns';
            const remove_btn = document.createElement('div');
            remove_btn.className = 'remove_btn';
            remove_btn.innerHTML = `<span class="switch_icon_delete"></span>`;

            // log key of set array
            var key = Array.from(this.added_diagnosis).indexOf(data);
            console.log(key);


            remove_btn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.added_diagnosis.delete(data);
                card.remove();

                console.log(this.added_diagnosis);

                if (this.added_diagnosis.size <= 0) { this.handleNoDataAdded() }
            });
            cont.appendChild(remove_btn);
            card.appendChild(cont);
            card_list.prepend(card);
        })
    }

    attachListeners() {
        const
            cancel_btn = document.querySelector('.add_implementable_device_popUp #confirm_cancel'); cancel_btn.addEventListener('click', () => {
                this.close();
            });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    // async save_pre_diagnosis_note() {
    //     const btn_submit = document.querySelector('br-button[type="submit"]');
    //     btn_submit.setAttribute('loading', true);


    //     if (this.added_diagnosis.size <= 0) { notify('top_left', 'No Added Diagnosis.', 'warning'); return; } var
    //         formData = { action: 'create', diagnosis: Array.from(this.added_diagnosis), visit_id: this.visit_id }; try {
    //             const response = await fetch('/api/patient/create_delete_pre_diagnosis', {
    //                 method: 'POST', headers:
    //                     { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
    //             }); if (!response.ok) {
    //                 throw new
    //                     Error('Fail to Save Note. Server Error');
    //             } const result = await response.json(); if (result.success) {
    //                 dashboardController.visitPreDiagnosisCardView.PreRender({
    //                     visit_id: this.visit_id, data: result.data, state:
    //                         this.state,
    //                 }); notify('top_left', result.message, 'success'); console.log(result.data); this.close();
    //             } else {
    //                 notify('top_left', result.message, 'warning');
    //             }
    //         } catch (error) {
    //             notify('top_left', error.message, 'error');
    //         } finally { btn_submit.removeAttribute('loading'); }
    // }
}