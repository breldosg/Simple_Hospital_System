import { allergySeverity, allergyTypes } from "../custom/customizing.js";
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

            <br-select required name="type" fontSize="13px" label="Allergen Type" placeholder="Select allergen type"
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


            <br-select required name="type" fontSize="13px" label="Reaction Type" placeholder="Select condition" styles="
                        border-radius: var(--input_main_border_r);
                        width: 300px;
                        padding: 10px;
                        height: 41px;
                        background-color: transparent;
                        border: 2px solid var(--input_border);
                        " labelStyles="font-size: 14px !important;">

                        ${allergyTypes.map((type) => { return `<br-option type="checkbox" value="${type}">${type}</br-option>` }).join('')}


            </br-select>




            <br-input placeholder="Enter the specific allergen" name="chief_complain"
                label="Specific Allergen" required type="text" styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 41px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>


                
            <br-select placeholder="Select allergy severity" required name="type" fontSize="13px" label="Severity"
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


            <br-input label="Reaction Type" placeholder="Select the type of reaction" name="chief_complain" required
                type="textarea" styles="
                border-radius: var(--input_main_border_r);
                width: 300px;
                padding: 10px;
                height: 60px;
                background-color: transparent;
                border: 2px solid var(--input_border);
                " labelStyles="font-size: 13px;"></br-input>



            <br-select required name="type" fontSize="13px" label="Is Active" placeholder="Select allergy condition"
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