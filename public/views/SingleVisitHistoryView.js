import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, print_div } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SingleVisitHistoryView {
    constructor() {
        this.patient_id = null;
        this.patient_name = null;

    }
    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('', 'active');
        this.main_container = document.querySelector('.single_visit_history_cont');

        this.patient_id = params.id;
        // Now call render which will fetch data and populate it
        this.render(params.id);
    }

    async render(id) {
        const cont = document.querySelector('.update_cont');
        const patient_data = await this.fetchData(id); // Wait for fetchData to complete

        console.log(patient_data);


        if (patient_data) {
            this.patient_name = patient_data.name;
            cont.innerHTML = this.ViewReturn(patient_data);
            this.attach_listeners()
        } else {
            // Handle case where no roles were returned, or an error occurred.
            cont.innerHTML = '<h3>Error fetching roles data. Please try again.</h3>';
        }
    }

    ViewReturn(data, loader = '') {
        // Check if vital signs data is available and not empty
        const vitalSigns = data && data.vital_signs &&
            typeof data.vital_signs === 'object' &&
            Object.keys(data.vital_signs).length > 0 ?
            data.vital_signs : null;

        // Calculate BMI
        let bmi = 0;
        let bmiStatus = 'normal';
        if (vitalSigns && vitalSigns.height && vitalSigns.weight) {
            const height_m = vitalSigns.height / 100;
            bmi = (vitalSigns.weight / (height_m * height_m)).toFixed(1);

            if (bmi < 18.5) bmiStatus = 'low';
            else if (bmi >= 18.5 && bmi < 25) bmiStatus = 'normal';
            else bmiStatus = 'high';
        }

        // Blood pressure analysis
        const analyzeBP = (bp) => {
            if (!bp) return { status: 'normal', systolic: 0, diastolic: 0 };
            const [systolic, diastolic] = bp.split('/').map(Number);
            let status = 'normal';

            if (systolic < 90 || diastolic < 60) status = 'low';
            else if (systolic >= 140 || diastolic >= 90) status = 'high';

            return { status, systolic, diastolic };
        };

        const bp = vitalSigns && vitalSigns.blood_pressure ? analyzeBP(vitalSigns.blood_pressure) : { status: 'normal' };

        // Helper function to get arrow icon and status text
        const getStatusInfo = (status) => {
            switch (status) {
                case 'high':
                    return {
                        icon: '<span class="switch_icon_arrow_drop_up"></span>',
                        text: 'High'
                    };
                case 'low':
                    return {
                        icon: '<span class="switch_icon_arrow_drop_down"></span>',
                        text: 'Low'
                    };
                default:
                    return {
                        icon: '<span class="switch_icon_minus"></span>',
                        text: 'Normal'
                    };
            }
        };

        const bmiInfo = getStatusInfo(bmiStatus);
        const bpInfo = getStatusInfo(bp.status);

        // New vital signs analysis
        const analyzeTemp = (temp) => {
            if (!temp) return { status: 'normal', text: 'Normal' };
            const temperature = parseFloat(temp);
            if (temperature < 36.0) return { status: 'low', text: 'Low' };
            if (temperature > 37.5) return { status: 'high', text: 'High' };
            return { status: 'normal', text: 'Normal' };
        };

        const analyzePulse = (pulse) => {
            if (!pulse) return { status: 'normal', text: 'Normal' };
            if (pulse < 60) return { status: 'low', text: 'Low' };
            if (pulse > 100) return { status: 'high', text: 'High' };
            return { status: 'normal', text: 'Normal' };
        };

        const analyzeO2 = (o2) => {
            if (!o2) return { status: 'normal', text: 'Normal' };
            if (o2 < 95) return { status: 'low', text: 'Low' };
            return { status: 'normal', text: 'Normal' };
        };

        const analyzeRespiration = (resp) => {
            if (!resp) return { status: 'normal', text: 'Normal' };
            if (resp < 12) return { status: 'low', text: 'Low' };
            if (resp > 20) return { status: 'high', text: 'High' };
            return { status: 'normal', text: 'Normal' };
        };

        const tempInfo = vitalSigns && vitalSigns.temperature ? analyzeTemp(vitalSigns.temperature) : { status: 'normal', text: 'Normal' };
        const pulseInfo = vitalSigns && vitalSigns.pulse ? analyzePulse(vitalSigns.pulse) : { status: 'normal', text: 'Normal' };
        const o2Info = vitalSigns && vitalSigns.o2_saturation ? analyzeO2(vitalSigns.o2_saturation) : { status: 'normal', text: 'Normal' };
        const respInfo = vitalSigns && vitalSigns.respiration ? analyzeRespiration(vitalSigns.respiration) : { status: 'normal', text: 'Normal' };

        return `
<div class="single_visit_history_cont">
        <div class="print_btn">
            <button type="button" class="print_btn_btn">Print Report</button>
        </div>

    <div class="top_card patient_info_cont">
        <div class="Patient_imag">
            <img src="${data == '' ? '' : data.Patient_img}" alt="">
        </div>

        <div class="patient_detail">
            <div class="card name_card">
                <p class="name">${data == '' ? '' : data.name} #<span>${data == '' ? '' : data.id}</span></p>
                <button type="button" data_src="${data == '' ? '' : data.id}" class="edit_btn"><span
                        class='switch_icon_edit'></span></button>
            </div>
            <div class="card">
                <div class="icon_card">
                    <span class='switch_icon_user'></span>
                    <p>${data == '' ? '' : data.gender}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_calendar_check'></span>
                    <p>${date_formatter(data == '' ? '2001-02-01' : data.dob)} (${data == '' ? '' : data.age.amount}
                        ${data == '' ? '' : data.age.unit})</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_location_dot'></span>
                    <p>${data == '' ? '' : data.address} (<span>${data == '' ? '' : data.nationality}</span>)</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_phone'></span>
                    <p>${data == '' ? '' : data.phone} <span>/</span> ${data == '' ? '' : data.alt_phone}</p>
                </div>

                <div class="icon_card">
                    <span class='switch_icon_briefcase'></span>
                    <p>${data == '' ? '' : data.occupation}</p>
                </div>
            </div>

            <div class="card vital">
                <div class="vital_card">
                    <p class="main_ms ${bmiStatus}">${bmi || '-'}</p>
                    <div class="dist">
                        <p>BMI</p>
                        <div class="range ${bmiStatus}">
                            ${bmiInfo.icon}
                        </div>
                    </div>
                </div>

                <div class="vital_card">
                    <p class="main_ms ${tempInfo.status}">${vitalSigns && vitalSigns.temperature ? vitalSigns.temperature : '-'}<span>°C</span></p>
                    <div class="dist">
                        <p>Temperature</p>
                        <div class="range ${tempInfo.status}">
                            ${getStatusInfo(tempInfo.status).icon}
                        </div>
                    </div>
                </div>

                <div class="vital_card">
                    <p class="main_ms ${pulseInfo.status}">${vitalSigns && vitalSigns.pulse ? vitalSigns.pulse : '-'}<span>/min</span></p>
                    <div class="dist">
                        <p>Pulse</p>
                        <div class="range ${pulseInfo.status}">
                            ${getStatusInfo(pulseInfo.status).icon}
                        </div>
                    </div>
                </div>

                <div class="vital_card">
                    <p class="main_ms ${bp.status}">${vitalSigns && vitalSigns.blood_pressure ? vitalSigns.blood_pressure : '-'}</p>
                    <div class="dist">
                        <p>Blood pressure</p>
                        <div class="range ${bp.status}">
                            ${bpInfo.icon}
                        </div>
                    </div>
                </div>

                <div class="vital_card">
                    <p class="main_ms ${o2Info.status}">${vitalSigns && vitalSigns.o2_saturation ? vitalSigns.o2_saturation : '-'}<span>%</span></p>
                    <div class="dist">
                        <p>O₂ Saturation</p>
                        <div class="range ${o2Info.status}">
                            ${getStatusInfo(o2Info.status).icon}
                        </div>
                    </div>
                </div>

                <div class="vital_card">
                    <p class="main_ms ${respInfo.status}">${vitalSigns && vitalSigns.respiration ? vitalSigns.respiration : '-'}<span>/min</span></p>
                    <div class="dist">
                        <p>Respiration Rate</p>
                        <div class="range ${respInfo.status}">
                            ${getStatusInfo(respInfo.status).icon}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="loader_cont ${loader}">
            <div class="loader"></div>
        </div>
    </div>

    <div class="section_cont clinic_plan_cont">
        <div class="clinical_evaluation_cont">
            <h3>Clinical Evaluation</h3>
            <div class="card">
            <div class="top_eval_card">
                <p class="date">Mar 18, 2025</p>
                <p class="doctor">Kelvin Godliver</p>
            </div>
            <div class="group">
                <p class="head">Chief Complaint</p>
                <p class="value">Lorem ipsum dolor sit,
                    amet consectetur adipisicing elit. Inventore at a facere ab ducimus aut quo excepturi distinctio sunt minus nobis voluptate neque voluptatum asperiores architecto quam, voluptas iusto.</p>
            </div>
            <div class="group">
                <p class="head">History of Present Illness</p>
                <p class="value">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Inventore at a facere ab ducimus aut quo excepturi distinctio sunt minus nobis voluptate neque voluptatum asperiores architecto quam, voluptas iusto.</p>
            </div>
            <div class="group">
                <p class="head">Review of Systems</p>
                <p class="value">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Inventore at a facere ab ducimus aut quo excepturi distinctio sunt minus nobis voluptate neque voluptatum asperiores architecto quam, voluptas iusto.</p>
            </div>
            <div class="group">
                <p class="head">General Examination</p>
                <p class="value">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Inventore at a facere ab ducimus aut quo excepturi distinctio sunt minus nobis voluptate neque voluptatum asperiores architecto quam, voluptas iusto.</p>
            </div>
            <div class="group">
                <p class="head">Systemic Examination</p>
                <p class="value">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Inventore at a facere ab ducimus aut quo excepturi distinctio sunt minus nobis voluptate neque voluptatum asperiores architecto quam, voluptas iusto.</p>
            </div>
            
        </div>
        
        </div>

        <div class="plan_for_next_visit_cont">
            <h3>Plan for Next Visit</h3>
            <div class="card">
                <div class="top_plan_card">
                    <p class="date">Mar 18, 2025</p>
                    <p class="doctor">Kelvin Godliver</p>
                </div>
                <div class="group">
                    <p class="head">Purpose of Visit</p>
                    <p class="value">Lorem Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus quae a consequatur nihil nemo facere neque, incidunt nisi velit repellat.ipsum dolor sit, amet consectetur adipisicing elit. Inventore at a facere ab ducimus aut quo excepturi distinctio sunt minus nobis voluptate neque voluptatum asperiores architecto quam, voluptas iusto.</p>
                </div>
                <div class="group">
                    <p class="head">Instructions</p>
                    <p class="value">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Inventore at a facere ab ducimus aut quo excepturi distinctio sunt minus nobis voluptate neque voluptatum asperiores architecto quam, voluptas iusto.</p>
                </div>
            </div>
        </div>
    </div>


    <div class="pre_final_diagnosis">
        <div class="diagnosis_cont">
            <h3>Preliminary Diagnosis</h3>
            <div class="card_cont">
                <div class="card">
                    <div class="icon_card">
                        <span class="switch_icon_accessibility"></span>
                    </div>
                    <p class="name">Lorem ipsum dolor sit amet.</p>
                </div>
                <div class="card">
                    <div class="icon_card">
                        <span class="switch_icon_accessibility"></span>
                    </div>
                    <p class="name">Lorem ipsum dolor sit.</p>
                </div>
                
                <div class="card">
                    <div class="icon_card">
                        <span class="switch_icon_accessibility"></span>
                    </div>
                    <p class="name">Lorem ipsum dolor sit, amet consectetur adipisicing.</p>
                </div>
                
            </div>
        </div>
        
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

    </div>


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

    async fetchData(id) {
        try {
            const response = await fetch('/api/patient/single_patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: id,
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


}

