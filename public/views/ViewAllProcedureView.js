import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, currency_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewAllProcedureView {
    constructor() {
        window.procedure_search_on_view_all_procedure = this.search_procedure.bind(this);
        this.procedureData = [];
        this.batchNumber = 1;
        this.total_page_num = 1;
        this.total_data_num = 0;
        this.show_count_num = 0;
        this.searchTerm = '';
        this.isLoading = false;  // Prevent multiple fetch calls at the same time
        this.page_shift = false;  // Prevent multiple fetch calls at the same time

        applyStyle(this.style());
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        this.main_component = document.querySelector('.procedure_all_view_cont');

        // Get the current path, default to '/users' if on '/dashboard'
        const rawPath = window.location.pathname.toLowerCase();

        this.side_fetched = rawPath.split('/')[1];

        // Fetch the initial batch of radiology data
        await this.fetchAndRenderData();
        this.attachEventListeners();

    }

    attachEventListeners() {

        // Open Close Filter Section buttons
        var open_close = this.main_component.querySelector('.heading_cont');
        open_close.addEventListener('click', () => {
            const filter_section = this.main_component.querySelector('.medicine_top');
            var open_close_btn = this.main_component.querySelector('#open_close_search');

            if (open_close_btn.classList.contains('closed')) {
                open_close_btn.classList.remove('closed');
                filter_section.classList.remove('closed');
            }
            else {
                open_close_btn.classList.add('closed');
                filter_section.classList.add('closed');
            }

        });

        // Pagination buttons
        this.main_component.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                this.page_shift = true;
                await this.fetchAndRenderData();
            }
        });

        this.main_component.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (!this.isLoading && this.batchNumber > 1) {
                this.batchNumber -= 1;
                this.page_shift = true;
                await this.fetchAndRenderData();
            }
        });

        var open_add_procedure_popup = this.main_component.querySelector('#open_add_procedure_popup');
        if (open_add_procedure_popup) {
            open_add_procedure_popup.addEventListener('click', () => {
                dashboardController.createUpdateProcedurePopUp.PreRender();
            });
        }
    }

    async fetchAndRenderData() {
        if (this.isLoading) return;  // Prevent multiple fetches
        this.isLoading = true;
        this.loading_and_nodata_view();

        if (!this.page_shift) {
            this.main_component.querySelector('.search_containers').innerHTML = this.searchProcedureView();
        }

        const procedureData = await this.fetchData(); // Fetch data
        this.procedureData = procedureData || [];
        this.render();

        this.isLoading = false;
        this.page_shift = false;
    }

    render() {
        if (this.procedureData.proceduresList && this.procedureData.proceduresList.length > 0) {
            this.populateTable(this.procedureData);
        } else {
            this.displayNoDataMessage();
        }
    }

    populateTable(procedureData) {
        const tableBody = this.main_component.querySelector('.table_body');
        tableBody.innerHTML = '';  // Clear table before populating


        const show_count = this.main_component.querySelector('.show_count');
        const total_data = this.main_component.querySelector('.total_data');
        const total_page = this.main_component.querySelector('.total_page');
        const current_page = this.main_component.querySelector('.current_page');

        show_count.innerText = procedureData.showData;
        total_data.innerText = procedureData.total;
        total_page.innerText = procedureData.pages;
        current_page.innerText = procedureData.batch;
        this.total_page_num = procedureData.pages;


        procedureData.proceduresList.forEach((procedure, index) => {
            const row = document.createElement('div');
            row.className = 'tr d_flex flex__c_a';
            row.setAttribute('title', procedure.name);

            row.innerHTML = `
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${procedure.name}</p>
                    <p class="name">${procedure.category == null ? 'No Category' : procedure.category}</p>
                    <p class="remain">${currency_formatter(procedure.price)}</p>
                    <p class="status ${procedure.status == 'inactive' ? 'inactive' : ''}">${procedure.status}</p>
                    <div class="action d_flex flex__c_c">
                        <button class="main_btn edit_procedure_btn">Edit</button>
                    </div>
            `;

            // add event listener to the edit procedure btn
            row.querySelector('.edit_procedure_btn').addEventListener('click', () => {
                var new_procedure = {
                    id: procedure.id,
                    name: procedure.name,
                    category: procedure.category_id,
                    status: procedure.status
                };
                dashboardController.createUpdateProcedurePopUp.PreRender(new_procedure);
                console.log('edit procedure btn clicked', new_procedure);
            });

            tableBody.appendChild(row);
        });

        // clear variables
        this.procedureData = [];
    }

    async fetchData() {
        try {
            const response = await fetch('/api/billing/search_procedure_for_billing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,
                    batch: this.batchNumber
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


            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    async search_procedure(data) {
        this.loadingContent();
        this.searchTerm = data.query;
        this.batchNumber = 1; // Reset to first batch on search
        this.page_shift = true;
        await this.fetchAndRenderData();
    }

    loadingContent() {
        const tableBody = this.main_component.querySelector('.table_body');
        tableBody.innerHTML = `
            <div class="start_page deactivate">
                <p>No Procedure Found</p>
            </div>
            <div class="loader_cont active"><div class="loader"></div></div>
        `;
    }

    displayNoDataMessage() {
        const show_count = this.main_component.querySelector('.show_count');
        const total_data = this.main_component.querySelector('.total_data');
        const total_page = this.main_component.querySelector('.total_page');
        const current_page = this.main_component.querySelector('.current_page');

        current_page.innerText = 1;
        show_count.innerText = 0;
        total_data.innerText = 0;
        total_page.innerText = 1;
        this.main_component.querySelector('.start_page').style.display = 'flex';
        this.main_component.querySelector('.table_body .loader_cont').classList.remove('active');
        this.total_page_num = 1;
    }

    searchProcedureView() {
        return `
        <br-form callback="procedure_search_on_view_all_procedure">
            <div class="medicine_content">
                <br-input label="Procedure Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter procedure name" styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>
                
                <div class="med_btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit" >Search</br-button>
                </div> 
            </div>
        </br-form>
            `;
    }

    loading_and_nodata_view() {
        this.main_component.querySelector('.table_body').innerHTML = `
        <div class="start_page deactivate">
            <p>No Procedure Found</p>
        </div>
        <div class="loader_cont active"><div class="loader"></div></div>
                    `;
    }

    ViewReturn() {
        return `
    <div class="procedure_all_view_cont">
    
    <div class="medicine_top closed">
    <div class="heading_cont">
                <h4>Search Procedure</h4>

                <div class="open_close_filter closed" title="Open Filter" id="open_close_search">
                    <span class='switch_icon_keyboard_arrow_up'></span>
                </div>

            </div>
    <div class="search_containers">
        <div>
            <div class="medicine_content">
                <br-input label="Procedure Name" name="query" type="text" value="${this.searchTerm == null ? '' : this.searchTerm}" placeholder="Enter procedure name" styles="
                            border-radius: var(--input_main_border_r);
                            width: 400px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 12px;"></br-input>
        
                <div class="med_btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit" >Search</br-button>
                </div> 

                <div class="loader_cont active"><div class="loader"></div></div>

            </div>
        </div>
    </div>
    
    </div>
    
    <div class="main_section medicine_table_out">
    
        <div class="in_table_top d_flex flex__u_s">
            <h4>Procedure List</h4>

            <div class="add_btn" title="Create New Procedure" id="open_add_procedure_popup">
                <span class="switch_icon_add"></span>
            </div>
        </div>
        <div class="outpatient_table">
    
            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="name">Category</p>
                <p class="remain">Price</p>
                <p class="status">Status</p>
                <div class="action"></div>
            </div>
    
            <div class="table_body d_flex flex__co">
                <div class="start_page deactivate">
                <p>No Procedure Found</p>
            </div>
            <div class="loader_cont active"><div class="loader"></div></div>
            </div>
    
            <div class="table_footer d_flex flex__e_b">
                <p>Show <span class='show_count'>${this.show_count_num}</span> data of <span class="total_data">${this.total_data_num}</span></p>
                <div class="pagenation d_flex flex__c_c">
                    <button type="button" class="main_btn prev">Prev</button>
                    <p class="page_no d_flex flex__c_c"><span class="current_page" >${this.batchNumber}</span>/<span class="total_page" >${this.total_page_num}</span></p>
                    <button type="button" class="main_btn next">Next</button>
                </div>
            </div>
    
        </div>
    
    </div>
    
    </div>
        `;
    }



    style() {
        return `
        .procedure_all_view_cont {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            overflow-y: scroll;

            .medicine_top {
                width: 100%;
                background-color: var(--pure_white_background);
                /* height: 100px; */
                border-radius: 10px;
                padding: 20px;

                .heading_cont {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;

                    .open_close_filter {
                        width: 35px;
                        height: 35px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        flex: none;

                        span {
                            font-size: 20px;
                            /* color: var(--btn_hover_color); */
                        }
                    }


                    .open_close_filter.closed {
                        transform: rotate(180deg);
                    }

                }

                .medicine_content {
                    margin-top: 20px;
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                    position: relative;

                    .loader_cont {
                        position: absolute;
                    }
                }
            }

            .medicine_top.closed {

                .search_containers {
                    display: none;
                }

            }

            .med_btn_cont {
                display: flex;
                width: 100%;
                justify-content: end;
                align-items: end;

                .btn_next {
                    border: none;
                    background-color: var(--pri_color);
                    padding: 10px 20px;
                    font-weight: bold;
                    font-size: 12px;
                    color: var(--white);
                    cursor: pointer;
                    border-radius: var(--input_main_border_r);
                }
            }

            .main_section {
                height: 100%;
                width: 100%;
                padding: 20px;
                background-color: var(--pure_white_background);
                border-radius: 10px;

                .in_section_top {
                    height: 50px;
                }
            }

            .medicine_table_out {
                overflow-y: scroll;

                .d_flex {
                    display: flex;
                }

                .flex__u_b {
                    justify-content: space-between;
                }

                .flex__c_a {
                    align-items: center;
                    justify-content: space-around;
                }

                .flex__c_c {
                    align-items: center;
                    justify-content: center;
                }

                .flex__e_b {
                    align-items: flex-end;
                    justify-content: space-between;
                }

                .flex__co {
                    flex-direction: column;
                }

                .in_table_top {
                    height: 50px;
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .add_btn {
                        width: 35px;
                        height: 35px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 5px;
                        flex: none;

                        span {
                            font-size: 20px;
                            /* color: var(--btn_hover_color); */
                        }
                    }

                    .add_btn:hover {
                        background-color: var(--pri_op);
                        cursor: pointer;

                        span {
                            color: var(--light_pri_color);
                        }
                    }
                }

                .outpatient_table {
                    height: calc(100% - 50px);

                    .table_head {
                        background-color: var(--pri_color);
                        height: 50px;
                        border-radius: 5px 5px 0 0;

                        p {
                            font-weight: 600;
                            color: var(--white);
                            font-size: 13px;
                            cursor: default;
                        }
                    }

                    .tr {
                        gap: 2px;

                        p {
                            flex: none;
                            text-align: center;
                        }

                        .id {
                            width: 5%;
                        }

                        .name {
                            width: 28%;
                            text-align: left;
                        }



                        .status {
                            width: 10%;
                            text-transform: capitalize;
                        }

                        .remain {
                            width: 15%;
                        }

                        .action {
                            width: 14%;

                            .error {
                                background-color: var(--error_color);
                            }
                        }
                    }

                    .table_body {
                        padding-block: 5px;
                        gap: 5px;
                        overflow-y: scroll;
                        height: calc(100% - 130px);

                        .tr {
                            flex: none;
                            height: 40px;
                            cursor: pointer;

                            p {
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                                display: inline-block;
                            }

                            .main_btn {
                                height: 30px;
                                padding-inline: 10px;
                                width: 90px;
                            }

                            .status {
                                font-weight: 700;
                                color: var(--light_pri_color);
                            }
                            
                            .inactive {
                                color: var(--error_color);
                            }
                        }

                        .tr:hover {
                            background-color: var(--hover_list_table);
                        }

                        .start_page {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;

                            p {
                                font-size: 16px;
                                font-weight: 600;
                                color: var(--black-op2);
                            }
                        }
                    }

                    .table_footer {
                        height: 80px;

                        p {
                            font-size: 14px;
                            font-weight: bold;
                        }

                        .pagenation {
                            gap: 10px;
                            align-self: flex-end;

                            .page_no {
                                width: 40px;
                                height: 40px;
                                border-radius: 5px;
                                border: 1px solid var(--border_color);
                            }

                            .main_btn {
                                height: 40px;
                                width: 62px;
                                font-weight: bold;
                            }
                        }
                    }
                }
            }
        }

        `;
    }
}
