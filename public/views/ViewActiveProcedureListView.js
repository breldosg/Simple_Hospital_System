import { dashboardController } from "../controller/DashboardController.js";
import { visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ViewActiveProcedureListView {
    constructor() {
        this.PatientData = [];
        this.batchNumber = 1; // Keep track of current batch
        this.total_page_num = 1; // Keep track of current batch
        this.total_data_num = 0; // Keep track of current batch
        this.show_count_num = 0; // Keep track of current batch
        this.searchTerm = '';  // Store the current search term

        this.applyStyle();
    }

    async PreRender() {

        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        // Fetch the initial batch of Patient data
        await this.fetchAndRenderData();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Search input event listener
        const searchInput = document.querySelector('.search_cont input');
        searchInput.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                this.searchTerm = searchInput.value;
                this.batchNumber = 1; // Reset to batch 1 when searching
                await this.fetchAndRenderData();
            }
        });

        const searchBtn = document.querySelector('.btn_search');
        searchBtn.addEventListener('click', async () => {
            this.searchTerm = searchInput.value;
            this.batchNumber = 1; // Reset to batch 1 when searching
            await this.fetchAndRenderData();
        });

        // Pagination buttons
        document.querySelector('.main_btn.next').addEventListener('click', async () => {
            if (this.batchNumber < this.total_page_num) {
                this.batchNumber += 1;
                await this.fetchAndRenderData();
            }
            // this.batchNumber += 1;
            // await this.fetchAndRenderData();
        });

        document.querySelector('.main_btn.prev').addEventListener('click', async () => {
            if (this.batchNumber > 1) {
                this.batchNumber -= 1;
                await this.fetchAndRenderData();
            }
        });
    }


    async fetchAndRenderData() {
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn(); // Show loader
        const PatientData = await this.fetchData(); // Fetch data with search term and batch number

        this.PatientData = PatientData || [];
        this.render();
        this.attachEventListeners();
    }

    render() {
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        if (this.PatientData.VisitList && this.PatientData.VisitList.length > 0) {
            this.populateTable(this.PatientData);
        } else {
            const show_count = document.querySelector('.show_count');
            const total_data = document.querySelector('.total_data');
            const total_page = document.querySelector('.total_page');
            show_count.innerText = 0;
            total_data.innerText = 0;
            total_page.innerText = 1;
            this.total_page_num = 1;
            this.show_count_num = 0;
            this.total_data_num = 0;
            document.querySelector('.start_page').style.display = 'flex'; // No data message
        }
        document.querySelector('.loader_cont').classList.remove('active');
    }

    populateTable(PatientData) {
        const tableBody = document.querySelector('.table_body');
        tableBody.innerHTML = ''; // Clear table before populating

        const show_count = document.querySelector('.show_count');
        const total_data = document.querySelector('.total_data');
        const total_page = document.querySelector('.total_page');


        show_count.innerText = PatientData.showData;
        total_data.innerText = PatientData.total;
        total_page.innerText = PatientData.pages;
        this.total_page_num = PatientData.pages;
        this.show_count_num = PatientData.showData;
        this.total_data_num = PatientData.total;


        PatientData.VisitList.forEach((patient, index) => {

            // filter and show only visit type label
            const visit_type_detail = visit_type.find(type => type.value === patient.visit_type);

            // filter and show only visit priority label
            const visit_priority_detail = visit_priority.find(priority => priority.value === patient.visit_priority);

            const row = document.createElement('div');
            row.className = 'tr d_flex flex__c_a';
            row.setAttribute('title', patient.patient_name);


            row.innerHTML = `
                    <p class="id">${(this.batchNumber - 1) * 15 + index + 1}</p>
                    <p class="name">${patient.patient_name}</p>
                    <p class="orders">${patient.radiology_orders}</p>
                    <p class="priority">${visit_priority_detail.label}</p>
                    <p class="type">${visit_type_detail.label}</p>
                    <p class="department">${patient.department_name}</p>
            `




            row.addEventListener('click', () => {
                frontRouter.navigate('/radiology/activevisits/' + patient.id);
            })

            tableBody.appendChild(row);
        });

    }

    async fetchData() {
        try {
            const response = await fetch('/api/procedure/search_visit_with_procedure_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: this.searchTerm,  // Send search term
                    batch: this.batchNumber // Send current batch number
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

    ViewReturn() {
        return `
        <div class="main_section active_procedure_list">
            <div class="in_table_top d_flex flex__u_b">
                <h4>Active Visit List With Order</h4>
                <div class="search_cont">
                    <input type="text" placeholder="Search by name or id" value="${this.searchTerm}">
                    <br-button loader_width="23" class="btn_search" type="submit">
                            <span class="switch_icon_magnifying_glass"></span>
                    </br-button>
                    
                </div>
            </div>
            <div class="procedure_table">
                <div class="table_head tr d_flex flex__c_a">
                    <p class="id">SN</p>
                    <p class="name">Patient Name</p>
                    <p class="orders">Orders</p>
                    <p class="priority">Visit Priority</p>
                    <p class="type">Visit Type</p>
                    <p class="department">Department</p>
                </div>
                <div class="table_body d_flex flex__co">


                    <div class="start_page deactivate">
                        <p>There Is No Any Active Visit</p>
                    </div>
                    <div class="loader_cont active"><div class="loader"></div></div>
                </div>
                <div class="table_footer d_flex flex__e_b">
                    <p>Show <span class='show_count'>${this.show_count_num}</span> data of <span class="total_data">${this.total_data_num}</span></p>
                    <div class="pagenation d_flex flex__c_c">
                        <button type="button" class="main_btn prev">Prev</button>
                        <p class="page_no d_flex flex__c_c">${this.batchNumber}/<span class="total_page" >${this.total_page_num}</span></p>
                        <button type="button" class="main_btn next">Next</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    applyStyle() {
        const styleElement = document.createElement('style');
        styleElement.textContent = this.style();
        styleElement.id = 'active_procedure_list';
        document.head.appendChild(styleElement);
    }

    style() {
        return `
        
             /* ------------------------------------------------------- */

        .active_procedure_list {
            .main_btn {
                height: 35px;
                width: 86px;
            }

            .main_btn:hover {
                background-color: var(--btn_hover_color);
            }



            .in_table_top {
                height: 50px;

                .search_cont {
                    display: flex;
                    gap: 10px;
                    align-items: center;

                    input {
                        border-radius: var(--input_main_border_r);
                        width: 300px;
                        padding: 10px;
                        height: 41px;
                        background-color: transparent;
                        border: 2px solid var(--input_border);
                    }

                    .add_btn {
                        width: 35px;
                        height: 35px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 5px;
                        flex: none;
                        margin-left: 20px;

                        span {
                            font-size: 20px;
                            /* color: var(--btn_hover_color); */
                        }

                    }

                    .input_search {
                        display: flex;
                        gap: 5px;
                        align-items: center;
                        position: relative;
                    }

                    .add_btn:hover {
                        background-color: var(--pri_op);
                        cursor: pointer;
                    }

                    .input_search.close {
                        width: 50px;
                        overflow: hidden;
                    }

                    .btn_search {
                        background-color: var(--pri_color);
                        width: 40px;
                        height: 40px;
                        cursor: pointer;
                        border-radius: var(--input_main_border_r);
                        display: flex;
                        justify-content: center;
                        align-items: center;

                        span {
                            color: var(--white);
                        }
                    }

                }
            }

            .procedure_table {
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
                        width: 20%;
                        text-align: left;
                    }

                    .priority {
                        width: 15%;
                    }

                    .type {
                        width: 10%;
                    }

                    .orders {
                        width: 17%;
                    }


                    .department {
                        width: 31%;
                    }

                }

                .table_body {
                    padding-block: 5px;
                    gap: 5px;
                    overflow-y: scroll;
                    height: calc(100% - 130px);
                    position: relative;

                    .loader_cont {
                        position: absolute;
                    }

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

                    .start_page.deactivate {
                        display: none;
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
        
        
        `
    }
}

