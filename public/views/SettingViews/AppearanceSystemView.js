import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../../config/roles.js";
import { dashboardController } from "../../controller/DashboardController.js";
import { visit_priority, visit_type } from "../../custom/customizing.js";
import { screenCollection } from "../../screens/ScreenCollection.js";
import { applyStyle, date_formatter, decodeHTML, getVisitPriority, getVisitType, notify, timeStamp_formatter } from "../../script/index.js";
import { frontRouter } from "../../script/route.js";

export class AppearanceSystemView {
    constructor() {
        applyStyle(this.style());
    }

    async PreRender() {
        const check_main_container = document.querySelector('.settings_bottom_cont_right');
        if (!check_main_container) {
            await dashboardController.settingsView.PreRender();
        }

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        // Fetch data and wait for result
        // const response = await this.fetchData();
        // console.log(response);


        const cont = document.querySelector('.settings_bottom_cont_right');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.appearance_setting_container');


    }

    ViewReturn() {
        return `
        <div class="appearance_setting_container">
            <div class="appearance_header">
                <h2>Appearance Settings</h2>
                <p>Customize how your application looks and feels</p>
            </div>
            
            <div class="settings_section">
                <h3>Theme</h3>
                <div class="theme_options">
                    <div class="theme_card" data-theme="light">
                        <div class="theme_preview light"></div>
                        <span>Light Mode</span>
                        <input type="radio" name="theme" value="light" checked>
                    </div>
                    <div class="theme_card" data-theme="dark">
                        <div class="theme_preview dark"></div>
                        <span>Dark Mode</span>
                        <input type="radio" name="theme" value="dark">
                    </div>
                    <div class="theme_card" data-theme="system">
                        <div class="theme_preview system"></div>
                        <span>System Default</span>
                        <input type="radio" name="theme" value="system">
                    </div>
                </div>
            </div>


            <div class="settings_actions">
                <button class="btn_save">Save Changes</button>
                <button class="btn_reset">Reset to Default</button>
            </div>
        </div>
        `;
    }

    style() {
        return `
    .appearance_setting_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 24px;
        gap: 32px;
        background: var(--pure_white_background);
        


        .appearance_header h2 {
            font-size: 24px;
            margin-bottom: 8px;
        }

        .appearance_header p {
            font-size: 14px;
        }

        .settings_section {
            border-radius: 12px;
            margin-bottom: 24px;
        }

        .settings_section h3 {
            font-size: 18px;
            margin-bottom: 16px;
        }

        .theme_options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
        }

        .theme_card {
            border: 1px solid var(--border_color);
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .theme_card:hover {
            transform: translateY(-2px);
        }

        .theme_preview {
            width: 100%;
            height: 100px;
            border-radius: 6px;
            margin-bottom: 12px;
        }

        .theme_preview.light {
            background: #ffffff;
            border: 1px solid #ddd;
        }

        .theme_preview.dark {
            background: #1a1a1a;
        }

        .theme_preview.system {
            background: linear-gradient(135deg, #ffffff 50%, #1a1a1a 50%);
        }

        .color_options {
            display: flex;
            gap: 16px;
        }

        .color_picker {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .color_picker input[type="color"] {
            width: 48px;
            height: 48px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .density_select {
            width: 200px;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid var(--border-color, #ddd);
            font-size: 14px;
        }

        .font_size_slider {
            width: 100%;
            max-width: 300px;
        }

        .slider {
            width: 100%;
            height: 4px;
            outline: none;
            -webkit-appearance: none;
            border-radius: 2px;
        }

        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background: var(--primary-color, #007AFF);
            border-radius: 50%;
            cursor: pointer;
        }

        .font_size_labels {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
        }

        .font_size_labels span:first-child {
            font-size: 12px;
        }

        .font_size_labels span:last-child {
            font-size: 20px;
        }

        .settings_actions {
            display: flex;
            gap: 16px;
            margin-top: 32px;
            
        }

        .btn_save, .btn_reset {
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn_save {
            background: var(--primary-color, #007AFF);
            color: white;
            border: none;
        }

        .btn_reset {
            background: transparent;
            border: 1px solid var(--border-color, #ddd);
            color: var(--text-primary, #333);
        }

        .btn_save:hover {
            background: var(--primary-color-dark, #0056b3);
        }

        .btn_reset:hover {
            background: var(--hover-color, #f5f5f5);
        }
    }
        `;
    }
}


