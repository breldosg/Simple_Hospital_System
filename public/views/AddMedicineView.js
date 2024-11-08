import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class AddMedicineView {
    constructor() {
        window.register_medicine = this.register_medicine.bind(this)
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
        const category_raw = await this.fetchData(); // Wait for fetchData to complete

        if (category_raw) {
            // Create roles elements
            const roles = (category_raw) => {
                var rolesElem = "";
                category_raw.forEach(data => {
                    rolesElem += `
                        <br-option type="checkbox" value="${data.id}">${data.name}</br-option>
                    `;
                });
                return rolesElem;
            };

            // Replace loader and insert the content
            cont.innerHTML = this.ViewReturn(roles(category_raw));
        } else {
            // Handle case where no roles were returned, or an error occurred.
            cont.innerHTML = '<3>Error fetching roles data. Please try again.</3>';
        }
    }


    ViewReturn(category, loader = '') {
        return `
<div class="container add_medicine">

    <br-form callback="register_medicine" id="register_medicine_form" class="slides">
        <div class="slide">
            <p class="heading">Medicine information</p>

            <div class="input_group">

                <br-input required name="m_code" label="Medicine Code" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>


                <br-input required name="name" label="Medicine Name" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>


                <br-select search required name="category" fontSize="13px" label="Category name" placeholder="Select Category Name" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;">

                    ${category}

                </br-select>
                
                <br-select required name="quantity_unit" fontSize="13px" label="Unit" placeholder="Select Quantity Unit" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;">

                    <br-option type="checkbox" value="bottle">Bottle</br-option>
                    <br-option type="checkbox" value="cards">Cards</br-option>
                    <br-option type="checkbox" value="pills">Pills</br-option>

                </br-select>


                <br-input required name="price" label="Sale Price (Price/One Unit)" type="number" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>

                <br-input required name="min_quantity" label="Amount To Trigger Low Stock Alert" placeholder="Unit" type="number" styles="
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
    <div class="loader_cont ${loader}">
            <div class="loader"></div>
    </div>

</div>
`;
    }

    async register_medicine(data) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        try {
            const response = await fetch('/api/pharmacy/register_medicine', {
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


    async fetchData() {
        try {
            const response = await fetch('/api/pharmacy/get_category', {
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
