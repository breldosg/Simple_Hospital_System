import { REPORTS_CONFIG } from "../config/roles.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, removeStyle } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class ReportsView {
    constructor() {
        this.user_role = '';
        this.styleId = 'reports-view-styles';
        // Apply styles
        applyStyle(this.style(), this.styleId);
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // Get user role from localStorage
        this.user_role = globalStates.getState('user_data').role;



        const update_cont = document.querySelector('.update_cont');
        update_cont.innerHTML = '';
        update_cont.appendChild(this.ViewReturn());

    }

    ViewReturn() {
        const container = document.createElement('div');
        container.className = 'reports_view_container';

        container.innerHTML = `
            <div class="reports_grid"></div>
        `;

        const reportsGrid = container.querySelector('.reports_grid');

        // Iterate through report categories
        Object.entries(REPORTS_CONFIG).forEach(([categoryKey, category]) => {
            let hasAccessibleReports = false;

            // Check if user has access to any reports in this category
            Object.values(category.reports).forEach(report => {
                if (report.roles.includes(this.user_role)) {
                    hasAccessibleReports = true;
                }
            });

            // Only show category if user has access to any reports within it
            if (hasAccessibleReports) {
                const categorySection = document.createElement('div');
                categorySection.className = 'report_category_section';

                categorySection.innerHTML = `
                    <div class="category_header">
                        <p class="category_title">${category.title}</p>
                    </div>
                    <div class="category_reports"></div>
                `;

                const reportsContainer = categorySection.querySelector('.category_reports');

                // Add report cards
                Object.entries(category.reports).forEach(([reportKey, report]) => {
                    if (report.roles.includes(this.user_role)) {
                        const reportCard = document.createElement('a');
                        reportCard.href = report.endpoint;
                        reportCard.setAttribute('data-link', '');
                        reportCard.className = 'report_card';

                        reportCard.innerHTML = `
                            <div class="card_content">
                                <div class="card_icon">
                                    <span class="${category.icon}"></span>
                                </div>
                                <p class="card_title">${report.name}</p>
                                <p class="card_description">${report.description}</p>
                            </div>
                        `;

                        reportCard.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            console.log(report.endpoint);
                            frontRouter.navigate(report.endpoint);
                        });

                        reportsContainer.appendChild(reportCard);
                    }
                });

                reportsGrid.appendChild(categorySection);
            }
        });

        return container;
    }

    style() {
        return `
            
        `;
    }
} 