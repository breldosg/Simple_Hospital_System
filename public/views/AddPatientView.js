import { screenCollection } from "../screens/ScreenCollection.js";

export class AddPatientView {
    constructor() {
        window.register_patient = this.register_patient.bind(this)
    }

    async PreRender() {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.render();
    }

    render() {
        const cont = document.querySelector('.update_cont');

        cont.innerHTML = this.ViewReturn();

    }


    ViewReturn() {
        return `
<div class="container add_patient">
    <!-- <div class="top_bars">
                        <div class="bar active">
                            <p class="num">1</p>
                            <p class="num_word">Basic information</p>
                        </div>
                    </div> -->

    <br-form class="slides" callback="register_patient" btn_class="add_user_btn">
        <div class="slide">
            <p class="heading">Basic information</p>

            <div class="input_group">

                <br-input name="name" required label="Full name" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>


                <br-select required name="gender" fontSize="13px" label="Gender" placeholder="Select Gender" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;">

                    <br-option type="checkbox" value="Male">Male</br-option>
                    <br-option type="checkbox" value="Female">Female</br-option>

                </br-select>


                <br-input required name="dob" label="Date of birth" type="date" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>

                <br-input required name="occupation" label="Occupation" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>

                <br-input required name="phone" label="Phone number" type="tel" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>

                <br-input required name="alt_phone" label="Second phone number" type="tel" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>

                <br-input required name="nationality" label="Nationality" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>


                <br-input required name="address" label="Address" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>



                <div class="btn_cont">
                    <br-button loader_width="23" class="btn_next" type="submit" >Submit</br-button>
                </div>

            </div>

        </div>
    </br-form>

</div>
`;
    }


    async register_patient(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        try {
            const response = await fetch('/api/patient/register_patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Registration failed. Server Error');
            }

            const result = await response.json();

            if (result.success) {
                alert('Patient registered successfully');
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
        finally {
            btn_submit.setAttribute('loading', false);
        }
    }


}

// export const staffListView = new StaffListView();