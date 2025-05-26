import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class AddUserViewPopup {
    constructor() {
        window.registerUser = this.registerUser.bind(this);
        this.is_update = false;
        this.data = null;
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }
        console.log(params);

        if (params) {
            this.is_update = params.is_update ?? false;
            this.data = params.data ?? null;
        }
        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn('', 'active');

        this.main_container = document.querySelector('.add_user_popup');
        // Now call render which will fetch data and populate it
        this.render();
        this.addEventListeners();
    }

    async render() {
        const cont = document.querySelector('.update_cont');
        const roles_raw = await this.fetchData(); // Wait for fetchData to complete

        if (roles_raw) {
            // Create roles elements
            const options = (role_raw) => {
                var rolesElem = "";
                role_raw.forEach(data => {
                    rolesElem += `
                        <br-option type="checkbox" value="${data.id}">${data.name}</br-option>
                    `;
                });
                return rolesElem;
            };

            const role_selector = this.main_container.querySelector('#role_selector');
            if (role_selector) {
                role_selector.innerHTML = options(roles_raw.roles);
            }

            const department_selector = this.main_container.querySelector('#department_selector');
            department_selector.innerHTML = options(roles_raw.departments);

            // remove loader
            const loader = this.main_container.querySelector('.loader_cont');
            loader.remove();

            // Replace loader and insert the content
            // cont.innerHTML = this.ViewReturn(roles(roles_raw));
        } else {
            // Handle case where no roles were returned, or an error occurred.
            cont.innerHTML = '<3>Error fetching roles data. Please try again.</3>';
        }
    }

    ViewReturn(roles, loader = '') {
        return `
        <div class="container add_user_popup">
            <br-form class="slides" callback="registerUser" btn_class="add_user_btn">
                <div class="slide">
                    <p class="heading">Staff information</p>
                    <div class="input_group">
                        <br-input label="Full name" name="name" type="text" value="${this.is_update ? this.data.name == null ? '' : this.data.name : ''}" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required></br-input>

                        <br-input label="Email" name="email" type="email" value="${this.is_update ? this.data.email == null ? '' : this.data.email : ''}" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required ></br-input>

                        <br-input label="Username" name="user_name" type="text" value="${this.is_update ? this.data.user_name == null ? '' : this.data.user_name : ''}" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required ></br-input>

                        <br-select required fontSize="13px" label="Gender" name="gender" placeholder="Select Gender" value="${this.is_update ? this.data.gender == null ? '' : this.data.gender : ''}"  styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;">
                            <br-option value="Male">Male</br-option>
                            <br-option value="Female">Female</br-option>
                        </br-select>

                        ${this.is_update ? '' : `
                                <br-select required fontSize="13px" id="role_selector" search=true label="Role" name="role" placeholder="Select Role" styles="
                                    ${this.input_styles()}
                                " labelStyles="font-size: 12px;">
                                </br-select>
                            `
            }
                        </br-select>
                        <br-select required fontSize="13px" id="department_selector" search=true label="Department" name="department" placeholder="Select Department" value="${this.is_update ? this.data.department_id == null ? '' : this.data.department_id : ''}" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;">
                            
                        </br-select>

                        <br-input label="Specialist" type="text" name="specialist" value="${this.is_update ? this.data.specialist == null ? '' : this.data.specialist : ''}" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;"></br-input>

                        <br-input label="Practitioner Number" name="practitioner_number" type="text" value="${this.is_update ? this.data.practitioner_number == null ? '' : this.data.practitioner_number : ''}" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" ></br-input>

                        <br-input label="Phone number" type="tel" name="phone" value="${this.is_update ? this.data.phone == null ? '' : this.data.phone : ''}" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required></br-input>


                        <div class="btn_cont">
                            <br-button loader_width="23" class="btn_next cancel_btn" type="close" >Cancel</br-button>
                            <br-button loader_width="23" class="btn_next" type="submit" >${this.is_update ? 'Update' : 'Submit'}</br-button>
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

    addEventListeners() {
        const cancel_btn = this.main_container.querySelector('.cancel_btn');
        cancel_btn.addEventListener('click', () => {
            this.close_popup();
        });
    }

    async registerUser(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        var link = '/api/users/register_staff';
        if (this.is_update) {
            link = '/api/users/update_staff_profile';
        }

        try {
            const response = await fetch(link, {
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
                notify('top_left', result.message, 'success');
                this.close_popup();
                if (this.is_update) {
                    dashboardController.userProfileView.PreRender();
                } else {
                    dashboardController.staffListView.fetchAndRenderData();
                }
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

    close_popup() {
        const popup_cont = document.querySelector('.popup');
        popup_cont.innerHTML = '';
        popup_cont.classList.remove('active');
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

    input_styles() {
        return `
        border-radius: var(--input_main_border_r);
        width: 300px;
        padding: 10px;
        height: 41px;
        background-color: transparent;
        border: 2px solid var(--input_border);`;
    }
}

