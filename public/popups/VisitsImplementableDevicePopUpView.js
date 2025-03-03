import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, getCurrentDate, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitsImplementableDevicePopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.added_devices = new Set();
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
        this.visit_status = params.visit_status ? params.visit_status : 'checked_out';

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();
        this.added_devices.clear();

        this.attachListeners()
        this.createCard();
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
                <div class="body_left">

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

</div>
`;
    }

    add_implementable_device_in_right_section(data) {
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

        this.added_devices.add(input_value);
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

        if (this.added_devices.size <= 0) {
            this.handleNoDataAdded()
            return;
        }

        this.added_devices.forEach(data => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                    <div class="words">
                        <p class="word">${data.name}</p>
                        <p class="sub_id">${data.device_identity}</p>
                        <p class="sub_word">${date_formatter(data.implanted_date)}</p>
                    </div>`;
            const cont = document.createElement('div');
            cont.className = 'btns';
            const remove_btn = document.createElement('div');
            remove_btn.className = 'remove_btn';
            remove_btn.innerHTML = `<span class="switch_icon_delete"></span>`;

            // log key of set array
            var key = Array.from(this.added_devices).indexOf(data);
            console.log(key);


            remove_btn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.added_devices.delete(data);
                card.remove();

                console.log(this.added_devices);

                if (this.added_devices.size <= 0) { this.handleNoDataAdded() }
            });
            cont.appendChild(remove_btn);
            card.appendChild(cont);
            card_list.prepend(card);
        })
    }

    attachListeners() {
        const cancel_btn = document.querySelector('.add_implementable_device_popUp #confirm_cancel');
        cancel_btn.addEventListener('click', () => {
            this.close();
        });


        const submit_btn = document.querySelector('.add_implementable_device_popUp #submit_btn');
        submit_btn.addEventListener('click', () => {
            this.save_implantable_devices();
        });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async save_implantable_devices() {
        // const btn_submit = document.querySelector('br-button[type="submit"]');
        // btn_submit.setAttribute('loading', true);


        if (this.added_devices.size <= 0) {
            notify('top_left', 'No Added Diagnosis.', 'warning');
            return;
        }
        var formData = {
            devices: Array.from(this.added_devices),
            visit_id: this.visit_id
        };
        console.log(formData);
        try {
            const response = await fetch('/api/patient/save_implantable_devices',
                {
                    method: 'POST', headers:
                        { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
                });
            if (!response.ok) {
                throw new
                    Error('Fail to Save Note. Server Error');
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
                dashboardController.visitImplantableDevicesCardView.PreRender({
                    visit_id: this.visit_id,
                    data: result.data,
                    state: this.state,
                    visit_status: this.visit_status
                });
                console.log(result.data);

                notify('top_left', result.message, 'success');
                console.log(result.data);
                this.close();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            btn_submit.removeAttribute('loading');
        }
    }
}