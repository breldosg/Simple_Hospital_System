import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, globalStates, notify, searchInArray } from "../script/index.js";

export class VisitRadiologyExamPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.selected_category = null;
        window.render_radiology_data = this.render_radiology_data.bind(this);
        window.save_radiology_order = this.save_radiology_order.bind(this);
        this.selected_radiology_test = [];
        this.searchQuery = '';
        this.state = "creation";
    }

    async PreRender(params = '') {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.selected_radiology_test = [];
        this.visit_id = params.visit_id ? params.visit_id : '';
        this.evaluation_data = params.data ? params.data : '';
        this.state = params.state ? params.state : 'creation';

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners();
        this.render_radiology_data();
        this.render_selected_radiology_test();
    }

    ViewReturn() {
        return `
<div class="container radiology_popUp">

    <div class="cont_heading">
        <p class="heading">Add Radiology Examination</p>
        <div class="close_btn">
            <span class='switch_icon_close'>
            </span>
        </div>
    </div>
    <div class="radiology_pop_cont">

        <div class="left">
            <div class="top_head">
                <p class="heading">Select Radiology Exam</p>

                <div class="search_cont">
                    <input type="text" placeholder="Search" class="radiology_popup_search">
                    <br-button loader_width="23" class="btn_search" type="submit">
                        <span class="switch_icon_magnifying_glass"></span>
                    </br-button>
                </div>

            </div>

            <div class="left_body_cont">
                <div class="group_category_cont">
                    
                </div>

                <div class="group_category_list">
                    <div class="radiology_list_item selected" data_src="x_ray_1">
                        <p>X-Ray 1</p>
                        <span class='switch_icon_check_box'></span>
                    </div>

                </div>

                <div class="radiology_pop_loader_cont active">
                    <div class="loader"></div>
                </div>

            </div>

        </div>

        <div class="right">
            <div class="top_head">
                <p class="heading">Selected Radiology Exam</p>
            </div>

            <div class="right_body_cont">
                <!-- <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div> -->

                <div class="radiology_pop_loader_cont active">
                    <div class="loader"></div>
                </div>
                
            </div>

            <div class="btn_cont">
                <br-button type="cancel" class="secondary" id="confirm_cancel">Cancel</br-button>
                <br-button type="btn" loading="false">Submit</br-button>
            </div>
        </div>

    </div>



</div>

`;
    }

    render_radiology_data() {
        if (globalStates.getState('radiology_data_exists')) {
            document.querySelector('.radiology_popUp .left_body_cont .radiology_pop_loader_cont').classList.remove('active');
            this.loadRadiologyCategoryList();
            this.loadRadiologyList();
        }
        else {
            globalStates.setState({ radiology_data_render_function: 'render_radiology_data' });
        }
    }

    render_selected_radiology_test() {
        const selected_radiology_list = document.querySelector('.radiology_popUp .right_body_cont');
        selected_radiology_list.innerHTML = '';
        if (this.selected_radiology_test.length > 0) {

            this.selected_radiology_test.forEach((item_id) => {

                // the item is the id of radiology test so take name from the radiology_data.radiology_tests
                const radiology_data = globalStates.getState('radiology_data');
                const item = radiology_data.radiology_tests.find(val => val.id === item_id);
                if (!item) return;
                var radiology_item = document.createElement('div');
                radiology_item.classList.add('radiology_list_item');
                radiology_item.classList.add('selected');
                radiology_item.setAttribute('data_src', item.id);
                radiology_item.innerHTML = `
                <p>${item.name}</p>
                <span class='switch_icon_indeterminate_check_box'></span>
                `;

                radiology_item.addEventListener('click', () => {
                    //remove the clicked item from the selected_radiology_test array
                    this.selected_radiology_test = this.selected_radiology_test.filter((selected_items) => selected_items != item_id);
                    // remove the item from the selected_radiology_test array
                    this.render_selected_radiology_test();
                    // remove the item from the selected_radiology_test array
                    this.loadRadiologyList();
                });

                selected_radiology_list.prepend(radiology_item);
            }
            );
        }
    }

    loadRadiologyCategoryList() {
        if (globalStates.getState('radiology_data_exists')) {
            const radiology_data = globalStates.getState('radiology_data');
            const category_list = document.querySelector('.radiology_popUp .group_category_cont');

            category_list.innerHTML = '';

            var category_list_data = radiology_data.radiology_category;
            var is_first_active = false;
            category_list_data.forEach((item) => {

                var category_item = document.createElement('div');
                category_item.classList.add('group_category');
                if (!is_first_active) {
                    category_item.classList.add('active');
                    this.selected_category = item.id;
                }
                category_item.setAttribute('data_src', item.id);
                category_item.innerHTML = `
                <p>${item.name}</p>
                `;

                category_item.addEventListener('click', () => {
                    const selected_category = category_item.getAttribute('data_src');
                    this.selected_category = selected_category;
                    const active_category = category_list.querySelector('.group_category.active');
                    active_category.classList.remove('active');
                    category_item.classList.add('active');
                    this.loadRadiologyList();
                });

                category_list.appendChild(category_item);
                is_first_active = true
            });

        }
    }

    loadRadiologyList() {
        if (globalStates.getState('radiology_data_exists')) {
            const radiology_data = globalStates.getState('radiology_data');
            const radiology_list = document.querySelector('.radiology_popUp .group_category_list');
            radiology_list.innerHTML = '';

            var radiology_list_data = radiology_data.radiology_tests;
            radiology_list_data.forEach((item) => {
                if (this.searchQuery != '' && !item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                    return;
                }
                if (item.category == this.selected_category) {
                    var span_class = "switch_icon_check_box_outline_blank";
                    var radiology_item = document.createElement('div');
                    radiology_item.classList.add('radiology_list_item');
                    if (this.selected_radiology_test.includes(item.id)) {
                        radiology_item.classList.add('selected');
                        span_class = "switch_icon_check_box";
                    }
                    radiology_item.setAttribute('data_src', item.id);
                    radiology_item.innerHTML = `
                                                <p>${item.name}</p>
                                                <span class='${span_class}'></span>
                `;
                    radiology_item.addEventListener('click', () => {
                        const selected_item = radiology_item.getAttribute('data_src');
                        // check if the clicked item has class selected
                        if (radiology_item.classList.contains('selected')) {
                            radiology_item.classList.remove('selected');
                            // remove the item from the selected_radiology_test array
                            this.selected_radiology_test = this.selected_radiology_test.filter((item) => item != selected_item);
                            // replace the span class with switch_icon_check_box_outline_blank
                            radiology_item.querySelector('span').classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');
                        }
                        else {
                            // replace the span class with switch_icon_check_box
                            radiology_item.querySelector('span').classList.replace('switch_icon_check_box_outline_blank', 'switch_icon_check_box');
                            radiology_item.classList.add('selected');
                            // add the item to the selected_radiology_test array
                            this.selected_radiology_test.push(selected_item);
                        }
                        this.render_selected_radiology_test();
                    });

                    radiology_list.appendChild(radiology_item);
                }
            });
        }
    }

    attachListeners() {
        const cancel_btns = document.querySelectorAll('.radiology_popUp #confirm_cancel, .radiology_popUp .close_btn');

        cancel_btns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.close();
            });
        });

        const search_input = document.querySelector('.radiology_popUp .radiology_popup_search');
        search_input.addEventListener('input', debounce((e) => {
            this.searchQuery = e.target.value;

            this.loadRadiologyList();
        }, 500));

        const search_btn = document.querySelector('.radiology_popUp .btn_search');
        search_btn.addEventListener('click', () => {
            this.searchQuery = search_input.value;
            this.loadRadiologyList();
        });

        const submit_btn = document.querySelector('.radiology_popUp br-button[type="btn"]');
        submit_btn.addEventListener('click', () => {
            if (this.selected_radiology_test.length == 0) {
                notify('top_left', 'Please select at least one radiology test', 'warning');
                return;
            }
            this.save_radiology_order();
        });
    }


    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async save_radiology_order() {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);


        var data = {
            radiology_order: this.selected_radiology_test,
            visit_id: this.visit_id
        };
        console.log(data);

        try {
            const response = await fetch('/api/patient/save_radiology_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Fail to Save Note. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                dashboardController.visitRadiologyExamCardView.PreRender({
                    visit_id: this.visit_id,
                    state: this.state,
                    data: result.data,
                });
                this.close();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
        finally {
            btn_submit.setAttribute('loading', false);
        }
    }
}