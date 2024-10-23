import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class AddMedicineCategoryView {
    constructor() {
        window.register_medicine_category = this.register_medicine_category.bind(this)
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
        cont.innerHTML = this.ViewReturn();
    }


    ViewReturn(loader = '') {
        return `
<div class="container add_medicine_category">

    <br-form callback="register_medicine_category" class="slides">
        <div class="slide">
            <p class="heading">Medicine information</p>

            <div class="input_group">

                <br-input required name="name" label="Category Name" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 400px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>


                <br-input required name="description" label="Category Description" type="textarea" styles="
                                border-radius: var(--input_main_border_r);
                                width: 400px;
                                padding: 10px;
                                height: 100px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>

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

    async register_medicine_category(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        try {
            const response = await fetch('/api/medicine/register_medicine_category', {
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
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
        }
        finally {
            btn_submit.setAttribute('loading', false);
        }
    }

}
