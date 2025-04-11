export class BaseReportComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.data = null;
        this.summaryData = null;
        this.loading = true;
        this.filterPanelOpen = false;
        this.selectedDate = new Date().toISOString().split('T')[0];

        // Column configurations for the main table
        this.columnConfigs = {};

        // Filter arrays
        this.filters = {};
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

    setData(data, summaryData) {
        this.data = data;
        this.summaryData = summaryData;
        this.render();
    }

    setColumnConfigs(configs) {
        this.columnConfigs = configs;
        if (this.data) this.render();
    }

    loader() {
        this.shadowRoot.innerHTML = `
            ${this.styleSheet()}
            <div class="frag_loader">
                <tw-loader width="60px" stroke_width="12px" stroke_color="var(--main_color)"></tw-loader>
            </div>
        `;
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
                filters: this.filters
            };

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            const { success, message, data, summary } = result;

            if (success && data) {
                this.data = data;
                this.summaryData = summary;
                this.loading = false;
                this.controlRender();
                this.twAlert(message || 'Data loaded successfully', 'success', 3000);
            } else {
                this.loading = false;
                this.data = null;
                this.summaryData = null;
                this.controlRender();
                this.twAlert(message || 'Failed to load data', 'error', 3000);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            this.loading = false;
            this.data = null;
            this.summaryData = null;
            this.controlRender();
            this.twAlert(error.message || 'An error occurred while loading data', 'error', 3000);
        }
    }

    renderSummaryTable() {
        if (!this.summaryData) return '';

        return `
            <div class="summary-table">
                <div class="summary-header">
                    <h3>Summary</h3>
                </div>
                <div class="summary-content">
                    ${Object.entries(this.summaryData).map(([key, value]) => `
                        <div class="summary-item">
                            <div class="summary-label">${this.formatLabel(key)}</div>
                            <div class="summary-value">${this.formatValue(value)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderMainTable() {
        if (!this.data || !this.data.length) {
            return `<div class="empty-state">
                <span class="switch_icon_do_not_disturb_alt"></span>
                <p>No data available</p>
            </div>`;
        }

        const columnKeys = Object.keys(this.columnConfigs);

        return `
            <div class="main-table">
                <div class="table-header">
                    ${columnKeys.map(key => `
                        <div class="th" style="width: ${this.columnConfigs[key].width}; text-align: ${this.columnConfigs[key].align || 'left'}">
                            <div class="header-content">${this.columnConfigs[key].title}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="table-body">
                    ${this.data.map(item => `
                        <div class="table-row">
                            ${columnKeys.map(key => `
                                <div class="td" style="width: ${this.columnConfigs[key].width}">
                                    <div class="cell-content" style="text-align: ${this.columnConfigs[key].align || 'left'}">
                                        ${this.renderCell(key, item[key], item)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    formatLabel(key) {
        return key.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatValue(value) {
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return value;
    }

    renderCell(key, value, item) {
        if (this.columnConfigs[key] && this.columnConfigs[key].renderer) {
            return this.columnConfigs[key].renderer(value, item);
        }
        return this.formatValue(value);
    }

    printReport() {
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';

        document.body.appendChild(printFrame);

        const currentDate = new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');

        setTimeout(() => {
            printFrame.contentDocument.open();
            printFrame.contentDocument.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${this.reportTitle || 'Report'}</title>
                    <link rel="stylesheet" href="/assets/icons/style.css">
                    <style>
                        ${this.printStyles()}
                    </style>
                </head>
                <body>
                    <div class="report-header">
                        <div class="logo">
                            <img src="/assets/files/Primary_logo.svg" alt="Hospital Logo">
                        </div>
                        <div class="report-title">${this.reportTitle || 'Report'}</div>
                        <div class="report-date">Generated on: ${currentDate}</div>
                    </div>

                    ${this.renderPrintSummary()}
                    ${this.renderPrintTable()}
                </body>
                </html>
            `);
            printFrame.contentDocument.close();

            printFrame.onload = () => {
                try {
                    printFrame.contentWindow.focus();
                    printFrame.contentWindow.print();
                    setTimeout(() => {
                        document.body.removeChild(printFrame);
                    }, 1000);
                } catch (error) {
                    console.error('Print error:', error);
                    this.twAlert('Failed to print report', 'error', 3000);
                }
            };
        }, 100);
    }

    render() {
        this.shadowRoot.innerHTML = `
            ${this.styleSheet()}
            <div class="report-container">
                <div class="report-header">
                    <div class="title">${this.reportTitle || 'Report'}</div>
                    <div class="actions">
                        <button class="print-button">
                            <span class="switch_icon_print"></span>
                            Print
                        </button>
                        <div class="date-filter">
                            <input type="date" class="date-input" value="${this.selectedDate}">
                            <button class="submit-date">Apply</button>
                        </div>
                    </div>
                </div>

                <div class="report-grid">
                    <div class="summary-section">
                        ${this.renderSummaryTable()}
                    </div>
                    <div class="table-section">
                        ${this.renderMainTable()}
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const printButton = this.shadowRoot.querySelector('.print-button');
        printButton.addEventListener('click', () => this.printReport());

        const submitButton = this.shadowRoot.querySelector('.submit-date');
        submitButton.addEventListener('click', async () => {
            const dateInput = this.shadowRoot.querySelector('.date-input');
            this.selectedDate = dateInput.value;
            this.loading = true;
            this.controlRender();
            await this.fetchData();
        });
    }

    styleSheet() {
        return `
            <style>
                @import url('/assets/icons/style.css');

                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .report-container {
                    display: grid;
                    grid-template-rows: auto 1fr;
                    height: 100%;
                    gap: 20px;
                    padding: 20px;
                }

                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 10px;
                    border-bottom: 1px solid var(--border_color);
                }

                .title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--main_text);
                }

                .actions {
                    display: flex;
                    gap: 15px;
                }

                .print-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: 42px;
                    padding: 0 15px;
                    background-color: var(--main_color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .print-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(var(--main_color_rgb), 0.2);
                }

                .date-filter {
                    display: flex;
                    gap: 10px;
                }

                .date-input {
                    height: 42px;
                    border-radius: 8px;
                    border: 1px solid var(--border_color);
                    padding: 0 15px;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
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
                    color: white;
                    border: none;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .submit-date:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(var(--main_color_rgb), 0.2);
                }

                .report-grid {
                    display: grid;
                    grid-template-rows: auto 1fr;
                    gap: 20px;
                    height: 100%;
                    overflow: hidden;
                }

                .summary-section {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    padding: 20px;
                    background: white;
                    border-radius: 10px;
                    border: 1px solid var(--border_color);
                }

                .summary-table {
                    display: contents;
                }

                .summary-content {
                    display: contents;
                }

                .summary-item {
                    background: var(--white_background);
                    padding: 20px;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    transition: transform 0.2s ease;
                }

                .summary-item:hover {
                    transform: translateY(-2px);
                }

                .summary-label {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }

                .summary-value {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: var(--main_color);
                }

                .table-section {
                    display: grid;
                    grid-template-rows: auto 1fr;
                    background: white;
                    border-radius: 10px;
                    border: 1px solid var(--border_color);
                    overflow: hidden;
                }

                .main-table {
                    display: grid;
                    grid-template-rows: auto 1fr;
                    overflow: hidden;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: ${this.getGridTemplateColumns()};
                    background-color: var(--main_color);
                    padding: 15px;
                    gap: 10px;
                }

                .th {
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                    padding: 0 10px;
                }

                .table-body {
                    overflow-y: auto;
                }

                .table-row {
                    display: grid;
                    grid-template-columns: ${this.getGridTemplateColumns()};
                    padding: 12px 15px;
                    gap: 10px;
                    border-bottom: 1px solid var(--border_color);
                    transition: background-color 0.2s ease;
                }

                .table-row:hover {
                    background-color: rgba(var(--main_color_rgb), 0.05);
                }

                .td {
                    font-size: 0.9rem;
                    padding: 0 10px;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 10px;
                }

                .empty-state span {
                    font-size: 50px;
                    color: var(--error_color);
                }

                .empty-state p {
                    color: var(--error_color);
                }

                .frag_loader {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Scrollbar Styling */
                .table-body::-webkit-scrollbar {
                    width: 6px;
                }

                .table-body::-webkit-scrollbar-track {
                    background: transparent;
                }

                .table-body::-webkit-scrollbar-thumb {
                    background: var(--main_color-op2);
                    border-radius: 10px;
                }

                .table-body::-webkit-scrollbar-thumb:hover {
                    background: var(--main_color);
                }
            </style>
        `;
    }

    getGridTemplateColumns() {
        return Object.values(this.columnConfigs)
            .map(config => config.width || '1fr')
            .join(' ');
    }

    printStyles() {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            body {
                padding: 20px;
                background-color: white;
            }

            .report-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }

            .logo img {
                height: 40px;
                margin-bottom: 15px;
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
                margin-bottom: 30px;
            }

            th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }

            th {
                background-color: #f8f9fa;
                font-weight: 600;
            }

            @media print {
                @page {
                    margin: 15mm;
                    size: auto;
                }
            }
        `;
    }

    renderPrintSummary() {
        if (!this.summaryData) return '';

        return `
            <table class="summary-table">
                <tbody>
                    ${Object.entries(this.summaryData).map(([key, value]) => `
                        <tr>
                            <th>${this.formatLabel(key)}</th>
                            <td>${this.formatValue(value)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderPrintTable() {
        if (!this.data || !this.data.length) return '';

        const columnKeys = Object.keys(this.columnConfigs);

        return `
            <table>
                <thead>
                    <tr>
                        ${columnKeys.map(key => `
                            <th style="text-align: ${this.columnConfigs[key].align || 'left'}">
                                ${this.columnConfigs[key].title}
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.data.map(item => `
                        <tr>
                            ${columnKeys.map(key => `
                                <td style="text-align: ${this.columnConfigs[key].align || 'left'}">
                                    ${this.renderCell(key, item[key], item)}
                                </td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
} 