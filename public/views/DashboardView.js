import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../config/roles.js";
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, decodeHTML, notify, timeStamp_formatter } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class DashboardView {
    constructor() {
        this.demoData = this.getDemoData();
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // Add Font Awesome if it's not already in the document
        this._loadFontAwesome();

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        // Fetch data and wait for result
        const response = await this.fetchData();
        
        const cont = document.querySelector('.update_cont');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = await this.ViewReturn(response);
        this.applyStyle();

        this.renderChart();
        this.initEventListeners();
    }

    _loadFontAwesome() {
        // Check if Font Awesome is already loaded
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            fontAwesome.integrity = 'sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==';
            fontAwesome.crossOrigin = 'anonymous';
            fontAwesome.referrerPolicy = 'no-referrer';
            document.head.appendChild(fontAwesome);
        }
    }

    async fetchData() {
        try {
            const response = await fetch('/api/users/get_dashboard_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
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

    getDemoData() {
        return {
            stats: {
                newPatients: 12,
                totalPatients: 14685,
                activeVisits: 8,
                totalAppointments: 10
            },
            appointments: [
                {
                    id: 1,
                    time: "9:00 am - 11:00 am",
                    title: "Mymensingh Medical College Hospital",
                    doctor: "Dr. Jacob Duncan (MBBS, MD, Therapist Specialist)",
                    color: "blue"
                },
                {
                    id: 2,
                    time: "12:00 am - 2 pm",
                    title: "Hand examination",
                    doctor: "Dr. Jacob Duncan (MBBS, MD, Surgeon Specialist)",
                    color: "purple"
                },
                {
                    id: 3,
                    time: "3:00 pm - 4:00 pm",
                    title: "Patient Consultation",
                    doctor: "Dr. Ramona Frontale (MBBS, MD)",
                    color: "green"
                }
            ],
            activeVisits: [
                {
                    id: 1,
                    patientName: "John Smith",
                    age: 45,
                    reason: "Chest Pain",
                    waitTime: "10 min",
                    status: "In Progress"
                },
                {
                    id: 2,
                    patientName: "Sarah Johnson",
                    age: 32,
                    reason: "Annual Checkup",
                    waitTime: "5 min",
                    status: "Waiting"
                },
                {
                    id: 3,
                    patientName: "Michael Brown",
                    age: 58,
                    reason: "Blood Pressure Follow-up",
                    waitTime: "15 min",
                    status: "In Progress"
                },
                {
                    id: 4,
                    patientName: "Emily Davis",
                    age: 28,
                    reason: "Migraine",
                    waitTime: "2 min",
                    status: "Waiting"
                }
            ],
            loginSessions: [
                {
                    date: "2023-03-27",
                    time: "08:15 AM",
                    device: "Windows Desktop",
                    location: "Hospital Main Building"
                },
                {
                    date: "2023-03-26",
                    time: "09:30 AM",
                    device: "iPhone 13",
                    location: "Medical Center"
                },
                {
                    date: "2023-03-25",
                    time: "07:45 AM",
                    device: "MacBook Pro",
                    location: "Home Office"
                }
            ],
            healthMetrics: {
                visitStats: [65, 80, 45, 90, 75, 85, 60]
            }
        };
    }

    formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }

    renderChart() {
        // Get the chart container element
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;

        // Clear existing canvas if present
        const existingCanvas = chartContainer.querySelector('#visitsChart');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        // Sample monthly data for the line graph
        const monthlyData = [
            { "value": 28735, "date": "Jan GMT + 8" },
            { "value": 45735, "date": "Feb GMT + 8" },
            { "value": 25735, "date": "Mar GMT + 8" },
            { "value": 52735, "date": "Apr GMT + 8" },
            { "value": 38735, "date": "May GMT + 8" },
            { "value": 56735, "date": "Jun GMT + 8" },
            { "value": 74735, "date": "Jul GMT + 8" },
            { "value": 65735, "date": "Aug GMT + 8" },
            { "value": 45735, "date": "Sep GMT + 8" },
            { "value": 75735, "date": "Oct GMT + 8" },
            { "value": 58735, "date": "Nov GMT + 8" },
            { "value": 85735, "date": "Dec GMT + 8" }
        ];

        // Create the line graph component
        const lineGraph = document.createElement('br-line-graph');
        lineGraph.setAttribute('title', 'Visit Statistics');
        lineGraph.setAttribute('currency', '$');
        lineGraph.setAttribute('comparison-value', '15,686.65');
        lineGraph.setAttribute('highlight-point', '11'); // Highlight July
        lineGraph.setAttribute('data', JSON.stringify(monthlyData));

        // Add the component to the chart container
        chartContainer.appendChild(lineGraph);

        // Set up period button event listeners
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                periodBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // You could update the graph data based on the selected period
                // For demonstration purposes, we'll just change the highlight point
                if (e.currentTarget.textContent === 'Week') {
                    lineGraph.setAttribute('highlight-point', '3');
                } else if (e.currentTarget.textContent === 'Month') {
                    lineGraph.setAttribute('highlight-point', '6');
                } else if (e.currentTarget.textContent === 'Year') {
                    lineGraph.setAttribute('highlight-point', '11');
                }
            });
        });
    }

    initEventListeners() {
        // Add any event listeners necessary for the dashboard
        const datePills = document.querySelectorAll('.date-pill');
        datePills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                datePills.forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }

    ViewReturn(response) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const greeting = this.getGreeting();
        var userData = globalStates.getState('user_data');
        const stats = this.demoData.stats;

        // Handle case where response is null or undefined
        const activeVisits = response && response.active_visits ? response.active_visits : [];
        const loginSessions = response && response.login_sessions ? response.login_sessions : [];

        return `
        <div class="main_dashboard">
            <div class="dashboard-header">
                <div class="greeting-section">
                    <h1 class="greeting">${greeting}, ${userData.name}</h1>
                    <p class="date-display">${formattedDate}</p>
                </div>
                
            </div>
            
            <div class="stats-cards">
                <div class="stat-card">
                    
                    <div class="stat-info">
                        <h3>New Today</h3>
                        <p class="stat-value">${stats.newPatients}</p>
                        <p class="stat-change"><span class="up">↑ 2.1%</span> from yesterday</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    
                    <div class="stat-info">
                        <h3>Total Patients</h3>
                        <p class="stat-value">${stats.totalPatients}</p>
                        <p class="stat-change"><span class="up">↑ 1.3%</span> from last week</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Active Visits</h3>
                        <p class="stat-value">${stats.activeVisits}</p>
                        <p class="stat-change"><span class="down">↓ 2.5%</span> from yesterday</p>
                    </div>
                </div>
                
                
                <div class="stat-card">
                    
                    <div class="stat-info">
                        <h3>Active Visits</h3>
                        <p class="stat-value">${stats.activeVisits}</p>
                        <p class="stat-change"><span class="down">↓ 2.5%</span> from yesterday</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="content-left">
                    <div class="active-visits-section dashboard-card">
                        <div class="card-header">
                            <h2>Active Visits</h2>
                            <button class="view-all-btn">View All</button>
                        </div>
                        <div class="visits-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Patient Name</th>
                                        <th>Age</th>
                                        <th>Reason</th>
                                        <th>Wait Time</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${activeVisits.map(visit => `
                                        <tr>
                                            <td>${visit.patientName}</td>
                                            <td>${visit.age}</td>
                                            <td>${visit.visit_priority}</td>
                                            <td>${visit.waiting_time}</td>
                                            <td><span class="status-badge ${visit.status.toLowerCase().replace(' ', '-')}">${visit.status}</span></td>
                                            <td><button class="view-btn">View</button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="stats-chart dashboard-card">
                        <div class="card-header">
                            <h2>Visit Statistics</h2>
                            <div class="chart-period">
                                <button class="period-btn">Week</button>
                                <button class="period-btn active">Month</button>
                                <button class="period-btn">Year</button>
                            </div>
                        </div>
                        <div class="chart-container">
                            <!-- The br-line-graph component will be inserted here by renderChart() -->
                        </div>
                    </div>
                </div>
                
                <div class="content-right">
                    <div class="appointments-section dashboard-card">
                        <div class="card-header">
                            <h2>Today's Appointments</h2>
                        </div>
                        <div class="appointments-list">
                            ${this.demoData.appointments.map(appointment => `
                                <div class="appointment-card ${appointment.color}">
                                    <div class="appointment-time">${appointment.time}</div>
                                    <div class="appointment-details">
                                        <h3>${appointment.title}</h3>
                                        <p>${appointment.doctor}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="login-sessions dashboard-card">
                        <div class="card-header">
                            <h2>Last Login Sessions</h2>
                        </div>
                        <div class="sessions-list">
                            ${loginSessions.map((session, index) => `
                                <div class="session-item">
                                    <div class="session-icon ${session.status == 1 ? 'current' : ''}">
                                        <span class='${session.device == 'Desktop' ? 'switch_icon_desktop_windows' : (session.device == 'Android' ? 'switch_icon_mobile_screen_button' : 'switch_icon_laptop_mac')}'></span>
                                    </div>
                                    <div class="session-details">
                                        <h4>${timeStamp_formatter(session.created_at)}</h4>
                                        <p>${session.device} • ${session.os}</p>
                                    </div>
                                    ${session.status == 1 ? '<span class="current-badge">Current</span>' : ''}
                                </div>
                            `).join('')}
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

        .main_dashboard {
            width: 100%;
            height: 100%;
            overflow-y: auto;
            background: var(--pure_white_background);
            padding: 20px;
            border-radius: var(--main_border_r);
        }
        
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        
        .greeting {
            font-size: 2.2rem;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
        }
        
        .date-display {
            font-size: 1.1rem;
            margin: 8px 0 0 0;
            color: var(--gray_text);
        }
        
        .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: var(--pure_white_background);
            border-radius: 16px;
            padding: 20px;
            display: flex;
            align-items: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid var(--input_border);
        }
        
        .stat-info {
            flex: 1;
        }
        
        .stat-info h3 {
            margin: 0 0 5px 0;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--gray_text);
        }
        
        .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 0 0 5px 0;
        }
        
        .stat-change {
            font-size: 0.8rem;
            margin: 0;
            color: var(--gray_text);
        }
        
        .up {
            color: var(--success_color);
            font-weight: 600;
        }
        
        .down {
            color: var(--error_color);
            font-weight: 600;
        }
        
        .dashboard-content {
            display: grid;
            grid-template-columns: 1.7fr 1fr;
            gap: 20px;
        }
        
        .dashboard-card {
            background: var(--pure_white_background);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid var(--input_border);

        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .card-header h2 {
            font-size: 1.2rem;
            margin: 0;
            font-weight: 600;
        }
        
        .view-all-btn {
            background: transparent;
            color: var(--light_pri_color);
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        /* Visits table styles */
        .visits-table {
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            text-align: left;
            padding: 12px 15px;
            border-bottom: 1px solid var(--input_border);
            color: var(--gray_text);
            font-weight: 600;
        }

        th:first-child {
            padding-left: 0px;
        }

        td:first-child {
            padding-left: 0px;
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid var(--input_border);
            color: var(--gray_text);
        }
        
        tbody tr:hover {
            background-color: var(--hover_list_table);
        }
        
        .status-badge {
            padding: 5px 10px;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .in-progress {
            color: var(--success_color);
        }
        
        .waiting {
            color: var(--warning_color);
        }
        
        .view-btn {
            padding: 5px 15px;
            background: var(--pri_color);
            color: var(--white);
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s ease;
        }
        
        .view-btn:hover {
            background: rgba(52, 152, 219, 0.2);
        }
        
        /* Appointments styles - updated */
        .appointments-list {
            margin-top: 15px;
        }
        
        .appointment-card {
            display: flex;
            flex-direction: column;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            position: relative;
            border-left: 4px solid transparent;
        }
        
        .appointment-card.blue {
            background-color: var(--card-blue-bg);
            border-left-color: var(--card-blue);
        }
        
        .appointment-card.purple {
            background-color: var(--card-purple-bg);
            border-left-color: var(--card-purple);
        }
        
        .appointment-card.green {
            background-color: var(--card-green-bg);
            border-left-color: var(--card-green);
        }
        
        .appointment-time {
            font-size: 12px;
            color: var(--gray_text);
            min-width: 120px;
            margin-right: 15px;
        }
        
        .appointment-details {
            flex: 1;
        }
        
        .appointment-details h3 {
            margin: 0 0 5px 0;
            font-size: 0.95rem;
            font-weight: 600;
        }
        
        .appointment-details p {
            margin: 0;
            font-size: 0.8rem;
            color: var(--gray_text);
        }
        
        /* Chart styles */
        .chart-period {
            display: flex;
        }
        
        .period-btn {
            padding: 5px 15px;
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 0.85rem;
            color: var(--gray_text);
        }
        
        .period-btn.active {
            color: var(--light_pri_color);
            font-weight: 600;
        }
        
        .chart-container {
            width: 100%;
            height: 350px;
            margin-top: 20px;
            position: relative;
        }
        
        .chart-container br-line-graph {
            width: 100%;
            height: 100%;
            display: block;
        }
        
        /* Additional responsive chart styles */
        @media (max-width: 768px) {
            .chart-container {
                height: 250px;
            }
            
            .chart-period {
                flex-wrap: wrap;
            }
        }
        
        /* Login sessions styles */
        .sessions-list {
            margin-top: 10px;
        }
        
        .session-item {
            display: flex;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
            position: relative;
            align-items: center;
            border: 1px solid var(--input_border);
        }
        
        
        .session-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--pri_op);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            }
            
            .session-icon.current {
                background-color: var(--pri_color);
                color: var(--light_pri_color);
                span{
                    color: var(--white);
                }
        }
        
        .session-details h4 {
            margin: 0 0 3px 0;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .session-details p {
            margin: 0;
            font-size: 0.8rem;
            color: var(--gray_text);
        }
        
        .current-badge {
            padding: 3px 8px;
            color: var(--light_pri_color);
            border-radius: 50px;
            font-size: 0.7rem;
            font-weight: 900;
            margin-left: auto;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1200px) {
            .dashboard-content {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 768px) {
            .stats-cards {
                grid-template-columns: 1fr;
            }
            
            .greeting {
                font-size: 1.8rem;
            }
        }
        `;
    }


}


