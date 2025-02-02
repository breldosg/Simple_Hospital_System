import { dashboardController } from "../controller/DashboardController.js";
import { visit_add_card_btn } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, timeStamp_formatter } from "../script/index.js";

export class SingleVisitRadiologyView {
    constructor() {
        this.visit_id = null;
        this.is_add_card_open = false;
        this.rendered_card = [];
        this.add_card_deleted = null;
        this.current_clicked = null;
    }

    async PreRender(params) {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }


        // Render initial structure
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('active');

        this.main_container = document.querySelector('.single_radiology_visit_cont');
        this.rendered_card = [];
        this.visit_id = params.id;
        this.render(params.id);
        this.add_listeners();
    }

    async render() {
        const visit_data = await this.fetchData();

        if (!visit_data) return;

        // Render top patient card
        this.top_card_view(visit_data.patient_data);

        // Render orders
        this.render_orders(visit_data.radiology_orders);
        this.render_illness_info(visit_data.illness);
    }

    add_listeners() {

        var left_section_switcher = this.main_container.querySelectorAll('.left_section_switcher');
        left_section_switcher.forEach(btn => btn.addEventListener('click', () => {
            this.main_container.querySelector('.left_section_switcher.active').classList.remove('active');
            btn.classList.add('active');
            const src = btn.getAttribute('data_src');

            this.main_container.querySelector('#' + src).scrollIntoView({ behavior: 'smooth' });
        }));
        
        
        var right_section_switcher = this.main_container.querySelectorAll('.right_section_switcher');
        right_section_switcher.forEach(btn => btn.addEventListener('click', () => {
            this.main_container.querySelector('.right_section_switcher.active').classList.remove('active');
            btn.classList.add('active');
            const src = btn.getAttribute('data_src');

            this.main_container.querySelector('#' + src).scrollIntoView({ behavior: 'smooth' });
        }));

    }

    ViewReturn(loader = '') {
        return `
<div class="single_radiology_visit_cont">
    <div class="top_card">
        <div class="Patient_imag">
            <img src="" alt="">
        </div>
        <div class="patient_detail">
            <div class="card name_card">
                <div class="dit_group">
                    <p class="name"></p>
                    <p class="description"> Patient id: <span></span></p>
                </div>
                <button type="button" data_src="" class="edit_btn">
                    <span class='switch_icon_edit'></span>
                </button>
            </div>
            <div class="card">
                ${['user', 'calendar_check', 'location_dot', 'phone', 'briefcase']
                .map(icon => `
                <div class="icon_card">
                    <span class='switch_icon_${icon}'></span>
                    <p></p>
                </div>
                `).join('')}
            </div>
        </div>
        <div class="loader_cont ${loader}">
            <div class="loader"></div>
        </div>
    </div>
    <div class="more_visit_detail">

        <div class="left_card">
            <div class="top">
                <div class="section_selection active left_section_switcher" data_src="order_section">
                    <p>Orders List</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>
                <div class="section_selection left_section_switcher" data_src="illness_section">
                    <p>Illness Info</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>
            </div>

            <div class="bottom">

                <div class="section order_section scroll_bar" id="order_section">

                    

                </div>


                <div class="section illness_section scroll_bar" id="illness_section">

                </div>


            </div>

        </div>

        <div class="right_card">

            <div class="top">

                <div class="section_selection right_section_switcher active" data_src="report">
                    <p>Fill Report</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>

                <div class="section_selection right_section_switcher" data_src="attachments">
                    <p>Post Attachments</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>
            </div>

            <div class="bottom">

                <div class="section" id="report">

                    <div class="report">
                        <div class="input_cont">
                            <p class="label">Comparison</p>
                            <textarea name="" class="textarea"></textarea>
                        </div>

                        <div class="input_cont">
                            <p class="label">Findings</p>
                            <textarea name="" class="textarea"></textarea>
                        </div>

                        <div class="input_cont">
                            <p class="label">Impression</p>
                            <textarea name="" class="textarea"></textarea>
                        </div>

                        <div class="input_cont">
                            <p class="label">Recommendation</p>
                            <textarea name="" class="textarea"></textarea>
                        </div>

                        <div class="btn_cont">
                            <button type="submit" class="btn">Submit</button>
                        </div>

                    </div>



                </div>

                <div class="section list scroll_bar" id="attachments">

                    <div class="dropzone" id="dropzone">
                        <div class="dropzone_content">
                            <div class="folder_icon">
                                <span class="switch_icon_folder_open"></span>
                            </div>
                            <p class="title">Drag Files Here Or <button class="browse_btn"
                                    id="browse_btn">Browse</button></p>
                            <p class="note">You can upload up to 5 files at a time.</p>

                            <input type="file" id="file_input" max="5" multiple="" hidden="">
                        </div>
                        <div class="file_list scroll_bar" id="file_list"></div>
                    </div>

                    <div class="image_list scroll_bar">

                        <div class="image_card">
                            <div class="info_side">
                                <div class="img_cont">
                                    <img src="https://i.pinimg.com/736x/17/4e/e6/174ee6f7fab20154de7105627250e03e.jpg"
                                        alt="">
                                </div>
                                <div class="info_cont">
                                    <p class="title">CT SCAN ABDOMINAL</p>
                                    <div class="g_cont">
                                        <p class="word">Kelvin Godliver</p>
                                        <p class="word">Feb 1, 2025</p>
                                    </div>
                                </div>
                            </div>

                            <div class="action_side">
                                <div class="open_btn icon_btn" title="Open Attachment">
                                    <span class="switch_icon_open_in_browser"></span>
                                </div>
                                <div class="delete_btn icon_btn" title="Delete Attachment">
                                    <span class="switch_icon_delete"></span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>





            </div>

        </div>

    </div>

</div>
`;
    }

    render_orders(orders) {
        const body = this.main_container.querySelector('#order_section');
        body.innerHTML = '';

        orders.forEach(order => {
            const card = document.createElement('div');
            card.className='order_card';
            
            card.innerHTML = `
                <div class="info">
                    <p class="title">${order.radiology_name}</p>
                    <p class="created_by">${order.created_by}</p>
                    <p class="date">${timeStamp_formatter(order.created_at)}</p>
                </div>
                <div class="action">
                    <div class="status ${order.status}"></div>
                    <div class="action_btn_cont">
                        <button type="submit" class="btn">
                        ${order.status === 'pending' ? 'Serve' : 'Submit Results'}
                        </button>
                    </div>
                </div>
            `;

            body.appendChild(card);
        });

    }

    render_illness_info(illness) {
        const body = this.main_container.querySelector('#illness_section');
        body.innerHTML = '';

        // render symptoms 
        const symptoms = document.createElement('div');
        symptoms.classList.add('illness_card');
        symptoms.innerHTML = `
            <p class="head">Symptoms</p>
            <ul>
                <li>${illness.symptoms}</li>
            </ul>
        `;
        body.appendChild(symptoms);
        
        // render diagnosis
        const diagnosis = document.createElement('div');
        diagnosis.classList.add('illness_card');
        diagnosis.innerHTML = `
            <p class="head">Diagnosis</p>
            <ul>
                ${illness.diagnosis.map(item => `<li>${item.diagnosis}</li>`).join('')}
            </ul>
        `;
        body.appendChild(diagnosis);
    

    }

    top_card_view(data) {
        const body = this.main_container.querySelector(' .top_card');
        body.innerHTML = `
<div class="Patient_imag">
    <img src="${data ? data.Patient_img : ''}" alt="">
</div>

<div class="patient_detail">
    <div class="card name_card">
        <div class="dit_group">
            <p class="name">${data ? data.name : ''}</p>
            <p class="description"> Patient id: <span>${data ? data.id : ''}</span></p>
        </div>
    </div>

    <div class="card">
        ${[
                { icon: 'user', value: data ? data.gender : '' },
                {
                    icon: 'calendar_check',
                    value: data ? `${date_formatter(data.dob)} (${data.age.amount} ${data.age.unit})` : ''
                },
                {
                    icon: 'location_dot',
                    value: data ? `${data.address} (${data.nationality})` : ''
                },
                {
                    icon: 'phone',
                    value: data ? `${data.phone} / ${data.alt_phone}` : ''
                },
                { icon: 'briefcase', value: data ? data.occupation : '' }
            ].map(item => `
        <div class="icon_card">
            <span class='switch_icon_${item.icon}'></span>
            <p>${item.value}</p>
        </div>
        `).join('')}
    </div>
</div>
`;
    }

    async fetchData() {
        try {
            const response = await fetch('/api/patient/single_visit_with_radiology_order_detail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            if (result.success) {
                console.log(result);

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




