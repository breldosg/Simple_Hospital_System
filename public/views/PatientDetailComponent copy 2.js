import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";


export class PatientDetailComponent {
    constructor() {
        this.vitalSigns_data = false;
        this.applyStyle();
    }

    async PreRender(params) {
        // set default value
        this.vitalSigns_data = false;

        // receive parameters
        this.rendered_card = [];
        this.visit_id = params.visit_id ?? null;
        this.patient_id = params.patient_id ?? null;
        this.btn_group_type = params.btn_group_type ?? 'patient_history';
        this.container = params.container ?? null;
        if (this.container == null) {
            // throw new Error
            throw new Error('container is required');
        }

        // get role from global state
        this.role = globalStates.getState('user_data').role;

        // Render initial structure
        this.container.insertAdjacentHTML('afterbegin', this.ViewReturn(''));

        this.main_container = document.querySelector('.top_card_patient_info_cont');

        this.render();
    }

    async render() {
        const patient_data = await this.fetchData();


        if (!patient_data) {
            var loader = this.main_container.querySelector('.loader_cont');
            loader.classList.remove('active');
            return;
        }
        await this.vitalSigns_processing(patient_data);

        // Render top patient card
        this.top_card_view(patient_data);
        
        // Setup popup menu after rendering
        this.setupPopupMenu();
    }

    ViewReturn(data) {
        return `
    <div class="top_card_patient_info_cont">
        <div class="Patient_imag">
            <img src="${data == '' ? '' : data.Patient_img}" alt="">
        </div>

        <div class="patient_detail">
            <div class="card name_card">
                <p class="name">${data == '' ? '' : data.name} #<span>${data == '' ? '' : data.id}</span></p>
                <div class="more_btn"><span
                        class='switch_icon_more_vert'></span>
                    <div class="option_menu_popup">
                        <div class="option_item" data-action="edit_patient">
                            <span class="switch_icon_edit"></span>
                            <p>Edit Patient</p>
                        </div>
                        <div class="option_item" data-action="edit_visit">
                            <span class="switch_icon_edit"></span>
                            <p>Edit Visit</p>
                        </div>
                        <div class="option_item" data-action="add_vital_signs">
                            <span class="switch_icon_add"></span>
                            <p>Add Vital Signs</p>
                        </div>
                        <div class="option_item" data-action="view_history">
                            <span class="switch_icon_history"></span>
                            <p>View History</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
            ${['user', 'calendar_check', 'location_dot', 'phone', 'briefcase']
                .map(icon => `
                <div class="icon_card">
                    <span class='switch_icon_${icon}'></span>
                    <p></p>
                </div>
                `).join('')}
            </div>

            <div class="card vital">
                ${this.no_vital_sign_data_view()}
            </div>
        </div>

        <div class="loader_cont active">
            <div class="skeleton_loader"></div>
        </div>
    </div>
        `;
    }

    top_card_view(data) {
        console.log(this.vitalSigns_data);

        this.main_container.innerHTML = `
    <div class="Patient_imag">
            <img src="${data == '' ? '' : data.Patient_img}" alt="">
        </div>

        <div class="patient_detail">
            <div class="card name_card">
                <p class="name">${data == '' ? '' : data.name} #<span>${data == '' ? '' : data.id}</span></p>
                <div class="more_btn"><span
                        class='switch_icon_more_vert'></span>
                    <div class="option_menu_popup">
                        <div class="option_item" data-action="edit_patient">
                            <span class="switch_icon_edit"></span>
                            <p>Edit Patient</p>
                        </div>
                        <div class="option_item" data-action="edit_visit">
                            <span class="switch_icon_edit"></span>
                            <p>Edit Visit</p>
                        </div>
                        <div class="option_item" data-action="add_vital_signs">
                            <span class="switch_icon_add"></span>
                            <p>Add Vital Signs</p>
                        </div>
                        <div class="option_item" data-action="view_history">
                            <span class="switch_icon_history"></span>
                            <p>View History</p>
                        </div>
                        
                        <div class="option_item" data-action="print_file">
                            <span class="switch_icon_print"></span>
                            <p>Print File</p>
                        </div>

                    </div>
                </div>
            </div>
            <div class="card">
            ${[
                { icon: 'user', value: data ? data.gender : '' },
                {
                    icon: 'calendar_check',
                    value: data ? `${date_formatter(data.dob)} (${data.age.amount} ${data.age.unit})` : ''
                },
                {
                    icon: 'location_dot',
                    value: data ? `${data.address} (${data.nationality})` : ''
                },
                {
                    icon: 'phone',
                    value: data ? `${data.phone} / ${data.alt_phone}` : ''
                },
                { icon: 'briefcase', value: data ? data.occupation : '' }
            ].map(item => `
            <div class="icon_card">
                <span class='switch_icon_${item.icon}'></span>
                <p>${item.value}</p>
            </div>
            `).join('')}
            </div>

            <div class="card vital">
                ${this.vitalSigns_data ? this.vitalSigns_data.map(item => `
                <div class="vital_card">
                    <p class="main_ms ${item.status}">${item.value} <span>${item.unit}</span></p>
                    <div class="dist">
                        <p>${item.name}</p>
                        <div class="range ${item.status}">
                            ${item.icon}
                        </div>
                    </div>
                </div>
                `).join('') : this.no_vital_sign_data_view()}

            </div>
        </div>

        <div class="loader_cont">
            <div class="skeleton_loader"></div>
        </div>
    `;
    }

    setupPopupMenu() {
        const moreBtn = this.main_container.querySelector('.more_btn');
        const optionMenu = this.main_container.querySelector('.option_menu_popup');
        const optionItems = this.main_container.querySelectorAll('.option_item');

        // Toggle menu on more button click
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from propagating to document
            optionMenu.classList.toggle('active');
        });

        // Handle option items click
        optionItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent click from propagating to document
                const action = item.getAttribute('data-action');
                this.handleMenuAction(action);
                optionMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            if (optionMenu.classList.contains('active')) {
                optionMenu.classList.remove('active');
            }
        });
    }

    handleMenuAction(action) {
        switch (action) {
            case 'edit_patient':
                notify('top_left', 'Editing patient...', 'info');
                // Add functionality for editing patient
                break;
            case 'print_details':
                notify('top_left', 'Printing patient details...', 'info');
                // Add functionality for printing patient details
                break;
            case 'view_history':
                notify('top_left', 'Viewing patient history...', 'info');
                // Add functionality for viewing patient history
                break;
            default:
                break;
        }
    }

    async fetchData() {
        try {

            // const response = await fetch('/api/patient/single_visit_detail_by_patient_id_or_visit_id',
            const response = await fetch('/api/patient/single_patient',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        visit_id: this.visit_id,
                        patient_id: this.patient_id,
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

    no_vital_sign_data_view() {
        return `
        <div class="no_vital_sign_data_view">
            <p>No vital sign data</p>
        </div>
        `;
    }

    async vitalSigns_processing(data) {
        try {
            const vitalSigns = data?.vital_signs && typeof data.vital_signs === 'object' && Object.keys(data.vital_signs).length
                ? data.vital_signs
                : null;

            if (!vitalSigns) {
                this.vitalSigns_data = false;
                return;
            }

            const getStatusInfo = (status) => ({
                high: { icon: '<span class="switch_icon_arrow_drop_up"></span>', text: 'High' },
                low: { icon: '<span class="switch_icon_arrow_drop_down"></span>', text: 'Low' },
                normal: { icon: '<span class="switch_icon_minus"></span>', text: 'Normal' }
            }[status] || { icon: '<span class="switch_icon_minus"></span>', text: 'Normal' });

            // **BMI Calculation**
            let bmi = 0, bmiStatus = 'normal';
            if (vitalSigns.height >= 50 && vitalSigns.weight) { // Height should be at least 50cm to be reasonable
                const height_m = vitalSigns.height / 100;
                bmi = (vitalSigns.weight / (height_m * height_m)).toFixed(1);
                bmiStatus = bmi < 18.5 ? 'low' : bmi >= 25 ? 'high' : 'normal';
            }

            // **Blood Pressure Analysis**
            const analyzeBP = (bp) => {
                if (!bp) return { status: 'normal', systolic: 0, diastolic: 0 };
                const bpValues = bp.match(/\d+/g); // Extract numeric values

                if (bpValues.length === 1) { // If only one value is given
                    return {
                        status: bpValues[0] < 90 ? 'low' : bpValues[0] > 140 ? 'high' : 'normal',
                        systolic: bpValues[0],
                        diastolic: '-'
                    };
                }

                const [systolic, diastolic] = bpValues.map(Number);
                return {
                    status: systolic < 90 || diastolic < 60 ? 'low' :
                        systolic >= 140 || diastolic >= 90 ? 'high' : 'normal',
                    systolic, diastolic
                };
            };

            const bp = analyzeBP(vitalSigns.blood_pressure);

            // **Generic function to analyze vital ranges**
            const analyzeVital = (value, low, high) => ({
                status: !value ? 'normal' : value < low ? 'low' : value > high ? 'high' : 'normal',
                text: !value ? 'Normal' : value < low ? 'Low' : value > high ? 'High' : 'Normal'
            });

            const tempInfo = analyzeVital(vitalSigns.temperature, 36.0, 37.5);
            const pulseInfo = analyzeVital(vitalSigns.pulse, 60, 100);
            const o2Info = analyzeVital(vitalSigns.o2_saturation, 95, 100);
            const respInfo = analyzeVital(vitalSigns.respiration, 12, 20);

            this.vitalSigns_data = [
                { name: 'BMI', status: bmiStatus, value: bmi || '-', icon: getStatusInfo(bmiStatus).icon, unit: '' },
                { name: 'Temperature', status: tempInfo.status, value: vitalSigns.temperature || '-', icon: getStatusInfo(tempInfo.status).icon, unit: '°C' },
                { name: 'Pulse', status: pulseInfo.status, value: vitalSigns.pulse || '-', icon: getStatusInfo(pulseInfo.status).icon, unit: '/min' },
                { name: 'Blood Pressure', status: bp.status, value: `${bp.systolic}/${bp.diastolic}`, icon: getStatusInfo(bp.status).icon, unit: '' },
                { name: 'O₂ Saturation', status: o2Info.status, value: vitalSigns.o2_saturation || '-', icon: getStatusInfo(o2Info.status).icon, unit: '%' },
                { name: 'Respiration Rate', status: respInfo.status, value: vitalSigns.respiration || '-', icon: getStatusInfo(respInfo.status).icon, unit: '/min' }
            ];
        } catch (error) {
            notify('top_left', 'Failed to process vital signs data.', 'error');
            this.vitalSigns_data = false;
        }
    }

    applyStyle() {
        const styleElement = document.createElement('style');
        styleElement.textContent = this.style();
        styleElement.id = 'patient_detail_component_style';
        document.head.appendChild(styleElement);
    }

    style() {
        return `
            .top_card_patient_info_cont {
                width: 100%;
                background-color: var(--pure_white_background);
                /* height: 100px; */
                border-radius: 10px;
                padding: 20px;
                display: flex;
                gap: 40px;
                position: relative;
                flex:none;

                .Patient_imag {
                    width: 170px;
                    height: 170px;
                    border-radius: 50%;
                    overflow: hidden;
                    background-color: var(--image_background);
                    flex: none;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .patient_detail {
                    width: 100%;
                    display: flex;
                    gap: 10px;
                    flex-direction: column;

                    .card {
                        width: 100%;
                        display: flex;
                        align-items: flex-end;
                        gap: 10px 40px;
                        flex-wrap: wrap;

                        .name {
                            font-size: 30px;
                            font-weight: 900;
                        }

                        .more_btn {
                            width: 45px;
                            height: 45px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 5px;
                            flex: none;
                            cursor: pointer;
                            position: relative;
                        }

                        .more_btn:hover {
                            background-color: var(--pri_op);
                            cursor: pointer;
                            span{
                                color: var(--light_pri_color);
                            }
                        }

                        .option_menu_popup {
                            position: absolute;
                            top: 100%;
                            right: 0;
                            width: 200px;
                            background-color: var(--pure_white_background);
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                            z-index: 100;
                            opacity: 0;
                            padding: 10px;
                            visibility: hidden;
                            transform: translateY(10px);
                            transition: all 0.2s ease-in-out;
                            
                            &.active {
                                opacity: 1;
                                visibility: visible;
                                transform: translateY(0);
                            }
                            
                            .option_item {
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                padding: 12px 15px;
                                cursor: pointer;
                                transition: background-color 0.2s ease;
                                border-radius: 10px;
                                
                                &:hover {
                                    background-color: var(--pri_op);
                                    
                                    span {
                                        color: var(--light_pri_color);
                                    }
                                    
                                    p {
                                        color: var(--light_pri_color);
                                    }
                                }
                                
                                span {
                                    color: var(--gray_text);
                                    font-size: 14px;
                                }
                                
                                p {
                                    font-weight: 500;
                                    color: var(--gray_text);
                                }
                            }
                        }


                        .icon_card {
                            display: flex;
                            align-items: center;
                            gap: 10px;

                            p {
                                font-weight: 500;
                                color: var(--gray_text);

                                span {
                                    color: var(--gray_text);
                                    font-weight: 700;
                                }
                            }
                        }
                    }

                    .name_card {
                        justify-content: space-between;
                    }

                    .vital {
                        gap: 10px 20px;
                        margin-top: 20px;

                        .no_vital_sign_data_view{
                            border: dashed 2px var(--input_border);
                            width: 100%;
                            height: 70px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 10px;
                            
                            p{
                                font-size: 20px;
                                font-weight: 500;
                                color: var(--gray_text);
                            }
                        }

                        .vital_card {
                            padding: 5px 15px;
                            border: dashed 2px var(--input_border);
                            border-radius: 10px;

                            .main_ms {
                                font-size: 30px;
                                font-weight: 900;
                            }

                            .dist {
                                display: flex;
                                gap: 5px;

                                p {
                                    color: var(--gray_text);
                                    font-weight: 500;
                                }

                                .range {
                                    display: flex;
                                    gap: 5px;
                                }

                                .up {

                                    p,
                                    span {
                                        color: var(--success_color);
                                    }
                                }

                                .down {

                                    p,
                                    span {
                                        color: var(--error_color);
                                    }
                                }
                            }
                        }

                        .create_visit_btn {
                            margin-left: auto;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            color: var(--white);
                            font-weight: bold;
                            width: auto;
                        }
                    }

                    .vital_card {
                        .main_ms {
                            &.high {
                                color: var(--error_color);
                            }

                            &.low {
                                color: var(--warning_color);
                            }

                            &.normal {
                                color: var(--success_color);
                            }

                            span {
                                font-size: 25px;
                            }
                        }

                        .range {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-size: 12px;

                            &.high span {
                                /* background-color: rgba(255, 68, 68, 0.1); */
                                color: var(--error_color);
                            }

                            &.low span {
                                /* background-color: rgba(255, 160, 0, 0.1); */
                                color: var(--warning_color);
                            }

                            &.normal span {
                                /* background-color: rgba(0, 200, 83, 0.1); */
                                color: var(--success_color);
                            }

                            
                        }
                    }
                }

                .loader_cont {
                    padding: 0;
                }
            .skeleton_loader {
                width: 100%;
                height: 100%;
                background: 
                linear-gradient(97deg, var(--pure_white_background) 1%, var(--pri_op_skeleton) 20%, var(--pure_white_background) 80%) var(--pure_white_background);
                background-size: 900% 100%;
                animation: skeleton_loader 1.5s infinite cubic-bezier(0.445, 0.570, 0.760, 0.380);
                pointer-events: none;
            }
            
            

            }
        `;
    }
}

