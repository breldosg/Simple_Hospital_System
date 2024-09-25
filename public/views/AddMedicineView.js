import { screenCollection } from "../screens/ScreenCollection.js";

export class AddMedicineView {
    constructor() {

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
<div class="container add_medicine">
    <!-- <div class="top_bars">
                        <div class="bar active">
                            <p class="num">1</p>
                            <p class="num_word">Basic information</p>
                        </div>
                    </div> -->

    <br-form class="slides" btn_class="add_user_btn">
        <div class="slide">
            <p class="heading">Medicine information</p>

            <div class="input_group">

                <br-input label="Medicine Code" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>


                <br-input label="Medicine name" type="text" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>


                <br-select fontSize="13px" label="Generic name" placeholder="Select Generic Name" styles="
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


                <br-input label="Quantity" type="number" placeholder="In Pills or Bottle" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>

                <br-input label="Sale Price" type="number" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>

                <br-input label="lowest quantity Required" placeholder="Per Week" type="number" styles="
                                border-radius: var(--input_main_border_r);
                                width: 300px;
                                padding: 10px;
                                height: 41px;
                                background-color: transparent;
                                border: 2px solid var(--input_border);
                                " labelStyles="font-size: 13px;"></br-input>


            </div>

        </div>
    </br-form>

</div>
`;
    }



}

// export const staffListView = new StaffListView();