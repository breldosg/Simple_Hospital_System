import { screenCollection } from "../screens/ScreenCollection.js";

export class AttendanceView {
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
<div class="attendence_cont">

    <br-form btn_class="add_user_btn" class="attendence_top">

        <h4>Search Staff</h4>

        <div class="attendence_content">

            

            <br-input label="Staff Name" type="text" placeholder="Enter staff name" styles="
                        border-radius: var(--input_main_border_r);
                        width: 400px;
                        padding: 10px;
                        height: 41px;
                        background-color: transparent;
                        border: 2px solid var(--input_border);
                        " labelStyles="font-size: 12px;"></br-input>


            <br-input label="Choose Date" type="date" styles="
                        border-radius: var(--input_main_border_r);
                        width: 400px;
                        padding: 10px;
                        height: 41px;
                        background-color: transparent;
                        border: 2px solid var(--input_border);
                        " labelStyles="font-size: 12px;"></br-input>


        </div>

    </br-form>

    <div class="main_section attendence_table_out">

        <div class="in_table_top d_flex flex__u_b">
            <h4>Staff List</h4>

            <div class="search_cont">
                <input type="text" placeholder="Search by name or id">
            </div>

        </div>
        <div class="outpatient_table">

            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="gender">Gender</p>
                <p class="phone">Phone Number</p>
                <p class="role">Role</p>
                <p class="name">Created By</p>
                <p class="date">Created Date</p>
                <div class="action"></div>
            </div>

            <div class="table_body d_flex flex__co">

                <!-- -----------------------start page------------------- -->
                <div class="start_page">

                    <p>There Is No Any Staff Found</p>

                </div>

                <!-- ----------------------rows code-------------------- -->
                <!-- <div class="tr d_flex flex__c_a">
                                <p title="1" class="id">1</p>
                                <p title="John " class="name">John</p>
                                <p title="Male" class="gender">Male</p>
                                <p title="Jan 01, 2022" class="phone">0779528300</p>
                                <p title="Administrator" class="role">Administrator</p>
                                <p title="John " class="name">John</p>
                                <p title="Jan 01, 2022" class="date">Jan 01, 2022</p>
                                <div class="action d_flex flex__c_c">
                                    <button type="button" class="main_btn">Deactivate</button>
                                </div>
                            </div> -->



            </div>

            <div class="table_footer d_flex flex__e_b">
                <p>Show 15 data of 2140</p>

                <div class="pagenation d_flex flex__c_c">

                    <button type="button" class="main_btn">Prev</button>
                    <p class="page_no d_flex flex__c_c">1</p>
                    <button type="button" class="main_btn">Next</button>


                </div>

            </div>

        </div>

    </div>

</div>
`;
    }



}

// export const staffListView = new StaffListView();