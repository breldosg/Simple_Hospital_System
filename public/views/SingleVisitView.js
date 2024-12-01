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
        cont.innerHTML = this.ViewReturn('active');

        this.visit_id = params.id;


        // Now call render which will fetch data and populate it
        this.render(params.id);
        this.attach_listeners()

        if (this.is_add_card_open) {
            window.removeEventListener('click', handleWindowClick);
        }


    }

    async render() {
        const visit_data = await this.fetchData(); // Wait for fetchData to complete

        if (visit_data) {
            this.top_card_view(visit_data.patient_data);


            dashboardController.visitVitalCardView.PreRender({
                data: visit_data.vital_sign,
                visit_id: this.visit_id,
            });
            dashboardController.visitPatientNoteCardView.PreRender({
                data: visit_data.patient_note,
                visit_id: this.visit_id,
            })

            this.Add_visit_cards_view();

        } else {
            cont.innerHTML = '<h3>Error fetching roles data. Please try again.</h3>';
        }
    }

    ViewReturn(loader = '') {


        return `
<div class="single_visit_cont">

    <div class="top_card">

        <div class="Patient_imag">
            <img src="" alt="">
        </div>

        <div class="patient_detail">

            <div class="card name_card">
                <div class="dit_group">
                    <p class="name"></p>
                    <p class="description"> Patient id: <span></span></p>
                </div>

                <button type="button" data_src="" class="edit_btn">
                    <span class='switch_icon_edit'></span>
                </button>

            </div>

            <div class="card">
                <div class="icon_card">
                    <span class='switch_icon_user'></span>
                    <p></p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_calendar_check'></span>
                    <p>years</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_location_dot'></span>
                    <p><span></span>)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_phone'></span>
                    <p><span>/</span> </p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_briefcase'></span>
                    <p></p>
                </div>

            </div>

        </div>

        <div class="loader_cont ${loader}">
            <div class="loader"></div>
        </div>
    </div>

    <div class="more_visit_detail">
    
    </div>

    <div class="more_visit_cards">
    </div>


</div>
`;
    }


    Add_visit_cards_view() {
        const body = document.querySelector('.single_visit_cont .more_visit_cards');

        const cards_cont = document.createElement('div');
        cards_cont.className = 'add_card_btn';
        cards_cont.setAttribute('id', 'add_card_btn')

        cards_cont.innerHTML = `
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
        `;

        cards_cont.addEventListener('click', (e) => {
            e.stopPropagation();
            add_card_btn.classList.add('option');
            this.is_add_card_open = true;

            // Add the window click listener
            window.addEventListener('click', this.handleWindowClick);

        })

        const oprions = cards_cont.querySelectorAll('.option_cont .option');
        oprions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();

                const tab_name = option.getAttribute('data_src');

                add_card_btn.insertAdjacentElement('beforebegin', this.card_view(tab_name));

                add_card_btn.classList.remove('option');
                this.is_add_card_open = false;
            })
        });

        body.appendChild(cards_cont);

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

        this.handleWindowClick = (e) => {
            if (this.is_add_card_open) {
                if (!add_card_btn.contains(e.target)) {
                    add_card_btn.classList.remove('option');
                    this.is_add_card_open = false;

                    // Remove the event listener once the state is reset
                    window.removeEventListener('click', handleWindowClick);
                }
            }
        };

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


</div>
                        `;

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