import { screenCollection } from "../screens/ScreenCollection.js";

export class VisitAllergyPopUpView {
constructor() {
this.callback = null;
this.data = null;
}

async PreRender(params = '') {
// Render the initial structure with the loader
const check_dashboard = document.querySelector('.update_cont');
if (!check_dashboard) {
await screenCollection.dashboardScreen.PreRender();
}

this.heading = params.title ? params.title : null;


const cont = document.querySelector('.popup');
cont.classList.add('active');
cont.innerHTML = this.ViewReturn();


this.attachListeners()
}

ViewReturn() {
return `
<div class="container allergy_add_popUp">

    <div class="cont_heading">
        <p class="heading">Allergy Form</p>
    </div>

    <br-form callback="register_chief_complainsss">
        <div class="cont_form">


            <div class="section_group">
                <h4>Chief Complaints (CC)</h4>

                <div class="input_groups">

                    <br-input placeholder="Briefly describe the main issue..." name="chief_complain"
                        label="Complaint Description" required type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>

                    <br-input label="Duration" name="query" placeholder="How long has this been happening?"
                        type="number" styles="
                                border-radius: var(--input_main_border_r);
                                width: 350px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>
                </div>


            </div>


            <div class="section_group">
                <h4>History of Present Illness (HPI)</h4>

                <div class="input_groups">

                    <br-input placeholder="Briefly describe the main issue..." name="chief_complain" label="Onset Date"
                        required type="date" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>

                    <br-select required name="type" fontSize="13px" label="Progression" placeholder="Select condition"
                        styles="
                                    border-radius: var(--input_main_border_r);
                                    width: 350px;
                                    padding: 10px;
                                    height: 41px;
                                    background-color: transparent;
                                    border: 2px solid var(--input_border);
                                    " labelStyles="font-size: 14px !important;">

                        <br-option type="checkbox" value="consumable">Improving</br-option>
                        <br-option type="checkbox" value="medicine">Worsening</br-option>
                        <br-option type="checkbox" value="medicine">Unchanged</br-option>

                    </br-select>
                </div>


            </div>

            <div class="section_group">
                <h4>Review of Systems (ROS)</h4>

                <div class="input_groups">

                    <br-input placeholder="Select related symptoms" name="chief_complain" label="Related Symptoms"
                        type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>


                </div>


            </div>


            <div class="section_group">
                <h4>General Examination (GE)</h4>

                <div class="input_groups">

                    <br-input placeholder="Any visible or notable physical findings..." name="chief_complain"
                        label="Physical Observations" type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>


                </div>


            </div>


            <div class="section_group">
                <h4>Preliminary Diagnosis (Dx)</h4>

                <div class="input_groups">

                    <br-input placeholder="Enter initial diagnosis..." name="chief_complain" required
                        label="Provisional Diagnosis" require type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>


                    <br-input placeholder="Any additional notes or observations..." name="chief_complain"
                        label="Doctor's Notes" require type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>


                </div>


            </div>


            <div class="section_group">
                <h4>Systemic Examination (SE)</h4>

                <div class="input_groups">

                    <br-input placeholder="Key findings in specific systems..." name="chief_complain"
                        label="Focused Findings" require type="textarea" styles="
                            border-radius: var(--input_main_border_r);
                            width: 350px;
                            padding: 10px;
                            height: 60px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                            " labelStyles="font-size: 13px;"></br-input>


                </div>


            </div>



            <div class="btn_wrapper">
                <br-button id="confirm_cancel" class="card-button secondary">Cancel</br-button>
                <br-button class="card-button" type="submit">Save</br-button>
            </div>



        </div>
    </br-form>



</div>

`;
}

attachListeners() {
const cancel_btn = document.querySelector('#confirm_cancel');

cancel_btn.addEventListener('click', () => {
this.close();

});


// const delete_btn = document.querySelector('#confirm_delete');
// delete_btn.addEventListener('click', () => {
// const cont = document.querySelector('.popup');
// cont.classList.remove('active');
// cont.innerHTML = '';

// const callbackName = this.callback;
// const data = this.parameter;

// if (callbackName && typeof window[callbackName] === 'function') {
// window[callbackName](data);
// } else {
// console.warn(`Callback function ${callbackName} is not defined or not a function`);
// }
// });
}

close() {
const cont = document.querySelector('.popup');
cont.classList.remove('active');
cont.innerHTML = '';
}
}