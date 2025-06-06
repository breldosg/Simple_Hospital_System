import { dashboardController } from "../controller/DashboardController.js";
import { visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, date_formatter, notify, prepareVitalReport, print_div } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SingleVisitHistoryView {
    constructor() {
        this.visit_id = null;
        this.patient_name = null;
        this.lab_data = null;
        this.radiology_data = null;
        // applyStyle(this.style())
        this.rendered_cards = new Set();

        this.fetch_map = {
            visit_detail: '/api/patient/single_visit_detail',
            patient_detail: '/api/patient/single_patient',
        }

        this.card_to_show = [
            {
                title: 'Visit Details',
                cardName: 'visit_detail',
                class_name: 'visit_detail_cont',
            },
            {
                title: 'Clinic Evaluation & Visit Plan',
                cardName: 'clinic_plan_cont',
                class_name: 'section_cont clinic_plan_cont',
            },
            {
                title: 'Clinic Evaluation',
                cardName: 'clinic_evaluation',
                class_name: 'clinical_evaluation_cont',
            },
            {
                title: 'Preliminary Diagnosis',
                cardName: 'pre_final_diagnosis',
                class_name: 'prescription_cont',
            },
            {
                title: 'Visit Plan',
                cardName: 'visit_plan',
                class_name: 'plan_for_next_visit_cont',
            },
            {
                title: 'Pre-Diagnosis',
                cardName: 'pre_diagnosis',
                class_name: 'pre_diagnosis_cont',
            },
            {
                title: 'Final Diagnosis',
                cardName: 'final_diagnosis',
                class_name: 'final_diagnosis_cont',
            },
            {
                title: 'Patient Notes',
                cardName: 'patient_notes',
                class_name: 'patient_notes_cont',
            },
            {
                title: 'Allergies',
                cardName: 'allergies',
                class_name: 'allergies_cont',
            },
            {
                title: 'Vaccines',
                cardName: 'vaccines',
                class_name: 'vaccines_cont',
            },
            {
                title: 'Implants',
                cardName: 'implants',
                class_name: 'implants_cont',
            },
            {
                title: 'Procedures',
                cardName: 'procedures',
                class_name: 'procedures_cont',
            },
            {
                title: 'Prescriptions',
                cardName: 'prescriptions',
                class_name: 'prescription_cont',
            },
            {
                title: 'Attachments',
                cardName: 'attachments',
                class_name: 'attachments_cont',
            },
            {
                title: 'Lab Results',
                cardName: 'lab_results',
                class_name: 'lab_report_cont',
            },
            {
                title: 'Radiology Results',
                cardName: 'radiology_results',
                class_name: 'radiology_report_cont',
            },
            {
                title: 'Vital Signs',
                cardName: 'vital_signs',
                class_name: 'vital_detail_cont',
            }
        ];
    }

    async PreRender(params) {
        try {
            if (!params?.id) {
                throw new Error('Visit ID is required');
            }

            // Reset state
            this.visit_id = params.id;
            this.rendered_cards = new Set();
            this.lab_data = null;
            this.radiology_data = null;

            // Ensure dashboard is rendered
            const check_dashboard = document.querySelector('.print_cont');
            if (!check_dashboard) {
                await screenCollection.printScreen.PreRender();
            }

            // Get container and render initial structure
            const cont = document.querySelector('.print_cont');
            if (!cont) {
                throw new Error('Container not found');
            }

            cont.innerHTML = this.ViewReturn();
            this.main_container = document.querySelector('.single_visit_history_cont');

            if (!this.main_container) {
                throw new Error('Main container not found after rendering');
            }

            // Set light theme
            document.body.classList.value = '';
            document.body.classList.add('light_mode');
            document.documentElement.setAttribute('data-theme', 'light');

            // // Render patient details
            // await dashboardController.patientDetailComponent.PreRender({
            //     container: this.main_container,
            //     visit_id: this.visit_id,
            //     location: 'patient_history',
            // });

            // Render company details
            await dashboardController.companyDetailComponent.PreRender({
                container: this.main_container,
            });

            // Render main content
            await this.render();

        } catch (error) {
            console.error('Error in PreRender:', error);
            notify('top_left', error.message || 'Failed to initialize view', 'error');
        }
    }

    async render() {
        try {

            // fetch patient detail
            const patient_data = await this.fetchData('patient_detail');
            if (!patient_data) {
                notify('top_left', 'Failed to load patient data', 'error');
                return;
            }

            var patient_data_obj = {
                patient_data: patient_data,
                success: true
            }

            // fetch visit detail
            this.visit_data = await this.fetchData('visit_detail');
            if (!this.visit_data) {
                notify('top_left', 'Failed to load visit data', 'error');
                return;
            }

            // i push patient data to visit data
            this.visit_data.patient_data = patient_data_obj;

            // log data
            console.log("history data", this.visit_data);
            console.log("patient data", patient_data);

            const cardRenderConfig = [
                {
                    method: this.render_patient_detail,
                    dataKey: 'patient_data',
                    dataArray: 'patient_data',
                    cardName: 'patient_detail'
                },
                {
                    method: this.render_visit_detail,
                    dataKey: 'visit_detail',
                    dataArray: 'visit_data',
                    cardName: 'visit_detail'
                },
                {
                    method: this.render_vital_detail,
                    dataKey: 'vital_sign',
                    dataArray: 'vital_data',
                    cardName: 'vital_signs'
                },
                {
                    method: this.render_clinic_evaluation,
                    dataKey: 'clinical_evaluation_data',
                    dataArray: 'evaluation_data',
                    condition: (data) => data?.success,
                    cardName: 'clinic_evaluation'
                },
                {
                    method: this.render_visit_plan,
                    dataKey: 'plan_visit_data',
                    dataArray: 'plan_data',
                    condition: (data) => data?.success,
                    cardName: 'visit_plan'
                },
                {
                    method: this.render_pre_diagnosis,
                    dataKey: 'pre_diagnosis_data',
                    dataArray: 'diagnosis_data',
                    condition: (data) => data?.success,
                    cardName: 'pre_diagnosis'
                },
                {
                    method: this.render_final_diagnosis,
                    dataKey: 'final_diagnosis_data',
                    dataArray: 'diagnosis_data',
                    condition: (data) => data?.success,
                    cardName: 'final_diagnosis'
                },
                {
                    method: this.render_lab_results,
                    dataKey: 'lab_order_data',
                    dataArray: 'order_data',
                    condition: (data) => data?.success,
                    cardName: 'lab_results',
                    fetchData: true
                },
                {
                    method: this.render_radiology_results,
                    dataKey: 'radiology_order_data',
                    dataArray: 'order_data',
                    condition: (data) => data?.success,
                    cardName: 'radiology_results',
                    fetchData: true
                },
                {
                    method: this.render_patient_notes,
                    dataKey: 'patient_note',
                    dataArray: 'note_data',
                    condition: (data) => data?.success && data?.note_data?.length > 0,
                    cardName: 'patient_notes'
                },
                {
                    method: this.render_allergies,
                    dataKey: 'allergy_data',
                    dataArray: 'allergy_data',
                    condition: (data) => data?.success && data?.allergy_data?.length > 0,
                    cardName: 'allergies'
                },
                {
                    method: this.render_vaccines,
                    dataKey: 'vaccine_data',
                    dataArray: 'vaccine_data',
                    condition: (data) => data?.success && data?.vaccine_data?.length > 0,
                    cardName: 'vaccines'
                },
                {
                    method: this.render_implants,
                    dataKey: 'implantable_device_data',
                    dataArray: 'devices_data',
                    condition: (data) => data?.success && data?.devices_data?.length > 0,
                    cardName: 'implants'
                },
                {
                    method: this.render_procedures,
                    dataKey: 'procedure_data',
                    dataArray: 'procedure_data',
                    condition: (data) => data?.success && data?.procedure_data?.length > 0,
                    cardName: 'procedures'
                },
                {
                    method: this.render_prescriptions,
                    dataKey: 'prescription_data',
                    dataArray: 'prescription_data',
                    condition: (data) => data?.success && data?.prescription_data?.length > 0,
                    cardName: 'prescriptions'
                },
                {
                    method: this.render_attachments,
                    dataKey: 'attachments_data',
                    dataArray: 'attachments_data',
                    condition: (data) => data?.success && data?.attachments_data?.length > 0,
                    cardName: 'attachments'
                },
            ];

            // Clear rendered cards set
            this.rendered_cards = new Set();

            // Process each card configuration sequentially
            for (const config of cardRenderConfig) {
                try {
                    const data = this.visit_data[config.dataKey];

                    // Skip if condition exists and is not met
                    if (config.condition && !config.condition(data)) continue;

                    // If this config requires fetching additional data
                    let renderData;
                    if (config.fetchData) {
                        if (config.cardName === 'lab_results') {
                            renderData = await this.fetch_laboratory_request(this.visit_id);
                        } else if (config.cardName === 'radiology_results') {
                            renderData = await this.fetch_radiology_request(this.visit_id);
                        }
                    } else {
                        renderData = config.dataArray ? data[config.dataArray] : undefined;
                    }

                    // Call render method with proper context and data
                    await config.method.call(
                        this,
                        renderData
                    );

                    // Add to rendered cards set
                    this.rendered_cards.add(config.cardName);

                    // Call afterRender if exists
                    if (config.afterRender) {
                        await config.afterRender.call(this);
                    }
                } catch (error) {
                    console.error(`Error rendering ${config.cardName}:`, error);
                    notify('top_left', `Failed to render ${config.cardName}`, 'warning');
                }
            }

            console.log("rendered cards", this.rendered_cards);

            // Render settings popup and attach listeners
            await this.render_settings_popup();
            this.attach_listeners();

        } catch (error) {
            console.error('Error in render:', error);
            notify('top_left', 'Failed to render visit history', 'error');
        }
    }

    ViewReturn() {
        return `
            <div class="single_visit_history_cont">

                <p class="head_title">Patient Report</p>

                <div class="print_btn">
                    <div class="settings_btn">
                        <span class='switch_icon_settings1'></span>
                    </div>
                    <button type="button" class="print_btn_btn">Print Report</button>
                </div>
                
            </div>
        `;
    }

    attach_listeners() {
        try {
            // Remove any existing listeners first
            const existingPrintBtn = this.main_container.querySelector('.print_btn_btn');
            const existingSettingsBtn = this.main_container.querySelector('.settings_btn');
            const newPrintBtn = existingPrintBtn.cloneNode(true);
            const newSettingsBtn = existingSettingsBtn.cloneNode(true);

            if (existingPrintBtn) {
                existingPrintBtn.parentNode.replaceChild(newPrintBtn, existingPrintBtn);
            }

            if (existingSettingsBtn) {
                existingSettingsBtn.parentNode.replaceChild(newSettingsBtn, existingSettingsBtn);
            }

            // Attach print button listener
            newPrintBtn.addEventListener('click', () => {
                this.print_document();
            });

            // Attach settings button listener
            newSettingsBtn.addEventListener('click', () => {
                this.open_render_settings_popup();
            });

            // // Attach keyboard shortcut for printing
            // const handleKeyPress = (e) => {
            //     if (e.ctrlKey && e.key === 'p') {
            //         // e.preventDefault();
            //         this.print_document();
            //     }
            // };

            // // Remove existing listener if any
            // document.removeEventListener('keydown', handleKeyPress);
            // // Add new listener
            // document.addEventListener('keydown', handleKeyPress);

        } catch (error) {
            console.error('Error attaching listeners:', error);
            notify('top_left', 'Failed to attach event listeners', 'warning');
        }
    }

    async print_document() {
        try {
            // Close settings popup
            this.close_render_settings_popup();

            // Print the document
            window.print();
        } catch (error) {
            console.error('Error during printing:', error);
            notify('top_left', 'Failed to print document', 'error');
        }
    }

    async render_settings_popup() {
        try {
            // Create popup if it doesn't exist
            await this.create_popup();

            const popup = document.querySelector('.wrapper .popup');
            if (!popup) {
                throw new Error('Failed to find or create popup element');
            }

            popup.innerHTML = `
                <div class="popup_content">
                    <div class="print_sections">
                        <div class="print_sections_header">
                            <h3>Print Options</h3>
                            <div class="close_print_sections">
                                <span class='switch_icon_close'></span>
                            </div>
                        </div>

                        <div class="select_all_cont">
                            <p class="select_all_text">Shown</p>
                            <p class="select_all_action" data_action="hide">Hide All</p>
                        </div>
                        <div class="sections_list"></div>
                        <div class="print_actions">
                            <button class="print_now_btn">Print Now</button>
                        </div>
                    </div>
                </div>
            `;

            // Attach event listeners
            const closeBtn = popup.querySelector('.close_print_sections');
            const selectAllAction = popup.querySelector('.select_all_action');
            const printNowBtn = popup.querySelector('.print_now_btn');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close_render_settings_popup());
            }

            if (selectAllAction) {
                selectAllAction.addEventListener('click', (e) => {
                    const action = e.target.getAttribute('data_action');
                    this.handle_select_all_action(action, e.target);
                });
            }

            if (printNowBtn) {
                printNowBtn.addEventListener('click', () => this.print_document());
            }

            // Render section options
            await this.render_on_print_options_item(popup);

        } catch (error) {
            console.error('Error rendering settings popup:', error);
            notify('top_left', 'Failed to render print settings', 'warning');
        }
    }

    create_popup() {
        return new Promise((resolve) => {
            let popup = document.querySelector('.wrapper .popup');
            if (!popup) {
                popup = document.createElement('div');
                popup.className = 'popup';
                const popup_content = document.createElement('div');
                popup_content.className = 'popup_content';
                popup.appendChild(popup_content);
                document.querySelector(".wrapper").appendChild(popup);
            }
            resolve(popup);
        });
    }

    open_render_settings_popup() {
        const popup = document.querySelector('.wrapper .popup');
        if (popup) {
            popup.classList.add('active');
        }
    }

    close_render_settings_popup() {
        const popup = document.querySelector('.wrapper .popup');
        if (popup) {
            popup.classList.remove('active');
        }
    }

    async handle_select_all_action(action, element) {
        try {
            if (action === "hide") {
                element.innerHTML = "Show All";
                element.setAttribute('data_action', 'show');
                this.rendered_cards.forEach(card_name => {
                    const card_info = this.card_to_show.find(card => card.cardName === card_name);
                    if (card_info) {
                        const cardElement = this.main_container.querySelector(`.${card_info.class_name}`);
                        if (cardElement) {
                            cardElement.classList.add('display_hidden');
                        }
                    }
                });
                await this.render_on_print_options_item(document.querySelector('.wrapper .popup'), 'hide');
            } else {
                element.innerHTML = "Hide All";
                element.setAttribute('data_action', 'hide');
                this.rendered_cards.forEach(card_name => {
                    const card_info = this.card_to_show.find(card => card.cardName === card_name);
                    if (card_info) {
                        const cardElement = this.main_container.querySelector(`.${card_info.class_name}`);
                        if (cardElement) {
                            cardElement.classList.remove('display_hidden');
                        }
                    }
                });
                await this.render_on_print_options_item(document.querySelector('.wrapper .popup'), 'show');
            }
        } catch (error) {
            console.error('Error in handle_select_all_action:', error);
            notify('top_left', 'Failed to update section visibility', 'warning');
        }
    }

    async render_on_print_options_item(popup, state = 'show') {
        try {
            const sections_list = popup.querySelector('.sections_list');
            if (!sections_list) return;

            sections_list.innerHTML = '';

            const icon_map = {
                show: 'switch_icon_eye',
                hide: 'switch_icon_eye_slash',
            };

            this.rendered_cards.forEach(card_name => {
                const card_info = this.card_to_show.find(card => card.cardName === card_name);
                if (!card_info) return;

                const option = document.createElement('div');
                option.className = 'checkbox_container';
                option.setAttribute('is-checked', true);
                option.innerHTML = `
                    <p class="label">${card_info.title}</p>
                    <span class='${icon_map[state]}'></span>
                `;

                option.addEventListener('click', () => {
                    const is_checked = option.getAttribute('is-checked') === 'true';
                    option.setAttribute('is-checked', !is_checked);

                    const icon = option.querySelector('span');
                    if (is_checked) {
                        icon.classList.replace('switch_icon_eye', 'switch_icon_eye_slash');
                        this.main_container.querySelector(`.${card_info.class_name}`)?.classList.add('display_hidden');
                    } else {
                        icon.classList.replace('switch_icon_eye_slash', 'switch_icon_eye');
                        this.main_container.querySelector(`.${card_info.class_name}`)?.classList.remove('display_hidden');
                    }
                });

                sections_list.appendChild(option);
            });
        } catch (error) {
            console.error('Error in render_on_print_options_item:', error);
            notify('top_left', 'Failed to render print options', 'warning');
        }
    }

    render_patient_detail(data) {
        var cont = this.main_container.querySelector('.patient_detail_cont ');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'patient_detail_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        cont.innerHTML = `
            <div class="patient_detail_section">
                <h3>Patient Details</h3>
                <div class="card">
                        <p class="response">Name: <span class="response_text">${data.name} - #${data.id}</span></p>
                        <p class="response">Gender: <span class="response_text">${data.gender}</span></p>
                        <p class="response">Date of Birth: <span class="response_text">${date_formatter(data.dob)}</span></p>
                        <p class="response">Age: <span class="response_text">${data.age.amount} ${data.age.unit}</span></p>
                        <p class="response">Occupation: <span class="response_text">${data.occupation}</span></p>
                        <p class="response">Nationality: <span class="response_text">${data.nationality}</span></p>
                        <p class="response">Address: <span class="response_text">${data.address}</span></p>
                        <p class="response">Registration Date: <span class="response_text">${date_formatter(data.created_at)}</span></p>
                        <p class="response">Phone: <span class="response_text">${data.phone} ${data.alt_phone && data.alt_phone !== '' ? `  /  ${data.alt_phone}` : ''}</span></p>
                </div>
            </div>
        `;
    }

    render_vital_detail(data) {
        var cont = this.main_container.querySelector('.vital_detail_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'vital_detail_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        const vitalReport = prepareVitalReport(data);

        cont.innerHTML = `
            <div class="vital_detail_section">
                <h3>Vital Signs</h3>
                <p>Vital signs recorded on <u>${date_formatter(data.created_at)}</u>. These measurements indicate the patient's essential physiological functions.</p>
                <table class="vital_table">
                    <thead>
                        <tr>
                            <th>Vital Sign</th>
                            <th>Value</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Temperature</td>
                            <td>${data.temperature} ${vitalReport.temperature.unit}</td>
                            <td class="${vitalReport.temperature.status}">${vitalReport.temperature.status.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td>Pulse</td>
                            <td>${data.pulse} ${vitalReport.pulse.unit}</td>
                            <td class="${vitalReport.pulse.status}">${vitalReport.pulse.status.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td>Blood Pressure</td>
                            <td>${data.blood_pressure} ${vitalReport.blood_pressure.unit}</td>
                            <td class="${vitalReport.blood_pressure.status}">${vitalReport.blood_pressure.status.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td>Respiration</td>
                            <td>${data.respiration} ${vitalReport.respiration.unit}</td>
                            <td class="${vitalReport.respiration.status}">${vitalReport.respiration.status.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td>O2 Saturation</td>
                            <td>${data.o2_saturation} ${vitalReport.o2_saturation.unit}</td>
                            <td class="${vitalReport.o2_saturation.status}">${vitalReport.o2_saturation.status.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td>Weight</td>
                            <td>${data.weight} kg</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Height</td>
                            <td>${data.height} cm</td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    render_visit_detail(data) {
        var cont = this.main_container.querySelector('.visit_detail_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'visit_detail_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        var visit_priority_title = visit_priority.find(priority => priority.value === data.visit_priority).label ?? "N/A";
        var visit_type_title = visit_type.find(type => type.value === data.visit_type).label ?? "N/A";
        cont.innerHTML = `
            <div class="visit_detail_section">
                <h3>Visit Details</h3>
                <div class="card">
                    <p class="response">Visit ID: <span class="response_text">#${data.visit_id}</span></p>
                    <p class="response">Department: <span class="response_text">${data.department_name}</span></p>
                    <p class="response">Doctor: <span class="response_text">${data.doctor_name}</span></p>
                    <p class="response">Visit Status: <span class="response_text">${data.status}</span></p>
                    <p class="response">Visit Type: <span class="response_text">${visit_type_title}</span></p>
                    <p class="response">Visit Priority: <span class="response_text">${visit_priority_title}</span></p>
                    <p class="response">Visit Date: <span class="response_text">${date_formatter(data.created_at)}</span></p>
                    <p class="response">Leave Date: <span class="response_text">${data.checkout_time ? date_formatter(data.checkout_time) : 'N/A'}</span></p>
                </div>
            </div>
        `;
    }

    render_clinic_evaluation(data) {
        var cont = this.main_container.querySelector('.clinical_evaluation_cont '); // Added missing dot for class selector

        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'section_cont clinical_evaluation_cont page_breaker';
            this.main_container.appendChild(cont);
        }


        // Helper to render a group if value exists
        const renderGroup = (label, value) => value ? `
            <div class="group">
                <p class="head">${label}</p>
                <p class="value">${value}</p>
            </div>
        ` : '';

        cont.innerHTML = `
            <h3>Clinical Evaluation</h3>
            <p>The following is the clinical evaluation for the patient. This evaluation is based on the information provided by the patient and the doctor.</p>
            <div class="card">
                ${renderGroup('Chief Complaint', data.chief_complaints)}
                ${renderGroup('History of Present Illness', data.history_of_present_illness)}
                ${renderGroup('Review of Systems', data.review_of_systems)}
                ${renderGroup('General Examination', data.general_exam)}
                ${renderGroup('Systemic Examination', data.systemic_exam)}
            </div>
        `;
    }

    render_visit_plan(data) {

        var cont = this.main_container.querySelector('.plan_for_next_visit_cont');

        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'section_cont plan_for_next_visit_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        // Format date
        const date = data.created_at ? date_formatter(data.created_at) : '';

        // Helper to render a group if value exists
        const renderGroup = (label, value) => value ? `
            <div class="group">
                <p class="head">${label}</p>
                <p class="value">${value}</p>
            </div>
        ` : '';

        const view = `
            <h3>Plan for Next Visit</h3>
            <p>The following is the plan for the next visit for the patient. This plan is based on the information provided by the patient and the doctor.</p>
            <div class="card">
                ${renderGroup('Purpose of Visit', data.purpose)}
                ${renderGroup('Instructions', data.instruction)}
            </div>
        `;

        cont.innerHTML += view; // Use innerHTML += to append HTML string

    }

    render_pre_diagnosis(data) {
        var cont = this.main_container.querySelector('.pre_diagnosis_cont');

        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'pre_diagnosis_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        let content = '';
        if (Array.isArray(data) && data.length > 0) {
            content = `
            <ul class="card_cont">
                ${data.map(item => `
                    <li class="name">${item.diagnosis}</li>
                `).join('')}
            </ul>
            `;
        } else {
            cont.remove();
        }

        cont.innerHTML = `
            <h3>Preliminary Diagnosis</h3>
            <p>The following is the preliminary diagnosis for the patient. This diagnosis is based on the information provided by the patient and the doctor.</p>
            ${content}
        `;
    }

    render_final_diagnosis(data) {
        var cont = this.main_container.querySelector('.final_diagnosis_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'final_diagnosis_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        let content = '';
        if (Array.isArray(data) && data.length > 0) {
            content = `
            <ul class="card_cont">
                ${data.map(item => `
                    <li class="name">${item.diagnosis}</li>
                `).join('')}
            </ul>
            `;
        } else {
            cont.remove();
        }

        cont.innerHTML = `
            <h3>Final Diagnosis</h3>
            <p>The following is the final diagnosis for the patient. This diagnosis is based on the information provided by the patient and the doctor.</p>
            ${content}
        `;
    }

    render_lab_results(data) {
        if (!Array.isArray(data) || data.length === 0) return;

        var cont = this.main_container.querySelector('.lab_report_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'lab_report_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        this.lab_data = data;

        cont.innerHTML = `
            <h3>Laboratory Report</h3>
            <p class="sub_text">The following is the laboratory report for the patient. This report is based on the information provided by the patient and the doctor.</p>
            ${data.map(test => test.status === 'complete' ? `
                <div class="card">
                    <div class="lab_card_top">
                        <p class="name">${test.lab_test_name}</p>
                        <p class="date">${date_formatter(test.created_at)}</p>
                    </div>
                    <div class="lab_card_bottom">
                        ${test.status === 'complete' && test.lab_test_items.length > 0 ? `
                            <div class="t_head tr">
                                <p class="column">Test</p>
                                <p class="column">Result</p>
                                <p class="column">Normal Range</p>
                            </div>
                            ${test.lab_test_items.map(item => `
                                <div class="t_body tr">
                                    <p class="column">${item.name}</p>
                                    <p class="column">${item.result || ''} ${item.unit || ''}</p>
                                    <p class="column">${item.normal_range || ''}</p>
                                </div>
                            `).join('')}
                            <div class="result_info">
                                <p class="served_by">Served by: ${test.served_by}</p>
                                <p class="served_at">Completed: ${test.served_at ? date_formatter(test.served_at) : ''}</p>
                            </div>
                        ` : `
                            <div class="status_info">
                                <p class="status ${test.status}">${test.status.toUpperCase()}</p>
                                <p class="ordered_by">Ordered by: ${test.created_by}</p>
                            </div>
                        `}
                    </div>
                </div>
            ` : ``).join('')}
        `;
    }

    render_radiology_results(data) {
        if (!Array.isArray(data) || data.length === 0) return;

        var cont = this.main_container.querySelector('.radiology_report_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'radiology_report_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        this.radiology_data = data;

        cont.innerHTML = `
        <h3>Radiology Report</h3>
        <p class="sub_text">The following is the radiology report for the patient. This report is based on the information provided by the patient and the doctor.</p>
        ${data.map(exam => exam.status === 'complete' ? `
            <div class="card page_breaker">
                <div class="rad_card_top">
                    <p class="name">${exam.radiology_name}</p>
                    <p class="date">${date_formatter(exam.created_at)}</p>
                </div>
                <div class="rad_card_bottom">
                    ${exam.report ? `
                        <div class="group">
                            <p class="head">Comparison</p>
                            <p class="value">${exam.report.comparison || ''}</p>
                        </div>
                        <div class="group">
                            <p class="head">Findings</p>
                            <p class="value">${exam.report.findings || ''}</p>
                        </div>
                        <div class="group">
                            <p class="head">Impression</p>
                            <p class="value">${exam.report.impression || ''}</p>
                        </div>
                        <div class="group">
                            <p class="head">Recommendation</p>
                            <p class="value">${exam.report.recommendation || ''}</p>
                        </div>
                        ` : `
                        <div class="no_report_group">
                            <p class="no_report">No report found, only attachments are available.</p>
                        </div>`}
                    <div class="result_info">
                        <p class="status ${exam.status}">${exam.status.toUpperCase()}</p>
                        <p class="ordered_by">Ordered by: ${exam.created_by}</p>
                    </div>
                </div>
            </div>
        ` : ``).join('')}
    `;
    }


    // {
    //     "success": true,
    //     "attachments_data": [
    //         {
    //             "id": 4,
    //             "file_name": "attach-6836e1c748d1a3.92723608.jpg",
    //             "type": "CT Scan",
    //             "note": "hr",
    //             "created_by": "Faiz Ally",
    //             "created_at": "2025-05-28 13:13:27",
    //             "url": "/attachments/attach-6836e1c748d1a3.92723608.jpg"
    //         },
    //     ]
    // }

    render_patient_notes(data) {
        var cont = this.main_container.querySelector('.patient_notes_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'patient_notes_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        cont.innerHTML = `
            <div class="notes_section">
                <h3>Patient Notes</h3>
                <div class="card_cont">
                    ${data.map(note => `
        <div class="card">
                            <div class="note_top">
                                <p class="date">${date_formatter(note.created_at)}</p>
                                <p class="doctor">${note.created_by}</p>
            </div>
                            <p class="note">${note.note}</p>
                </div>
                    `).join('')}
                </div>
                </div>
        `;
    }

    render_allergies(data) {
        var cont = this.main_container.querySelector('.allergies_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'allergies_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        cont.innerHTML = `
            <div class="allergies_section">
                <h3>Allergies</h3>
                <div class="card_cont">
                    ${data.map(allergy => `
        <div class="card">
                            <div class="allergy_top">
                                <p class="type">${allergy.allergy_type}</p>
                                <p class="severity ${allergy.allergy_severity.toLowerCase()}">${allergy.allergy_severity}</p>
            </div>
                            <div class="allergy_details">
                                <p><strong>Specific:</strong> ${allergy.allergy_specific}</p>
                                <p><strong>Reaction:</strong> ${allergy.allergy_reaction}</p>
                                <p><strong>Condition:</strong> ${allergy.allergy_condition}</p>
                </div>
                            <div class="allergy_footer">
                                <p class="created_by">${allergy.created_by}</p>
                                <p class="date">${date_formatter(allergy.created_at)}</p>
                </div>
                </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    render_vaccines(data) {
        var cont = this.main_container.querySelector('.vaccines_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'vaccines_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        cont.innerHTML = `
            <div class="vaccines_section">
                <h3>Vaccines</h3>
                <div class="card_cont">
                    ${data.map(vaccine => `
        <div class="card">
                            <div class="vaccine_top">
                                <p class="name">${vaccine.vaccine_name}</p>
                                <p class="date">${vaccine.given_date}</p>
            </div>
                            <p class="note">${vaccine.note}</p>
                            <p class="created_by">${vaccine.created_by}</p>
                </div>
                    `).join('')}
                </div>
                </div>
        `;
    }

    render_implants(data) {
        var cont = this.main_container.querySelector('.implants_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'implants_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        cont.innerHTML = `
            <div class="implants_section">
                <h3>Implantable Devices</h3>
                <p>The following implants were inserted into the patient's body.</p>
                <div class="card_cont">
                    ${data.map(device => `
                    <div class="card">
                        <div class="device_top">
                            <p class="name">${device.device_name}</p>
                            <p class="implanted_date">Implanted: ${date_formatter(device.implanted_date)}</p>
                            <p class="identifier">Identifier: ${device.identifier ? device.identifier : 'N/A'}</p>
                            <p class="note_title">Note</p>
                            <p class="note">${device.note}</p>
                        </div>
                    </div>
                    `).join('')}
                </div>
                </div>
        `;
    }

    render_procedures(data) {
        var cont = this.main_container.querySelector('.procedures_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'procedures_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        cont.innerHTML = `
            <h3>Procedures</h3>
            <div class="card_cont">
                ${data.map(procedure => `
            <div class="card">
                <div class="medication_card_top">
                            <p class="name">${procedure.procedure_name}</p>
                            <p class="date">${procedure.procedure_date}</p>
                </div>
                <div class="card_bottom">
                    <div class="group">
                                <p class="head">Leading Surgeon:</p>
                                <p class="value">${procedure.surgeon}</p>
                    </div>
                    <div class="group">
                                <p class="head">Anesthesiologist:</p>    
                                <p class="value">${procedure.anesthesiologist}</p>
                    </div>
                            <div class="group assistant_group">
                                <p class="head">Assistant</p>
                                <div class="pill_cont">
                                    ${procedure.assistance.map(assistant => `
                                        <p class="pill">${assistant}</p>
                                    `).join('')}
                    </div>
                </div>
            </div>
                </div>
                `).join('')}
                    </div>
        `;
    }

    render_prescriptions(data) {
        var cont = this.main_container.querySelector('.prescription_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'prescription_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        cont.innerHTML = `
            <h3>Prescription</h3>
            <p class="sub_text">The following is the prescription for the patient. This prescription is based on the information provided by the patient and the doctor.</p>
            <div class="card_cont">
                ${data.map(prescription => `
            <div class="card">
                <div class="medication_card_top">
                    <p class="name">${prescription.product_name}</p>
                    <p class="date">${date_formatter(prescription.created_at)}</p>
                </div>
                <div class="card_bottom">
                    <div class="group">
                        <p class="head">Quantity:</p>
                        <p class="value">${prescription.amount} ${prescription.unit}</p>
                    </div>
                    <div class="group">
                        <p class="head">Duration:</p>    
                        <p class="value">${prescription.duration} days</p>
                    </div>
                    <div class="group">
                        <p class="head">Is Given:</p>    
                        <p class="value ${prescription.is_given == 'true' ? 'success' : 'error'}">${prescription.is_given == 'true' ? 'Yes' : 'No'}</p>
                    </div>
                    <div class="group instruction_group">
                        <p class="head">Instruction:</p>    
                                <p class="value">${prescription.instruction}</p>
                    </div>
                </div>
            </div>
                `).join('')}
        </div>
        `;
    }

    async add_images_to_attachments(data, type) {
        data.forEach(async attachment_report => {
            attachment_report.report_attachment.forEach(async attachment => {
                console.log("attachment", attachment);
                if (type === 'radiology') {
                    // prepare the array of images
                    const attachment_prepare = {
                        "id": attachment.id,
                        "file_name": attachment.file_name,
                        "type": attachment_report.radiology_name,
                        "note": "No note provided.",
                        "created_by": attachment.created_by,
                        "created_at": attachment.created_at,
                        "url": attachment.url
                    };

                    // update visit data attachments_data by add the images from radiology
                    await this.visit_data.attachments_data.attachments_data.push(attachment_prepare);
                }
            });
        });

        return '';
    }


    async render_attachments(data) {
        console.log("render_attachments");
        console.log("radiology data", this.radiology_data);
        console.log("lab data", this.lab_data);

        var cont = this.main_container.querySelector('.attachments_cont');
        if (!cont) {
            cont = document.createElement('div');
            cont.className = 'attachments_cont page_breaker';
            this.main_container.appendChild(cont);
        }

        // add images to attachments data
        if (this.radiology_data != null) {
            await this.add_images_to_attachments(this.radiology_data, 'radiology');
        }
        if (this.lab_data != null) {
            await this.add_images_to_attachments(this.lab_data, 'laboratory');
        }

        cont.innerHTML = `
            <div class="attachments_section">
                <h3>Attachments</h3>
                <div class="attachments_grid">
                    ${data.map((attachment) => `
                        <div class="attachment_card page_breaker">
                            <div class="attachment_info">
                                <div class="attachment_top">
                                    <div class="left_info">
                                        <p class="type">${attachment.type}</p>
                                        <p class="date">${date_formatter(attachment.created_at)}</p>
                                    </div>
                                </div>
                                <p class="note">${attachment.note ? attachment.note : 'No note provided.'}</p>
                            </div>
                            <div class="attachment_preview">
                                <img src="${attachment.url}" alt="${attachment.file_name}">
                            </div>    
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async fetchData(type = 'visit_detail') {
        try {
            if (!this.visit_id) {
                throw new Error('Visit ID is not set');
            }


            const response = await fetch(this.fetch_map[type], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Handle unauthorized access
                    await this.handleUnauthorized();
                    return null;
                }
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch visit data');
            }

            return result.data;

        } catch (error) {
            console.error('Error fetching data:', error);
            notify('top_left', error.message || 'Failed to fetch visit data', 'error');
            return null;
        }
    }

    async handleUnauthorized() {
        try {
            // Fade out the body
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '0';

            // Wait for fade out animation
            await new Promise(resolve => setTimeout(resolve, 500));

            // Navigate to login
            frontRouter.navigate('/login');

            // Fade back in
            document.body.style.opacity = '1';

        } catch (error) {
            console.error('Error handling unauthorized access:', error);
            // Force navigation to login as fallback
            frontRouter.navigate('/login');
        }
    }

    async fetch_laboratory_request(visit_id) {
        try {
            const response = await fetch('/api/laboratory/get_laboratory_test_order_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: visit_id,
                }),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            if (result.status === 401) {
                await this.handleUnauthorized();
                return null;
            }

            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return null;
            }

            return result.data;
        } catch (error) {
            console.error('Error fetching laboratory data:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    async fetch_radiology_request(visit_id) {
        try {
            const response = await fetch('/api/patient/get_radiology_test_order_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: visit_id,
                }),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            if (result.status === 401) {
                await this.handleUnauthorized();
                return null;
            }

            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return null;
            }

            return result.data;
        } catch (error) {
            console.error('Error fetching radiology data:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    style() {
        return `
             /* ------------------------------------------------------- */


        .single_visit_history_cont {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            overflow: scroll;
            position: relative;

            .print_btn {
                position: fixed;
                bottom: 30px;
                right: 20px;
                z-index: 100;
                display: flex;
                align-items: center;
                gap: 10px;

                .settings_btn{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: var(--light_pri_color);
                    border-radius: 5px;
                    cursor: pointer;
                    padding: 10px;
                    
                    span{
                        color: var(--white);
                        font-size: 17px;
                    }
                    
                }

                .print_btn_btn {
                    padding: 10px 20px;
                    cursor: pointer;
                    border: none;
                    background-color: var(--light_pri_color);
                    color: var(--white);
                    font-weight: bold;
                    border-radius: 5px;
                }
            }

            .loader_cont {
                border-radius: var(--main_border_r);
                position: absolute;
            }

            

            .clinic_plan_cont {
                width: 100%;
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 20px;
                /* display: none; */

                .clinical_evaluation_cont {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--pure_white_background);
                    gap: 20px;
                    padding: 20px;
                    border-radius: 10px;

                    .card {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;

                        .top_eval_card {

                            /* display: flex; */
                            /* flex-direction: column; */
                            /* gap: 10px; */
                            .date {
                                font-size: 20px;
                                font-weight: 900;
                            }

                            .doctor {
                                font-size: 14px;
                                /* font-weight: 500; */
                            }
                        }

                        .group {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;

                            .head {
                                font-size: 16px;
                                font-weight: 700;
                                padding-bottom: 10px;
                                color: var(--light_pri_color);
                                border-bottom: solid 1px var(--active_color);
                            }

                            .value {
                                font-size: 14px;
                                font-weight: 500;
                            }



                        }

                    }
                }

                .plan_for_next_visit_cont {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--pure_white_background);
                    gap: 20px;
                    padding: 20px;
                    border-radius: 10px;

                    .card {
                        width: 100%;
                        display: flex;
                        flex-direction: column;

                        .top_plan_card {

                            .date {
                                font-size: 20px;
                                font-weight: 900;
                            }

                            .doctor {
                                font-size: 14px;
                                /* font-weight: 500; */
                            }
                        }

                        .group {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;

                            .head {
                                font-size: 16px;
                                font-weight: 700;
                                padding-bottom: 10px;
                                color: var(--light_pri_color);
                                border-bottom: solid 1px var(--active_color);
                            }

                            .value {
                                font-size: 14px;
                                font-weight: 500;
                            }



                        }

                    }
                }
            }

            .pre_final_diagnosis {
                width: 100%;
                display: grid;
                /* display: none; */
                grid-template-columns: 1fr 1fr;
                gap: 20px;

                .diagnosis_cont {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--pure_white_background);
                    gap: 20px;
                    padding: 20px;
                    border-radius: 10px;

                    .card_cont {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;

                        .card {
                            padding: 10px;
                            border-radius: 10px;
                            border: solid 1px var(--active_color);
                            display: flex;
                            align-items: center;
                            gap: 10px;

                            .icon_card {
                                width: 30px;
                                height: 30px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border-radius: var(--btn_border_r);
                                background-color: var(--pri_op);


                                span {
                                    font-size: 17px;
                                    color: var(--light_pri_color);
                                }
                            }

                            .name {
                                font-size: 16px;
                                font-weight: 500;
                            }
                        }
                    }

                }
            }

            

            .prescription_cont {
                width: 100%;
                display: flex;
                flex-direction: column;
                background-color: var(--pure_white_background);
                gap: 20px;
                padding: 20px;
                border-radius: 10px;
                /* display: none; */

                .card_cont {
                    width: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;

                    .card {
                        padding: 10px;
                        border-radius: 10px;
                        border: solid 1px var(--active_color);
                        display: flex;
                        flex-direction: column;
                        gap: 10px;

                        .medication_card_top {
                            display: flex;
                            flex-direction: column;

                            .name {
                                font-size: 20px;
                                font-weight: 700;
                            }

                        }

                        .card_bottom {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;

                            .group {
                                display: flex;
                                gap: 5px;
                                padding-block: 5px;
                                border-bottom: solid 1px var(--input_border);

                                .head {
                                    width: 40%;
                                }

                                .value {
                                    font-weight: 700;
                                }

                            }

                            .instruction_group {
                                gap: 0;
                                flex-direction: column;
                                border: none;

                                .head {
                                    font-weight: 700;

                                }

                                .value {
                                    font-weight: normal;

                                }
                            }
                        }
                    }

                }

            }

            .procedures_cont {
                width: 100%;
                display: flex;
                flex-direction: column;
                background-color: var(--pure_white_background);
                gap: 20px;
                padding: 20px;
                border-radius: 10px;

                .card_cont {
                    width: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;

                    .card {
                        padding: 10px;
                        border-radius: 10px;
                        border: solid 1px var(--active_color);
                        display: flex;
                        flex-direction: column;
                        gap: 10px;

                        .medication_card_top {
                            display: flex;
                            flex-direction: column;

                            .name {
                                font-size: 20px;
                                font-weight: 700;
                            }

                        }

                        .card_bottom {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;

                            .group {
                                display: flex;
                                gap: 5px;
                                padding-block: 5px;
                                border-bottom: solid 1px var(--input_border);

                                .head {
                                    width: 40%;
                                }

                                .value {
                                    font-weight: 700;
                                }

                            }

                            .assistant_group {
                                gap: 0;
                                flex-direction: column;
                                border: none;

                                .head {
                                    font-weight: 700;

                                }

                                .pill_cont {
                                    display: flex;
                                    flex-wrap: wrap;
                                    gap: 5px;

                                    .pill {
                                        padding: 5px 10px;
                                        border-radius: 5px;
                                        background-color: var(--pri_op);
                                        /* color: var(--light_pri_color); */
                                    }


                                }

                            }
                        }
                    }

                }

            }

            .patient_notes_cont,
            .allergies_cont,
            .vaccines_cont,
            .implants_cont,
            .attachments_cont {
                width: 100%;
                display: flex;
                flex-direction: column;
                background-color: var(--pure_white_background);
                gap: 20px;
                padding: 20px;
                border-radius: 10px;
                
                .card_cont {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    
                    .card {
                        padding: 15px;
                        border-radius: 10px;
                        border: solid 1px var(--active_color);
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                }
            }
            
            .severity {
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 500;
                
                &.mild { background-color: #e3f2fd; color: #1976d2; }
                &.moderate { background-color: #fff3e0; color: #f57c00; }
                &.severe { background-color: #ffebee; color: #d32f2f; }
            }
            
            .attachment_preview {
                width: 100%;
                overflow: hidden;
                border-radius: 8px;
                
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
        }

        .visit_detail_cont {
            width: 100%;
            background-color: var(--pure_white_background);
            padding: 20px;
            border-radius: 10px;

            .visit_detail_section {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .card {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;

                .response {
                    width: 32%;
                    min-width: 300px;
                    font-size: 14px;
                    font-weight: 500;
                    .response_text{
                        font-weight: 700;
                        text-transform: capitalize;
                        text-decoration: underline;
                        /* change underline to dots */
                        text-decoration-style: dotted;
                    }
                }

                .right_info {
                    display: flex;
                    gap: 10px;

                    p {
                        padding: 5px 10px;
                        border-radius: 5px;
                        font-weight: 500;
                    }
                }
            }
        }

        .page_break {
            page-break-before: always;
        }

        .attachments_cont {
            width: 100%;
            background-color: var(--pure_white_background);
            padding: 20px;
            border-radius: 10px;

            .attachments_grid {
                display: flex;
                flex-direction: column;
                gap: 30px;
            }

            .attachment_card {
                break-inside: avoid;
                page-break-inside: avoid;
                padding: 20px;
                border-radius: 10px;
                border: solid 1px var(--active_color);

                .attachment_info {
                    margin-bottom: 15px;
                }

                .attachment_top {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;

                    .type {
                        font-weight: 700;
                    }
                }

                .note {
                    margin-bottom: 10px;
                }

                .created_by {
                    color: var(--text_color_op);
                    font-size: 14px;
                }

                .attachment_preview {
                    width: 100%;
                    max-height: none;
                    border-radius: 8px;
                    overflow: hidden;

                    img {
                        width: 100%;
                        height: auto;
                        object-fit: contain;
                    }
                }
            }
        }

        
        `
    }

}

