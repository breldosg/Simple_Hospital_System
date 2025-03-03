import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, notify, searchInArray } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitLabTestOrdersPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        this.selected_category = null;
        window.render_lab_test_data = this.render_lab_test_data.bind(this);
        // window.save_radiology_order = this.save_radiology_order.bind(this);
        this.selected_lab_test = [];
        this.searchQuery = '';
        this.state = "creation";
    }

    async PreRender(params = '') {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.selected_lab_test = [];
        this.visit_id = params.visit_id ? params.visit_id : '';
        this.selected_lab_test = params.data ? params.data : [];
        this.state = params.state ? params.state : 'creation';
        this.visit_status = params.visit_status ? params.visit_status : 'checked_out';



        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners();
        this.render_lab_test_data();
    }

    ViewReturn() {
        return `
<div class="container lab_order_popup">

    <div class="cont_heading">
        <p class="heading">Add Laboratory Test Order</p>
        <div class="close_btn">
            <span class='switch_icon_close'>
            </span>
        </div>
    </div>
    <div class="lab_order_pop_cont">

        <div class="left">
            <div class="top_head">
                <p class="heading">Select Laboratory Test</p>

                <div class="search_cont">
                    <input type="text" placeholder="Search" class="lab_order_popup_search">
                    <br-button loader_width="23" class="btn_search" type="submit">
                        <span class="switch_icon_magnifying_glass"></span>
                    </br-button>
                </div>

            </div>

            <div class="left_body_cont">
                <div class="group_category_cont">
                    
                </div>

                <div class="group_category_list">
                    <div class="lab_order_list_item selected" data_src="x_ray_1">
                        <p>X-Ray 1</p>
                        <span class='switch_icon_check_box'></span>
                    </div>

                </div>

                <div class="lab_order_pop_loader_cont active">
                    <div class="loader"></div>
                </div>

            </div>

        </div>

        <div class="right">
            <div class="top_head">
                <p class="heading">Selected Laboratory Test</p>
            </div>

            <div class="right_body_cont">
                <!-- <div class="lab_order_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div> -->

                <div class="lab_order_pop_loader_cont active">
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

    render_lab_test_data() {
        if (globalStates.getState('lab_test_data_exists')) {
            document.querySelector('.lab_order_popup .left_body_cont .lab_order_pop_loader_cont').classList.remove('active');
            this.loadLabTestCategoryList();
            this.loadLabTestList();
            this.render_selected_lab_test();
        }
        else {
            globalStates.setState({ radiology_data_render_function: 'render_lab_test_data' });
        }
    }

    render_selected_lab_test() {
        const selected_radiology_list = document.querySelector('.lab_order_popup .right_body_cont');
        selected_radiology_list.innerHTML = '';
        // the item is the id of radiology test so take name from the radiology_data.radiology_tests
        const lab_test_data = globalStates.getState('lab_test_data');

        if (this.selected_lab_test.length > 0) {



            this.selected_lab_test.forEach((item_id) => {

                const item = lab_test_data.lab_test_tests.find(val => parseInt(val.id) === item_id);
                if (!item) return;
                var row_item = document.createElement('div');
                row_item.classList.add('lab_order_list_item');
                row_item.classList.add('selected');
                row_item.setAttribute('data_src', item.id);
                row_item.innerHTML = `
                <p>${item.name}</p>
                <span class='switch_icon_indeterminate_check_box'></span>
                `;

                row_item.addEventListener('click', () => {
                    //remove the clicked item from the selected_radiology_test array
                    this.selected_lab_test = this.selected_lab_test.filter((selected_items) => selected_items != item_id);
                    // remove the item from the selected_radiology_test array
                    this.render_selected_lab_test();
                    // remove the item from the selected_radiology_test array
                    this.loadLabTestList();
                });

                selected_radiology_list.prepend(row_item);
            }
            );
        }
    }

    loadLabTestCategoryList() {
        if (globalStates.getState('lab_test_data_exists')) {
            const lab_test_data = globalStates.getState('lab_test_data');
            const category_list = document.querySelector('.lab_order_popup .group_category_cont');

            category_list.innerHTML = '';

            var category_list_data = lab_test_data.lab_test_category;
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
                    this.loadLabTestList();
                });

                category_list.appendChild(category_item);
                is_first_active = true
            });

        }
    }

    loadLabTestList() {
        if (globalStates.getState('lab_test_data_exists')) {
            const lab_test_data = globalStates.getState('lab_test_data');
            const lab_test_list = document.querySelector('.lab_order_popup .group_category_list');
            lab_test_list.innerHTML = '';

            var lab_test_list_data = lab_test_data.lab_test_tests;
            lab_test_list_data.forEach((item) => {
                if (this.searchQuery != '' && !item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                    return;
                }
                if (item.category == this.selected_category) {
                    var span_class = "switch_icon_check_box_outline_blank";
                    var lab_test_item = document.createElement('div');
                    lab_test_item.classList.add('lab_test_list_item');

                    if (this.selected_lab_test.includes(parseInt(item.id))) {
                        lab_test_item.classList.add('selected');
                        span_class = "switch_icon_check_box";
                    }
                    lab_test_item.setAttribute('data_src', item.id);
                    lab_test_item.innerHTML = `
                                                <p>${item.name}</p>
                                                <span class='${span_class}'></span>
                `;
                    lab_test_item.addEventListener('click', () => {
                        const selected_item = parseInt(lab_test_item.getAttribute('data_src'));
                        // check if the clicked item has class selected
                        if (lab_test_item.classList.contains('selected')) {
                            lab_test_item.classList.remove('selected');
                            // remove the item from the selected_lab_test array
                            this.selected_lab_test = this.selected_lab_test.filter((item) => item != selected_item);
                            // replace the span class with switch_icon_check_box_outline_blank
                            lab_test_item.querySelector('span').classList.replace('switch_icon_check_box', 'switch_icon_check_box_outline_blank');
                        }
                        else {
                            // replace the span class with switch_icon_check_box
                            lab_test_item.querySelector('span').classList.replace('switch_icon_check_box_outline_blank', 'switch_icon_check_box');
                            lab_test_item.classList.add('selected');
                            // add the item to the selected_lab_test array
                            this.selected_lab_test.push(selected_item);
                        }
                        this.render_selected_lab_test();
                    });

                    lab_test_list.appendChild(lab_test_item);
                }
            });
        }
    }

    attachListeners() {
        const cancel_btns = document.querySelectorAll('.lab_order_popup #confirm_cancel, .lab_order_popup .close_btn');

        cancel_btns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.close();
            });
        });

        const search_input = document.querySelector('.lab_order_popup .lab_order_popup_search');
        search_input.addEventListener('input', debounce((e) => {
            this.searchQuery = e.target.value;

            this.loadLabTestList();
        }, 500));

        const search_btn = document.querySelector('.lab_order_popup .btn_search');
        search_btn.addEventListener('click', () => {
            this.searchQuery = search_input.value;
            this.loadLabTestList();
        });

        const submit_btn = document.querySelector('.lab_order_popup br-button[type="btn"]');
        submit_btn.addEventListener('click', () => {
            if (this.selected_lab_test.length == 0) {
                notify('top_left', 'Please select at least one radiology test', 'warning');
                return;
            }
            this.save_lab_test_order();
        });
    }


    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    async save_lab_test_order() {
        var data = {
            lab_order: this.selected_lab_test,
            visit_id: this.visit_id
        };


        try {
            const response = await fetch('/api/patient/save_lab_test_order', {
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
                notify('top_left', result.message, 'success');
                dashboardController.visitLabExamCardView.PreRender({
                    visit_id: this.visit_id,
                    state: this.state,
                    data: result.data,
                    visit_status: this.visit_status
                });


                this.close();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
    }
}