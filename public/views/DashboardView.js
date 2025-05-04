import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, getVisitPriority, getVisitType, notify, timeStamp_formatter } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class DashboardView {
    constructor() {
        this.demoData = this.getDemoData();
        applyStyle(this.style())
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        // Fetch data and wait for result
        const response = await this.fetchData();
        console.log(response);


        const cont = document.querySelector('.update_cont');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = await this.ViewReturn(response);

        this.renderChart(response.visit_statistics);
        this.initEventListeners();
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

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }

    renderChart(visit_statistics) {
        // Get the chart container element
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;

        // Clear existing canvas if present
        const existingCanvas = chartContainer.querySelector('br-line-graph');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        // Format the data for the chart
        let data;

        if (visit_statistics && Array.isArray(visit_statistics) && visit_statistics.length > 0) {
            console.log("Original visit statistics:", visit_statistics);

            // Sort the data by date to ensure chronological order
            data = visit_statistics.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            }).map(item => {
                // Format the date for display
                const date = new Date(item.date);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);

                let formattedDate;
                if (date.toDateString() === today.toDateString()) {
                    formattedDate = 'Today';
                } else if (date.toDateString() === yesterday.toDateString()) {
                    formattedDate = 'Yesterday';
                } else {
                    formattedDate = date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });
                }

                // Convert value to number to ensure proper graph scaling
                const numericValue = parseFloat(item.total_visit) || 0;

                return {
                    value: numericValue,
                    date: formattedDate
                };
            });

            console.log("Processed graph data:", data);
        } else {
            // Fallback to sample data if no valid data is provided
            console.log("Using fallback data for chart");
            data = [
                { value: 0, date: "Mar 6" },
                { value: 0, date: "Mar 7" },
                { value: 0, date: "Mar 8" },
                { value: 0, date: "Mar 9" },
                { value: 0, date: "Mar 10" },
                { value: 1, date: "Mar 11" },
                { value: 7, date: "Mar 12" },
                { value: 1, date: "Mar 13" },
                { value: 0, date: "Mar 14" },
                { value: 3, date: "Mar 15" },
                { value: 0, date: "Mar 17" },
                { value: 0, date: "Mar 21" }
            ];
        }

        // Ensure we have at least 2 data points
        if (data.length === 0) {
            data = [
                { value: 0, date: "Today" },
                { value: 0, date: "Tomorrow" }
            ];
        } else if (data.length === 1) {
            data.push({ ...data[0], date: "Next" });
        }

        // Create the line graph component
        const lineGraph = document.createElement('br-line-graph');
        lineGraph.setAttribute('title', 'Visit Statistics');
        lineGraph.setAttribute('currency', '');
        lineGraph.setAttribute('chart-type', 'normal'); // Default to normal chart

        // Safe highlight point calculation
        let highlightPoint = data.length - 1; // Default to last point
        try {
            const lastNonZeroIndex = [...data].reverse().findIndex(item => item.value > 0);
            if (lastNonZeroIndex >= 0) {
                highlightPoint = data.length - 1 - lastNonZeroIndex;
            }
        } catch (e) {
            console.error("Error calculating highlight point:", e);
        }

        lineGraph.setAttribute('highlight-point', highlightPoint.toString());

        // Set the data
        lineGraph.setAttribute('data', JSON.stringify(data));

        // Add the component to the chart container
        chartContainer.appendChild(lineGraph);

        // Update chart header to include chart type selector
        const chartHeader = document.querySelector('.stats-chart .card-header');
        const chartTypeSelector = document.createElement('div');
        chartTypeSelector.className = 'chart-type-selector';
        chartTypeSelector.innerHTML = `
            <button class="chart-type-btn active" data-type="normal">Normal</button>
            <button class="chart-type-btn" data-type="cumulative">Cumulative</button>
        `;

        chartHeader.appendChild(chartTypeSelector);

        // Set up chart type button event listeners
        const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
        chartTypeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                chartTypeBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                const chartType = e.currentTarget.getAttribute('data-type');
                lineGraph.setAttribute('chart-type', chartType);
            });
        });

        // Set up period button event listeners
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                periodBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                try {
                    // You could update the graph data based on the selected period
                    if (e.currentTarget.textContent === 'Week') {
                        const weekData = data.length > 7 ? data.slice(-7) : data; // Last 7 days or all if less
                        lineGraph.setAttribute('data', JSON.stringify(weekData));
                        lineGraph.setAttribute('highlight-point', (weekData.length - 1).toString());
                    } else if (e.currentTarget.textContent === 'Month') {
                        lineGraph.setAttribute('data', JSON.stringify(data));
                        lineGraph.setAttribute('highlight-point', highlightPoint.toString());
                    } else if (e.currentTarget.textContent === 'Year') {
                        // For year view, we might want to aggregate by month in a real implementation
                        lineGraph.setAttribute('data', JSON.stringify(data));
                        lineGraph.setAttribute('highlight-point', highlightPoint.toString());
                    }
                } catch (err) {
                    console.error("Error updating chart period:", err);
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

        const activeVisitRows = document.querySelectorAll('.active_visit_row');
        activeVisitRows.forEach(row => {
            row.addEventListener('click', (e) => {
                e.stopPropagation();
                frontRouter.navigate('/patient/activevisit/' + row.getAttribute('data_src'));
            });
        });

        const viewAllActiveVisitsBtn = document.querySelector('.view_all_active_visits');
        viewAllActiveVisitsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            frontRouter.navigate('/patient/activevisit');
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
                            <button class="view-all-btn view_all_active_visits">View All</button>
                        </div>
                        <div class="visits-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Patient Name</th>
                                        <th>Age</th>
                                        <th>Visit Priority</th>
                                        <th>Waiting Time</th>
                                        <th>Visit Type</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${activeVisits.map(visit => `
                                        <tr class="active_visit_row" data_src="${visit.id}">
                                            <td>${visit.patientName}</td>
                                            <td>${visit.age}</td>
                                            <td>${getVisitPriority(visit.visit_priority)}</td>
                                            <td>${visit.waiting_time}</td>
                                            <td>${getVisitType(visit.visit_type)}</td>
                                            <td><button class="view-btn">Open</button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="stats-chart dashboard-card">
                        <div class="card-header">
                            <h2>Visit Statistics</h2>
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
                                        <span class='${session.device == 'Desktop' ? 'switch_icon_desktop_windows' : (session.device == 'Mobile' ? 'switch_icon_mobile_screen_button' : 'switch_icon_laptop_mac')}'></span>
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


    style() {
        return `
        .main_dashboard {
            width: 100%;
            height: 100%;
            overflow-y: auto;
            /* background: var(--pure_white_background); */
            /* padding: 20px; */
            /* border-radius: var(--main_border_r); */
        
        
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
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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
            font-weight: 700;
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
            cursor: pointer;
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
            height: 336px;
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
        
        /* Chart type selector styles */
        .chart-type-selector {
            display: flex;
            margin-left: 15px;
        }
        
        .chart-type-btn {
            padding: 5px 10px;
            background: transparent;
            border: 1px solid var(--input_border);
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85rem;
            color: var(--gray_text);
            margin-left: 5px;
            transition: all 0.2s ease;
        }
        
        .chart-type-btn.active {
            color: var(--light_pri_color);
            background: var(--pri_op3);
            font-weight: 500;
            border-color: var(--pri_color);
        }
    }
        `;
    }
}


