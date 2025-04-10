import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, removeStyle } from "../script/index.js";

export class SalesReportView {
    constructor() {
        this.styleId = 'sales-report-view-styles';
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // Apply styles
        applyStyle(this.style(), this.styleId);
        
        const update_cont = document.querySelector('.update_cont');
        update_cont.innerHTML = '';
        update_cont.appendChild(this.ViewReturn());

        // Add cleanup listener
        window.addEventListener('popstate', () => this.cleanup());
    }

    cleanup() {
        removeStyle(this.styleId);
        window.removeEventListener('popstate', () => this.cleanup());
    }

    ViewReturn() {
        const container = document.createElement('div');
        container.className = 'sales_report_view_container';

        // Create the report component
        const reportComponent = document.createElement('sales-report');
        container.appendChild(reportComponent);

        return container;
    }

    style() {
        return `
            .sales_report_view_container {
                display: grid;
                grid-template-rows: 1fr;
                width: 100%;
                height: 100%;
                background-color: var(--background);
                border-radius: 10px;
                overflow: hidden;
                padding: 0;
                gap: 0;
            }

            .sales_report_view_container > * {
                min-width: 0;
                min-height: 0;
            }

            @media screen and (max-width: 768px) {
                .sales_report_view_container {
                    padding: 10px;
                }
            }
        `;
    }
} 