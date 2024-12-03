import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class SingleVisitView {
    constructor() {
        this.visit_id = null;
        this.is_add_card_open = false;
        this.card_rendered = [];
        this.add_card_deleted = '';
        this.rendered_card = [];
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
        // this.attach_listeners()

        if (this.is_add_card_open) {
            window.removeEventListener('click', this.handleWindowClick);
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


            // this.Add_visit_cards_view();

            this.render_add_btn()


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

        <div class="card_group_cont_cont" id="clinical_group">

            <h4>Clinical Notes</h4>
            <div class="card_group_cont">

            </div>

        </div>

        <div class="card_group_cont_cont" id="diagnosis_group">

            <h4>Diagnosis</h4>
            <div class="card_group_cont">

            </div>

        </div>

        <div class="card_group_cont_cont" id="treatment_group">

            <h4>Treatment Plan</h4>
            <div class="card_group_cont">

            </div>

        </div>

    </div>


</div>
`;
    }


    render_add_btn() {
        const add_btns = [
            {
                body_container_id: 'clinical_group',
                cards: [
                    {
                        component: 'visitClinicalEvaluationCardView',
                        title: 'Clinical Evaluation'
                    },
                    {
                        component: 'visitFinalDiagnosisCardView',
                        title: 'Final Diagnosis'
                    },
                    {
                        component: 'visitAllergyCardView',
                        title: 'Allergy'
                    },
                    {
                        component: 'visitPlanForNextVisitCardView',
                        title: 'Plan for Next Visit'
                    },
                ],
            },
            {
                body_container_id: 'diagnosis_group',
                cards: [
                    {
                        component: 'visitRadiologyExamCardView',
                        title: 'Radiology Exam'
                    },
                    {
                        component: 'visitLabExamCardView',
                        title: 'Laboratory Test'
                    },
                ],
            },
            {
                body_container_id: 'treatment_group',
                cards: [
                    {
                        component: 'visitPrescriptionsCardView',
                        title: 'Prescriptions'
                    },
                    {
                        component: 'visitProceduresCardView',
                        title: 'Procedures'
                    },
                    {
                        component: 'visitVaccineCardView',
                        title: 'Vaccine'
                    },
                    {
                        component: 'visitImplantableDevicesCardView',
                        title: 'Implantable Devices'
                    },
                ],
            },
        ];

        add_btns.forEach((btn) => {

            const body = document.querySelector(`.single_visit_cont #${btn.body_container_id} .card_group_cont`);
            if (body) {
                const cards_cont = document.createElement('div');
                cards_cont.className = 'add_card_btn';
                cards_cont.setAttribute('id', 'add_card_btn');

                const add_card_btn_in = document.createElement('div');
                add_card_btn_in.className = 'add_card_btn_in';
                add_card_btn_in.innerHTML = `<span class='switch_icon_add'></span>`;
                cards_cont.appendChild(add_card_btn_in);

                const option_cont = document.createElement('div');
                option_cont.className = 'option_cont';

                btn.cards.forEach(card => {
                    const option = document.createElement('div');
                    option.className = 'option';
                    option.innerText = card.title;

                    if (this.rendered_card.includes(card.title)) {
                        option.classList.add('disabled');
                    } else {
                        const handleClick = (e) => {
                            e.stopPropagation();

                            // Dynamically call the PreRender method for the component
                            const controllerMethod = dashboardController[card.component];
                            if (controllerMethod && typeof controllerMethod.PreRender === 'function') {
                                controllerMethod.PreRender({
                                    data: [],
                                    visit_id: this.visit_id,
                                });
                            } else {
                                console.error(`PreRender method not found for component: ${card.component}`);
                            }

                            // Add the card title to the rendered cards list
                            this.rendered_card.push(card.title);

                            // Mark option as disabled
                            option.classList.add('disabled');

                            // Remove the click listener on this option
                            option.removeEventListener('click', handleClick);

                            // Close the options menu
                            cards_cont.classList.remove('option');
                            this.is_add_card_open = false;
                            this.add_card_deleted = '';

                            // Remove the event listener once the state is reset
                            window.removeEventListener('click', this.handleWindowClick);
                        };

                        // Attach the named click listener
                        option.addEventListener('click', handleClick);
                    }

                    option_cont.appendChild(option);
                });

                cards_cont.appendChild(option_cont);

                cards_cont.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering window click
                    if (this.is_add_card_open) {
                        this.add_card_deleted.classList.remove('option');
                        this.is_add_card_open = false;

                        // Remove the event listener once the state is reset
                        window.removeEventListener('click', this.handleWindowClick);
                    }
                    cards_cont.classList.add('option');
                    this.is_add_card_open = true;
                    this.add_card_deleted = cards_cont;
                    window.addEventListener('click', this.handleWindowClick);
                });

                body.appendChild(cards_cont);
            }

        })
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


    handleWindowClick = (e) => {
        // const add_card_btn = document.querySelector('.add_card_btn');
        const add_card_btn = this.add_card_deleted == '' ? false : this.add_card_deleted;

        if (this.is_add_card_open) {
            if (!add_card_btn.contains(e.target)) {
                add_card_btn.classList.remove('option');
                this.is_add_card_open = false;

                // Remove the event listener once the state is reset
                window.removeEventListener('click', this.handleWindowClick);
                this.add_card_deleted = '';
            }
        }
    };

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