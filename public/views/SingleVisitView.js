import { dashboardController } from "../controller/DashboardController.js";
import { visit_add_card_btn, whoToSeeAddBtn } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SingleVisitView {
    constructor() {
        this.visit_id = null;
        this.is_add_card_open = false;
        this.rendered_card = [];
        this.add_card_deleted = null;
        this.current_clicked = null;
        this.add_cards_container = [];
        this.staff_role = '';
        this.visit_detail_data = null;
    }

    async PreRender(params) {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.rendered_card = [];
        this.visit_id = params.id;
        this.staff_role = globalStates.getState('user_data').role;

        // Render initial structure
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('active');

        // Render patient detail component
        this.main_container = document.querySelector('.single_visit_cont');
        dashboardController.patientDetailComponent.PreRender({
            container: this.main_container,
            visit_id: this.visit_id,
            location: 'visit_view',
        })


        this.render(params.id);

        // Remove any existing window click listener
        if (this.is_add_card_open) {
            window.removeEventListener('click', this.handleWindowClick);
        }
    }

    async render() {
        const visit_data = await this.fetchData();

        if (!visit_data) return;

        this.visit_detail_data = visit_data.visit_detail.visit_data;

        console.log(this.visit_detail_data);
        

        // Render various card views
        const cardRenderConfig = [
            {
                method: dashboardController.visitDetailCardView,
                dataKey: 'visit_detail',
                dataArray: 'visit_data',
            },
            {
                method: dashboardController.visitPatientNoteCardView,
                dataKey: 'patient_note',
                dataArray: 'note_data',
            },
            {
                method: dashboardController.visitClinicalEvaluationCardView,
                dataKey: 'clinical_evaluation_data',
                dataArray: 'evaluation_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitAllergyCardView')
            },
            {
                method: dashboardController.visitPreDiagnosisCardView,
                dataKey: 'pre_diagnosis_data',
                dataArray: 'diagnosis_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitPlanForNextVisitCardView')
            },
            {
                method: dashboardController.visitAllergyCardView,
                dataKey: 'allergy_data',
                dataArray: 'allergy_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitAllergyCardView')
            },
            {
                method: dashboardController.visitPlanForNextVisitCardView,
                dataKey: 'plan_visit_data',
                dataArray: 'plan_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitPlanForNextVisitCardView')
            },
            {
                method: dashboardController.visitRadiologyExamCardView,
                dataKey: 'radiology_order_data',
                dataArray: 'order_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitRadiologyExamPopUpView')
            },
            {
                method: dashboardController.visitLabExamCardView,
                dataKey: 'lab_order_data',
                dataArray: 'order_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitPlanForNextVisitCardView')
            },
            {
                method: dashboardController.visitFinalDiagnosisCardView,
                dataKey: 'final_diagnosis_data',
                dataArray: 'diagnosis_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitPlanForNextVisitCardView')
            },
            {
                method: dashboardController.visitImplantableDevicesCardView,
                dataKey: 'implantable_device_data',
                dataArray: 'devices_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitPlanForNextVisitCardView')
            },
            {
                method: dashboardController.visitVaccineCardView,
                dataKey: 'vaccine_data',
                dataArray: 'vaccine_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitPlanForNextVisitCardView')
            },
            {
                method: dashboardController.visitProceduresCardView,
                dataKey: 'procedure_data',
                dataArray: 'procedure_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitPlanForNextVisitCardView')
            },
            {
                method: dashboardController.visitAttachmentsCardView,
                dataKey: 'attachments_data',
                dataArray: 'attachments_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitPlanForNextVisitCardView')
            },
            {
                method: dashboardController.visitPrescriptionsCardView,
                dataKey: 'prescription_data',
                dataArray: 'prescription_data',
                condition: (data) => data.success,
                // afterRender: () => this.rendered_card.push('visitPlanForNextVisitCardView')
            },
        ];

        cardRenderConfig.forEach(config => {
            if (config.condition && !config.condition(visit_data[config.dataKey])) return;
            var data = visit_data[config.dataKey];

            config.method.PreRender({
                data: config.dataArray ? data[config.dataArray] : undefined,
                visit_id: this.visit_id,
                visit_status: this.visit_detail_data.status,
            });

            if (config.afterRender) config.afterRender();
        });

        // Render add buttons
        if (whoToSeeAddBtn.includes(this.staff_role) && this.visit_detail_data.status == 'active') {
            this.render_add_btn();
        }

        this.fetch_Dataset();
    }

    ViewReturn(loader = '') {
        return `
<div class="single_visit_cont">
    
    <div class="more_visit_detail"></div>
    <div class="more_visit_cards">
        ${['Clinical Notes', 'Diagnosis & Investigation', 'Treatment Plan']
                .map((title, index) => `
        <div class="card_group_cont_cont" id="${['clinical', 'diagnosis', 'treatment'][index]}_group">
            <h4>${title}</h4>
            <div class="card_group_cont"></div>
        </div>
        `).join('')}
    </div>
</div>
`;
    }

    render_add_btn() {

        // delete the existing add card btn
        this.add_cards_container.forEach(container => {
            container.remove();
        });

        this.add_cards_container = [];

        //create new add card btn
        visit_add_card_btn.forEach(btn => {
            const body = document.querySelector(`.single_visit_cont #${btn.body_container_id} .card_group_cont`);
            if (!body) return;

            const cards_cont = this.createAddCardButton(btn);
            body.appendChild(cards_cont);

            //add the new add card btn to the array
            this.add_cards_container.push(cards_cont);
        });
    }

    createAddCardButton(btn) {
        const cards_cont = document.createElement('div');
        cards_cont.className = 'add_card_btn';
        cards_cont.setAttribute('id', 'add_card_btn');

        const add_card_btn_in = document.createElement('div');
        add_card_btn_in.className = 'add_card_btn_in';
        add_card_btn_in.innerHTML = `<span class='switch_icon_add'></span>`;
        cards_cont.appendChild(add_card_btn_in);

        const option_cont = this.createCardOptions(btn, cards_cont);
        cards_cont.appendChild(option_cont);

        this.setupCardContainerListeners(cards_cont);

        return cards_cont;
    }

    createCardOptions(btn, cards_cont) {
        const option_cont = document.createElement('div');
        option_cont.className = 'option_cont';

        btn.cards.forEach(card => {
            const option = document.createElement('div');
            option.className = 'option';
            option.innerText = card.title;

            var is_role_support = !card.operator_roles.includes(this.staff_role);
            var is_component_rendered = this.rendered_card.includes(card.component);
            var is_restricted = false;



            card.active_if.forEach(active_if => {
                if (!this.rendered_card.includes(active_if)) {
                    is_restricted = true;
                }
            });

            if (is_component_rendered || is_role_support || is_restricted) {
                option.classList.add('disabled');
            } else {
                this.setupCardOptionListener(option, card, cards_cont);
            }

            option_cont.appendChild(option);
        });

        return option_cont;
    }

    setupCardOptionListener(option, card, cards_cont) {
        const handleClick = (e) => {
            e.stopPropagation();

            const controllerMethod = dashboardController[card.component];
            if (controllerMethod && typeof controllerMethod.PreRender === 'function') {
                controllerMethod.PreRender({
                    data: [],
                    state: 'creation',
                    visit_id: this.visit_id,
                    visit_status: this.visit_detail_data.status
                });
            } else {
                console.error(`PreRender method not found for component: ${card.component}`);
            }

            // this.rendered_card.push(card.component);
            // option.classList.add('disabled');
            this.current_clicked = option;
            cards_cont.classList.remove('option');
            this.is_add_card_open = false;
            this.add_card_deleted = null;
            window.removeEventListener('click', this.handleWindowClick);
        };

        option.addEventListener('click', handleClick);
    }

    setupCardContainerListeners(cards_cont) {
        cards_cont.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.is_add_card_open) {
                this.add_card_deleted?.classList.remove('option');
                this.is_add_card_open = false;
                window.removeEventListener('click', this.handleWindowClick);
            }
            cards_cont.classList.add('option');
            this.is_add_card_open = true;
            this.add_card_deleted = cards_cont;
            window.addEventListener('click', this.handleWindowClick);
        });
    }

    handleWindowClick = (e) => {
        const add_card_btn = this.add_card_deleted;

        if (this.is_add_card_open && add_card_btn && !add_card_btn.contains(e.target)) {
            add_card_btn.classList.remove('option');
            this.is_add_card_open = false;
            window.removeEventListener('click', this.handleWindowClick);
            this.add_card_deleted = null;
        }
    };

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

    add_to_rendered_card_array(value) {
        this.rendered_card.push(value);


        // check if visit detail is fetched 
        if (this.visit_detail_data == null) {
            return;
        }

        // Render add buttons
        if (whoToSeeAddBtn.includes(this.staff_role) && this.visit_detail_data.status == 'active') {
            this.render_add_btn();
        }
        // if (this.current_clicked != null) {
        //     this.current_clicked.classList.add('disabled');

        //     // Use the saved handleClick reference to remove the event listener
        //     this.current_clicked.removeEventListener('click', this.current_clicked.handleClick);
        // }
    }

    // fetch future used dataset from server
    async fetch_Dataset() {

        // Fetch radiology data
        if (!globalStates.hasState('radiology_data')) {
            globalStates.setState({ radiology_data_exists: false });
            await this.fetchRadiologyData();
        }

        // Fetch Lab Test data
        if (!globalStates.hasState('Lab_test_data')) {
            globalStates.setState({ Lab_test_data_exists: false });
            await this.fetchLabTestData();
        }

        // Fetch Lab Test data
        if (!globalStates.hasState('add_procedure_form')) {
            globalStates.setState({ add_procedure_form_exists: false });
            await this.fetch_add_procedure_form();
        }

    }

    async fetchRadiologyData() {
        try {
            const response = await fetch('/api/patient/get_all_radiology_data_list', {
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
                globalStates.setState({ radiology_data_exists: true });
                globalStates.setState({ radiology_data: result.data });
                if (globalStates.hasState('radiology_data_render_function')) {
                    var callbackName = globalStates.getState('radiology_data_render_function');
                    if (callbackName && typeof window[callbackName] === 'function') {
                        window[callbackName]();
                        globalStates.removeState('radiology_data_render_function');
                    } else {
                        console.warn(`Callback function ${callbackName} is not defined or not a function`);
                    }
                }

            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    async fetchLabTestData() {
        try {
            const response = await fetch('/api/patient/get_lab_test_data', {
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
                globalStates.setState({ lab_test_data_exists: true });
                globalStates.setState({ lab_test_data: result.data });
                if (globalStates.hasState('lab_test_data_render_function')) {
                    var callbackName = globalStates.getState('lab_test_data_render_function');
                    if (callbackName && typeof window[callbackName] === 'function') {
                        window[callbackName]();
                        globalStates.removeState('lab_test_data_render_function');
                    } else {
                        console.warn(`Callback function ${callbackName} is not defined or not a function`);
                    }
                }

            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    async fetch_add_procedure_form() {
        try {
            const response = await fetch('/api/patient/get_data_add_procedure_form', {
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
                globalStates.setState({ add_procedure_form_exists: true });
                globalStates.setState({ add_procedure_form: result.data });
                if (globalStates.hasState('add_procedure_form_render_function')) {
                    var callbackName = globalStates.getState('add_procedure_form_render_function');
                    if (callbackName && typeof window[callbackName] === 'function') {
                        window[callbackName]();
                        globalStates.removeState('add_procedure_form_render_function');
                    } else {
                        console.warn(`Callback function ${callbackName} is not defined or not a function`);
                    }
                }

            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }

}