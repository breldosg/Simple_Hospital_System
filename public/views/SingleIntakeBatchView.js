import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class SingleIntakeBatchView {
    constructor() {
        this.batch_id = null;
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
        cont.innerHTML = this.ViewReturn('active');

        this.batch_id = params.id;
        // Now call render which will fetch data and populate it
        this.render();
    }

    async render() {
        const top_cont = document.querySelector('.single_batch_cont .top_card');
        const batch_data = await this.fetchData(); // Wait for fetchData to complete

        console.log(batch_data);
        

        top_cont.innerHTML = this.top_card_view(batch_data.batch_data);

        this.attach_listeners()

    }

    ViewReturn(loader = '') {
        return `
<div class="single_batch_cont">

    <div class="top_card">

        <div class="juu">
            <p class="name">Medium Load</p>

        </div>
        <div class="pack_cont">

            <div class="pack">
                <span class="switch_icon_calendar_check"></span>
                <p class="date">Oct 10, 2024</p>
            </div>

            <div class="pack">
                <span class='switch_icon_cart_shopping'></span>
                <p class="date">Unguja Pharmacy</p>
            </div>

            <div class="pack">
                <span class='switch_icon_user_pen'></span>
                <p class="date">Kelvin Godliver</p>
            </div>

            <div class="btn">
                <br-button loader_width="23" class="btn_batch_close" type="submit">Close Batch</br-button>
                <!-- <br-button loader_width="23" class="btn_batch_close inactive" type="submit">Batch Closed</br-button> -->
            </div>
        </div>
<div class="loader_cont active"><div class="loader"></div></div>
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

    top_card_view(data) {
        try {
            var receive_date = date_formatter(data.receive_date);
        }
        catch (e) {
            var receive_date = '';
        }

        var close_btn = `<br-button loader_width="23" class="btn_batch_close" type="submit">Close Batch</br-button>`;
        var closed_btn = '<br-button loader_width="23" class="btn_batch_close inactive" type="submit">Batch Closed</br-button>';

        return `
        <div class="juu">
            <p class="name">${data.name}</p>

        </div>
        <div class="pack_cont">

            <div class="pack">
                <span class="switch_icon_calendar_check"></span>
                <p class="date">${receive_date}</p>
            </div>

            <div class="pack">
                <span class='switch_icon_cart_shopping'></span>
                <p class="date">${data.provider}</p>
            </div>

            <div class="pack">
                <span class='switch_icon_user_pen'></span>
                <p class="date">${data.created_by}</p>
            </div>

            <div class="btn">
                ${data.status == 'open' ? close_btn : closed_btn}
            </div>
        </div>
        `;
    }

    attach_listeners() {

        const open_add_product_popup = document.querySelector('#open_add_product_popup');

        open_add_product_popup.addEventListener('click', async () => {
            dashboardController.receiveIntakeBatchPopUpView.PreRender(
                {
                    id: this.batch_id
                }
            );
        })


    }


    async fetchData() {
        try {
            const response = await fetch('/api/pharmacy/single_batch_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: this.batch_id,
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

}