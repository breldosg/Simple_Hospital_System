import { dashboardController } from "../controller/DashboardController.js";
import { diagnosisArray, duration_unit } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { debounce, notify, searchInArray } from "../script/index.js";

export class VisitRadiologyExamPopUpView {
    constructor() {
        this.callback = null;
        this.data = null;
        // window.save_clinical_note = this.save_clinical_note.bind(this);
    }

    async PreRender(params = '') {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.visit_id = params.visit_id ? params.visit_id : '';
        this.evaluation_data = params.data ? params.data : '';
        this.state = params.state ? params.state : 'creation';

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn();


        this.attachListeners()
    }

    ViewReturn() {
        return `
<div class="container clinical_note_add_popUp">

    <div class="cont_heading">
        <p class="heading">Clinical Evaluation</p>
    </div>

    <br-form callback="save_clinical_note">
        
    </br-form>



</div>

`;
    }

    attachListeners() {
        const cancel_btn = document.querySelector('#confirm_cancel');

        cancel_btn.addEventListener('click', () => {
            this.close();

        });

    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

//     async save_clinical_note(data) {
//         const btn_submit = document.querySelector('br-button[type="submit"]');
//         btn_submit.setAttribute('loading', true);

//         data = {
//             ...data,
//             action: this.state == 'update' ? 'update' : 'create',
//             evaluation_id: this.state == 'update' ? this.evaluation_data.id : '',
//             visit_id: this.visit_id
//         };

//         console.log(data);


//         try {
//             const response = await fetch('/api/patient/save_clinical_note', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(data)
//             });

//             if (!response.ok) {
//                 throw new Error('Fail to Save Note. Server Error');
//             }

//             const result = await response.json();

//             if (result.success) {
//                 dashboardController.visitClinicalEvaluationCardView.PreRender({
//                     visit_id: this.visit_id,
//                     data: result.data,
//                     state: this.state,
//                 });
//                 notify('top_left', result.message, 'success');
//                 this.close();
//             } else {
//                 notify('top_left', result.message, 'warning');
//             }
//         } catch (error) {
//             notify('top_left', error.message, 'error');
//         }

//     }
}