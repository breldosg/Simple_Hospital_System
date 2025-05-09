import { dashboardController } from "../controller/DashboardController.js";
 
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, debounce, notify, searchInArray } from "../script/index.js";
import { frontRouter } from "../script/route.js";

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

        applyStyle(this.style())
    }

    async PreRender(params = '') {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.selected_radiology_test = [];
        this.visit_id = params.visit_id ? params.visit_id : '';
        this.selected_radiology_test = params.data ? params.data : [];
        this.state = params.state ? params.state : 'creation';
        this.visit_status = params.visit_status ? params.visit_status : 'checked_out';

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners();
        this.render_radiology_data();
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
                <div class="group_category_cont_cont">

                    <div class="group_category_cont scroll_bar">
                    
                    </div>
                </div>

                <div class="group_category_list">
                    

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
            this.render_selected_radiology_test();

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
                const item = radiology_data.radiology_tests.find(val => parseInt(val.id) === item_id);
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
            console.log(category_list_data);

            category_list_data = [
                {
                    id: 0,
                    name: "All"
                },
                ...category_list_data
            ];

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
            console.log(radiology_list_data);

            radiology_list_data.forEach((item) => {
                if (this.searchQuery != '' && !item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                    return;
                }
                if (item.category == this.selected_category || this.selected_category == 0) {
                    var span_class = "switch_icon_check_box_outline_blank";
                    var radiology_item = document.createElement('div');
                    radiology_item.classList.add('radiology_list_item');

                    if (this.selected_radiology_test.includes(parseInt(item.id))) {
                        radiology_item.classList.add('selected');
                        span_class = "switch_icon_check_box";
                    }
                    radiology_item.setAttribute('data_src', item.id);
                    radiology_item.innerHTML = `
                                                <p>${item.name}</p>
                                                <span class='${span_class}'></span>
                                                `;
                    radiology_item.addEventListener('click', () => {
                        const selected_item = parseInt(radiology_item.getAttribute('data_src'));
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
                dashboardController.visitRadiologyExamCardView.PreRender({
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

    style() {
        return `
    .radiology_popUp {
        width: 1200px;
        max-width: 80%;
        height: 650px;
        max-height: 88%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        /* padding: 50px; */
        position: relative;
        z-index: 1;

        .cont_heading {
            background: var(--pure_white_background);
            border-radius: var(--main_border_r);
            box-shadow: 0 0 5px 0 #0000001d;
            padding: 10px 20px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .heading {
                font-size: 17px;
                font-weight: bold;
            }

            .close_btn {
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 5px;
                flex: none;
                cursor: pointer;
            }

            .close_btn:hover {
                box-shadow: 0 0 5px 0 #00000019;
            }

        }

        .radiology_pop_cont {
            /* padding: 20px; */
            display: flex;
            width: 100%;
            height: 100%;
            gap: 20px;
            overflow: scroll;

            .radiology_pop_loader_cont {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-color: var(--pure_white_background);
                display: none;
                justify-content: center;
                align-items: center;

            }

            .radiology_pop_loader_cont.active {
                display: flex;
            }

            .left {
                padding-block: 20px;
                width: 70%;
                background: var(--pure_white_background);
                border-radius: var(--main_border_r);
                box-shadow: 0 0 5px 0 #0000001d;
                display: flex;
                flex-direction: column;
                gap: 20px;
                overflow: hidden;

                .top_head {
                    padding-inline: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    /* border-bottom: 1px solid var(--input_border); */

                    .heading {
                        font-size: 15px;
                        font-weight: 700;
                    }

                    .search_cont {
                        display: flex;
                        align-items: center;
                        /* border: 2px solid var(--black-op3); */
                        box-shadow: 0 0 5px 0 #23989e38;
                        border-radius: var(--main_border_r);
                        overflow: hidden;

                        .radiology_popup_search {
                            width: 250px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: none;

                        }

                        .btn_search {
                            border: none;
                            /* background-color: var(--pri_color); */
                            width: 50px;
                            height: 40px;
                            cursor: pointer;
                            /* border-radius: var(--input_main_border_r); */
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                    }

                }

                .left_body_cont {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    height: calc(100% - 60px);
                    position: relative;
                    /* overflow-y: scroll; */

                    .group_category_cont_cont {
                        width: 100%;
                        padding-inline: 20px;

                        .group_category_cont {
                            display: flex;
                            gap: 10px;
                            overflow-x: scroll;
                            padding-bottom: 10px;

                            .group_category {
                                flex: none;
                                padding: 10px 20px;
                                /* box-shadow: 0 0 5px 0 #0000000b; */
                                border-radius: var(--main_border_r);
                                cursor: pointer;
                                border: 1px solid #00000007;


                                p {
                                    font-weight: 800;
                                }
                            }

                            .group_category:hover {
                                border: 1px solid var(--light_pri_color);
                                box-shadow: 0 0 5px 0 #0000000b;

                            }

                            .group_category.active {
                                border: 1px solid var(--light_pri_color);
                                background-color: var(--pri_op);

                                p {
                                    color: var(--light_pri_color);
                                }
                            }
                        }
                    }

                    .group_category_list {
                        padding-inline: 20px;
                        padding-bottom: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                        width: 100%;
                        overflow-y: scroll;
                        height: 100%;

                        .radiology_list_item {
                            padding: 15px 20px;
                            width: 100%;
                            border-radius: var(--main_border_r);
                            cursor: pointer;
                            border: 1px solid #00000007;
                            display: flex;
                            justify-content: space-between;

                            span {
                                font-size: 12px;
                                display: flex;
                                align-items: center;
                            }
                        }

                        .radiology_list_item.selected {
                            border: 1px solid var(--light_pri_color);

                            span {
                                color: var(--light_pri_color);
                            }
                        }

                        .radiology_list_item.selected:hover {
                            border: 1px solid var(--light_pri_color);
                            box-shadow: 0 0 5px 0 #0000000b;

                            span {
                                color: var(--light_pri_color);
                            }
                        }



                        .radiology_list_item:hover {
                            border: 1px solid var(--light_pri_color);
                            box-shadow: 0 0 5px 0 #0000000b;

                            span {
                                color: var(--light_pri_color);
                            }
                        }

                    }
                }

                .loader_cont {
                    position: absolute;
                }

            }

            .right {
                padding-block: 20px;
                background: var(--pure_white_background);
                border-radius: var(--main_border_r);
                box-shadow: 0 0 5px 0 #0000001d;
                width: 30%;
                display: flex;
                flex-direction: column;
                gap: 20px;
                justify-content: space-between;

                .top_head {
                    padding: 10px 20px;
                    /* border-bottom: 1px solid var(--input_border); */

                    .heading {
                        font-size: 15px;
                        font-weight: 700;
                    }
                }

                .right_body_cont {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    height: 100%;
                    overflow-y: scroll;
                    padding-inline: 20px;
                    padding-bottom: 20px;
                    position: relative;

                    .radiology_list_item {
                        padding: 15px 20px;
                        width: 100%;
                        box-shadow: 0 0 5px 0 #0000000b;
                        border-radius: var(--main_border_r);
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        border: 1px solid var(--light_pri_color);

                        span {
                            color: var(--light_pri_color);
                            font-size: 12px;
                            display: flex;
                            align-items: center;

                        }
                    }

                    .radiology_list_item:hover {
                        box-shadow: 0 0 5px 0 #0000000b;
                    }
                }


            }


        }


        .btn_cont {
            padding-inline: 20px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: end;
            gap: 10px;
            padding-top: 0;
            /* margin-top: 30px; */

            br-button {
                border: none;
                background-color: var(--pri_color);
                padding: 10px 35px;
                font-weight: bold;
                font-size: 12px;
                color: var(--white);
                cursor: pointer;
                border-radius: var(--input_main_border_r);
            }

            .secondary {
                background-color: var(--gray_text);
                color: var(--white);
            }

        }

    }

    @media screen and (max-width: 850px) {
        .radiology_popUp {
            gap:0;
            width:100%;
            max-width:95%;
            height:88%;
            background:var(--pure_white_background);
            border-radius: var(--main_border_r);


            .radiology_pop_cont {
                flex-direction:column;
                gap:0;

                .left{
                    width:100%;
                    height:100%;
                    .top_head{
                        .heading{
                            display:none;
                        }

                        .search_cont{
                            width:100%;
                            .radiology_popup_search{
                                width:100%;
                            }
                        }
                    }
                }

                .right {
                    box-shadow:none;
                    width:100%;
                    .top_head,.right_body_cont {
                        display:none;
                    }
                }   
            } 
        }
    }


        `
    }
}