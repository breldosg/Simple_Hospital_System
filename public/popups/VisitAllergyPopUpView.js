import { allergySeverity, allergyTypes } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

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

        this.visit_id = params.visit_id ? params.visit_id : '';



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

    <br-form callback="save_allergy">
        <div class="cont_form">

            <br-select required name="allergy_type" fontSize="13px" label="Allergen Type" placeholder="Select allergen type"
                styles="
                        border-radius: var(--input_main_border_r);
                        width: 300px;
                        padding: 10px;
                        height: 41px;
                        background-color: transparent;
                        border: 2px solid var(--input_border);
                        " labelStyles="font-size: 14px !important;">

                        ${allergyTypes.map((type) => { return `<br-option type="checkbox" value="${type}">${type}</br-option>` }).join('')}


            </br-select>


            <br-select required name="allergy_reaction" fontSize="13px" label="Reaction Type" placeholder="Select condition" styles="
                        border-radius: var(--input_main_border_r);
                        width: 300px;
                        padding: 10px;
                        height: 41px;
                        background-color: transparent;
                        border: 2px solid var(--input_border);
                        " labelStyles="font-size: 14px !important;">

                        ${allergyTypes.map((type) => { return `<br-option type="checkbox" value="${type}">${type}</br-option>` }).join('')}


            </br-select>




            <br-input placeholder="Enter the specific allergen" name="allergy_specific"
                label="Specific Allergen" required type="text" styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>


                
            <br-select placeholder="Select allergy severity" required name="allergy_severity" fontSize="13px" label="Allergy Severity"
            styles="
            border-radius: var(--input_main_border_r);
            width: 300px;
            padding: 10px;
            height: 41px;
            background-color: transparent;
            border: 2px solid var(--input_border);
            " labelStyles="font-size: 14px !important;">
            
                        ${allergySeverity.map((type) => { return `<br-option type="checkbox" value="${type}">${type}</br-option>` }).join('')}

        </br-select>






            <br-select required name="allergy_condition" fontSize="13px" label="Allergy Condition" placeholder="Select condition"
                styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 14px !important;">

                <br-option type="checkbox" value="Active">Active</br-option>
                <br-option type="checkbox" value="Inactive">Inactive</br-option>
                
            </br-select>


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
    }

    close() {
        const cont = document.querySelector('.popup');
        cont.classList.remove('active');
        cont.innerHTML = '';
    }

    add_loader_in_btn() {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);
    }
    remove_loader_in_btn() {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', false);
    }
}

