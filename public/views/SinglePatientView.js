import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SinglePatientView {
    constructor() {
        this.patient_id = null;
        this.patient_name = null;

    }
    async PreRender(params) {
        // Render the initial structure with the loader
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
    }

    async render() {
        // Initialize properties
        this.currentPage = 1;
        this.pageSize = 10;
        this.hasMore = true;

        // Load sample data (for demonstration)
        this.loadSampleVisits();

        // Attach event listeners
        // this.attach_listeners();
    }

    loadSampleVisits() {
        const sampleVisits = [
            {
                visit_id: "V2023001",
                visit_date: "2024-03-15",
                doctor_name: "Dr. Sarah Wilson",
                reason: "Regular checkup and blood pressure monitoring",
                diagnosis: "Mild hypertension, prescribed lifestyle changes and medication adjustment",
                status: "completed"
            },
            {
                visit_id: "V2023002",
                visit_date: "2024-03-10",
                doctor_name: "Dr. James Rodriguez",
                reason: "Persistent cough and fever",
                diagnosis: "Upper respiratory tract infection, prescribed antibiotics",
                status: "ongoing"
            },
            {
                visit_id: "V2023003",
                visit_date: "2024-03-05",
                doctor_name: "Dr. Emily Chen",
                reason: "Annual physical examination",
                diagnosis: "Generally healthy, recommended increased physical activity",
                status: "completed"
            },
            {
                visit_id: "V2023004",
                visit_date: "2024-02-28",
                doctor_name: "Dr. Michael Brown",
                reason: "Follow-up for diabetes management",
                diagnosis: "Blood sugar levels stable, continuing current treatment plan",
                status: "pending"
            },
            {
                visit_id: "V2023005",
                visit_date: "2024-02-20",
                doctor_name: "Dr. Lisa Thompson",
                reason: "Joint pain in right knee",
                diagnosis: "Early signs of osteoarthritis, prescribed physical therapy",
                status: "ongoing"
            }
        ];

        this.renderVisits(sampleVisits);
    }

    ViewReturn() {
        return `
<div class="single_patient_cont">
    <div class="visit_list">
        <div class="visit_list_top_part">
            <p class="heading">Visit History</p>
            
        </div>

        <div class="visit_list_bottom_part">
            <div class="timeline">

                <!-- Visits timeline will be populated here -->
            </div>
            <div class="load_more_container">
                <button class="load_more_btn">Load More</button>
            </div>
            <div class="no_visits_message" style="display: none;">
                No visits found in the selected date range
            </div>
        </div>
    </div>
</div>
`;
    }

    // attach_listeners() {
    //     const searchBtn = document.querySelector('.search_btn');
    //     const loadMoreBtn = document.querySelector('.load_more_btn');
    //     const exportCsvBtn = document.querySelector('.export_csv');
    //     const exportPdfBtn = document.querySelector('.export_pdf');

    //     searchBtn.addEventListener('click', () => {
    //         const fromDate = document.querySelector('.from_date').value;
    //         const toDate = document.querySelector('.to_date').value;
    //         this.currentPage = 1;
    //         this.loadVisits(fromDate, toDate);
    //     });

    //     loadMoreBtn.addEventListener('click', () => {
    //         this.currentPage++;
    //         const fromDate = document.querySelector('.from_date').value;
    //         const toDate = document.querySelector('.to_date').value;
    //         this.loadVisits(fromDate, toDate);
    //     });

    //     // document.querySelector('.visits_grid').addEventListener('click', (e) => {
    //     //     if (e.target.classList.contains('view_details_btn')) {
    //     //         const visitId = e.target.dataset.visitId;
    //     //         this.showVisitDetails(visitId);
    //     //     }
    //     // });

    //     exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
    //     exportPdfBtn.addEventListener('click', () => this.exportData('pdf'));
    // }

    async fetchData(id) {
        try {
            const response = await fetch('/api/patient/single_patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patient_id: id,
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

    style() {
        return `
        .single_patient_cont {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;
            overflow: auto;

            .visit_list {
                width: 100%;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);

                .timeline {
                    position: relative;
                    padding: 20px;
                    padding-left: 40px;

                    &:before {
                        content: '';
                        position: absolute;
                        left: 20px;
                        top: 0;
                        bottom: 0;
                        width: 2px;
                        background: #e0e0e0;
                    }

                    .timeline-item {
                        position: relative;
                        margin-bottom: 30px;
                        
                        .timeline-dot {
                            position: absolute;
                            left: -34px;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: white;
                            border: 2px solid;
                            display: flex;
                            align-items: center;
                            justify-content: center;

                            &.completed { border-color: #2e7d32; }
                            &.ongoing { border-color: #ef6c00; }
                            &.pending { border-color: #616161; }

                            i {
                                font-size: 8px;
                                &.completed { color: #2e7d32; }
                                &.ongoing { color: #ef6c00; }
                                &.pending { color: #616161; }
                            }
                        }

                        .timeline-date {
                            font-size: 0.9em;
                            color: #666;
                            margin-bottom: 8px;
                            i {
                                margin-right: 5px;
                            }
                        }

                        .timeline-content {
                            background: white;
                            border-radius: 8px;
                            padding: 15px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                            border: 1px solid #eee;

                            .timeline-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 10px;

                                .visit-id {
                                    font-weight: 600;
                                    color: #444;
                                }

                                .status-badge {
                                    padding: 4px 12px;
                                    border-radius: 12px;
                                    font-size: 12px;
                                    
                                    &.completed { 
                                        background: #e8f5e9; 
                                        color: #2e7d32; 
                                    }
                                    &.ongoing { 
                                        background: #fff3e0; 
                                        color: #ef6c00; 
                                    }
                                    &.pending { 
                                        background: #f5f5f5; 
                                        color: #616161; 
                                    }
                                }
                            }

                            .timeline-body {
                                .doctor-info {
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    color: #666;
                                    margin-bottom: 10px;
                                }

                                .visit-info {
                                    margin: 15px 0;

                                    .reason, .diagnosis {
                                        margin-bottom: 10px;

                                        label {
                                            font-weight: 500;
                                            color: #444;
                                            margin-bottom: 4px;
                                            display: block;
                                        }

                                        p {
                                            color: #666;
                                            font-size: 0.9em;
                                            line-height: 1.4;
                                        }
                                    }
                                }

                                .view_details_btn {
                                    padding: 8px 16px;
                                    border: none;
                                    border-radius: 6px;
                                    background: var(--primary-color);
                                    color: white;
                                    cursor: pointer;
                                    transition: background 0.2s ease;

                                    &:hover {
                                        background: var(--primary-color-dark);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    }

    renderVisits(visits) {
        const timeline = document.querySelector('.timeline');
        const visitsHTML = visits.map(visit => `
            <div class="timeline-item">
                <div class="timeline-dot-container">
                    <div class="timeline-dot ${visit.status == 'completed' ?'active':''}"></div>
                </div>
                <div class="timeline-date">
                    
                    <p>${date_formatter(new Date(visit.visit_date))}</p>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <p class="visit-id">#${visit.visit_id}</p>
                        ${
                            visit.status == 'completed' ? `
                                <span class="status-badge completed">Active</span>
                            ` : ''
                        }
                    </div>
                    <div class="timeline-body">
                        <div class="doctor-info">
                            <p class="doctor-name">${visit.doctor_name}</p>
                        </div>
                        <div class="visit-info">
                            <div class="reason">
                                <p class="label">Reason:</p>
                                <p class="text">${visit.reason}</p>
                            </div>
                            <div class="diagnosis">
                                <p class="label">Diagnosis:</p>
                                <p class="text">${visit.diagnosis || '-'}</p>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        `).join('');

        if (this.currentPage === 1) {
            timeline.innerHTML = visitsHTML;
        } else {
            timeline.insertAdjacentHTML('beforeend', visitsHTML);
        }
    }

}
