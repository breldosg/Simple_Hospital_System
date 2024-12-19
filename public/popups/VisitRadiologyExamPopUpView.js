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
<div class="container radiology_popUp">

    <div class="cont_heading">
        <p class="heading">Add Radiology</p>
        <div class="close_btn">
            <span class='switch_icon_close'>
            </span>
        </div>
    </div>
    <div class="radiology_pop_cont">

        <div class="left">
            <div class="top_head">
                <p class="heading">Select Radiology Exam</p>

                <div class="search_cont">
                    <input type="text" placeholder="Search" class="radiolody_popup_search">
                    <br-button loader_width="23" class="btn_search" type="submit">
                        <span class="switch_icon_magnifying_glass"></span>
                    </br-button>
                </div>

            </div>

            <div class="left_body_cont">
                <div class="group_category_cont">
                    <div class="group_category active" data_src="all">
                        <p>All</p>
                    </div>
                    <div class="group_category" data_src="x_ray">
                        <p>X-Rays</p>
                    </div>
                    <div class="group_category" data_src="ultrasound">
                        <p>Ultrasound</p>
                    </div>
                    <div class="group_category" data_src="ct_scans">
                        <p>CT Scans</p>
                    </div>
                    <div class="group_category" data_src="mri">
                        <p>MRI Scans</p>
                    </div>

                </div>

                <div class="group_category_list">
                    <div class="radiology_list_item selected" data_src="x_ray_1">
                        <p>X-Ray 1</p>
                        <span class='switch_icon_check_box'></span>
                    </div>
                    <div class="radiology_list_item" data_src="ultrasound_1">
                        <p>Ultrasound 1</p>
                        <span class='switch_icon_check_box_outline_blank'></span>
                    </div>
                    <div class="radiology_list_item" data_src="ct_scan_1">
                        <p>CT Scan 1</p>
                        <span class='switch_icon_check_box_outline_blank'></span>
                    </div>
                    <div class="radiology_list_item" data_src="mri_1">
                        <p>MRI Scan 1</p>
                        <span class='switch_icon_check_box_outline_blank'></span>
                    </div>
                    <div class="radiology_list_item selected" data_src="x_ray_1">
                        <p>X-Ray 1</p>
                        <span class='switch_icon_check_box'></span>
                    </div>
                </div>

            </div>

        </div>

        <div class="right">
            <div class="top_head">
                <p class="heading">Selected Radiology Exam</p>
            </div>

            <div class="right_body_cont">
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
                <div class="radiology_list_item selected" data_src="x_ray_1">
                    <p>X-Ray 1</p>
                    <span class='switch_icon_indeterminate_check_box'></span>
                </div>
            </div>

            <div class="btn_cont">
                <br-button type="cancel" class="secondary" id="confirm_cancel">Cancel</br-button>
                <br-button type="btn" loading="false">Submit</br-button>
            </div>
        </div>

    </div>



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

    // async save_clinical_note(data) {
    // const btn_submit = document.querySelector('br-button[type="submit"]');
    // btn_submit.setAttribute('loading', true);

    // data = {
    // ...data,
    // action: this.state == 'update' ? 'update' : 'create',
    // evaluation_id: this.state == 'update' ? this.evaluation_data.id : '',
    // visit_id: this.visit_id
    // };

    // console.log(data);


    // try {
    // const response = await fetch('/api/patient/save_clinical_note', {
    // method: 'POST',
    // headers: {
    // 'Content-Type': 'application/json'
    // },
    // body: JSON.stringify(data)
    // });

    // if (!response.ok) {
    // throw new Error('Fail to Save Note. Server Error');
    // }

    // const result = await response.json();

    // if (result.success) {
    // dashboardController.visitClinicalEvaluationCardView.PreRender({
    // visit_id: this.visit_id,
    // data: result.data,
    // state: this.state,
    // });
    // notify('top_left', result.message, 'success');
    // this.close();
    // } else {
    // notify('top_left', result.message, 'warning');
    // }
    // } catch (error) {
    // notify('top_left', error.message, 'error');
    // }

    // }
}