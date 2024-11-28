import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class SingleVisitView {
    constructor() {
        this.visit_id = null;
        this.is_add_card_open = false;
    }
    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('', 'active');

        this.visit_id = params.id;
        // Now call render which will fetch data and populate it
        this.render(params.id);
        this.attach_listeners()

        if (this.is_add_card_open) {
            window.removeEventListener('click', handleWindowClick);
        }

        dashboardController.patientIllnessNotePopUpView.PreRender();

    }

    async render() {
        const visit_data = await this.fetchData(); // Wait for fetchData to complete

        if (visit_data) {
            this.top_card_view(visit_data.patient_data);
        } else {
            cont.innerHTML = '<h3>Error fetching roles data. Please try again.</h3>';
        }
    }

    ViewReturn(data, loader = '') {


        return `
<div class="single_visit_cont">

    <div class="top_card">

        <div class="Patient_imag">
            <img src="${data == '' ? '' : data.Patient_img}" alt="">
        </div>

        <div class="patient_detail">

            <div class="card name_card">
                <div class="dit_group">
                    <p class="name">${data == '' ? '' : data.name}</p>
                    <p class="description"> Patient id: <span>${data == '' ? '' : data.id}</span></p>
                </div>

                <button type="button" data_src="${data == '' ? '' : data.id}" class="edit_btn">
                    <span class='switch_icon_edit'></span>
                </button>

            </div>

            <div class="card">
                <div class="icon_card">
                    <span class='switch_icon_user'></span>
                    <p>${data == '' ? '' : data.gender}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_calendar_check'></span>
                    <p>${date_formatter(data == '' ? '2001-02-01' : data.dob)} (${data == '' ? '' : data.age}
                        years)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_location_dot'></span>
                    <p>${data == '' ? '' : data.address} (<span>${data == '' ? '' : data.nationality}</span>)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_phone'></span>
                    <p>${data == '' ? '' : data.phone} <span>/</span> ${data == '' ? '' : data.alt_phone}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_briefcase'></span>
                    <p>${data == '' ? '' : data.occupation}</p>
                </div>

            </div>

        </div>

        <div class="loader_cont ${loader}">
            <div class="loader"></div>
        </div>
    </div>

    <div class="more_visit_detail">

        <div class="more_visit_detail_card vital_card_cont">
            <div class="head_part">
                <h4 class="heading">Vital Sign</h4>

                <div class="add_btn">
                    <span class='switch_icon_mode_edit'></span>
                </div>
            </div>

            <div class="body_part vital_card">

                <div class="value_cont">
                    <p class="name">Temperature:</p>
                    <p class="value">36.2 deg C</p>
                </div>
                <div class="value_cont">
                    <p class="name">Pulse:</p>
                    <p class="value">91 bpm</p>
                </div>
                <div class="value_cont">
                    <p class="name">Weight:</p>
                    <p class="value">77 Kg</p>
                </div>
                <div class="value_cont">
                    <p class="name">O2 Saturation:</p>
                    <p class="value">98 %</p>
                </div>
                <div class="value_cont">
                    <p class="name">Blood Pressure:</p>
                    <p class="value">136/84 mmHg</p>
                </div>
                <div class="value_cont">
                    <p class="name">Respiration:</p>
                    <p class="value">20 RR</p>
                </div>
                <div class="value_cont">
                    <p class="name">Height:</p>
                    <p class="value">36.2 cm</p>
                </div>

            </div>

        </div>


        <div class="more_visit_detail_card patient_note_cards_cont_cont">
            <div class="head_part">
                <h4 class="heading">Patient Note</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">

                <!-- no note show -->
                <!-- <div class="start_cont">
                    <p class="start_view_overlay">No Note Found</p>
                </div> -->

                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>


                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>


                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>


                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>



                <div class="note_card">
                    <div class="card_head">
                        <p class="title">ABDILAH KHATIB MAKAME</p>
                        <p class="date">${date_formatter(new Date())}</p>
                    </div>
                    <p class="detail">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti quidem inventore, nihil et
                        voluptate corporis. Omnis, assumenda explicabo. Aliquid placeat officiis asperiores suscipit
                        incidunt magni explicabo nulla perferendis, aut similique.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias minus rerum itaque
                        dignissimos? Modi, aliquam quaerat! Labore, cupiditate iure culpa cumque libero optio minima
                        earum porro. Voluptate eos numquam iusto? Ratione iusto praesentium alias tempora porro commodi

                    </p>
                </div>


            </div>

        </div>

        <div class="more_visit_detail_card" type="complain">
        <div class="head_part">
                <h4 class="heading">Chief Complain</h4>

                <div class="add_btn">
                    <span class="switch_icon_add"></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">


            </div></div>

        <div class="add_card_btn" id="add_card_btn">
            <div class="add_card_btn_in">
                <span class='switch_icon_add'></span>
            </div>
            <div class="option_cont">
                <div data_src="vital" class="option">Vital Sign</div>
                <div data_src="complain" class="option">Chief Complain</div>
                <div data_src="illness" class="option">Presented Illness</div>
                <div data_src="reviewSystem" class="option">Review of Other System</div>
                <div data_src="generalExam" class="option">General Exam</div>
                <div data_src="systemicExam" class="option">Systemic Exam</div>
                <div data_src="preliminaryDiagnosis" class="option">Preliminary Diagnosis</div>
                <div data_src="radiologyExam" class="option">Radiology Exam</div>
                <div data_src="labExam" class="option">Laboratory Exam</div>
                <div data_src="labExam" class="option">Laboratory Exam</div>
                <div data_src="prescription" class="option">Prescription</div>
            </div>
        </div>

    </div>

</div>
`;
    }

    top_card_view(data) {

        const body = document.querySelector('.single_visit_cont .top_card');
        body.innerHTML = `
        <div class="Patient_imag">
            <img src="${data == '' ? '' : data.Patient_img}" alt="">
        </div>

        <div class="patient_detail">

            <div class="card name_card">
                <div class="dit_group">
                    <p class="name">${data == '' ? '' : data.name}</p>
                    <p class="description"> Patient id: <span>${data == '' ? '' : data.id}</span></p>
                </div>

                <button type="button" data_src="${data == '' ? '' : data.id}" class="edit_btn">
                    <span class='switch_icon_edit'></span>
                </button>

            </div>

            <div class="card">
                <div class="icon_card">
                    <span class='switch_icon_user'></span>
                    <p>${data == '' ? '' : data.gender}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_calendar_check'></span>
                    <p>${date_formatter(data == '' ? '2001-02-01' : data.dob)} (${data == '' ? '' : data.age}
                        years)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_location_dot'></span>
                    <p>${data == '' ? '' : data.address} (<span>${data == '' ? '' : data.nationality}</span>)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_phone'></span>
                    <p>${data == '' ? '' : data.phone} <span>/</span> ${data == '' ? '' : data.alt_phone}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_briefcase'></span>
                    <p>${data == '' ? '' : data.occupation}</p>
                </div>

            </div>

        </div>
            `;
    }

    attach_listeners() {
        const add_card_btn = document.querySelector('.add_card_btn');

        const handleWindowClick = (e) => {
            if (this.is_add_card_open) {
                if (!add_card_btn.contains(e.target)) {
                    add_card_btn.classList.remove('option');
                    this.is_add_card_open = false;

                    // Remove the event listener once the state is reset
                    window.removeEventListener('click', handleWindowClick);
                }
            }
        };

        add_card_btn.addEventListener('click', (e) => {
            e.stopPropagation();
            add_card_btn.classList.add('option');
            this.is_add_card_open = true;

            // Add the window click listener
            window.addEventListener('click', handleWindowClick);
        });

        const oprions = document.querySelectorAll('.option_cont .option');
        oprions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();

                const tab_name = option.getAttribute('data_src');

                add_card_btn.insertAdjacentElement('beforebegin', this.card_view(tab_name));

                add_card_btn.classList.remove('option');
                this.is_add_card_open = false;
            })
        });

    }

    card_view(type) {

        // use switch
        switch (type) {
            case 'complain':
                var title = 'Chief Complain';
                break;
            case 'illness':
                var title = 'Presented Illness';
                break;
            case 'reviewSystem':
                var title = 'Review of Other System';
                break;
            case 'generalExam':
                var title = 'General Exam';
                break;
            case 'systemicExam':
                var title = 'Systemic Exam';
                break;
            case 'preliminaryDiagnosis':
                var title = 'Preliminary Diagnosis';
                break;
            case 'radiologyExam':
                var title = 'Radiology Exam';
                break;
            case 'labExam':
                var title = 'Laboratory Exam';
                break;
            case 'vital':
                var title = 'Vital Sign';
                break;
            case 'prescription':
                var title = 'Prescription';
                break;
            default:
                var title = 'Unknown';
                break;
        }


        const card = document.createElement('div');
        card.classList.add('more_visit_detail_card');
        card.setAttribute('type', type);

        card.innerHTML = `
        <div class="head_part">
                <h4 class="heading">${title}</h4>

                <div class="add_btn">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part patient_note_cards_cont">


            </div>`;

        return card;

    }

    async fetchData() {
        try {
            const response = await fetch('/api/patient/single_visit_detail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            if (result.success) {
                return result.data;
            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }
}