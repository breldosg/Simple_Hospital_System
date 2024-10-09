import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class AddUserView {
    constructor() {
        window.registerUser = this.registerUser.bind(this);
    }

    async PreRender() {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('', 'active');

        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
        const cont = document.querySelector('.update_cont');
        const roles_raw = await this.fetchData(); // Wait for fetchData to complete

        if (roles_raw) {
            // Create roles elements
            const roles = (role_raw) => {
                var rolesElem = "";
                role_raw.forEach(data => {
                    rolesElem += `
                        <br-option type="checkbox" value="${data.id}">${data.name}</br-option>
                    `;
                });
                return rolesElem;
            };

            // Replace loader and insert the content
            cont.innerHTML = this.ViewReturn(roles(roles_raw));
        } else {
            // Handle case where no roles were returned, or an error occurred.
            cont.innerHTML = '<3>Error fetching roles data. Please try again.</3>';
        }
    }

    ViewReturn(roles, loader = '') {
        return `
        <div class="container add_user">
            <br-form class="slides" callback="registerUser" btn_class="add_user_btn">
                <div class="slide">
                    <p class="heading">Staff information</p>
                    <div class="input_group">
                        <br-input label="Full name" name="name" type="text" styles="
                            border-radius: var(--input_main_border_r);
                            width: 300px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                        " labelStyles="font-size: 13px;" required></br-input>

                        <br-select required fontSize="13px" label="Gender" name="gender" placeholder="Select Gender" styles="
                            border-radius: var(--input_main_border_r);
                            width: 300px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                        " labelStyles="font-size: 13px;">
                            <br-option value="Male">Male</br-option>
                            <br-option value="Female">Female</br-option>
                        </br-select>

                        <br-input label="Username" name="user_name" type="text" styles="
                            border-radius: var(--input_main_border_r);
                            width: 300px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                        " labelStyles="font-size: 13px;" required ></br-input>

                        <br-select required fontSize="13px" label="Role" name="role" placeholder="Select Role" styles="
                            border-radius: var(--input_main_border_r);
                            width: 300px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                        " labelStyles="font-size: 13px;">
                            ${roles}
                        </br-select>

                        <br-input label="Phone number" type="tel" name="phone" styles="
                            border-radius: var(--input_main_border_r);
                            width: 300px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                        " labelStyles="font-size: 13px;" required></br-input>

                        <br-input label="Password" name="pass" type="password" styles="
                            border-radius: var(--input_main_border_r);
                            width: 300px;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);
                        " labelStyles="font-size: 13px;" required></br-input>

                        <div class="btn_cont">
                            <br-button loader_width="23" class="btn_next" type="submit" >Submit</br-button>
                        </div>
                    </div>
                </div>
            </br-form>
            <div class="loader_cont ${loader}">
                    <div class="loader"></div>
            </div>
        </div>
        `;
    }

    async registerUser(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        try {
            const response = await fetch('/api/users/register_staff', {
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
                notify('top_left', result.message, 'success');
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', result.message, 'error');
        }
        finally {
            btn_submit.setAttribute('loading', false);
        }
    }

    async fetchData() {
        try {
            const response = await fetch('/api/users/get_role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

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
}
