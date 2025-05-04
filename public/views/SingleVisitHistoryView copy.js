import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, date_formatter, notify, print_div } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SingleVisitHistoryView {
    constructor() {
        this.visit_id = null;
        this.patient_name = null;
        applyStyle(this.style())
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

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
                method: this.render_clinic_evaluation, // Use a method defined in this component
                dataKey: 'clinical_evaluation_data',
                dataArray: 'evaluation_data',
                // condition: (data) => data.success,
            },
            {
                method: this.render_visit_plan, // Use a method defined in this component
                dataKey: 'plan_visit_data',
                dataArray: 'plan_data',
                // condition: (data) => data.success,
            },
            {
                method: this.render_pre_diagnosis, // Use a method defined in this component
                dataKey: 'pre_diagnosis_data',
                dataArray: 'diagnosis_data',
                // condition: (data) => data.success,
            },
        ];

        cardRenderConfig.forEach(config => {
            if (config.condition && !config.condition(visit_data[config.dataKey])) return;
            var data = visit_data[config.dataKey];

            config.method.call(this, // Use .call(this, ...) to ensure 'this' context
                config.dataArray ? data[config.dataArray] : undefined,
            );

            if (config.afterRender) config.afterRender();
        });

    }

    ViewReturn(data, loader = '') {

        return `
            <div class="single_visit_history_cont">
                <div class="print_btn">
                    <button type="button" class="print_btn_btn">Print Report</button>
                </div>

                <div class="section_cont clinic_plan_cont">
                </div>

                <div class="pre_final_diagnosis">
                </div>

            </div>
        `;
    }

    attach_listeners() {

        const print_btn = document.querySelector('.print_btn_btn');
        if (print_btn) {
            print_btn.addEventListener('click', async () => {
                // update some page styles before printing
                var style = document.createElement('style');
                style.id = 'print_style';
                style.innerHTML = this.report_style();
                document.head.appendChild(style);

                // get body class list
                var body_class = document.body.classList.value;
                // clean body class list
                document.body.classList.value = '';
                // add print class to body
                document.body.classList.add('light_mode');

                // print the page
                window.print();
                document.head.removeChild(style);
                // restore body class list
                document.body.classList.value = body_class;
            })
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
            <div class="diagnosis_cont">
                <h3>Preliminary Diagnosis</h3>
                ${content}
            </div>
        `;
    }


    render_pre_and_final_diagnosis() {
        return `
        <div class="diagnosis_cont">
            <h3>Final Diagnosis</h3>
            <div class="card_cont">
                <div class="card">
                    <div class="icon_card">
                        <span class="switch_icon_accessibility"></span>
                    </div>
                    <p class="name">Lorem ipsum dolor sit amet.</p>
                </div>
                
            </div>
        </div>
        `
    }

    render_lab_cards() {
        return `
        <div class="lab_report_cont">
        <h3>Laboratory Report</h3>
        <div class="card">
            <div class="lab_card_top">
                <p class="name">Blood Test</p>
                <p class="date">Mar 18, 2025</p>
            </div>
            <div class="lab_card_bottom">
                <div class="t_head tr">
                    <p class="column">Test</p>
                    <p class="column">Result</p>
                    <p class="column">Normal Range</p>
                </div>
                <div class="t_body tr">
                    <p class="column">WBC</p>
                    <p class="column">10.0 mmol/L</p>
                    <p class="column">4.5-11.0</p>
                </div>
                <div class="t_body tr">
                    <p class="column">WBC</p>
                    <p class="column">10.0 mmol/L</p>
                    <p class="column">4.5-11.0</p>
                </div>
                <div class="t_body tr">
                    <p class="column">WBC</p>
                    <p class="column">10.0 mmol/L</p>
                    <p class="column">4.5-11.0</p>
                </div>
                <div class="t_body tr">
                    <p class="column">WBC</p>
                    <p class="column">10.0 mmol/L</p>
                    <p class="column">4.5-11.0</p>
                </div>

            </div>
        </div>
        
        <div class="card">
            <div class="lab_card_top">
                <p class="name">Urine Test</p>
                <p class="date">Mar 18, 2025</p>
            </div>
            <div class="lab_card_bottom">
                <div class="t_head tr">
                    <p class="column">Test</p>
                    <p class="column">Result</p>
                    <p class="column">Normal Range</p>
                </div>
                <div class="t_body tr">
                    <p class="column">WBC</p>
                    <p class="column">10.0 mmol/L</p>
                    <p class="column">4.5-11.0</p>
                </div>
                <div class="t_body tr">
                    <p class="column">WBC</p>
                    <p class="column">10.0 mmol/L</p>
                    <p class="column">4.5-11.0</p>
                </div>
                <div class="t_body tr">
                    <p class="column">WBC</p>
                    <p class="column">10.0 mmol/L</p>
                    <p class="column">4.5-11.0</p>
                </div>
                <div class="t_body tr">
                    <p class="column">WBC</p>
                    <p class="column">10.0 mmol/L</p>
                    <p class="column">4.5-11.0</p>
                </div>

            </div>
        </div>
    </div>
        `
    }

    render_radiology_cards() {
        return `
    <div class="radiology_report_cont">
        <h3>Radiology Report</h3>
        <div class="card">
            <div class="rad_card_top">
                <p class="name">X-Ray</p>
                <p class="date">Mar 18, 2025</p>
            </div>
            <div class="rad_card_bottom">
                <div class="group">
                    <p class="head">Comparison</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
                <div class="group">
                    <p class="head">Findings</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
                <div class="group">
                    <p class="head">Impression</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
                <div class="group">
                    <p class="head">Recommendation</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>

            </div>
        </div>
        <div class="card">
            <div class="rad_card_top">
                <p class="name">X-Ray</p>
                <p class="date">Mar 18, 2025</p>
            </div>
            <div class="rad_card_bottom">
                <div class="group">
                    <p class="head">Comparison</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
                <div class="group">
                    <p class="head">Findings</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
                <div class="group">
                    <p class="head">Impression</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
                <div class="group">
                    <p class="head">Recommendation</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>

            </div>
        </div>
        <div class="card">
            <div class="rad_card_top">
                <p class="name">X-Ray</p>
                <p class="date">Mar 18, 2025</p>
            </div>
            <div class="rad_card_bottom">
                <div class="group">
                    <p class="head">Comparison</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
                <div class="group">
                    <p class="head">Findings</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
                <div class="group">
                    <p class="head">Impression</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
                <div class="group">
                    <p class="head">Recommendation</p>
                    <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>

            </div>
        </div>
    </div>
        `
    }

    render_prescription_cards() {
        return `
    <div class="prescription_cont">
        <h3>Prescription</h3>
        <div class="card_cont">

            <div class="card">
                <div class="medication_card_top">
                    <p class="name">Acetylsalicylic Acid Solid oral dosage form: 75mg</p>
                    <p class="date">Mar 18, 2025</p>
                </div>
                <div class="card_bottom">
                    <div class="group">
                        <p class="head">Quantity:</p>
                        <p class="value">100 pills</p>
                    </div>
                    <div class="group">
                        <p class="head">Duration:</p>    
                        <p class="value">20 days</p>
                    </div>
                    <div class="group instruction_group">
                        <p class="head">Instruction:</p>    
                        <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                    </div>
                    
                </div>
            </div>
            
            <div class="card">
                <div class="medication_card_top">
                    <p class="name">Acetylsalicylic Acid Solid oral dosage form: 75mg</p>
                    <p class="date">Mar 18, 2025</p>
                </div>
                <div class="card_bottom">
                    <div class="group">
                        <p class="head">Quantity:</p>
                        <p class="value">100 pills</p>
                    </div>
                    <div class="group">
                        <p class="head">Duration:</p>    
                        <p class="value">20 days</p>
                    </div>
                    <div class="group instruction_group">
                        <p class="head">Instruction:</p>    
                        <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                    </div>
                    
                </div>
            </div>
            <div class="card">
                <div class="medication_card_top">
                    <p class="name">Acetylsalicylic Acid Solid oral dosage form: 75mg</p>
                    <p class="date">Mar 18, 2025</p>
                </div>
                <div class="card_bottom">
                    <div class="group">
                        <p class="head">Quantity:</p>
                        <p class="value">100 pills</p>
                    </div>
                    <div class="group">
                        <p class="head">Duration:</p>    
                        <p class="value">20 days</p>
                    </div>
                    <div class="group instruction_group">
                        <p class="head">Instruction:</p>    
                        <p class="value">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                    </div>
                    
                </div>
            </div>

        </div>
    </div>
        `
    }

    render_procedures_cards() {
        return `
    <div class="procedures_cont">
        <h3>Procedures</h3>
        <div class="card_cont">

            <div class="card">
                <div class="medication_card_top">
                    <p class="name">Acetylsalicylic Acid Solid oral dosage form: 75mg</p>
                    <p class="date">Mar 18, 2025</p>
                </div>
                <div class="card_bottom">
                    <div class="group">
                        <p class="head">Leading Surgeon:</p>
                        <p class="value">Dr. John Doe</p>
                    </div>
                    <div class="group">
                        <p class="head">Anesthesiologist Name:</p>    
                        <p class="value">Dr. Jane Smith</p>
                    </div>
                    <div class="group assistant_group">
                        <p class="head">Assistant</p>
                        <div class="pill_cont">
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                        </div>    
                    </div>
                    
                </div>
            </div>
            

            <div class="card">
                <div class="medication_card_top">
                    <p class="name">Acetylsalicylic Acid Solid oral dosage form: 75mg</p>
                    <p class="date">Mar 18, 2025</p>
                </div>
                <div class="card_bottom">
                    <div class="group">
                        <p class="head">Leading Surgeon:</p>
                        <p class="value">Dr. John Doe</p>
                    </div>
                    <div class="group">
                        <p class="head">Anesthesiologist Name:</p>    
                        <p class="value">Dr. Jane Smith</p>
                    </div>
                    <div class="group assistant_group">
                        <p class="head">Assistant</p>
                        <div class="pill_cont">
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                        </div>    
                    </div>
                    
                </div>
            </div>
            

            <div class="card">
                <div class="medication_card_top">
                    <p class="name">Acetylsalicylic Acid Solid oral dosage form: 75mg</p>
                    <p class="date">Mar 18, 2025</p>
                </div>
                <div class="card_bottom">
                    <div class="group">
                        <p class="head">Leading Surgeon:</p>
                        <p class="value">Dr. John Doe</p>
                    </div>
                    <div class="group">
                        <p class="head">Anesthesiologist Name:</p>    
                        <p class="value">Dr. Jane Smith</p>
                    </div>
                    <div class="group assistant_group">
                        <p class="head">Assistant</p>
                        <div class="pill_cont">
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                            <p class="pill">Dr. Jane Smith</p>
                        </div>    
                    </div>
                    
                </div>
            </div>
            

        </div>
    </div>
        `
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
        }
        .single_visit_history_cont{
            overflow: unset !important;
            .print_btn{
                display: none !important;
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
        }
        `
    }

}

