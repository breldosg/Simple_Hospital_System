import { ALLOW_TO_ADD_PATIENT, VIEW_PATIENT_BTNS } from "../../config/roles.js";
import { dashboardController } from "../../controller/DashboardController.js";
import { visit_priority, visit_type } from "../../custom/customizing.js";
import { screenCollection } from "../../screens/ScreenCollection.js";
import { applyStyle, date_formatter, decodeHTML, getVisitPriority, getVisitType, notify, timeStamp_formatter } from "../../script/index.js";
import { frontRouter } from "../../script/route.js";

export class CompanyInformationView {
    constructor() {
        applyStyle(this.style());

        window.UpdateCompanyInfo = this.UpdateCompanyInfo.bind(this);
    }

    async PreRender() {
        const check_main_container = document.querySelector('.settings_bottom_cont_right');
        if (!check_main_container) {
            await dashboardController.settingsView.PreRender();
        }

        // get user role in global state
        this.user_data = globalStates.getState('user_data');

        // Fetch data and wait for result
        // const response = await this.fetchData();
        // console.log(response);


        const cont = document.querySelector('.settings_bottom_cont_right');
        // Use await here to ensure ViewReturn completes
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.company_information_view');

        this.addListener();
    }

    addListener() {
        const submit_btn = document.querySelector('.submit_btn');
        submit_btn.addEventListener('click', (e) => {
            e.preventDefault();
            const form = document.querySelector('br-form');
            form.handleSubmit();
        });
    }

    async UpdateCompanyInfo(data) {

        try {
            const response = await fetch('/api/users/update_company_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data
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
            console.log(result);
            
            notify('top_left', result.message, 'success');
            return result.success ? result.message : null;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            return null;
        }
    }


    ViewReturn() {
        return `
        <div class="company_information_view scroll_bar">
        
            <p class="big_title">Customization Company Information</p>

            <br-form callback="UpdateCompanyInfo">
                <div class="company_information_content">

                    <div class="company_information_card">
                        <p class="card_title">Company Name</p>
                        <p class="card_description">Choose a channel name that represents you and your content. Changes made to your name and picture are visible only on YouTube and not other Google services. You can change your name twice in 14 days</p>
                        <input type="text" class="card_input" name="name" value="Mount Meru Hospital" placeholder="Enter Company Name">
                    </div>

                    <div class="company_information_card">
                        <p class="card_title">Company Address</p>
                        <input type="text" class="card_input" name="address" value="P.O. Box 1234, Dar es Salaam, Tanzania" placeholder="Enter Company Address">
                    </div>

                    <div class="company_information_card">
                        <p class="card_title">Company Phone Number</p>
                        <input type="text" class="card_input" name="phone" value="+255 712 345 678" placeholder="Enter Company Phone Number">
                    </div>

                    <div class="company_information_card">
                        <p class="card_title">Company Email</p>
                        <input type="email" class="card_input" name="email" value="info@mountmeru.com" placeholder="Enter Company Email">
                    </div>

                    <div class="company_information_card logo">
                        <p class="card_title">Main Logo</p>
                        <p class="card_description">Upload a Main Logo for your company</p>
                        <div class="card_logo_container">
                            <div class="card_logo">
                                <img src="/public/assets/logo/Primary_logo.svg" alt="Company Logo">
                            </div>
                            <div class="card_logo_upload">
                                <p class="card_logo_upload_text">It’s recommended to use a picture that’s at least 98 x 98 pixels and 4MB or less. Use a PNG or GIF (no animations) file. Make sure your picture follows the YouTube Community Guidelines.
                                </p>
                                <div class="card_logo_upload_button_cont">
                                    <button class="card_logo_upload_button_button">Upload</button>
                                    <button class="card_logo_upload_button_button">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="company_information_card logo">
                        <p class="card_title">Secondary Logo</p>
                        <p class="card_description">Upload a Secondary Logo for your company</p>
                        <div class="card_logo_container">
                            <div class="card_logo">
                                <img src="/public/assets/logo/SubMark.png" alt="Company Logo">
                            </div>
                            <div class="card_logo_upload">
                                <p class="card_logo_upload_text">It’s recommended to use a picture that’s at least 98 x 98 pixels and 4MB or less. Use a PNG or GIF (no animations) file. Make sure your picture follows the YouTube Community Guidelines.
                                </p>
                                <div class="card_logo_upload_button_cont">
                                    <button class="card_logo_upload_button_button">Upload</button>
                                    <button class="card_logo_upload_button_button">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    
                    <div class="submit_btn_cont">
                        <p class="submit_btn_text">You can publish your company information by clicking the button below</p>
                        <button type="submit" class="submit_btn">Publish</button>
                    </div>
                </div>
            </br-form>

        </div>
        `;
    }


    style() {
        return `
    
        `;
    }
}


