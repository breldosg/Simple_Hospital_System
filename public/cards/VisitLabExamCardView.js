import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class VisitLabExamCardView {

    constructor() {
        window.remove_order_lab_exam_request = this.remove_order_lab_exam_request.bind(this);
        window.remove_lab_exam_request_bulk = this.remove_lab_exam_request_bulk.bind(this);
        this.visit_id = null;
        this.datas = [];
        this.select_all_active = false;
        this.singleSelectedToDelete = '';
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
            dashboardController.singleVisitView.add_to_rendered_card_array('visitLabTestOrdersPopUpView');
        }

        if (this.datas.length >= 1) {
            this.renderLabTestCards();
        }
    }

    renderLabTestCards() {

        const container = document.querySelector('.lab_test_cont_cont .body_part');

        if (this.datas.length > 0) {
            container.innerHTML = '';
            this.datas.forEach((data) => {

                const card = document.createElement('div');
                card.className = 'lab_test_card';
                card.setAttribute('data_src', data.id);

                card.innerHTML = `
                    <div class="left">
                        <div class="check_box lab_test_check_box ${data.status == 'pending' ? '' : 'inactive'}" >
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
                        <div title="Delete this order." class="more_btn order_delete_btn ${data.status == 'pending' ? '' : 'inactive'}">
                            <span class='switch_icon_delete'></span>
                        </div>
    
                        
                    </div>
    
                        `;



                var check_box = card.querySelector('.lab_test_check_box');
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
                        var main_checkbox = document.querySelector('.lab_test_cont_cont #main_lab_test_check_box');
                        this.make_checkbox_indeterminate(main_checkbox)
                    }


                })


                var delete_btn = card.querySelector('.order_delete_btn');
                delete_btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (delete_btn.classList.contains('inactive')) return;
                    // Toggle the check box status and the icon
                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'remove_order_lab_exam_request',
                        parameter: [data.id],
                        title: 'Remove Laboratory Order Request',
                        sub_heading: `Order For: ${data.name}`,
                        description: 'Are you sure you want to remove this order?',
                        ok_btn: 'Remove',
                        cancel_btn: 'Cancel'
                    });

                    this.singleSelectedToDelete = card;
                })

                container.prepend(card);
            })
            // this.datas = []; // Clear the data array to prevent duplication
        }
    }

    add_check_box_btn() {
        var container = document.querySelector('.lab_test_cont_cont .top_heading');
        const check_box = document.createElement('div');
        check_box.className = 'lab_test_check_box';
        check_box.classList.add('check_box');
        check_box.id = 'main_lab_test_check_box';
        // add title to the button with good message
        check_box.title = "Select all laboratory test";
        check_box.innerHTML = `
            <span class='switch_icon_indeterminate_check_box'></span>
            `;

        check_box.addEventListener('click', (e) => {
            var cards = document.querySelectorAll('.lab_test_cont_cont .lab_test_cont .lab_test_card');
            e.preventDefault();

            // Toggle the check box status and the icon
            var span = check_box.querySelector('span');

            if (span.classList.contains('switch_icon_indeterminate_check_box')) {
                cards.forEach((card) => {
                    this.make_checkbox_inactive(card.querySelector('.lab_test_check_box'));
                })
                span.classList.remove('switch_icon_indeterminate_check_box');
                span.classList.add('switch_icon_check_box_outline_blank');
            }

            else if (span.classList.contains('switch_icon_check_box_outline_blank')) {
                cards.forEach((card) => {
                    this.make_checkbox_active(card.querySelector('.lab_test_check_box'));
                })
                this.make_checkbox_active(check_box);
            }
            else {
                cards.forEach((card) => {
                    this.make_checkbox_inactive(card.querySelector('.lab_test_check_box'));
                })
                this.make_checkbox_inactive(check_box);
            }
        });

        container.prepend(check_box);
        this.select_all_active = true;
        document.querySelector('.lab_test_cont_cont .btn_section').innerHTML = "";

        this.add_cancel_btn();
        this.add_delete_btn();


    }

    ViewReturn() {

        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('lab_test_cont_cont');



        card.innerHTML = `
                <div class="head_part">
                    <div class="top_heading">
                        <h4 class="heading">Laboratory Test</h4>
                    </div>
                    <div class="btn_section">
                        
                    </div>
                </div>
    
                <div class="body_part lab_test_cont">
    
                </div>
    
            
                `;

        return card;

    }

    add_add_btn() {
        var container = document.querySelector('.lab_test_cont_cont .btn_section');
        const check_box = document.createElement('div');
        check_box.className = 'add_btn';
        check_box.id = 'add_lab_test';
        check_box.innerHTML = `
            <span class='switch_icon_add'></span>
            `;

        check_box.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selected_ids = this.datas
                .filter(item => item.status == 'pending')
                .map(item => item.test_id);

            dashboardController.visitLabTestOrdersPopUpView.PreRender(
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
        var container = document.querySelector('.lab_test_cont_cont .btn_section');
        const btn = document.createElement('div');
        btn.className = 'cancel_btn';
        // add title to the button with good message
        btn.title = "Cancel selecting laboratory test";
        btn.innerHTML = `
            <span class='switch_icon_cancel'></span>
            `;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            var cards = document.querySelectorAll('.lab_test_cont_cont .lab_test_cont .lab_test_card');
            cards.forEach((card) => {
                this.make_checkbox_inactive(card.querySelector('.lab_test_check_box'));
            })
            this.remove_multiple_selection_mode();
        });
        container.prepend(btn);

    }

    // remove multiple selection mode
    remove_multiple_selection_mode() {
        var select_all_check_box = document.querySelector('.lab_test_cont_cont .top_heading .lab_test_check_box');
        select_all_check_box.remove();
        this.select_all_active = false;
        document.querySelector('.lab_test_cont_cont .btn_section').innerHTML = "";
        this.add_add_btn();
    }

    add_delete_btn() {
        var container = document.querySelector('.lab_test_cont_cont .btn_section');
        const check_box = document.createElement('div');
        check_box.className = 'delete_btn';
        // add title to the button with good message
        check_box.title = "Delete all selected laboratory test";
        check_box.innerHTML = `
            <span class='switch_icon_delete'></span>
            `;

        check_box.addEventListener('click', (e) => {
            e.stopPropagation();
            const cards = document.querySelectorAll('.lab_test_cont_cont .body_part .lab_test_card');
            var ids = [];
            cards.forEach((card) => {
                var checkbox = card.querySelector('.lab_test_check_box');
                if (checkbox.classList.contains('checked') || !checkbox.classList.contains('inactive')) {
                    ids.push(parseInt(card.getAttribute('data_src')));
                }
            });
            if (ids.length > 0) {

                var num = ids.length;

                dashboardController.confirmPopUpView.PreRender({
                    callback: 'remove_lab_exam_request_bulk',
                    parameter: ids,
                    title: 'Remove Selected Laboratory Orders',
                    sub_heading: `You have selected ${num} laboratory orders.`,
                    description: 'Are you sure you want to remove these selected laboratory orders?',
                    ok_btn: 'Remove',
                    cancel_btn: 'Cancel'
                });
            }
            else {
                // show error message by notify function
                notify('top_left', 'Please select at least one order to remove.', 'warning');
            }


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

    async remove_order_lab_exam_request(lab_order_ids) {
        dashboardController.loaderView.render();
        try {
            const response = await fetch('/api/patient/delete_lab_test_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    lab_order_id: lab_order_ids,
                    state: 'single',
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();
            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }
            notify('top_left', result.message, 'success');
            this.singleSelectedToDelete.remove();
            this.singleSelectedToDelete = '';
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
        finally {
            dashboardController.loaderView.remove();
        }
    }


    async remove_lab_exam_request_bulk(lab_order_ids) {
        dashboardController.loaderView.render();
        try {
            const response = await fetch('/api/patient/delete_lab_test_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    lab_order_id: lab_order_ids,
                    state: 'multiple',
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();
            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }
            notify('top_left', result.message, 'success');
            this.datas = result.data;
            this.remove_multiple_selection_mode();
            this.renderLabTestCards();

        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
        finally {
            dashboardController.loaderView.remove();
        }
    }


}