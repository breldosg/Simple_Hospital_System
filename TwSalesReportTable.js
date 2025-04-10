export class TwSalesReportTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.data = null;
        this.columnConfigs = {};  // For manual column overrides
        this.selectedDate = new Date().toISOString().split('T')[0]; // Default to today
        this.loading = true; // Add loading state
        this.filterPanelOpen = false; // Track filter panel state

        // Filter arrays
        this.paymentMode = [];
        this.status = [];
        this.staff = [];
        this.patient = [];

        // Filter options for status dropdown
        this.filterOptions = {
            "all": "All",
            "paid": "Paid",
            "not_paid": "Not Paid"
        };

        // Add your column configurations here
        this.setColumnConfigs({
            id: {
                title: 'Invoice Id',
                width: '5%',
                priority: 1,
                hidden: false,
                align: 'left'
            },
            paid_by: {
                title: 'Patient Name',
                width: '20%',
                priority: 2,
                hidden: false,
                align: 'left'
            },
            visit_id: {
                hidden: false,
                title: 'Visit Id',
                width: '5%',
                priority: 3,
                align: 'center'
            },
            created_at: {
                hidden: false,
                title: 'Payment Date',
                width: '20%',
                priority: 4,
                align: 'center',
                renderer: (value) => this.formatDate(value, false)
            },
            served_by: {
                hidden: false,
                title: 'Served By',
                width: '20%',
                priority: 5,
                align: 'center'
            },
            status: {
                hidden: false,
                title: 'Status',
                width: '10%',
                priority: 6,
                align: 'center'
            },
            patient_id: {
                hidden: true
            },

            total_price: {
                title: 'Total Amount',
                width: '10%',
                priority: 7,
                hidden: false,
                align: 'right'
            }
        });
    }

    twAlert = (message, type, time) => {
        const alert_elem = document.querySelector('tw-bottom-alert') || '';
        if (alert_elem) {
            alert_elem.setAttribute('message', message || '');
            alert_elem.setAttribute('type', type || '');
            alert_elem.setAttribute('time', time || '');
            alert_elem.setAttribute('active', 'true');
        }
    };

    loader() {
        this.shadowRoot.innerHTML = `
            ${this.styleSheet()}
            <div class="frag_loader">
                <tw-loader width="60px" stroke_width="12px" stroke_color="var(--main_color)"></tw-loader>
            </div>
        `;
    }

    /**
     * Set data for the table
     * @param {Array} data - Array of objects to display
     */
    setData(data) {
        this.data = data;
        this.render();
    }

    /**
     * Override configuration for specific columns
     * @param {Object} configs - Object with column keys and their configs
     * Example: { name: { width: '200px', title: 'Full Name' } }
     */
    setColumnConfigs(configs) {
        this.columnConfigs = configs;
        if (this.data) this.render();
    }

    controlRender() {
        if (this.loading) {
            this.loader();
        } else {
            this.render();
        }
    }

    async fetchData() {
        try {
            // Prepare request data
            const requestData = {
                date: this.selectedDate,
                filters: {
                    status: this.status,
                    paymentMode: this.paymentMode,
                    staff: this.staff[0] || '',
                    patient: this.patient[0] || ''
                }
            };

            const response = await fetch('/fetchrequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    key: 1390,
                    data: JSON.stringify(requestData)
                })
            });

            const result = await response.json();
            const { success, message, data } = result;

            if (success && data) {
                this.data = data;
                this.loading = false;
                this.controlRender();
                this.twAlert(message || 'Data loaded successfully', 'success', 3000);
            } else {
                this.loading = false;
                this.data = null;
                this.controlRender();
                this.twAlert(message || 'Failed to load data', 'error', 3000);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            this.loading = false;
            this.data = null;
            this.controlRender();
            this.twAlert(error.message || 'An error occurred while loading data', 'error', 3000);
        }
    }

    async handleDateSubmit() {
        const dateInput = this.shadowRoot.querySelector('.date-input');
        this.selectedDate = dateInput.value;
        this.loading = true;
        this.controlRender();
        await this.fetchData();
    }

    toggleFilterPanel() {
        this.filterPanelOpen = !this.filterPanelOpen;
        const filterPanel = this.shadowRoot.querySelector('.filter-panel');
        const overlay = this.shadowRoot.querySelector('.filter-overlay');

        if (this.filterPanelOpen) {
            filterPanel.classList.add('open');
            overlay.classList.add('active');
        } else {
            filterPanel.classList.remove('open');
            overlay.classList.remove('active');
        }
    }

    formatDate(dateStr, time_bool = true) {
        const normalizedDateStr = dateStr.replace(' ', 'T');
        const date = new Date(normalizedDateStr);

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }

        const dateFormatter = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

        const dateParts = dateFormatter.formatToParts(date);
        const day = dateParts.find(part => part.type === 'day').value;
        const month = dateParts.find(part => part.type === 'month').value;
        const year = dateParts.find(part => part.type === 'year').value;

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day} ${month} ${year}${time_bool ? (` ${hours}:${minutes}:${seconds}`) : ''}`;
    }

    addFilter(type, value) {
        if (!value || !this.filterTypes[type]) return;

        this.selectedFilters[type] = {
            value,
            label: `${this.filterTypes[type].label}: ${value}`
        };

        this.updateFilterPills();
    }

    updateFilterPills() {
        const pillsContainer = this.shadowRoot.querySelector('.filter-pills');
        if (!pillsContainer) return;

        pillsContainer.innerHTML = Object.entries(this.selectedFilters).map(([type, { label }]) => `
            <div class="filter-pill">
                <span>${label}</span>
                <button class="remove-filter" data-filter-type="${type}">×</button>
            </div>
        `).join('');

        // Add event listeners for removal buttons
        const removeButtons = pillsContainer.querySelectorAll('.remove-filter');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFilter(button.dataset.filterType);
            });
        });
    }

    removeFilter(type) {
        if (this.selectedFilters[type]) {
            delete this.selectedFilters[type];

            // Reset the filter input in the panel
            const input = this.shadowRoot.querySelector(`[data-filter-type="${type}"]`);
            if (input) {
                if (input.type === 'radio') {
                    const radioGroup = this.shadowRoot.querySelectorAll(`[data-filter-type="${type}"]`);
                    radioGroup.forEach(radio => radio.checked = false);
                } else {
                    input.value = '';
                }
            }

            this.updateFilterPills();
        }
    }

    renderFilterSection() {
        return `
            <div class="filter-overlay"></div>
            <div class="filter-panel">
                <div class="filter-panel-header">
                    <h3>Filters</h3>
                    <div class="close-filter-panel">
                        <span class="switch_icon_close"></span>
                    </div>
                </div>
                <div class="filter-panel-content">
                    <div class="filter-group">
                        <h4 class="filter-title">Payment Status</h4>
                        <div class="filter-options">
                            <tw-dropdown 
                                background_color="var(--white_background)" 
                                type="dropdown" 
                                id="status_filter_dropdown" 
                                options_max_height="150px" 
                                options_position="absolute" 
                                placeholder="Select Status" 
                                border_radius="10px" 
                                border_width='1px' 
                                height='44px' 
                                font_size="small" 
                                dropdown_gap="8px"
                                data='${JSON.stringify(this.filterOptions)}'>
                            </tw-dropdown>
                        </div>
                    </div>
                </div>
                <div class="filter-panel-footer">
                    <button class="apply-filters-btn">Apply Filters</button>
                </div>
            </div>
        `;
    }

    async connectedCallback() {
        this.controlRender();
        await this.fetchData();
    }

    /**
     * Dynamically calculate appropriate column width
     */
    getColumnWidth(key, columnKeys) {
        if (this.columnConfigs[key] && this.columnConfigs[key].width) {
            return this.columnConfigs[key].width;
        }
        return `${100 / columnKeys.length}%`;
    }

    /**
     * Get display title for a column
     */
    getColumnTitle(key) {
        if (this.columnConfigs[key] && this.columnConfigs[key].title) {
            return this.columnConfigs[key].title;
        }
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    /**
     * Format cell content based on value type
     */
    formatCellContent(value) {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
    }

    /**
     * Apply custom cell renderer if available
     */
    renderCell(key, value, item) {
        if (this.columnConfigs[key] && this.columnConfigs[key].renderer) {
            return this.columnConfigs[key].renderer(value, item);
        }
        return this.formatCellContent(value);
    }

    calculateTotal() {
        if (!this.data) return 0;
        return this.data.reduce((sum, item) => {
            const amount = parseFloat(item.total_price) || 0;
            return (sum + amount);
        }, 0);
    }

    renderTable() {
        if (!this.data || !this.data.length) {
            return `<div class="empty-state"><span class="switch_icon_do_not_disturb_alt"></span><p>No data available</p></div>`;
        }

        // Get all column keys and sort them by priority
        const columnKeys = Object.keys(this.data[0]);
        const visibleColumns = columnKeys
            .filter(key => !this.columnConfigs[key]?.hidden)
            .sort((a, b) => {
                const priorityA = this.columnConfigs[a]?.priority || Number.MAX_VALUE;
                const priorityB = this.columnConfigs[b]?.priority || Number.MAX_VALUE;
                return priorityA - priorityB;
            });

        const total = this.calculateTotal();

        return `
            <div class="report-table">
                <div class="table-header">
                    ${visibleColumns.map(key => {
            const alignment = this.columnConfigs[key]?.align || 'left';
            const width = this.columnConfigs[key]?.width || 'auto';
            return `
                            <div class="th" style="width: ${width}; text-align: ${alignment}">
                                <div class="header-content">${this.getColumnTitle(key)}</div>
                            </div>
                        `;
        }).join('')}
                </div>
                
                <div class="table-body">
                    ${this.data.map(item => `
                        <div class="table-row">
                            ${visibleColumns.map(key => {
            const alignment = this.columnConfigs[key]?.align || 'left';
            const width = this.columnConfigs[key]?.width || 'auto';
            return `
                                    <div class="td" style="width: ${width}">
                                        <div class="cell-content" style="text-align: ${alignment}">${this.renderCell(key, item[key], item)}</div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    `).join('')}
                </div>

                <div class="table_footer">
                    <div class="total_row">
                        <div class="grand_total">
                            <div class="total_label">Total Amount:</div>
                            <div class="total_amount">${total.toLocaleString()} TZS/=</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        this.shadowRoot.innerHTML = `
            ${this.styleSheet()}
            <div class="report_section">
                <div class="report_header">
                    <div class="report_title">Sales Reports</div>
                    <div class="filter-area">
                        <button class="print-button">
                            <span class="switch_icon_print"></span>
                            Print
                        </button>
                        <button class="filter-toggle">
                            <span class="switch_icon_filter_list"></span>
                            <span>Filters</span>
                        </button>
                        <div class="date_filter">
                            <input type="date" class="date-input" value="${this.selectedDate}">
                            <button class="submit-date">Apply</button>
                        </div>
                    </div>
                </div>
                
                ${this.renderFilterSection()}
                
                <div class="table-container">
                    ${!this.data ? '<div class="empty-state"><span class="switch_icon_do_not_disturb_alt"></span><p>No data available</p></div>' : this.renderTable()}
                </div>
            </div>
        `;

        // Add event listener for date submit
        const submitButton = this.shadowRoot.querySelector('.submit-date');
        submitButton.addEventListener('click', async () => {
            submitButton.innerHTML = `<tw-loader width="20px" stroke_width="4px" stroke_color="var(--white)"></tw-loader>`;
            submitButton.disabled = true;
            await this.handleDateSubmit();
            submitButton.innerHTML = 'Apply';
            submitButton.disabled = false;
        });

        // Add event listeners for filter panel
        const filterToggle = this.shadowRoot.querySelector('.filter-toggle');
        filterToggle.addEventListener('click', () => this.toggleFilterPanel());

        const closeFilterPanel = this.shadowRoot.querySelector('.close-filter-panel');
        closeFilterPanel.addEventListener('click', () => this.toggleFilterPanel());

        const overlay = this.shadowRoot.querySelector('.filter-overlay');
        overlay.addEventListener('click', () => this.toggleFilterPanel());

        // Add event listener for apply filters button
        const applyFiltersBtn = this.shadowRoot.querySelector('.apply-filters-btn');
        applyFiltersBtn.addEventListener('click', () => this.applyFilters());

        // Add the print button event listener
        const printButton = this.shadowRoot.querySelector('.print-button');
        printButton.addEventListener('click', () => this.printReport());
    }

    async applyFilters() {
        // Get the status filter value
        const statusDropdown = this.shadowRoot.querySelector('#status_filter_dropdown');
        const selectedStatus = statusDropdown.value;

        // Clear previous filters
        this.status = [];

        // Add selected status to filters if not "all"
        if (selectedStatus && selectedStatus !== 'all') {
            this.status.push(selectedStatus);
        }

        // Close filter panel
        this.toggleFilterPanel();

        // Fetch data with new filters
        this.loading = true;
        this.controlRender();
        await this.fetchData();
    }

    printReport() {
        // Create a hidden iframe to handle printing
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';

        document.body.appendChild(printFrame);

        // Get current date for the report
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');

        // Wait for iframe to be ready
        setTimeout(() => {
            // Write the content to the iframe
            printFrame.contentDocument.open();
            printFrame.contentDocument.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Sales Report</title>
                    <link rel="stylesheet" href="/assets/icons/style.css">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        }

                        body {
                            padding: 10px;
                            background-color: white;
                            max-width: 100%;
                            width: 100%;
                        }

                        .report-header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 15px;
                            border-bottom: 1px solid #eee;
                            width: 100%;
                        }

                        .logo {
                            margin-bottom: 10px;
                        }

                        .logo img {
                            height: 40px;
                            width: auto;
                        }

                        .report-title {
                            font-size: 24px;
                            font-weight: 600;
                            margin-bottom: 10px;
                        }

                        .report-date {
                            font-size: 14px;
                            color: #666;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                            table-layout: fixed;
                        }

                        th, td {
                            padding: 8px;
                            text-align: left;
                            border-bottom: 1px solid #eee;
                            font-size: 12px;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        }

                        th {
                            background-color: #f8f9fa;
                            font-weight: 600;
                            white-space: nowrap;
                        }

                        .total-section {
                            text-align: right;
                            font-size: 14px;
                            font-weight: 600;
                            padding: 15px 0;
                            border-top: 2px solid #eee;
                        }

                        @media print {
                            @page {
                                margin: 10mm;
                                size: auto;
                            }
                            
                            body {
                                width: 100%;
                                min-width: 100%;
                                padding: 0;
                                margin: 0;
                            }

                            table {
                                page-break-inside: auto;
                            }
                            
                            tr {
                                page-break-inside: avoid;
                                page-break-after: auto;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-header">
                        <div class="logo">
                            <img src="/assets/files/Primary_logo.svg" alt="Hospital Logo">
                        </div>
                        <div class="report-title">Sales Report</div>
                        <div class="report-date">Generated on: ${currentDate}</div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                ${Object.keys(this.columnConfigs)
                    .filter(key => !this.columnConfigs[key].hidden)
                    .map(key => `<th>${this.columnConfigs[key].title}</th>`)
                    .join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${this.data.map(item => `
                                <tr>
                                    ${Object.keys(this.columnConfigs)
                            .filter(key => !this.columnConfigs[key].hidden)
                            .map(key => `<td>${this.renderCell(key, item[key], item)}</td>`)
                            .join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        Total Amount: ${this.calculateTotal().toLocaleString()} TZS/=
                    </div>
                </body>
                </html>
            `);
            printFrame.contentDocument.close();

            // Wait for resources to load
            printFrame.onload = () => {
                try {
                    printFrame.contentWindow.focus();
                    printFrame.contentWindow.print();

                    // Remove the iframe after printing
                    setTimeout(() => {
                        if (printFrame && printFrame.parentNode) {
                            document.body.removeChild(printFrame);
                        }
                    }, 1000);
                } catch (error) {
                    console.error('Print error:', error);
                    this.twAlert('Failed to print report', 'error', 3000);
                }
            };
        }, 100);
    }

    filterPanelStyles() {
        return `
            /* Filter Panel Styles */
            .filter-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--white-op2);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease;
            }

            .filter-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .filter-panel {
                position: absolute;
                border-radius: 0px 20px 20px 0;
                top: 0;
                left: -350px;
                width: 350px;
                height: 100%;
                background-color: var(--white_background);
                z-index: 11;
                transition: transform 0.3s ease;
                display: flex;
                flex-direction: column;
                padding: 15px;
            }

            .filter-panel.open {
                transform: translateX(350px);
            }

            .filter-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 15px;
                margin-bottom: 15px;
                border-bottom: 1px solid var(--border_color);
            }

            .filter-panel-header h3 {
                font-size: 1.1rem;
                color: var(--main_color);
                font-weight: 600;
            }

            .close-filter-panel {
                width: 35px;
                height: 35px;
                background: var(--main_color-op2);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;

                span{
                    color: var(--main_color);
                    font-size: 20px;
                }
            }

            .filter-panel-content {
                flex: 1;
                overflow-y: auto;
            }

            .filter-panel-footer {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid var(--border_color);
                background-color: var(--white_background);
            }

            .apply-filters-btn {
                width: 100%;
                height: 42px;
                border-radius: 8px;
                background-color: var(--main_color);
                color: var(--white);
                border: none;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .filter-group {
                margin-bottom: 25px;
            }

            .filter-title {
                font-size: 1rem;
                color: var(--text-primary);
                margin-bottom: 15px;
                font-weight: 500;
                padding-bottom: 8px;
                border-bottom: 1px solid var(--border_color);
            }

            .filter-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
        `;
    }

    styleSheet() {
        return `
        <style>
            @import url('/assets/icons/style.css');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'DM Sans', sans-serif;
            }

            :host {
                display: flex;
                width: 100%;
                flex: 1;
                gap: 20px;
                background-color: var(--white_background);
                padding: 20px !important;
                border-radius: 10px !important;
                margin-bottom: 10px !important;
                position: relative;
                overflow: hidden;
            }

            .frag_loader {
                height: 100%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: var(--white_background);
            }

            .report_section {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                position: relative;
                overflow: hidden;
            }

            .report_header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 65px;
                width: 100%;
            }

            .report_title {
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--main_text);
            }

            .filter-area {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-left: auto;
            }

            .filter-toggle {
                display: flex;
                align-items: center;
                gap: 5px;
                height: 42px;
                padding: 0 15px;
                background-color: var(--white_background);
                border: 1px solid var(--main_color);
                color: var(--main_color);
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
            }

            .filter-toggle span[class^="switch_icon"] {
                font-size: small;
            }

            .date_filter {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .date-input {
                height: 42px;
                border-radius: 8px;
                border: 1px solid var(--border_color);
                padding: 0 15px;
                font-size: 14px;
                color: var(--main_text);
                background-color: var(--white_background);
            }

            .date-input:focus {
                outline: none;
                border-color: var(--main_color);
            }

            .submit-date {
                height: 42px;
                min-width: 120px;
                border-radius: 8px;
                background-color: var(--main_color);
                color: var(--white);
                border: none;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .submit-date:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(var(--main_color_rgb), 0.4);
            }

            ${this.filterPanelStyles()}

            .report-table {
                flex: 1;
                max-height: 700px;
                overflow: hidden;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                border: 1px solid var(--border_color);
                border-radius: 10px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                table-layout: fixed;
            }

            .table-header {
                display: flex;
                border-radius: 10px 10px 0 0;
                background-color: var(--main_color);
                padding: 15px;
                gap: 10px;
                width: 100%;
            }

            .th {
                color: var(--white);
                font-weight: 600;
                font-size: 0.75rem;
                letter-spacing: 0.3px;
                flex-shrink: 0;
            }

            .header-content {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .table-body {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                background-color: var(--white_background);
            }

            .table-row {
                display: flex;
                padding: 12px 15px;
                gap: 10px;
                border-bottom: 1px solid var(--border_color);
                transition: background-color 0.2s;
                width: 100%;
            }
            
            .table-row:hover {
                background-color: rgba(var(--main_color_rgb), 0.05);
            }

            .td {
                font-size: 0.8rem;
                font-weight: 400;
                color: var(--text-primary);
                flex-shrink: 0;
            }

            .cell-content {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .table_footer {
                background-color: var(--white_background);
                border-top: 1px solid var(--border_color);
                padding: 15px;
            }

            .total_row {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                padding: 0 20px;
            }

            .grand_total {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .total_label {
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .total_amount {
                font-weight: 600;
                color: var(--main_color);
                font-size: 1rem;
            }

            .empty-state {
                display: flex;
                justify-content: center;
                flex-direction: column;
                align-items: center;
                height: 100%;
                gap: 10px;
                width: 100%;
            }

            .empty-state span {
                font-size: 50px;
                color: var(--error_color);
            }
            .empty-state p {
                font-size: medium;
                color: var(--error_color);
            }

            /* Scrollbar styling */
            .table-body::-webkit-scrollbar {
                width: 5px;
            }
            
            .table-body::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .table-body::-webkit-scrollbar-thumb {
                background: var(--main_color-op2);
                border-radius: 20px;
            }

            .table-container {
                flex: 1;
                width: 100%;
                height: 100%;
            }

            .print-button {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                height: 42px;
                padding: 0 15px;
                background-color: var(--main_color);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .print-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .print-button span {
                font-size: 16px;
            }
        </style>
        `;
    }
}

