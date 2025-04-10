import { TwBaseReportComponent } from './TwBaseReportComponent.js';

export class TwSalesReport extends TwBaseReportComponent {
    constructor() {
        super();
        this.reportTitle = 'Sales Report';
        this.endpoint = '/fetchrequest';
        this.requestKey = 1390;

        // Set up column configurations
        this.setColumnConfigs({
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
        });
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

    renderSummaryTable() {
        if (!this.summaryData) return '';

        const summaryCards = [
            {
                icon: 'switch_icon_payments',
                key: 'total_amount',
                label: 'Total Revenue',
                format: (value) => `${parseFloat(value).toLocaleString()} TZS/=`
            },
            {
                icon: 'switch_icon_receipt',
                key: 'total_invoices',
                label: 'Total Invoices',
                format: (value) => value
            },
            {
                icon: 'switch_icon_check_circle',
                key: 'paid_invoices',
                label: 'Paid Invoices',
                format: (value) => value
            },
            {
                icon: 'switch_icon_pending',
                key: 'pending_invoices',
                label: 'Pending Invoices',
                format: (value) => value
            }
        ];

        return `
            <div class="summary-grid">
                ${summaryCards.map(card => `
                    <div class="summary-card">
                        <div class="card-icon">
                            <span class="${card.icon}"></span>
                        </div>
                        <div class="card-content">
                            <div class="card-value">${card.format(this.summaryData[card.key] || 0)}</div>
                            <div class="card-label">${card.label}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    styleSheet() {
        return `
            ${super.styleSheet()}
            <style>
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    padding: 20px;
                }

                .summary-card {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 15px;
                    align-items: center;
                    padding: 20px;
                    background: var(--white_background);
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .summary-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(var(--main_color_rgb), 0.1);
                }

                .card-icon {
                    display: grid;
                    place-items: center;
                    width: 48px;
                    height: 48px;
                    background: var(--main_color-op2);
                    border-radius: 10px;
                }

                .card-icon span {
                    font-size: 24px;
                    color: var(--main_color);
                }

                .card-content {
                    display: grid;
                    gap: 5px;
                }

                .card-value {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: var(--main_text);
                }

                .card-label {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
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

                .table-row {
                    cursor: pointer;
                }

                .table-row:hover {
                    background-color: rgba(var(--main_color_rgb), 0.05);
                }

                .table-row .td {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding: 12px 16px;
                }

                .table-header .th {
                    font-weight: 600;
                    padding: 12px 16px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Responsive adjustments */
                @media screen and (max-width: 1200px) {
                    .summary-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media screen and (max-width: 768px) {
                    .summary-grid {
                        grid-template-columns: 1fr;
                    }

                    .card-value {
                        font-size: 1.2rem;
                    }
                }
            </style>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.fetchData();
    }
}

// Register the custom element
customElements.define('sales-report', TwSalesReport); 