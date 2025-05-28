import { dashboardController } from "../controller/DashboardController.js";
import { visit_priority, visit_type } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, date_formatter, notify, print_div } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SingleVisitHistoryView {
    constructor() {
        this.visit_id = null;
        this.patient_name = null;
        applyStyle(this.style())
        this.rendered_cards = new Set();


        this.card_to_show = [
            {
                title: 'Visit Details',
                cardName: 'visit_detail',
                class_name: 'visit_detail_cont',
                render_in_view: true,
            },
            {
                title: 'Clinic Evaluation & Visit Plan',
                cardName: 'clinic_plan_cont',
                class_name: 'section_cont clinic_plan_cont',
                render_in_view: true,
            },
            {
                title: 'Clinic Evaluation',
                cardName: 'clinic_evaluation',
                class_name: 'clinical_evaluation_cont',
                render_in_view: false,
            },
            {
                title: 'Preliminary Diagnosis',
                cardName: 'pre_final_diagnosis',
                class_name: 'pre_final_diagnosis',
                render_in_view: true,
            },
            {
                title: 'Visit Plan',
                cardName: 'visit_plan',
                class_name: 'plan_for_next_visit_cont',
                render_in_view: false,
            },
            {
                title: 'Pre-Diagnosis',
                cardName: 'pre_diagnosis',
                class_name: 'pre_diagnosis_cont',
                render_in_view: false,
            },
            {
                title: 'Final Diagnosis',
                cardName: 'final_diagnosis',
                class_name: 'final_diagnosis_cont',
                render_in_view: false,
            },
            {
                title: 'Patient Notes',
                cardName: 'patient_notes',
                class_name: 'patient_notes_cont',
                render_in_view: true,
            },
            {
                title: 'Allergies',
                cardName: 'allergies',
                class_name: 'allergies_cont',
                render_in_view: true,
            },
            {
                title: 'Vaccines',
                cardName: 'vaccines',
                class_name: 'vaccines_cont',
                render_in_view: true,
            },
            {
                title: 'Implants',
                cardName: 'implants',
                class_name: 'implants_cont',
                render_in_view: true,
            },
            {
                title: 'Procedures',
                cardName: 'procedures',
                class_name: 'procedures_cont',
                render_in_view: true,
            },
            {
                title: 'Prescriptions',
                cardName: 'prescriptions',
                class_name: 'prescriptions_cont',
                render_in_view: true,
            },
            {
                title: 'Attachments',
                cardName: 'attachments',
                class_name: 'attachments_cont',
                render_in_view: true,
            },
            {
                title: 'Lab Results',
                cardName: 'lab_results',
                class_name: 'lab_results_cont',
                render_in_view: false,
            }
        ];
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.rendered_cards = new Set();

        this.visit_id = params.id;


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('', 'active');
        this.main_container = document.querySelector('.single_visit_history_cont');

        dashboardController.patientDetailComponent.PreRender({
            container: this.main_container,
            visit_id: this.visit_id,
            location: 'patient_history',
        })


        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
        // const cont = document.querySelector('.update_cont');
        const visit_data = await this.fetchData(); // Wait for fetchData to complete

        console.log("history data", visit_data);

        const cardRenderConfig = [
            {
                method: this.render_visit_detail,
                dataKey: 'visit_detail',
                dataArray: 'visit_data',
                cardName: 'visit_detail'
            },
            {
                method: this.render_clinic_evaluation,
                dataKey: 'clinical_evaluation_data',
                dataArray: 'evaluation_data',
                cardName: 'clinic_evaluation'
            },
            {
                method: this.render_visit_plan,
                dataKey: 'plan_visit_data',
                dataArray: 'plan_data',
                cardName: 'visit_plan'
            },
            {
                method: this.render_pre_diagnosis,
                dataKey: 'pre_diagnosis_data',
                dataArray: 'diagnosis_data',
                cardName: 'pre_diagnosis'
            },
            {
                method: this.render_final_diagnosis,
                dataKey: 'final_diagnosis_data',
                dataArray: 'diagnosis_data',
                cardName: 'final_diagnosis'
            },
            {
                method: this.render_patient_notes,
                dataKey: 'patient_note',
                dataArray: 'note_data',
                condition: (data) => data.success && data.note_data.length > 0,
                cardName: 'patient_notes'
            },
            {
                method: this.render_allergies,
                dataKey: 'allergy_data',
                dataArray: 'allergy_data',
                condition: (data) => data.success && data.allergy_data.length > 0,
                cardName: 'allergies'
            },
            {
                method: this.render_vaccines,
                dataKey: 'vaccine_data',
                dataArray: 'vaccine_data',
                condition: (data) => data.success && data.vaccine_data.length > 0,
                cardName: 'vaccines'
            },
            {
                method: this.render_implants,
                dataKey: 'implantable_device_data',
                dataArray: 'devices_data',
                condition: (data) => data.success && data.devices_data.length > 0,
                cardName: 'implants'
            },
            {
                method: this.render_procedures,
                dataKey: 'procedure_data',
                dataArray: 'procedure_data',
                condition: (data) => data.success && data.procedure_data.length > 0,
                cardName: 'procedures'
            },
            {
                method: this.render_prescriptions,
                dataKey: 'prescription_data',
                dataArray: 'prescription_data',
                condition: (data) => data.success && data.prescription_data.length > 0,
                cardName: 'prescriptions'
            },
            {
                method: this.render_attachments,
                dataKey: 'attachments_data',
                dataArray: 'attachments_data',
                condition: (data) => data.success && data.attachments_data.length > 0,
                cardName: 'attachments'
            },
        ];

        await cardRenderConfig.forEach(async (config) => {
            if (config.condition && !config.condition(visit_data[config.dataKey])) return;
            var data = visit_data[config.dataKey];

            config.method.call(this, // Use .call(this, ...) to ensure 'this' context
                config.dataArray ? data[config.dataArray] : undefined,
            );

            this.rendered_cards.add(config.cardName);

            if (config.afterRender) config.afterRender();
        });

        console.log("rendered cards", this.rendered_cards);
        this.render_settings_popup();

        this.attach_listeners();
    }

    ViewReturn(data, loader = '') {
        return `
            <div class="single_visit_history_cont">
                <div class="print_btn">
                    <div class="settings_btn">
                        <span class='switch_icon_settings1'></span>
                    </div>
                    <button type="button" class="print_btn_btn">Print Report</button>
                </div>
                ${this.card_to_show.map(card => card.render_in_view ? `<div class="${card.class_name}"></div>` : '').join('')}
            </div>
        `;
    }

    attach_listeners() {
        // Disable Ctrl+P
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.print_document();

            }
        });

        const print_btn = this.main_container.querySelector('.print_btn_btn');
        if (print_btn) {
            print_btn.addEventListener('click', () => {
                this.print_document();
            });
        }

        const settings_btn = this.main_container.querySelector('.settings_btn');
        if (settings_btn) {
            settings_btn.addEventListener('click', () => {
                this.open_render_settings_popup();
            });
        }
    }

    async print_document() {

        // Add print styles
        var style = document.createElement('style');
        style.id = 'print_style';
        style.innerHTML = this.report_style();
        document.head.appendChild(style);

        // Get body class list
        var body_class = document.body.classList.value;
        // Clean body class list
        document.body.classList.value = '';
        // Add print class to body
        document.body.classList.add('light_mode');

        // Close popup
        this.close_render_settings_popup();

        // Print
        window.print();

        // Restore everything
        document.head.removeChild(style);
        body_class.split(' ').forEach(cls => {
            if (cls) document.body.classList.add(cls);
        });

        // Show all sections again
        section_checkboxes.forEach(checkbox => {
            const section = document.querySelector(`.${checkbox.dataset.section}`);
            if (section) {
                section.style.display = '';
            }
        });
    }

    async render_settings_popup() {
        let popup = document.querySelector('.wrapper .popup');

        // Create popup if it doesn't exist
        if (!popup) {
            console.log('in popup');

            this.create_popup();
            popup = document.querySelector('.wrapper .popup');
        }
        popup.innerHTML = "";

        // Prepare popup content
        const content = `
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
                            <div class="sections_list">

                            </div>
                            <div class="print_actions">
                                <button class="print_now_btn">Print Now</button>
                            </div>
                        </div>
                    </div>
                `;

        popup.innerHTML = content;


        // close the popup
        popup.querySelector('.close_print_sections').addEventListener('click', () => {
            this.close_render_settings_popup();
        });

        // select all action 
        popup.querySelector('.select_all_action').addEventListener('click', (e) => {
            // get data action
            var action = e.target.getAttribute('data_action');
            console.log(action);

            if (action == "hide") {
                console.log('hapa hide');
                e.target.innerHTML = "Show All";
                e.target.setAttribute('data_action', 'show')
                this.rendered_cards.forEach(async (card_name) => {
                    var card_info = this.card_to_show.find(card => card.cardName === card_name);
                    // hide the card
                    this.main_container.querySelector(`.${card_info.class_name}`).classList.add('display_hidden');
                })
                this.render_on_print_options_item(popup, 'hide')
            } else {
                console.log('hapa show');

                e.target.innerHTML = "Hide All";
                e.target.setAttribute('data_action', 'hide')
                this.rendered_cards.forEach(async (card_name) => {
                    var card_info = this.card_to_show.find(card => card.cardName === card_name);

                    // hide the card
                    this.main_container.querySelector(`.${card_info.class_name}`).classList.remove('display_hidden');
                })
                this.render_on_print_options_item(popup, 'show')
            }
        })

        // render selection options
        this.render_on_print_options_item(popup)


        // Add event listeners for the new content
        const select_all = popup.querySelector('.select_all_checkbox');
        const section_checkboxes = popup.querySelectorAll('.sections_list input[type="checkbox"]');
        const print_now_btn = popup.querySelector('.print_now_btn');

        if (select_all) {
            select_all.addEventListener('change', (e) => {
                section_checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }

        if (section_checkboxes) {
            section_checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const all_checked = Array.from(section_checkboxes).every(cb => cb.checked);
                    select_all.checked = all_checked;
                });
            });
        }

        if (print_now_btn) {
            print_now_btn.addEventListener('click', async () => {
                this.print_document();
            });
        }

    }

    open_render_settings_popup() {
        let popup = document.querySelector('.wrapper .popup');
        popup.classList.add('active');
    }

    close_render_settings_popup() {
        var popup = document.querySelector('.wrapper .popup');
        popup.classList.remove('active');
    }


    render_on_print_options_item(popup, state = 'show') {
        const sections_list = popup.querySelector('.sections_list');
        sections_list.innerHTML = '';
        this.rendered_cards.forEach(async (card_name) => {
            const option = document.createElement('div');
            option.className = 'checkbox_container';
            option.setAttribute('is-checked', true);

            var card_info = this.card_to_show.find(card => card.cardName === card_name);
            // console.log("card info", card_info);

            var title = card_info.title;

            var icon_map = {
                show: 'switch_icon_eye',
                hide: 'switch_icon_eye_slash',
            }



            option.innerHTML = `<p class="label">${title}</p><span class='${icon_map[state]}'></span>`;
            sections_list.appendChild(option);

            option.addEventListener('click', () => {
                // get attribute is-checked
                var is_checked = option.getAttribute('is-checked');

                if (is_checked === 'true') {
                    option.setAttribute('is-checked', false);
                    option.querySelector('span').classList.replace('switch_icon_eye', 'switch_icon_eye_slash');

                    // hide the card
                    this.main_container.querySelector(`.${card_info.class_name}`).classList.add('display_hidden');

                } else {
                    option.setAttribute('is-checked', true);
                    option.querySelector('span').classList.replace('switch_icon_eye_slash', 'switch_icon_eye');
                    // show the card
                    this.main_container.querySelector(`.${card_info.class_name}`).classList.remove('display_hidden');
                }
            });

        });
    }

    create_popup() {
        let popup = document.querySelector('.wrapper .popup');

        if (!popup) {
            popup = document.createElement('div');
            popup.className = 'popup';
            const popup_content = document.createElement('div');
            popup_content.className = 'popup_content';
            popup.appendChild(popup_content);
            document.querySelector(".wrapper").appendChild(popup);
        }

    }


    render_clinic_evaluation(data) {
        var cont = this.main_container.querySelector('.clinic_plan_cont'); // Added missing dot for class selector

        if (!cont) return;

        // Format date
        const date = data.created_at ? date_formatter(data.created_at) : '';

        // Helper to render a group if value exists
        const renderGroup = (label, value) => value ? `
            <div class="group">
                <p class="head">${label}</p>
                <p class="value">${value}</p>
            </div>
        ` : '';

        cont.innerHTML = `
        <div class="clinical_evaluation_cont">
            <h3>Clinical Evaluation</h3>
            <div class="card">
                <div class="top_eval_card">
                    <p class="date">${date}</p>
                    <p class="doctor">${data.created_by || ''}</p>
                </div>
                ${renderGroup('Chief Complaint', data.chief_complaints)}
                ${renderGroup('History of Present Illness', data.history_of_present_illness)}
                ${renderGroup('Review of Systems', data.review_of_systems)}
                ${renderGroup('General Examination', data.general_exam)}
                ${renderGroup('Systemic Examination', data.systemic_exam)}
            </div>
        </div>
        `;
    }

    render_visit_plan(data) {

        var cont = this.main_container.querySelector('.clinic_plan_cont');

        if (!cont) return;

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
        <div class="plan_for_next_visit_cont">
            <h3>Plan for Next Visit</h3>
            <div class="card">
                <div class="top_plan_card">
                    <p class="date">${date}</p>
                    <p class="doctor">${data.created_by || ''}</p>
                </div>
                ${renderGroup('Purpose of Visit', data.purpose)}
                ${renderGroup('Instructions', data.instruction)}
            </div>
        </div>
        `;

        cont.innerHTML += view; // Use innerHTML += to append HTML string

    }

    render_pre_diagnosis(data) {
        var cont = this.main_container.querySelector('.pre_final_diagnosis');

        if (!cont) return;

        let content = '';

        if (Array.isArray(data) && data.length > 0) {
            content = `
                <div class="card_cont">
                    ${data.map(item => `
                        <div class="card">
                            <div class="icon_card">
                                <span class="switch_icon_accessibility"></span>
                            </div>
                            <p class="name">${item.diagnosis}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            content = `
                <div class="no_diagnosis_msg">
                    No preliminary diagnosis added
                </div>
            `;
        }

        cont.innerHTML = `
            <div class="diagnosis_cont pre_diagnosis_cont">
                <h3>Preliminary Diagnosis</h3>
                ${content}
            </div>
        `;
    }

    render_final_diagnosis(data) {
        var cont = this.main_container.querySelector('.pre_final_diagnosis');
        if (!cont) return;

        let content = '';
        if (Array.isArray(data) && data.length > 0) {
            content = `
            <div class="card_cont">
                    ${data.map(item => `
                <div class="card">
                    <div class="icon_card">
                        <span class="switch_icon_accessibility"></span>
                    </div>
                            <p class="name">${item.diagnosis}</p>
                </div>
                    `).join('')}
            </div>
            `;
        } else {
            content = `
                <div class="no_diagnosis_msg">
                    No final diagnosis added
        </div>
            `;
        }

        cont.innerHTML += `
            <div class="diagnosis_cont final_diagnosis_cont">
                <h3>Final Diagnosis</h3>
                ${content}
            </div>
        `;
    }

    render_patient_notes(data) {
        var cont = this.main_container.querySelector('.patient_notes_cont');
        if (!cont) return;

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
        if (!cont) return;

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
        if (!cont) return;

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
        if (!cont) return;

        cont.innerHTML = `
            <div class="implants_section">
                <h3>Implantable Devices</h3>
                <div class="card_cont">
                    ${data.map(device => `
        <div class="card">
                            <div class="device_top">
                                <p class="name">${device.device_name}</p>
                                <p class="identifier">${device.identifier}</p>
            </div>
                            <p class="note">${device.note}</p>
                            <div class="device_footer">
                                <p class="implanted_date">Implanted: ${device.implanted_date}</p>
                                <p class="created_by">${device.created_by}</p>
                </div>
                </div>
                    `).join('')}
                </div>
                </div>
        `;
    }

    render_procedures(data) {
        var cont = this.main_container.querySelector('.procedures_cont');
        if (!cont) return;

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
        if (!cont) return;

        cont.innerHTML = `
            <h3>Prescription</h3>
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

    render_attachments(data) {
        var cont = this.main_container.querySelector('.attachments_cont');
        if (!cont) return;

        cont.classList.add('page_break');

        cont.innerHTML = `
            <div class="attachments_section">
                <h3>Attachments</h3>
                <div class="attachments_grid">
                    ${data.map((attachment, index) => `
                        <div class="attachment_card">
                            <div class="attachment_info">
                                <div class="attachment_top">
                                    <div class="left_info">
                                        <p class="type">${attachment.type}</p>
                                        <p class="index">Attachment ${index + 1} of ${data.length}</p>
                </div>
                                    <p class="date">${date_formatter(attachment.created_at)}</p>
                    </div>
                                ${attachment.note ? `<p class="note">${attachment.note}</p>` : ''}
                                <p class="created_by">Added by: ${attachment.created_by}</p>
                    </div>
                            <div class="attachment_preview">
                                <img src="${attachment.url}" alt="${attachment.file_name}" loading="lazy">
                        </div>    
                    </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    render_visit_detail(data) {
        var cont = this.main_container.querySelector('.visit_detail_cont');
        if (!cont) return;

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

    async fetchData() {
        try {
            const response = await fetch('/api/patient/single_visit_detail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
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



            if (result.success) {
                return result.data;
            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    report_style() {
        return `
        br-navigation{
            display: none;
        }
        .update_cont{
            height: fit-content !important;
            background: #f4f7f6 !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        .single_visit_history_cont{
            overflow: unset !important;
            padding: 0 !important;
            margin: 0 !important;
            
            .print_btn{
                display: none !important;
            }
        }

        /* General card print styles */


        .card_cont {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
        }

        /* Section specific print styles */
        .visit_detail_cont,
        .pre_final_diagnosis,
        .patient_notes_cont,
        .allergies_cont,
        .vaccines_cont,
        .implants_cont,
        .procedures_cont,
        .prescription_cont {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
        }

        /* Handle section breaks */
        .section_cont,
        .diagnosis_cont,
        .notes_section,
        .allergies_section,
        .vaccines_section,
        .implants_section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 20px !important;
        }

        /* Ensure headers stay with their content */
        h3 {
            break-after: avoid !important;
            page-break-after: avoid !important;
            margin-bottom: 15px !important;
        }
        
        .attachments_cont {
            page-break-before: always !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
            width: 100% !important;

            .attachments_section {
                padding: 0 !important;
                margin: 0 !important;
            }

            h3 {
                margin-bottom: 30px !important;
            }

            .attachments_grid {
                gap: 0 !important;
            }

            .attachment_card {
                page-break-after: always !important;
                break-after: page !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                background: none !important;
                width: 100% !important;

                &:last-child {
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                }

                .attachment_info {
                    margin-bottom: 20px !important;
                    padding: 0 20px !important;
                }

                .attachment_preview {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                    page-break-inside: avoid !important;
                    
                    img {
                        width: 100% !important;
                        height: auto !important;
                        max-height: none !important;
                        object-fit: contain !important;
                        page-break-inside: avoid !important;
                    }
                }
            }
        }

        @media print {
            /* Force page breaks between major sections */
            .clinic_plan_cont,
            .pre_final_diagnosis,
            .patient_notes_cont,
            .allergies_cont,
            .vaccines_cont,
            .implants_cont,
            .procedures_cont,
            .prescription_cont {
                break-before: auto !important;
                break-after: auto !important;
                page-break-before: auto !important;
                page-break-after: auto !important;
            }

            /* Ensure grid layout works in print */
            .card_cont {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 20px !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
            }

            /* Force cards to stay together */
            .card {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                margin-bottom: 20px !important;
                background-color: white !important;
            }

            /* Keep section headers with their content */
            h3 {
                break-after: avoid !important;
                page-break-after: avoid !important;
            }

            /* Ensure proper margins and spacing */
            @page {
                margin: 2cm !important;
                padding: 0 !important;
            }
        }
    `;
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

            .lab_report_cont {
                width: 100%;
                display: flex;
                /* display: none; */
                flex-direction: column;
                background-color: var(--pure_white_background);
                gap: 20px;
                padding: 20px;
                border-radius: 10px;

                .card {
                    padding: 10px;
                    border-radius: 10px;
                    border: solid 1px var(--active_color);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;

                    .lab_card_top {
                        .name {
                            font-size: 20px;
                            font-weight: 700;
                        }
                    }

                    .lab_card_bottom {
                        .tr {
                            display: grid;
                            grid-template-columns: 2fr 1fr 3.5fr;
                            gap: 10px;
                        }

                        .t_head {
                            padding-bottom: 10px;
                            border-bottom: solid 1px var(--active_color);

                            .column {
                                font-size: 14px;
                                font-weight: 700;
                            }
                        }

                        .t_body {
                            padding-block: 10px;
                            border-bottom: solid 1px var(--input_border);
                        }
                    }

                }

            }

            .radiology_report_cont {
                width: 100%;
                display: flex;
                /* display: none; */
                flex-direction: column;
                background-color: var(--pure_white_background);
                gap: 20px;
                padding: 20px;
                border-radius: 10px;

                .card {
                    padding: 10px;
                    border-radius: 10px;
                    border: solid 1px var(--active_color);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;

                    .rad_card_top {
                        .name {
                            font-size: 20px;
                            font-weight: 700;
                        }
                    }

                    .rad_card_bottom {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;

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

        @media print {
            .attachments_cont {
                .attachment_card {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
            }
        }
        
        .popup_content{
            width: 100%;
            height: 100%;
            position: relative;

            .print_sections {
                display: flex;
                flex-direction: column;
                padding: 20px;
                height: 100%;
                background-color: var(--pure_white_background);
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                width: 25%;
                min-width: 400px;
                position: absolute;
                top: 0;
                right: 0;
                -webkit-animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

                .print_sections_header{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 20px;

                    .close_print_sections{
                        width: 35px;
                        height: 35px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 5px;
                        flex: none;
                        cursor: pointer;
                        background-color: var(--white_error_color_op1);
                        span {
                            color: var(--white_error_color);
                            font-size: 16px;
                        }
                    }

                    .close_print_sections:hover{
                        span {
                            color: var(--error_color);
                        }
                    }

                }
            
                .select_all_cont {
                    padding-block: 20px;
                    border-top: 1px solid var(--active_color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    .select_all_text{
                        font-size: 14px;
                        font-weight: 700;
                        color: var(--gray_text);
                    }
                    .select_all_action{
                        font-size: 14px;
                        font-weight: 700;
                        color: var(--light_pri_color);
                        cursor: pointer;
                    }
                    
                }

                .sections_list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;

                    /* Scrollbar styling */
                    &::-webkit-scrollbar {
                        width: 6px;
                    }

                    &::-webkit-scrollbar-track {
                        background: var(--pure_white_background);
                        border-radius: 10px;
                    }

                    &::-webkit-scrollbar-thumb {
                        background: var(--active_color);
                        border-radius: 10px;
                    }
                }

                .print_actions {
                    padding-top: 20px;
                    border-top: 1px solid var(--active_color);
                    background-color: var(--pure_white_background);
                }

                .print_now_btn {
                    width: 100%;
                    padding: 12px;
                    background: var(--pri_color);
                    color: var(--pure_white_background);
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    color: var(--white);

                    &:hover {
                        opacity: 0.9;
                        transform: translateY(-1px);
                    }
                }

                .checkbox_container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    user-select: none;
                    padding: 10px 8px;
                    border-radius: 5px;
                    transition: background-color 0.2s ease;
                    width: 100%;

                    &:hover{
                        background: var(--pri_op1);
                    }

                    .label {
                        font-size: 14px;
                        font-weight: 500;
                    }
                }
            }
        }
        `
    }

}

