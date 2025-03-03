import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, getCurrentDate, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitsVaccinePopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.addedVaccines = new Set();
        this.visit_id = '';
        window.add_vaccine_in_right_section = this.add_vaccine_in_right_section.bind(this);
    }

    async PreRender(params = '') {
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
        this.addedVaccines.clear();

        this.container = document.querySelector('.vaccine_popup');
        this.attachListeners();
        this.createCard();
    }

    ViewReturn() {
        return `
<div class="container vaccine_popup">
    <div class="cont_heading">
        <p class="heading">Vaccine Records</p>
        <div class="close_btn" id="confirm_cancel">
            <span class="switch_icon_close"></span>
        </div>
    </div>

    <div class="body">
        <div class="left">
            <div class="heading_cont">
                <p class="heading">Vaccine Form</p>
            </div>
            <br-form callback="add_vaccine_in_right_section" class="slides">
                <div class="body_left animation">
                    <br-input required placeholder="Enter vaccine name" name="name" label="Vaccine Name" type="text"
                        styles="${this.input_style()}" labelStyles="font-size: 12px;"></br-input>
                    

                    <br-input placeholder="Enter vaccination notes" name="notes" label="Notes"
                        type="textarea" styles="${this.text_area_style()}" labelStyles="font-size: 12px;"></br-input>

                    <br-input required placeholder="Enter vaccine name" name="given_date" label="Given Date" type="date"
                        styles="${this.input_style()}" value="${getCurrentDate()}" labelStyles="font-size: 12px;"></br-input>

                    <div class="btn_cont">
                        <br-button class="card-button" type="submit">Add</br-button>
                    </div>
                </div>
            </br-form>
        </div>

        <div class="line"></div>

        <div class="right">
            <div class="heading_cont">
                <p class="heading">Added Vaccines</p>
            </div>
            <div class="card_list">
                <div class="example">
                    <p class="word">No Vaccines Added</p>
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

    add_vaccine_in_right_section(data) {
        this.handleDataAdded(data);
    }

    handleNoDataAdded() {
        const card_list = this.container.querySelector('.card_list');
        const submitBtn = this.container.querySelector('#submit_btn');
        submitBtn.classList.add('disabled');
        card_list.innerHTML = this.exampleCard();
    }

    handleDataAdded(input_value) {
        const submitBtn = this.container.querySelector('#submit_btn');
        submitBtn.classList.remove('disabled');

        this.addedVaccines.add(input_value);
        this.createCard();
        var form = this.container.querySelector('br-form');
        form.reset();
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
                    <p class="word">No Vaccines Added</p>
                </div>`;
    }

    createCard() {
        const card_list = this.container.querySelector('.card_list');
        card_list.innerHTML = '';

        if (this.addedVaccines.size <= 0) {
            this.handleNoDataAdded();
            return;
        }

        this.addedVaccines.forEach(data => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                    <div class="words">
                        <p class="word">${data.name}</p>
                        <p class="sub_id">${data.notes}</p>
                        <p class="sub_word">${data.given_date}</p>
                    </div>`;

            const cont = document.createElement('div');
            cont.className = 'btns';
            const remove_btn = document.createElement('div');
            remove_btn.className = 'remove_btn';
            remove_btn.innerHTML = `<span class="switch_icon_delete"></span>`;

            remove_btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addedVaccines.delete(data);
                card.remove();

                if (this.addedVaccines.size <= 0) {
                    this.handleNoDataAdded();
                }
            });

            cont.appendChild(remove_btn);
            card.appendChild(cont);
            card_list.prepend(card);
        });
    }

    attachListeners() {
        const cancel_btn = this.container.querySelector('#confirm_cancel');
        cancel_btn.addEventListener('click', () => {
            this.close();
        });

        const submit_btn = this.container.querySelector('#submit_btn');
        submit_btn.addEventListener('click', () => {
            this.saveVaccines();
        });
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async saveVaccines() {
        if (this.addedVaccines.size <= 0) {
            notify('top_left', 'No Vaccines Added.', 'warning');
            return;
        }

        const formData = {
            vaccines: Array.from(this.addedVaccines),
            visit_id: this.visit_id
        };

        console.log(formData);
        // return;

        try {
            const response = await fetch('/api/patient/save_vaccine_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to Save Vaccines. Server Error');
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
                dashboardController.visitVaccineCardView.PreRender({
                    visit_id: this.visit_id,
                    data: result.data,
                    state: this.state,
                    visit_status: this.visit_status
                });

                notify('top_left', result.message, 'success');
                this.close();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
    }


}