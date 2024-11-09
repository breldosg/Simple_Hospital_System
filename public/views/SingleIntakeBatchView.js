import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { notify } from "../script/index.js";

export class SingleIntakeBatchView {
    constructor() {
        this.patient_id = null;
        this.patient_name = null;
        this.batchNumber = 1;
        this.total_page_num = 1;
        this.total_data_num = 0;
        this.show_count_num = 0;

    }
    async PreRender(params) {
        // Render the initial structure with the loader
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('', 'active');

        this.patient_id = params.id;
        // Now call render which will fetch data and populate it
        this.render(params.id);
    }

    async render(id) {
        const cont = document.querySelector('.update_cont');
        const patient_data = await this.fetchData(id); // Wait for fetchData to complete

        this.patient_name = patient_data.name;

        if (patient_data) {
            cont.innerHTML = this.ViewReturn(patient_data);
            this.attach_listeners()
        } else {
            // Handle case where no roles were returned, or an error occurred.
            cont.innerHTML = '<h3>Error fetching roles data. Please try again.</h3>';
        }
    }

    ViewReturn(data, loader = '') {


        return `
<div class="single_batch_cont">

    <div class="top_card">

        <div class="juu">
            <p class="name">Medium Load</p>
        </div>
        <div class="pack">
            <span class="switch_icon_calendar_check"></span>
            <p class="date">Oct 10, 2024</p>
        </div>

    </div>

    <div class="main_section batch_table_out">

        <div class="in_table_top d_flex">
            <h4>Product List</h4>

            <div class="add_btn" title="Add Product" id="open_add_product_popup">
                <span class='switch_icon_add'></span>
            </div>
        </div>
        <div class="outpatient_table">

            <div class="table_head tr d_flex flex__c_a">
                <p class="id">SN</p>
                <p class="name">Name</p>
                <p class="name">Provider</p>
                <p class="date">Receive Date</p>
                <p class="name">Create By</p>
                <p class="status">Status</p>
                <div class="action"></div>
            </div>

            <div class="table_body d_flex flex__co">

                <div class="start_page">
                    <p>No Product Found</p>
                </div>

                <div class="loader_cont">
                    <div class="loader"></div>
                </div>
            </div>

            <div class="table_footer d_flex flex__e_b">
                <p>Show <span class='show_count'>${this.show_count_num}</span> data of <span
                        class="total_data">${this.total_data_num}</span></p>
                <div class="pagenation d_flex flex__c_c">
                    <button type="button" class="main_btn prev">Prev</button>
                    <p class="page_no d_flex flex__c_c">${this.batchNumber}/<span
                            class="total_page">${this.total_page_num}</span></p>
                    <button type="button" class="main_btn next">Next</button>
                </div>
            </div>

        </div>

    </div>

</div>
`;
    }

    attach_listeners() {

        const open_add_product_popup = document.querySelector('#open_add_product_popup');

        open_add_product_popup.addEventListener('click', async () => {
            dashboardController.receiveIntakeBatchPopUpView.PreRender(
                {
                    id: this.patient_id
                }
            );
        })


    }


    async fetchData(id) {
        try {
            const response = await fetch('/api/patient/single_patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patient_id: id,
                })
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

    date_formatter(ymd) {
        console.log('date', ymd);

        const dateee = new Date(ymd);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(dateee);
    }

}