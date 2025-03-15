import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class AddMedicineCategoryViewPopup {
    constructor() {
        window.register_medicine_category = this.register_medicine_category.bind(this)
    }

    async PreRender() {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }
        const cont = document.querySelector('.popup');
        cont.classList.add('active');
        cont.innerHTML = this.ViewReturn('', 'active');

        // Add listeners
        this.addListeners();
    }

    addListeners() {
        const close_btn = document.querySelector('.close_popup');
        close_btn.addEventListener('click', () => {
            this.close_popup();
        })
    }

    close_popup() {
        const popup_cont = document.querySelector('.popup');
        popup_cont.innerHTML = '';
        popup_cont.classList.remove('active');
    }

    ViewReturn(loader = '') {
        return `
<div class="container add_medicine_category">

    <br-form callback="register_medicine_category" id="add_category_form" class="slides">
        <div class="slide">
            <p class="heading">Medicine category information</p>

            <div class="input_group">

                <br-input required name="name" label="Category Name" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 400px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>


                <br-input required name="description" label="Category Description" type="textarea" styles="
                                border-radius: var(--input_main_border_r);
                                width: 400px;
                                padding: 10px;
                                height: 100px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 12px;"></br-input>

                <div class="btn_cont">
                    <br-button loader_width="23" class="btn_next close_popup error" type="cancel" >Cancel</br-button>
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

    async register_medicine_category(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        try {
            const response = await fetch('/api/pharmacy/register_medicine_category', {
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
                dashboardController.viewMedicineCategoryView.fetchAndRenderData();
                this.close_popup();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
        }
        finally {
            btn_submit.setAttribute('loading', false);
        }
    }

}
