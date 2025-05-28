import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SinglePatientView {
    constructor() {
        this.patient_id = null;
        this.patient_name = null;
        this.currentPage = 1;
        this.pageSize = 10;
        this.hasMore = true;
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
}
