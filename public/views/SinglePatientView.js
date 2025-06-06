import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SinglePatientView {
    constructor() {
        this.patient_id = null;
        this.patient_name = null;
        this.currentPage = 1;
        this.pageSize = 10;
        this.hasMore = true;
        applyStyle(this.style());
    }

    async PreRender(params) {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.single_patient_cont');
        this.patient_id = params.id;

        // Render patient detail component
        dashboardController.patientDetailComponent.PreRender({
            container: this.main_container,
            patient_id: this.patient_id,
        })

        // Now call render which will fetch data and populate it
        this.render();
        this.addEventListeners();
    }

    async render() {
        const visits = await this.fetchData();
        if (visits) {
            this.renderVisits(visits.visitsList);
            this.hasMore = visits.batch < visits.pages;
            this.attachLoadMoreListener();
        }
    }

    addEventListeners() {
        const dateRangePicker = this.main_container.querySelector('br-date-range-picker');
        const btn_search = this.main_container.querySelector('.btn_search');

        btn_search.addEventListener('click', () => {
            const fromDate = dateRangePicker.startDate;
            const toDate = dateRangePicker.endDate;

            console.log('From:', fromDate);
            console.log('To:', toDate);
        });
    }

    ViewReturn() {
        return `
<div class="single_patient_cont">
    <div class="visit_list">
        <div class="visit_list_top_part">
            <p class="heading">Visit History</p>

            <div class="date_range_picker_container">
                <div class="date_range_picker_container_inner">
                    <br-date-range-picker 
                        mode="range" 
                        placeholder="Select Date Range" 
                        locale="en-US"
                        theme="light"
                    ></br-date-range-picker>
                </div>
                <br-button loader_width="23" class="btn_search" type="submit">
                    <span class="switch_icon_magnifying_glass"></span>
                </br-button>
            </div>
        </div>

        <div class="visit_list_bottom_part">
            <div class="timeline">
                <!-- Visits timeline will be populated here -->
            </div>
            <div class="load_more_container" style="display: none;">
                <button class="load_more_btn">Load More</button>
            </div>
            <div class="no_visits_message" style="display: none;">
                No visits found
            </div>
        </div>
    </div>
</div>
`;
    }

    attachLoadMoreListener() {
        const loadMoreBtn = document.querySelector('.load_more_btn');
        const loadMoreContainer = document.querySelector('.load_more_container');

        if (this.hasMore) {
            loadMoreContainer.style.display = 'flex';
            loadMoreBtn.addEventListener('click', async () => {
                this.currentPage++;
                const newVisits = await this.fetchData();
                if (newVisits) {
                    this.renderVisits(newVisits.visitsList);
                    this.hasMore = newVisits.batch < newVisits.pages;
                    if (!this.hasMore) {
                        loadMoreContainer.style.display = 'none';
                    }
                }
            });
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    async fetchData() {
        try {
            const response = await fetch('/api/patient/search_list_of_patient_visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patient_id: this.patient_id,
                    page: this.currentPage,
                    limit: this.pageSize
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

    renderVisits(visits) {
        const timeline = document.querySelector('.timeline');
        const noVisitsMessage = document.querySelector('.no_visits_message');

        if (!visits || visits.length === 0) {
            timeline.innerHTML = '';
            noVisitsMessage.style.display = 'block';
            return;
        }

        noVisitsMessage.style.display = 'none';

        // Clear existing content if it's first page
        if (this.currentPage === 1) {
            timeline.innerHTML = '';
        }

        visits.forEach(visit => {
            // Create main timeline item container
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.setAttribute('data-visit-id', visit.id);
            timelineItem.innerHTML = `
                <div class="timeline-dot-container">
                    <div class="timeline-dot ${visit.status}"></div>
                </div>
                <div class="timeline-date">
                    <p>${date_formatter(new Date(visit.created_at))}</p>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <p class="visit-id">#${visit.id}</p>
                        ${visit.status == 'active' ?
                    `<span class="status-badge active">Current Visit</span>`
                    : ''
                }
                    </div>
                    <div class="timeline-body">
                        <div class="doctor-info">
                            <span class='switch_icon_user_doctor'></span>
                            <p class="doctor-name">${visit.doctor_name}</p>
                        </div>
                        <div class="visit-info">
                            <div>
                                <div class="department">
                                    <p class="label">Department:</p>
                                    <p>${visit.department_name}</p>
                                </div>
                                <div class="diagnosis">
                                    <p class="label">Final Diagnosis:</p>
                                    <p>${visit.final_diagnosis || '-'}</p>
                                </div>
                            </div>
                            <div class="visit_actions">
                                <a href="/patient/activevisit/${visit.id}" target="_blank">
                                    <br-button class="btn_view_visit" id="view_visit" type="button">View Visit</br-button>
                                </a>
                                <a href="/patient/visithistory/${visit.id}" target="_blank">
                                    <br-button class="btn_view_visit" id="print_visit" type="button">Print Visit</br-button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add hover effect class
            timelineItem.classList.add('timeline-item-hoverable');

            // Append the timeline item to the timeline
            timeline.appendChild(timelineItem);
        });
    }

    style(){
        return `
                    /* ------------------------------------------------------- */

        .single_patient_cont {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            overflow: scroll;

            .loader_cont {
                border-radius: var(--main_border_r);
                position: absolute;
            }

            .visit_list {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                flex: none;


                .visit_list_top_part {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;

                    .heading {
                        font-size: 24px;
                        font-weight: 700;
                    }

                    .date_range_picker_container {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        flex: none;

                        .date_range_picker_container_inner {
                            width: 280px;
                        }

                        .next_btn {
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            color: var(--white);
                            font-weight: bold;
                            background-color: var(--btn_color);
                        }

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

                .visit_list_bottom_part {
                    width: 100%;
                    height: 100%;
                    overflow-y: scroll;
                    position: relative;

                    &:before {
                        content: '';
                        position: absolute;
                        transform: translateX(-50%);
                        left: 20px;
                        top: 0px;
                        bottom: 0;
                        width: 2px;
                        height: 98%;
                        background: var(--pure_white_background);
                        border-radius: 2px;
                    }

                    .timeline {
                        overflow-y: scroll;
                        height: 100%;
                        /* overflow-y: scroll; */



                        .timeline-item {
                            position: relative;
                            margin-bottom: 30px;
                            display: flex;
                            cursor: pointer;

                            .timeline-dot-container {
                                width: 40px;
                                display: flex;
                                justify-content: center;


                                .timeline-dot {
                                    width: 20px;
                                    height: 20px;
                                    border-radius: 50%;
                                    background: var(--pure_white_background);
                                    position: relative;

                                    &:before {
                                        content: '';
                                        position: absolute;
                                        left: 50%;
                                        top: 50%;
                                        transform: translate(-50%, -50%);
                                        width: 70%;
                                        height: 70%;
                                        background: var(--pri_color);
                                        border-radius: 10px;
                                        opacity: 0;
                                    }
                                }

                                .timeline-dot.active {
                                    &:before {
                                        opacity: 1;
                                    }
                                }
                            }

                            .timeline-date {
                                color: var(--gray_text);
                                margin-bottom: 8px;
                                display: flex;
                                gap: 5px;
                                height: 20px;
                                position: absolute;
                                left: 55px;
                                top: 0;

                                span {
                                    font-size: 14px;
                                }

                                p {
                                    font-weight: 600;

                                }
                            }

                            .timeline-content {
                                background: var(--pure_white_background);
                                border-radius: 8px;
                                padding: 15px;
                                margin-top: 23px;
                                width: 100%;

                                .timeline-header {
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    margin-bottom: 10px;

                                    .visit-id {
                                        font-weight: 600;
                                        font-size: 16px;
                                    }

                                    .status-badge {
                                        font-size: 12px;

                                        &.active {
                                            font-size: 14px;
                                            font-weight: 700;
                                            color: var(--light_pri_color);
                                        }


                                    }
                                }

                                .timeline-body {
                                    .doctor-info {
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                        margin-bottom: 10px;

                                        .doctor-name {
                                            font-weight: 700;
                                            font-size: 14px;
                                            /* color: var(--light_pri_color); */
                                        }

                                        span {
                                            font-size: 14px;
                                            /* color: var(--light_pri_color); */
                                        }
                                    }

                                    .visit-info {
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: end;

                                        .department {
                                            margin-bottom: 7px;
                                        }

                                        .label {
                                            font-weight: 700;
                                            color: var(--light_pri_color);
                                        }

                                        .visit_actions {
                                            display: flex;
                                            flex-direction: column;
                                            gap: 10px;

                                            .btn_view_visit {
                                                border: none;
                                                background-color: var(--pri_color);
                                                padding: 10px 35px;
                                                font-weight: bold;
                                                font-size: var(--main_font_size);
                                                color: var(--white);
                                                cursor: pointer;
                                                border-radius: var(--input_main_border_r);
                                            }

                                            #print_visit{
                                                background-color: var(--sec_color);
                                            }
                                        }

                                    }


                                }
                            }
                        }
                    }

                    .load_more_container {
                        display: flex;
                        justify-content: center;
                        padding: 20px;

                        .load_more_btn {
                            padding: 8px 24px;
                            background: var(--primary-color);
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            transition: background 0.2s;

                            &:hover {
                                background: var(--primary-color-dark);
                            }
                        }
                    }
                }
            }



        }

        `
    }
}
