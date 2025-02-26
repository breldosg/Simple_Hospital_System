
import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class UpdateCategoryPopUpView {
    constructor() {
        window.UpdateCategory = this.UpdateCategory.bind(this);
        this.category_id = null;
    }

    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.category_id = params.c_id;
        this.category_name = params.c_name;
        this.category_description = params.c_description;

        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn(params, 'active');

        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
        // Replace loader and insert the content
        this.attachListeners()
    }

    ViewReturn(params, loader = '') {
        return `
        <div class="container update_medicine_category">

            <br-form callback="UpdateCategory" class="slides">
                <div class="slide">
                    <p class="heading">Update category information</p>

                    <div class="input_group">

                        <br-input required name="name" label="Category Name" value="${params.c_name}" type="text" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 400px;
                                        padding: 10px;
                                        height: 41px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>


                        <br-input name="description" label="Category Description" value="${params.c_description == null ? '' : params.c_description}" type="textarea" styles="
                                        border-radius: var(--input_main_border_r);
                                        width: 400px;
                                        padding: 10px;
                                        height: 100px;
                                        background-color: transparent;
                                        border: 2px solid var(--input_border);
                                        " labelStyles="font-size: 12px;"></br-input>

                        <div class="btn_cont">
                            <br-button loader_width="23" class="btn_next" type="submit">Update</br-button>
                            <br-button loader_width="23" class="btn_next cancel" type="cancel">Cancel</br-button>
                        </div>  
                    </div>

                </div>
            </br-form>
        </div>
        `;
    }

    attachListeners() {
        const cancel_btn = document.querySelector('br-button[type="cancel"]');

        cancel_btn.addEventListener('click', () => {
            const cont = document.querySelector('.popup');
            cont.classList.remove('active');
            cont.innerHTML = '';

        });
    }

    async UpdateCategory(data_old) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        var data = {
            ...data_old,
            id: this.category_id
        }

        try {
            const response = await fetch('/api/pharmacy/update_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('failed To create visit. Server Error');
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
                // After successful creation, clear the popup and close it
                const popup_cont = document.querySelector('.popup');
                popup_cont.innerHTML = ''; // Clear the popup and close it
                popup_cont.classList.remove('active');

                dashboardController.singleMedicineCategoryView.PreRender(
                    {
                        id: this.category_id
                    });

            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
        finally {
            btn_submit.setAttribute('loading', false);
        }
    }
}
