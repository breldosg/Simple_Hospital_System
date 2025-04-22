import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, removeStyle } from "../script/index.js";
import { BaseReportComponent } from '../report_utility/BaseReportComponent.js';

// Register the base report component
customElements.define('base-report', BaseReportComponent);

export class SalesReportView {
    constructor() {
        this.styleId = 'sales-report-view-styles';
        this.reportTitle = 'Sales Report';
        this.endpoint = '/api/reports/get_sales_report';
        this.requestKey = 1390;

        // Apply styles
        applyStyle(this.style(), this.styleId);
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.ViewReturn();
    }

    formatDate(dateStr) {
        const date = new Date(dateStr.replace(' ', 'T'));
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    getColumnConfigs() {
        return {
            id: {
                title: 'Invoice Id',
                width: '100px',
                align: 'left'
            },
            paid_by: {
                title: 'Patient Name',
                width: '2fr',
                align: 'left'
            },
            visit_id: {
                title: 'Visit Id',
                width: '100px',
                align: 'center'
            },
            created_at: {
                title: 'Payment Date',
                width: '1.5fr',
                align: 'center',
                renderer: (value) => this.formatDate(value)
            },
            served_by: {
                title: 'Served By',
                width: '1.5fr',
                align: 'center'
            },
            status: {
                title: 'Status',
                width: '120px',
                align: 'center',
                renderer: (value) => `<span class="status-badge ${value.toLowerCase()}">${value}</span>`
            },
            total_price: {
                title: 'Total Amount',
                width: '150px',
                align: 'right',
                renderer: (value) => `${parseFloat(value).toLocaleString()} TZS/=`
            }
        };
    }

    async fetchData(date, filters = {}) {
        try {
            const requestData = {
                date: date,
                filters: filters,
                key: this.requestKey
            };

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching sales data:', error);
            throw error;
        }
    }

    ViewReturn() {
        const update_cont = document.querySelector('.update_cont');
        update_cont.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'sales_report_view_container';

        // Create the report header with controls
        const reportHeader = document.createElement('div');
        reportHeader.className = 'report-header';

        // Title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'title';
        titleDiv.textContent = this.reportTitle;
        reportHeader.appendChild(titleDiv);

        // Actions container
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        // Print button
        const printButton = document.createElement('button');
        printButton.className = 'print-button';
        printButton.innerHTML = '<span class="switch_icon_print"></span> Print';
        actionsDiv.appendChild(printButton);

        // Date filter
        const dateFilter = document.createElement('div');
        dateFilter.className = 'date-filter';

        const today = new Date().toISOString().split('T')[0];

        // Date input
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'date-input';
        dateInput.value = today;
        dateFilter.appendChild(dateInput);

        // Apply button
        const applyButton = document.createElement('button');
        applyButton.className = 'submit-date';
        applyButton.textContent = 'Apply';
        dateFilter.appendChild(applyButton);

        actionsDiv.appendChild(dateFilter);
        reportHeader.appendChild(actionsDiv);

        container.appendChild(reportHeader);

        // Create the base report component
        const reportComponent = document.createElement('base-report');

        // Set initial properties
        reportComponent.setColumnConfigs(this.getColumnConfigs());
        reportComponent.reportTitle = this.reportTitle;
        reportComponent.endpoint = this.endpoint;
        reportComponent.setDate(today);

        // Setup data fetching
        this.fetchData(today)
            .then(result => {
                if (result.success && result.data) {
                    reportComponent.setData(result.data.data, result.data.summary);
                }
            })
            .catch(error => {
                console.error('Failed to fetch initial data:', error);
            });

        // Add event listeners
        printButton.addEventListener('click', () => {
            reportComponent.printReport();
        });

        applyButton.addEventListener('click', async () => {
            const date = dateInput.value;
            reportComponent.setDate(date);
            reportComponent.loading = true;
            reportComponent.controlRender();

            try {
                const result = await this.fetchData(date);
                if (result.success && result.data) {
                    reportComponent.setData(result.data.data, result.data.summary);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        });

        container.appendChild(reportComponent);
        update_cont.appendChild(container);
    }

    style() {
        return `
            .sales_report_view_container {
                display: grid;
                grid-template-rows: auto 1fr;
                width: 100%;
                height: 100%;
                border-radius: 10px;
                overflow: hidden;
                padding: 0;
                gap: 20px;
            }

            .sales_report_view_container > * {
                min-width: 0;
                min-height: 0;
            }

            .report-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 10px;
                width: 100%;
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
                background-color: var(--pri_color);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .print-button:hover {
                transform: translateY(-2px);
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
            }

            .submit-date {
                height: 42px;
                min-width: 120px;
                border-radius: 8px;
                background-color: var(--pri_color);
                color: white;
                border: none;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .submit-date:hover {
                transform: translateY(-2px);
            }

            .status-badge {
                display: inline-grid;
                place-items: center;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 500;
                text-transform: capitalize;
            }

            .status-badge.paid {
                background-color: var(--success_color-op2);
                color: var(--success_color);
            }

            .status-badge.not_paid {
                background-color: var(--error_color-op2);
                color: var(--error_color);
            }

            @media screen and (max-width: 768px) {
                .sales_report_view_container {
                    padding: 10px;
                }
                
                .actions {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .report-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                }
                
                .date-filter {
                    width: 100%;
                }
                
                .date-input {
                    flex: 1;
                }
            }
        `;
    }
} 