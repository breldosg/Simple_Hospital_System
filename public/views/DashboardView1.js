import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../config/roles.js";
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, decodeHTML, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class DashboardView {
    constructor() {
        this.today = new Date();
        this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.demoData = this.generateDemoData();
    }

    generateDemoData() {
        // Example JSON data for demo purposes
        return {
            doctor: {
                name: "Dr. Jacob Duncan",
                specialty: "Cardiologist",
                avatar: "/assets/images/doctor-avatar.png"
            },
            stats: {
                newPatients: 12,
                totalPatients: 14685,
                activeVisits: 8
            },
            appointments: [
                {
                    id: 1,
                    time: "9:00 am - 11:00 am",
                    title: "Mymensingh Medical College Hospital",
                    doctor: "Dr. Jacob Duncan (MBBS, MD, Therapist Specialist)",
                    type: "consultation",
                    color: "#4285F4"
                },
                {
                    id: 2,
                    time: "12:00 am - 2:00 pm",
                    title: "Hand examination",
                    doctor: "Dr. Jacob Duncan (MBBS, MD, Surgeon Specialist)",
                    type: "examination",
                    color: "#DB4CB2"
                },
                {
                    id: 3,
                    time: "3:00 pm - 4:00 pm",
                    title: "Follow-up Consultation",
                    doctor: "Dr. Jacob Duncan (MBBS, MD, Therapist Specialist)",
                    type: "follow-up",
                    color: "#34A853"
                }
            ],
            activeVisits: [
                {
                    id: 1,
                    patientName: "John Doe",
                    patientId: "P10045",
                    time: "10:15 AM",
                    status: "In Progress",
                    room: "Room 203"
                },
                {
                    id: 2,
                    patientName: "Sarah Johnson",
                    patientId: "P10046",
                    time: "10:30 AM",
                    status: "Waiting",
                    room: "Room 205"
                },
                {
                    id: 3,
                    patientName: "Michael Williams",
                    patientId: "P10047",
                    time: "11:00 AM",
                    status: "Scheduled",
                    room: "Room 201"
                },
                {
                    id: 4,
                    patientName: "Emma Brown",
                    patientId: "P10048",
                    time: "11:30 AM",
                    status: "Waiting",
                    room: "Room 204"
                }
            ],
            visitStats: [
                { date: "03/21", count: 18 },
                { date: "03/22", count: 24 },
                { date: "03/23", count: 15 },
                { date: "03/24", count: 30 },
                { date: "03/25", count: 22 },
                { date: "03/26", count: 19 },
                { date: "03/27", count: 25 }
            ],
            loginSessions: [
                { date: "March 27, 2023", time: "08:15 AM", device: "Windows PC", ip: "192.168.1.45" },
                { date: "March 26, 2023", time: "07:55 AM", device: "iPhone 13", ip: "192.168.1.32" },
                { date: "March 25, 2023", time: "08:05 AM", device: "MacBook Pro", ip: "192.168.1.45" }
            ]
        };
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();
        this.applyStyle();


        this.main_container = document.querySelector('.main_dashboard');

        // Add event listeners after rendering
        this.addEventListeners();

        // Render charts
        this.renderVisitChart();
    }

    getGreeting() {
        const hour = this.today.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }

    formatDate() {
        const day = this.today.getDate();
        const month = this.months[this.today.getMonth()];
        const year = this.today.getFullYear();
        const weekday = this.days[this.today.getDay()];

        return {
            full: `${weekday}, ${month} ${day}, ${year}`,
            short: `${day} ${month}`
        };
    }

    async fetchData() {
        try {
            const response = await fetch('/api/patient/search_patient', {
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

    renderAppointments() {
        return this.demoData.appointments.map(appointment => {
            return `
                <div class="appointment-card" style="border-left: 4px solid ${appointment.color}">
                    <div class="appointment-time">${appointment.time}</div>
                    <div class="appointment-title">${appointment.title}</div>
                    <div class="appointment-doctor">${appointment.doctor}</div>
                </div>
            `;
        }).join('');
    }

    renderActiveVisits() {
        return this.demoData.activeVisits.map(visit => {
            let statusClass = '';
            if (visit.status === 'In Progress') statusClass = 'status-in-progress';
            else if (visit.status === 'Waiting') statusClass = 'status-waiting';
            else statusClass = 'status-scheduled';

            return `
                <tr>
                    <td>${visit.patientName}</td>
                    <td>${visit.patientId}</td>
                    <td>${visit.time}</td>
                    <td>${visit.room}</td>
                    <td><span class="status-badge ${statusClass}">${visit.status}</span></td>
                    <td>
                        <button class="view-btn">View</button>
                        <button class="action-btn">Actions</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderLoginSessions() {
        return this.demoData.loginSessions.map(session => {
            return `
                <div class="login-session">
                    <div class="session-icon">
                        <i class="fas fa-sign-in-alt"></i>
                    </div>
                    <div class="session-details">
                        <div class="session-date">${session.date} at ${session.time}</div>
                        <div class="session-device">${session.device} • IP: ${session.ip}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderVisitChart() {
        setTimeout(() => {
            const ctx = document.getElementById('visitChart').getContext('2d');

            // If we had Chart.js this would be the code
            // Since we're using vanilla JS, we'll create a simple visualization
            const data = this.demoData.visitStats;
            const canvas = document.getElementById('visitChart');
            const ctx2 = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            // Clear canvas
            ctx2.clearRect(0, 0, width, height);

            // Find max value for scaling
            const maxCount = Math.max(...data.map(item => item.count));

            // Draw graph
            ctx2.beginPath();
            ctx2.strokeStyle = '#4285F4';
            ctx2.lineWidth = 3;

            const barWidth = (width - 40) / data.length;
            const barSpacing = 10;

            data.forEach((item, index) => {
                const x = 20 + index * (barWidth + barSpacing);
                const barHeight = (item.count / maxCount) * (height - 60);
                const y = height - 30 - barHeight;

                // Draw bar
                ctx2.fillStyle = '#4285F4';
                ctx2.fillRect(x, y, barWidth, barHeight);

                // Draw date label
                ctx2.fillStyle = '#666';
                ctx2.font = '10px Arial';
                ctx2.fillText(item.date, x, height - 10);

                // Draw count label
                ctx2.fillStyle = '#333';
                ctx2.font = '10px Arial';
                ctx2.fillText(item.count.toString(), x, y - 5);
            });
        }, 100);
    }

    addEventListeners() {
        // Add event listeners for interactive elements
        const tabs = document.querySelectorAll('.date-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // Would update appointments based on selected date
            });
        });
    }

    ViewReturn() {
        const date = this.formatDate();
        const greeting = this.getGreeting();

        return `
        <div class="main_dashboard">
            <div class="dashboard-header">
                <div class="greeting-container">
                    <h1 class="greeting">${greeting}, ${this.demoData.doctor.name}!</h1>
                    <div class="today-date">${date.full}</div>
                </div>
                <div class="doctor-profile">
                    <div class="doctor-info">
                        <div class="doctor-name">${this.demoData.doctor.name}</div>
                        <div class="doctor-specialty">${this.demoData.doctor.specialty}</div>
                    </div>
                    <div class="doctor-avatar">
                        <img src="/assets/images/doctor-avatar.png" alt="Doctor Avatar">
                    </div>
                </div>
            </div>
            
            <div class="stats-container">
                <div class="stat-card new-patients">
                    <div class="stat-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-title">New Today</div>
                        <div class="stat-value">${this.demoData.stats.newPatients}</div>
                        <div class="stat-change">+2.5% from yesterday</div>
                    </div>
                </div>
                
                <div class="stat-card total-patients">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-title">Total Patients</div>
                        <div class="stat-value">${this.demoData.stats.totalPatients}</div>
                        <div class="stat-change">+1.3% from last week</div>
                    </div>
                </div>
                
                <div class="stat-card active-visits">
                    <div class="stat-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-title">Active Visits</div>
                        <div class="stat-value">${this.demoData.stats.activeVisits}</div>
                        <div class="stat-change">+3.2% from yesterday</div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="dashboard-left">
                    <div class="section-card active-visits-section">
                        <div class="section-header">
                            <h2>Active Visits</h2>
                            <div class="section-actions">
                                <button class="refresh-btn"><i class="fas fa-sync-alt"></i></button>
                                <button class="more-btn"><i class="fas fa-ellipsis-v"></i></button>
                            </div>
                        </div>
                        <div class="section-content">
                            <table class="visits-table">
                                <thead>
                                    <tr>
                                        <th>Patient Name</th>
                                        <th>Patient ID</th>
                                        <th>Time</th>
                                        <th>Room</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderActiveVisits()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="section-card stats-section">
                        <div class="section-header">
                            <h2>Visit Statistics</h2>
                            <div class="section-actions">
                                <select class="stats-period">
                                    <option>Last 7 days</option>
                                    <option>Last 30 days</option>
                                    <option>This month</option>
                                </select>
                            </div>
                        </div>
                        <div class="section-content">
                            <div class="visit-chart-container">
                                <canvas id="visitChart" width="600" height="250"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-right">
                    <div class="section-card appointments-section">
                        <div class="section-header">
                            <h2>Today's Appointments</h2>
                            <div class="date-tabs">
                                <div class="date-tab">Mon<br>26</div>
                                <div class="date-tab">Tue<br>27</div>
                                <div class="date-tab active">Wed<br>28</div>
                                <div class="date-tab">Thu<br>29</div>
                                <div class="date-tab">Fri<br>30</div>
                            </div>
                        </div>
                        <div class="section-content appointments-list">
                            ${this.renderAppointments()}
                        </div>
                    </div>
                    
                    <div class="section-card login-section">
                        <div class="section-header">
                            <h2>Recent Login Sessions</h2>
                            <div class="section-actions">
                                <button class="more-btn"><i class="fas fa-ellipsis-v"></i></button>
                            </div>
                        </div>
                        <div class="section-content login-sessions">
                            ${this.renderLoginSessions()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    applyStyle() {
        const styleElement = document.createElement('style');
        styleElement.textContent = this.style();
        document.head.appendChild(styleElement);
    }
    style() {
        return `
        /* Dashboard Layout */
        .main_dashboard {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;
            width: 100%;
            height: 100%;
            overflow-y: auto;
        }

        /* Header Section */
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .greeting {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            color: #333;
        }

        .today-date {
            font-size: 16px;
            color: #666;
            margin-top: 5px;
        }

        .doctor-profile {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .doctor-info {
            text-align: right;
        }

        .doctor-name {
            font-weight: 600;
            font-size: 16px;
        }

        .doctor-specialty {
            color: #666;
            font-size: 14px;
        }

        .doctor-avatar img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        /* Stats Cards */
        .stats-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }

        .stat-card {
            display: flex;
            align-items: center;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        }

        .stat-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            border-radius: 12px;
            margin-right: 15px;
            font-size: 20px;
        }

        .new-patients .stat-icon {
            background-color: rgba(66, 133, 244, 0.1);
            color: #4285F4;
        }

        .total-patients .stat-icon {
            background-color: rgba(52, 168, 83, 0.1);
            color: #34A853;
        }

        .active-visits .stat-icon {
            background-color: rgba(251, 188, 5, 0.1);
            color: #FBBC05;
        }

        .stat-content {
            flex-grow: 1;
        }

        .stat-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .stat-change {
            font-size: 12px;
            color: #34A853;
        }

        /* Dashboard Content Layout */
        .dashboard-content {
            display: grid;
            grid-template-columns: 3fr 2fr;
            gap: 20px;
        }

        .dashboard-left, .dashboard-right {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Section Cards */
        .section-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            overflow: hidden;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
        }

        .section-header h2 {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
        }

        .section-actions {
            display: flex;
            gap: 10px;
        }

        .section-actions button {
            background: none;
            border: none;
            font-size: 16px;
            color: #666;
            cursor: pointer;
            padding: 5px;
            border-radius: 5px;
            transition: background-color 0.2s;
        }

        .section-actions button:hover {
            background-color: #f5f5f5;
        }

        .section-content {
            padding: 20px;
        }

        /* Appointments Section */
        .date-tabs {
            display: flex;
            gap: 10px;
        }

        .date-tab {
            text-align: center;
            padding: 8px 12px;
            border-radius: 8px;
            background-color: #f5f5f5;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 12px;
            width: 40px;
        }

        .date-tab.active {
            background-color: #4285F4;
            color: white;
        }

        .appointments-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .appointment-card {
            padding: 15px;
            border-radius: 8px;
            background-color: #f8f9fa;
            position: relative;
        }

        .appointment-time {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .appointment-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .appointment-doctor {
            font-size: 12px;
            color: #666;
        }

        /* Active Visits Table */
        .visits-table {
            width: 100%;
            border-collapse: collapse;
        }

        .visits-table th, .visits-table td {
            text-align: left;
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
        }

        .visits-table th {
            font-weight: 600;
            font-size: 14px;
            color: #666;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 500;
        }

        .status-in-progress {
            background-color: rgba(66, 133, 244, 0.1);
            color: #4285F4;
        }

        .status-waiting {
            background-color: rgba(251, 188, 5, 0.1);
            color: #FBBC05;
        }

        .status-scheduled {
            background-color: rgba(52, 168, 83, 0.1);
            color: #34A853;
        }

        .view-btn, .action-btn {
            padding: 5px 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            margin-right: 5px;
        }

        .view-btn {
            background-color: #4285F4;
            color: white;
        }

        .action-btn {
            background-color: #f5f5f5;
            color: #333;
        }

        /* Login Sessions */
        .login-sessions {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .login-session {
            display: flex;
            align-items: center;
            padding: 10px;
            border-radius: 8px;
            background-color: #f8f9fa;
        }

        .session-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background-color: rgba(66, 133, 244, 0.1);
            color: #4285F4;
            margin-right: 15px;
        }

        .session-date {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 2px;
        }

        .session-device {
            font-size: 12px;
            color: #666;
        }

        /* Visit Chart */
        .visit-chart-container {
            height: 250px;
            position: relative;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
            .dashboard-content {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .stats-container {
                grid-template-columns: 1fr;
            }
            
            .dashboard-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
            
            .doctor-profile {
                align-self: flex-end;
            }
        }
        `;
    }
}


