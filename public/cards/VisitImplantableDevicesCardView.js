import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitImplantableDevicesCardView {
    constructor() {
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
        this.visit_status = null;
        this.edit_mode = false;
        window.remove_implantable_devices_request = this.remove_implantable_devices_request.bind(this);
    }

    async PreRender(params = []) {
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.datas = params.data ? params.data : [];
        this.visit_id = params.visit_id;
        this.state = params.state ? params.state : "creation";
        this.visit_status = params.visit_status ? params.visit_status : "checked_out";
        this.edit_mode = false;
        if (this.visit_status == "active") {
            this.edit_mode = true;
        }
        if (this.state == "creation") {
            const cont = document.querySelector('.single_visit_cont .more_visit_cards #treatment_group .card_group_cont');
            const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #treatment_group .card_group_cont .add_card_btn');
            if (add_btn) {
                add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
            }
            else {
                cont.appendChild(this.ViewReturn());
            }
            dashboardController.singleVisitView.add_to_rendered_card_array('visitsImplementableDevicePopUpView');
        }

        if (this.datas.length >= 1) {
            this.renderDeviceCards();
        }
    }

    renderDeviceCards() {
        const container = document.querySelector('.implantable_devices_card_cont_cont .body_part')

        container.innerHTML = '';

        if (this.datas.length > 0) {
            this.datas.forEach((data) => {
                const card = document.createElement('div');
                card.className = 'device_card';

                card.innerHTML = `
                    <div class="top">
                        <div class="left">
                            <p class="date">${date_formatter(data.created_at)}</p>
                            <p class="created_by">${data.created_by}</p>
                        </div>
                        <div class="right">
                            <!-- <div class="edit_btn btn" id="edit_patient_device" >
                                <span class='switch_icon_edit'></span>
                            </div> -->
                            <div class="delete_btn btn ${this.edit_mode ? "" : "visibility_hidden"}" id="delete_patient_device" >
                                <span class='switch_icon_delete'></span>
                            </div>
                        </div>
                    </div>

                    <div class="data">
                        <p class="head">Device Name:</p>
                        <p class="description">${data.device_name}</p>
                    </div>
                    
                    <div class="data">
                        <p class="head">Identifier:</p>
                        <p class="description">${data.identifier}</p>
                    </div>
                    
                    <div class="data">
                        <p class="head">Implanted Date:</p>
                        <p class="description">${date_formatter(data.implanted_date)}</p>
                    </div>
                    
                    ${data.note ? `
                    <div class="data note">
                        <p class="head">Note</p>
                        <p class="description">${data.note}</p>
                    </div>
                    ` : ''}
                `;

                // delete listener
                const delete_btn = card.querySelector('.delete_btn');
                if (this.edit_mode) {
                    delete_btn.addEventListener('click', () => {

                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'remove_implantable_devices_request',
                        parameter: data.id,
                        title: 'Remove Implantable Devices Request',
                        sub_heading: `Order For: ${data.device_name}`,
                        description: 'Are you sure you want to remove this device?',
                        ok_btn: 'Remove',
                        cancel_btn: 'Cancel'
                    });

                    this.singleSelectedToDelete = card;

                    });
                }

                container.prepend(card);
            })

            this.datas = [];
        }

        this.datas = [];
    }

    ViewReturn() {
        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('implantable_devices_card_cont_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Implantable Devices</h4>

                <div class="add_btn ${this.edit_mode ? "" : "visibility_hidden"}" id="add_patient_device" >
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part device_card_cont">
            </div>
        `;

        const add_btn = card.querySelector('.implantable_devices_card_cont_cont #add_patient_device');
        if (this.edit_mode) {
            add_btn.addEventListener('click', () => {
                dashboardController.visitsImplementableDevicePopUpView.PreRender(
                    {
                        visit_id: this.visit_id,
                        state: 'modify',
                        visit_status: this.visit_status,
                    }
                );
            })
        }

        return card;
    }


    async remove_implantable_devices_request(ids) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_implantable_devices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    device_ids: [ids],
                    state: 'single',
                })
            });

            if (!response.ok) throw new Error('Server Error');

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


            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }

            notify('top_left', result.message, 'success');

            if (this.singleSelectedToDelete) {
                this.singleSelectedToDelete.remove();
                this.singleSelectedToDelete = '';
                // this.singleSelectedToDelete_id = '';
                // this.datas = this.datas.filter(item => item.id != this.singleSelectedToDelete_id);
            }

        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            dashboardController.loaderView.remove();
        }
    }


}