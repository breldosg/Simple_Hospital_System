import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter } from "../script/index.js";

export class VisitRadiologyExamCardView {

    constructor() {
        // window.save_patient_note = this.save_patient_note.bind(this);
        this.visit_id = null;
        this.datas = [];
        this.select_all_active = false;
    }

    async PreRender(params = []) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }
        this.select_all_active = false;
        this.datas = params.data ? params.data : [];
        this.visit_id = params.visit_id;
        this.state = params.state ? params.state : "creation";
        this.selected_ids = params.data.map((item) => item.exam_id);




        if (this.state == "creation") {
            const cont = document.querySelector('.single_visit_cont .more_visit_cards #diagnosis_group .card_group_cont');
            const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #diagnosis_group .card_group_cont .add_card_btn');
            if (add_btn) {
                add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
            }
            else {
                cont.appendChild(this.ViewReturn());
                this.add_add_btn();
            }
            dashboardController.singleVisitView.add_to_rendered_card_array('visitRadiologyExamPopUpView');
        }

        if (this.datas.length >= 1) {
            this.renderRadiologyCards();
        }
    }

    renderRadiologyCards() {

        const container = document.querySelector('.radiology_exam_cont_cont .body_part')

        if (this.datas.length > 0) {
            container.innerHTML = '';
            this.datas.forEach((data) => {
                const card = document.createElement('div');
                card.className = 'radiology_exam_card';

                card.innerHTML = `
                <div class="left">
                    <div class="check_box radiology_check_box ${data.status == 'pending' ? '' : 'inactive'}" >
                        <span class='switch_icon_check_box_outline_blank'></span>
                    </div>
                    <div class="word">
                        <p class="title">${data.name}</p>
                        <p class="created_by">${data.created_by}</p>
                        <p class="date">${date_formatter(data.created_at)}</p>
                    </div>
                </div>
                <div class="right">
                    <div class="status ${data.status}"></div>
                    <div class="more_btn ${data.status == 'pending' ? '' : 'inactive'}">
                        <span class='switch_icon_delete'></span>
                    </div>

                    
                </div>

                    `;

                var check_box = card.querySelector('.radiology_check_box');
                check_box.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Toggle the check box status and the icon
                    var span = check_box.querySelector('span');
                    if (span.classList.contains('switch_icon_check_box_outline_blank')) {
                        this.make_checkbox_active(check_box);
                    }
                    else {
                        this.make_checkbox_inactive(check_box);
                    }

                    if (!this.select_all_active) {
                        this.add_check_box_btn();
                    }
                    else {
                        var main_checkbox = document.querySelector('.radiology_exam_cont_cont #main_radiology_order_check_box');
                        this.make_checkbox_indeterminate(main_checkbox)
                    }

                })

                container.prepend(card);
            })
            this.datas = []; // Clear the data array to prevent duplication
        }
    }

    add_check_box_btn() {
        var container = document.querySelector('.radiology_exam_cont_cont .top_heading');
        const check_box = document.createElement('div');
        check_box.className = 'radiology_check_box';
        check_box.classList.add('check_box');
        check_box.id='main_radiology_order_check_box';
        // add title to the button with good message
        check_box.title = "Select all radiology exams";
        check_box.innerHTML = `
        <span class='switch_icon_indeterminate_check_box'></span>
        `;

        check_box.addEventListener('click', (e) => {
            var cards = document.querySelectorAll('.radiology_exam_cont_cont .radiology_exam_cont .radiology_exam_card');
            e.preventDefault();

            // Toggle the check box status and the icon
            var span = check_box.querySelector('span');

            if (span.classList.contains('switch_icon_indeterminate_check_box')) {
                cards.forEach((card) => {
                    this.make_checkbox_inactive(card.querySelector('.radiology_check_box'));
                })
                span.classList.remove('switch_icon_indeterminate_check_box');
                span.classList.add('switch_icon_check_box_outline_blank');
            }

            else if (span.classList.contains('switch_icon_check_box_outline_blank')) {
                cards.forEach((card) => {
                    this.make_checkbox_active(card.querySelector('.radiology_check_box'));
                })
                this.make_checkbox_active(check_box);
            }
            else {
                cards.forEach((card) => {
                    this.make_checkbox_inactive(card.querySelector('.radiology_check_box'));
                })
                this.make_checkbox_inactive(check_box);
            }
        });

        container.prepend(check_box);
        this.select_all_active = true;
        document.querySelector('.radiology_exam_cont_cont .btn_section').innerHTML = "";

        this.add_cancel_btn();
        this.add_delete_btn();


    }

    ViewReturn() {

        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('radiology_exam_cont_cont');



        card.innerHTML = `
            <div class="head_part">
                <div class="top_heading">
                    <h4 class="heading">Radiology Exam</h4>
                </div>
                <div class="btn_section">
                    
                </div>
            </div>

            <div class="body_part radiology_exam_cont">

            </div>

        
            `;

        return card;

    }

    add_add_btn() {
        var container = document.querySelector('.radiology_exam_cont_cont .btn_section');
        const check_box = document.createElement('div');
        check_box.className = 'add_btn';
        check_box.id = 'add_radiology_exam';
        check_box.innerHTML = `
        <span class='switch_icon_add'></span>
        `;

        check_box.addEventListener('click', (e) => {

            dashboardController.visitRadiologyExamPopUpView.PreRender(
                {
                    visit_id: this.visit_id,
                    state: 'modify',
                    data: this.selected_ids,
                }
            );
        });
        container.appendChild(check_box);

    }

    add_cancel_btn() {
        var container = document.querySelector('.radiology_exam_cont_cont .btn_section');
        const btn = document.createElement('div');
        btn.className = 'cancel_btn';
        // add title to the button with good message
        btn.title = "Cancel selected radiology exams";
        btn.innerHTML = `
        <span class='switch_icon_cancel'></span>
        `;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            var cards = document.querySelectorAll('.radiology_exam_cont_cont .radiology_exam_cont .radiology_exam_card');
            cards.forEach((card) => {
                this.make_checkbox_inactive(card.querySelector('.radiology_check_box'));
            })
            var select_all_check_box = document.querySelector('.radiology_exam_cont_cont .top_heading .radiology_check_box');
            select_all_check_box.remove();
            this.select_all_active = false;
            document.querySelector('.radiology_exam_cont_cont .btn_section').innerHTML = "";
            this.add_add_btn();
        });
        container.prepend(btn);

    }

    add_delete_btn() {
        var container = document.querySelector('.radiology_exam_cont_cont .btn_section');
        const check_box = document.createElement('div');
        check_box.className = 'delete_btn';
        // add title to the button with good message
        check_box.title = "Delete all selected radiology exams";
        check_box.innerHTML = `
        <span class='switch_icon_delete'></span>
        `;

        check_box.addEventListener('click', (e) => {
            dashboardController.visitRadiologyExamPopUpView.PreRender(
                {
                    visit_id: this.visit_id,
                    state: 'modify',
                }
            );
        });
        container.appendChild(check_box);

    }

    attachListeners() {
        //     const cancel_btn = document.querySelector('br-button[type="cancel"]');

        //     cancel_btn.addEventListener('click', () => {
        //         this.close();
        //     });
    }

    make_checkbox_active(check_box) {
        var span = check_box.querySelector('span');
        // check if the checkbox is inactive state
        if (!check_box.classList.contains('inactive')) {
            check_box.classList.add('checked');
            span.classList.remove('switch_icon_check_box_outline_blank');
            span.classList.add('switch_icon_check_box');
        }
    }

    make_checkbox_inactive(check_box) {
        var span = check_box.querySelector('span');
        check_box.classList.remove('checked');
        span.classList.remove('switch_icon_check_box');
        span.classList.add('switch_icon_check_box_outline_blank');
    }

    make_checkbox_indeterminate(check_box) {
        var span = check_box.querySelector('span');
        check_box.classList.add('checked');
        span.classList.remove('switch_icon_check_box_outline_blank');
        span.classList.add('switch_icon_indeterminate_check_box');
    }

}