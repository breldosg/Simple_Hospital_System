import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, decodeHTML, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitsOtherServicePopUpView {
    constructor() {
        window.OtherService_Search_services = this.OtherService_Search_services.bind(this);
        window.add_to_other_service_pending = this.add_to_other_service_pending.bind(this);
        this.visit_id = null;
        this.batchNumber = 1;
        this.selected_product = '';
        this.pending_data = new Set();
        this.load_more_btn = null;
        applyStyle(this.style());
    }

    async PreRender(params) {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        console.log(params);

        this.visit_id = params.visit_id;
        this.state = params.state;
        this.visit_status = params.visit_status ? params.visit_status : 'checked_out';


        // Clear all constructor variables
        this.selected_product = '';
        this.pending_data.clear;
        this.load_more_btn = null;
        this.batchNumber = 1;

        // Render the initial structure with the loader
        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn(params, 'active');


        this.main_container = document.querySelector('.other_service_popup');

        this.attachListeners();
        this.OtherService_Search_services('');
    }

    ViewReturn() {
        return `
<div class="container other_service_popup">
    <div class="left">
        <div class="slider" id="search_slide">
            <p class="heading">Select Service</p>
            <div class="search_cont_cont">
                <br-form callback="OtherService_Search_services">
                    <div class="search_cont">
                        <br-input label="Service Name" name="query" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 350px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

                    <br-button loader_width="23" class="btn_search" type="submit">
                        <span class='switch_icon_magnifying_glass'></span>
                    </br-button>

                    </div>
                </br-form>
                
            </div>

            <div class="result_cont scroll_bar">
                ${this.loader_view()}
            </div>
        </div>

        <div class="slider" id="input_slide">
            <div class="heading_cont">
                <p class="heading">Add Service Detail</p>
                <div class="btn_back" id="back_btn">
                    <span class='switch_icon_keyboard_arrow_right'></span>
                </div>
            </div>

            <br-form id="more_detail_form" callback="add_to_other_service_pending">
                <div class="search_cont">
                    <br-input name="id" label="Service Name" id="service_name_view" type="text" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;" disable="true"></br-input>

                    <br-input required name="quantity" label="Quantity" value="1" type="number" styles="
                    border-radius: var(--input_main_border_r);
                    width: 400px;
                    padding: 10px;
                    height: 41px;
                    background-color: transparent;
                    border: 2px solid var(--input_border);
                    " labelStyles="font-size: 12px;"></br-input>

                    <div class="btn">
                        <br-button loader_width="23" class="btn_next" type="submit">Add</br-button>
                    </div>
                </div>
            </br-form>
        </div>
    </div>

    <div class="line"></div>

    <div class="right">
        <div class="heading_cont">
            <p class="heading">Service Details</p>
        </div>
        <div class="pending_data_view">
            <div class="pending_data_body scroll_bar" id="table_body_for_pending_data">
                <div class="start_page">
                    <p>No Services Added</p>
                </div>
            </div>
            <div class="btn_cont">
                <br-button loader_width="23" class="btn_next" type="cancel">Cancel</br-button>
                <br-button loader_width="23" class="btn_next submit_btn disabled" type="submit">Save Services</br-button>
            </div>
        </div>
    </div>
</div>
`;
    }

    no_data_view() {
        return `
        <div class="start_page">
            <p>No Services Added</p>
        </div>`;
    }

    attachListeners() {
        const cancel_btn = this.main_container.querySelector('br-button[type="cancel"]');
        cancel_btn.addEventListener('click', () => {
            this.close();
        });

        const back_btn = this.main_container.querySelector('#back_btn');
        back_btn.addEventListener('click', () => {
            this.back_to_search_view();
        });

        const submit_btn = this.main_container.querySelector('.submit_btn[type="submit"]');
        submit_btn.addEventListener('click', async () => {
            await this.save_other_services(submit_btn);
        });
    }

    async save_other_services(btn) {
        btn.setAttribute('loading', true);

        if (this.pending_data.size <= 0) {
            notify('top_left', 'No Services Added.', 'warning');
            btn.removeAttribute('loading');
            return;
        }


        var body_form = {
            visit_id: this.visit_id,
            order_data: Array.from(this.pending_data),
        };

        try {
            const response = await fetch('/api/patient/save_other_services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body_form)
            });

            if (!response.ok) {
                throw new Error('Server Error');
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



            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }
            notify('top_left', result.message, 'success');
            this.close();
            dashboardController.visitOtherServicesCardView.PreRender({
                visit_id: this.visit_id,
                state: this.state,
                data: result.data,
                visit_status: this.visit_status
            });

        } catch (error) {
            console.error('Error:', error);
            notify('top_left', 'Failed To Save Services.', 'error');
        } finally {
            btn.removeAttribute('loading');
        }
    }

    async fetch_data(searchTerm) {

        try {
            const response = await fetch('/api/patient/search_all_services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: searchTerm,
                    batch: this.batchNumber,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
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


            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    loader_view() {
        return `
                <div class="loader_cont active">
                    <div class="loader"></div>
                </div>
        `;
    }

    async OtherService_Search_services(query) {
        if (this.load_more_btn == null) this.batchNumber = 1;

        const tableBody = document.querySelector('.result_cont');
        if (this.batchNumber == 1) {
            tableBody.innerHTML = this.loader_view();
        }

        const data = await this.fetch_data(query.query);

        if (this.batchNumber === 1) {
            tableBody.innerHTML = '';
        }

        if (data.servicesList && data.servicesList.length > 0) {
            if (this.load_more_btn) { this.load_more_btn.remove(); }
            this.load_more_btn = null;

            data.servicesList.forEach((service) => {
                const row = document.createElement('div');
                row.classList.add('row');
                row.setAttribute('data_src', service.id);
                row.setAttribute('title', decodeHTML(service.name));
                row.innerHTML = `
                    <div class="info_top">
                        <p class="name">${service.name}</p>
                    </div>
                `;
                row.addEventListener('click', () => {
                    this.open_fill_form(service.id, decodeHTML(service.name), service.status);
                });
                tableBody.appendChild(row);
            });

            if (data.pages > this.batchNumber) {
                const btn_cont = document.createElement('div');
                btn_cont.classList.add('more_btn_cont');
                btn_cont.innerHTML = `
                    <br-button loader_width="22" class="more_btn" title="Load More">Load More</br-button>
                `;
                const btn = btn_cont.querySelector('.more_btn');
                btn.addEventListener('click', () => {
                    this.batchNumber += 1;
                    btn.setAttribute('loading', 'true');
                    this.load_more_btn = btn_cont;
                    this.OtherService_Search_services(query);
                });

                tableBody.appendChild(btn_cont);
            }
        } else {
            tableBody.innerHTML = `
                <div class="start_view">
                    <p class="start_view_overlay">No Results Found</p>
                </div>
            `;
        }
    }

    open_fill_form(id, name, status) {
        const check_if_exist = [...this.pending_data].some(data => data.product == id);

        if (check_if_exist) {
            notify('top_left', 'Service already exists in the other services list.', 'warning');
            return;
        }

        document.getElementById('input_slide').scrollIntoView({ behavior: 'smooth' });
        const service_name_view = document.querySelector('#service_name_view');
        this.selected_product = {
            name: name,
            id: id,
            status: status
        };
        service_name_view.setValue(name);
        service_name_view.setAttribute('shadow_value', id);
    }

    add_to_other_service_pending(data) {
        data = {
            product_name: this.selected_product.name,
            ...data
        };

        this.selected_product = '';

        this.pending_data.add(data);

        this.render_cards();
        this.back_to_search_view();
    }

    render_cards() {
        const container = this.main_container.querySelector('#table_body_for_pending_data');

        container.innerHTML = '';
        const submit_btn = this.main_container.querySelector('.submit_btn[type="submit"]');

        if (this.pending_data.size <= 0) {
            container.innerHTML = this.no_data_view();
            if (submit_btn) {
                submit_btn.classList.add('disabled');
            }
            return;
        }

        if (submit_btn) {
            submit_btn.classList.remove('disabled');
        }

        this.pending_data.forEach((data) => {


            const card = document.createElement('div');
            card.classList.add('procedure_card');
            card.innerHTML = `
            <div class="top">
                <div class="card_left">
                    <p class="date">${data.product_name}</p>
                    <!-- <p class="created_by">Jan 24, 2025</p> -->
                </div>
                <div class="card_right">
                    <div class="delete_btn btn">
                        <span class="switch_icon_delete"></span>
                    </div>
                </div>
            </div>

            <div class="data">
                <p class="head">Quantity:</p>
                <p class="description">${data.quantity}</p>
            </div>
                    `;
            card.setAttribute('title', data.product_name);


            const remove_btn = card.querySelector('.delete_btn');
            remove_btn.addEventListener('click', () => {
                this.remove_from_pending(data);
            });


            container.prepend(card);

        });
    }

    remove_from_pending(data) {
        this.pending_data.delete(data);
        this.render_cards();
    }

    back_to_search_view() {
        document.getElementById('search_slide').scrollIntoView({ behavior: 'smooth' });
        document.querySelector('#more_detail_form').reset();
    }

    close() {
        this.pending_data.clear();
        this.selected_product = '';
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    style() {
        return `
    .other_service_popup {
        border-radius: var(--main_border_r);
        background-color: var(--pure_white_background);
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 90%;
        width: 90%;
        max-width: 1300px;
        max-height: 650px;


        .loader_cont {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background-color: var(--pure_white_background);
            display: flex;
            justify-content: center;
            align-items: center;

        }

        .heading {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .left,
        .right {
            height: 100%;
            flex: none;
        }

        .line {
            width: 2px;
            border-radius: 2px;
            height: 95%;
            background: var(--input_border);
        }

        .left {
            display: flex;
            overflow: hidden;
            width: 500px;

            .slider {
                padding: 50px;
                width: 100%;
                height: 100%;
                flex: none;
                display: flex;
                flex-direction: column;
                gap: 10px;

                .search_cont_cont {
                    .search_cont {
                        display: flex;
                        gap: 10px;
                        width: 100%;
                        align-items: flex-end;
                        flex-direction: row;

                        .btn_search {
                            border: none;
                            background-color: var(--pri_color);
                            width: 50px;
                            height: 40px;
                            cursor: pointer;
                            border-radius: var(--input_main_border_r);
                            display: flex;
                            justify-content: center;
                            align-items: center;

                            span {
                                font-size: 17px;
                                color: var(--white);
                            }
                        }
                    }
                }

                .result_cont {
                    display: flex;
                    gap: 5px;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    overflow-y: scroll;
                    border-top: 2px solid var(--input_border);
                    padding-top: 10px;
                    position: relative;

                    .start_view {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;

                        .start_view_overlay {
                            font-size: 16px;
                            font-weight: 600;
                            color: var(--black-op2);
                        }
                    }

                    .row {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        gap: 5px;
                        width: 100%;
                        padding: 10px;
                        border-radius: var(--input_main_border_r);
                        cursor: pointer;
                        opacity: 1;
                        transform: translateY(0);
                        border: solid 1px var(--pri_border_color);

                        .info_top {
                            display: flex;
                            justify-content: space-between;
                            gap: 5px;
                        }

                        .name {
                            font-size: 14px;
                            font-weight: 600;
                        }
                    }

                    .row:hover {
                        background-color: var(--pri_op1);
                    }

                    .more_btn_cont {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        padding-block: 10px;

                        .more_btn {
                            border: none;
                            background-color: var(--gray_text);
                            padding: 10px 20px;
                            font-weight: 500;
                            font-size: 12px;
                            color: var(--white);
                            text-align: center;
                            cursor: pointer;
                            border-radius: 20px;
                        }

                        .more_btn:hover {
                            background-color: var(--btn_hover_color);
                            color: var(--white)
                        }
                    }
                }

                .scroll_bar::-webkit-scrollbar-thumb {
                    background-color: var(--gray_text);
                }

                .search_cont {
                    display: flex;
                    gap: 10px;
                    width: 100%;
                    flex-direction: column;

                    .btn {
                        padding-top: 10px;
                        display: flex;
                        flex-direction: column;
                        justify-content: end;
                        height: 100%;

                        .btn_next {
                            border: none;
                            background-color: var(--pri_color);
                            padding: 10px 20px;
                            font-weight: bold;
                            width: 100%;
                            font-size: 14px;
                            color: var(--white);
                            text-align: center;
                            cursor: pointer;
                            border-radius: var(--input_main_border_r);

                            span {
                                color: var(--white);
                                font-size: 14px;
                            }
                        }
                    }
                }

                .heading_cont {
                    display: flex;
                    width: 100%;
                    justify-content: space-between;
                    align-items: center;

                    .btn_back {
                        border: none;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        cursor: pointer;
                        border-radius: var(--input_main_border_r);
                    }

                    .btn_back:hover {
                        background-color: var(--btn_hover_color);

                        span {
                            color: var(--white);
                        }
                    }
                }
            }
        }

        .right {
            padding: 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: calc(100% - 502px);
            gap: 10px;

            .heading_cont {
                display: flex;
                width: 100%;
                justify-content: space-between;
                align-items: center;
            }

            .pending_data_view {
                width: 100%;
                height: 100%;
                padding-top: 15px;
                display: flex;
                flex-direction: column;

                .pending_data_body {
                    width: 100%;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    overflow-y: scroll;
                    height: 100%;

                    .start_page {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;

                        p {
                            font-size: 16px;
                            font-weight: 600;
                            color: var(--black-op2);
                        }
                    }

                    .procedure_card {
                        display: flex;
                        flex-direction: column;
                        width: calc(50% - 20px);
                        max-width: 341px;
                        padding: 15px;
                        height: fit-content;
                        border-radius: var(--main_border_r);
                        border: solid 1px var(--pri_border_color);
                        flex-grow: 1;


                        .top {
                            border: none;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            .card_left {
                                width: 70%;
                            }

                            .card_right {
                                display: flex;
                                gap: 10px;

                                .btn {
                                    width: 35px;
                                    height: 35px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border-radius: 5px;
                                    flex: none;
                                    cursor: pointer;

                                    span {
                                        font-size: 16px;
                                    }
                                }

                                .btn:hover {
                                    background-color: var(--pri_op);

                                    span {
                                        color: var(--pri_color);
                                    }
                                }

                                .delete_btn:hover {
                                    background-color: var(--white_error_color_op1);

                                    span {
                                        color: var(--error_color);
                                    }
                                }
                            }

                            .date {
                                font-size: 16px;
                                font-weight: 900;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                display: -webkit-box;
                                -webkit-box-orient: vertical;
                                -webkit-line-clamp: 2;

                            }

                            .created_by {
                                font-size: 13px;
                            }
                        }

                        .data {
                            display: flex;
                            gap: 5px;
                            align-items: center;
                            padding-block: 5px;
                            border-bottom: 1px solid var(--input_border);

                            .head {
                                font-weight: 500;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                                display: inline-block;
                            }

                            .description {
                                width: 40%;
                                font-weight: 600;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                                display: inline-block;
                            }
                        }

                        .note {
                            flex-direction: column;
                            gap: 10px;
                            height: 100%;
                            overflow: auto;

                            .head {
                                font-weight: 700;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                                display: inline-block;
                                width: 100%;
                                flex: none;
                            }

                            .description {
                                width: 100%;
                                font-weight: 400;
                                white-space: unset;
                                text-overflow: unset;
                                overflow: unset;
                                display: unset;
                                word-break: break-all;
                                overflow-y: scroll;
                                height: 100%;
                            }
                        }

                        .pills {
                            align-items: left;
                            flex-direction: column;
                            gap: 10px;

                            .head {
                                font-weight: 700;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                                display: inline-block;
                                width: 100%;
                            }

                            .pills_cont {
                                width: 100%;
                                display: flex;
                                gap: 5px;
                                width: 100%;
                                overflow-x: scroll;

                                .pill {
                                    flex: none;
                                    white-space: nowrap;
                                    text-overflow: ellipsis;
                                    overflow: hidden;
                                    display: inline-block;
                                    width: auto;
                                    max-width: 200px;
                                    padding: 5px 10px;
                                    background-color: var(--pri_op);
                                    font-weight: 700;
                                    border-radius: 15px;
                                    font-size: 10px;
                                }
                            }
                        }

                        .data:last-child {
                            border: none;
                        }
                    }

                    .example {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        height: 100%;
                        font-weight: 600;

                        .word {
                            font-size: 16px;
                            font-weight: 600;
                            color: var(--black-op2);
                        }
                    }

                    .procedure_card:hover {
                        /* box-shadow: 0 0 5px 0 #0000003e; */
                        background: var(--pri_op1);
                    }



                }


                .btn_cont {
                    width: 100%;
                    border-top: 2px solid var(--border_color);
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-top: 20px;
                    gap: 20px;
                    flex: none;

                    .btn_next[type="cancel"] {
                        background-color: var(--error_color);
                    }

                    .btn_next[type="cancel"]:hover {
                        background-color: var(--btn_error_hover_color);
                    }

                    .btn_next {
                        border: none;
                        background-color: var(--pri_color);
                        padding: 10px 20px;
                        font-weight: bold;
                        font-size: 14px;
                        color: var(--white);
                        text-align: center;
                        cursor: pointer;
                        border-radius: var(--input_main_border_r);

                        span {
                            color: var(--white);
                            font-size: 14px;
                        }
                    }
                }
            }
        }
    }

        `;
    }

}



