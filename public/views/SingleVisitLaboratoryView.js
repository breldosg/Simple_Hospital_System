import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, timeStamp_formatter, uploadWithProgress } from "../script/index.js";

export class SingleVisitLaboratoryView {
    constructor() {
        window.delete_laboratory_report_attachment = this.delete_laboratory_report_attachment.bind(this);
        this.visit_id = null;
        this.current_clicked = null;
        this.single_laboratory_data = null;
        this.active_order_data = null;
        this.on_uploading_cards = [];
        this.card_to_delete = null;

        this.edit_mode = true;
    }

    async PreRender(params) {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // Update state but don't trigger render yet
        this.current_clicked = null;
        this.single_laboratory_data = null;
        this.active_order_data = null;
        this.on_uploading_cards = [];
        this.card_to_delete = null;

        this.rendered_card = [];
        this.visit_id = params.id;

        // Render initial structure
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('active');

        this.main_container = document.querySelector('.single_laboratory_visit_cont');

        // Render patient detail component
        dashboardController.patientDetailComponent.PreRender({
            container: this.main_container,
            visit_id: this.visit_id,
        })

        this.render();
        this.add_listeners();

    }

    async render() {
        const visit_data = await this.fetchData();

        if (!visit_data) return;

        // Render top patient card
        // this.top_card_view(visit_data.patient_data);

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

    }

    ViewReturn(loader = '') {
        return `
<div class="single_laboratory_visit_cont">
    
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

                <div class="example">
                    <p>No Order Selected</p>
                </div>

        </div>

    </div>

</div>
`;
    }

    render_orders(orders) {
        const body = this.main_container.querySelector('#order_section');
        body.innerHTML = '';
        console.log(orders);

        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'order_card';
            card.dataset.id = order.id;

            if (this.active_order_data != null && this.active_order_data.id == order.id) {
                card.classList.add('active');
                this.current_clicked = card;
                this.active_order_data = order;
            }

            card.innerHTML = `
                <div class="info">
                    <p class="title">${order.lab_test_name}</p>
                    <p class="created_by">${order.created_by}</p>
                    <p class="date">${timeStamp_formatter(order.created_at)}</p>
                </div>
                <div class="action">
                    <div class="status ${order.status}"></div>
                    <div class="action_btn_cont">
                        <button type="${order.status === 'complete' ? 'revert' : 'publish'}" class="btn ${order.status == 'pending' ? 'disabled' : ''}">
                        ${order.status === 'complete' ? 'Revert' : 'Publish'}
                        </button>
                    </div>
                </div>
            `;

            const publishBtn = card.querySelector('.action_btn_cont button[type="publish"]')
            if (publishBtn) {
                publishBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.publish_laboratory_order(order.id)
                });
            }


            const revertBtn = card.querySelector('.action_btn_cont button[type="revert"]');
            if (revertBtn) {
                revertBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.revert_laboratory_order(order.id)
                });
            }


            card.addEventListener('click', () => {
                if (this.current_clicked) {
                    this.current_clicked.classList.remove('active');
                }
                this.edit_mode = order.status == 'complete' || order.status == 'pending' ? false : true;
                this.active_order_data = order;
                this.current_clicked = card;
                card.classList.add('active');
                this.render_order_infos_and_form(order.lab_test_items, order.report_attachment);
            })

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

    render_order_infos_and_form(report_data, attachments_data) {

        const body = this.main_container.querySelector(' .right_card');
        body.innerHTML = '';

        const top = document.createElement('div');
        top.className = 'top';

        top.innerHTML = `
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
        `;

        var right_section_switcher = top.querySelectorAll('.right_section_switcher');
        right_section_switcher.forEach(btn => btn.addEventListener('click', () => {
            top.querySelector('.right_section_switcher.active').classList.remove('active');
            btn.classList.add('active');
            const src = btn.getAttribute('data_src');

            body.querySelector('#' + src).scrollIntoView({ behavior: 'smooth' });
        }));

        body.appendChild(top);

        const bottom = document.createElement('div');
        bottom.className = 'bottom';


        bottom.innerHTML = `
                <div class="section" id="report">

                    <div class="report" id="report_form">
                        

                    </div>



                </div>

                <div class="section list scroll_bar" id="attachments">

                ${this.edit_mode ? `
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
                    </div>
                    `: ''

            }

                    <div class="file_list scroll_bar">

                    </div>

                </div>

        `;

        const browseBtn = bottom.querySelector('#browse_btn');
        if (browseBtn) {

            browseBtn.addEventListener('click', () => fileInput.click());
            const fileInput = bottom.querySelector('#file_input');
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(Array.from(e.target.files));
            });

            const dropzone = bottom.querySelector('#dropzone');


            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });


            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('dragover');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
                this.handleFiles(Array.from(e.dataTransfer.files));
            });
        }

        body.appendChild(bottom);
        this.render_report_view(report_data);
        this.render_uploaded_attachments(attachments_data);

    }

    handleFiles(files) {
        if (files.length > 5) {
            notify('top_left', 'Maximum 5 files can be uploaded', 'warning');
            return;
        }
        for (const file of files) {

            if (file.size > 20 * 1024 * 1024) {
                notify('top_left', 'File too large. Maximum size is 20MB', 'error');
                return;
            }

            const file_card_id = `file_card_${Date.now()}`;

            // this.render_on_upload_attachment(file, file_card_id)
            this.render_on_upload_attachment({
                data: {
                    'file': file,
                    'file_card_id': file_card_id,
                    'order_id': this.active_order_data.id
                },
                single: true
            })



            this.uploadFile(file, file_card_id);
        }
    }

    uploadFile(file, file_card_id) {
        var order_id = this.active_order_data.id;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("visit_id", this.visit_id);
        formData.append("order_id", order_id);

        const card = this.main_container.querySelector('#' + file_card_id);
        uploadWithProgress('/api/laboratory/upload_attachments', formData, (progress) => {
            if (this.active_order_data.id == order_id) {
                const progress_bar = card.querySelector('.uploading_progress .counter');
                progress_bar.innerHTML = `${progress}%`;
            }
        }).then(response => {
            if (this.active_order_data.id == order_id) {
                card.remove();

                this.single_laboratory_data.forEach(data => {
                    if (data.id == order_id) {
                        data.report_attachment.push(response.data[0]);
                        data.status = 'approved';
                    }
                })

                // the complete pending uploading file on the list
                this.on_uploading_cards = this.on_uploading_cards.filter(data => (data.file_card_id.toString() != file_card_id.toString()));
                var attachment_to_render = this.single_laboratory_data.find(data => data.id == this.active_order_data.id);
                this.render_uploaded_attachments(attachment_to_render.report_attachment);

            }
            this.render_orders(this.single_laboratory_data);

            notify('top_left', 'Upload Complete', 'success');
        }).catch(error => {
            console.error(error);
            notify('top_left', 'Upload Failed', 'error');
            card.classList.add('error');
        });
    }

    render_on_upload_attachment(data = { 'single': false }) {
        const file_list = this.main_container.querySelector('.file_list');

        var to_render = this.on_uploading_cards;

        if (data.single) {
            this.on_uploading_cards.push(data.data);
            to_render = [data.data];
        }


        if (to_render.length <= 0) return;

        to_render.forEach(card => {


            if (card.order_id == this.active_order_data.id) {
                const file_card = document.createElement('div');
                file_card.classList.add('file_card');
                file_card.setAttribute('id', card.file_card_id);
                file_card.innerHTML = `
                <div class="info_side">
                    <div class="img_cont">
                        <img src="${URL.createObjectURL(card.file)}"
                            alt="">
                    </div>
                    <div class="info_cont">
                        <p class="title">${card.file.name}</p>
                        <div class="g_cont">
                            <p class="word">Uploading</p>
                        </div>
                    </div>
                </div>
    
                <div class="action_side uploading">
                    <div class="uploading_progress">
                        <p class="title">Uploading</p>
                        <p class="counter">0%</p>
                    </div>
    
                    <div class="delete_btn icon_btn" title="Cancel Uploading">
                        <span class="switch_icon_close"></span>
                    </div>
                </div>
            
            `;
                file_list.prepend(file_card);
            }
        })


    }

    render_uploaded_attachments(order_attachment) {
        const file_list = this.main_container.querySelector('.file_list');
        file_list.innerHTML = '';

        order_attachment.forEach((file) => {
            const file_card = document.createElement('div');
            file_card.classList.add('file_card');
            file_card.innerHTML = `
        
            <div class="info_side">
                <div class="img_cont">
                    <img src="${file.url}"
                        alt="">
                </div>
                <div class="info_cont">
                    <p class="title">${file.file_name}</p>
                    <div class="g_cont">
                        <p class="word">${file.created_by}</p>
                        <p class="word">${timeStamp_formatter(file.created_at)}</p>
                    </div>
                </div>
            </div>

            <div class="action_side">
                <div class="open_btn icon_btn" title="Open Attachment">
                    <span class="switch_icon_arrow_up_right_from_square"></span>
                </div>
                <div class="delete_btn icon_btn ${this.edit_mode ? '' : 'disabled'}" title="Delete Attachment">
                    <span class="switch_icon_delete"></span>
                </div>
            </div>
        
        `;

            // add listener to btns
            file_card.querySelector('.open_btn').addEventListener('click', () => {
                window.open(file.url, '_blank');
            });

            if (this.edit_mode) {
                file_card.querySelector('.delete_btn').addEventListener('click', () => {
                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'delete_laboratory_report_attachment',
                        parameter: file.id,
                        title: 'Remove Attachment File',
                        sub_heading: `Attachment For: ${file.file_name}`,
                        description: 'Are you sure you want to remove this attachment?',
                        ok_btn: 'Remove',
                        cancel_btn: 'Cancel'
                    });

                    this.card_to_delete = file_card;
                });
            }

            file_list.prepend(file_card);
        })

        this.render_on_upload_attachment();
    }


    render_example() {
        const body = this.main_container.querySelector('.right_card');
        body.innerHTML = `
                <div class="example">
                    <p>No Order Selected</p>
                </div>
            `;

        this.render_orders(this.single_laboratory_data);
        this.current_clicked = null;
        this.active_order_data = null;

    }

    async validate_submit_report() {
        const form = this.main_container.querySelectorAll('#report_form input');
        var data_to_submit = [];

        let isValid = false;
        form.forEach(input => {
            var value = input.value.trim();
            if (value !== '') {
                isValid = true;
                input.classList.remove('error');
                // data_to_submit[input.name] = value;

                data_to_submit.push({
                    test_item_id: input.name,
                    result: value
                })
            }
        });

        if (!isValid) {
            notify('top_left', 'Please Fill Required Fields.', 'warning');
            return;
        }

        await this.submit_report(data_to_submit);
    }

    async submit_report(data) {

        const btn = this.main_container.querySelector('.bottom .submit');
        btn.setAttribute('loading', true);
        var active_data = this.active_order_data;

        var body_form = {
            items: data,
            visit_id: this.visit_id,
            order_id: this.active_order_data.id
        };

        try {
            const response = await fetch('/api/laboratory/save_laboratory_order_report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body_form)
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();


            if (!result.success) {
                notify('top_left', result.message, 'warning');
                return;
            }

            notify('top_left', result.message, 'success');
            this.single_laboratory_data.forEach(data => {
                if (data.id == active_data.id) {
                    data.lab_test_items = result.data;
                    data.status = 'approved';
                }
            })



            if (active_data.id == this.active_order_data.id) {
                this.render_report_view(result.data);
            }

            this.render_orders(this.single_laboratory_data);

        } catch (error) {
            console.error('Error:', error);
            notify('top_left', 'Failed To Save Prescription.', 'error');
        } finally {
            btn.removeAttribute('loading');
        }

    }

    render_report_view(report_data) {
        console.log(report_data);

        const report_form_cont = this.main_container.querySelector('#report_form');
        report_form_cont.innerHTML = '';

        const report_form = document.createElement('div');
        report_form.classList.add('input_cont_cont');

        const report_fields = report_data;

        report_fields.forEach(field => {
            const input_container = document.createElement('div');
            input_container.classList.add('input_cont');
            console.log();

            input_container.innerHTML = `
                <div class="input_top">
                    <p class="label">${field.name}</p>
                    <p class="field_unit">${field.unit}</p>
                </div>
                <input type="text" name="${field.id}" value="${field.result ?? ''}"  class="textarea ${this.edit_mode ? '' : 'disabled'}"></input>
                <div class="input_info_icon">
                    <p class="meta_data">
                        ${field.normal_range && field.normal_range.trim() != '' ? field.normal_range : 'No Range To Show.'}
                    </p>
                    
                    <span class="switch_icon_info_outline"></span>
                </div>
            `;

            report_form.appendChild(input_container);
        })


        const btn_cont = document.createElement('div');
        btn_cont.classList.add('btn_cont');
        btn_cont.innerHTML = `
        ${report_data.created_by ? `
            <div class="staff_data">
                <p class="label">Served By: ${report_data.created_by}</p>
                <p class="label">Served At: ${timeStamp_formatter(report_data.created_at)}</p>
            </div>
            `: ''}
            `;

        const cancel_btn = document.createElement('button');
        cancel_btn.className = 'btn cancel';
        cancel_btn.setAttribute('type', 'cancel');
        cancel_btn.textContent = 'Cancel';
        cancel_btn.addEventListener('click', () => {
            this.render_example();
        });

        btn_cont.appendChild(cancel_btn);

        const submit_btn = document.createElement('br-button');
        submit_btn.className = 'btn submit';
        this.edit_mode ? '' : submit_btn.classList.add('disabled');
        submit_btn.setAttribute('type', 'submit');
        submit_btn.setAttribute('loader_width', '23');
        submit_btn.textContent = report_data.comparison ? 'Update' : 'Submit';
        submit_btn.addEventListener('click', () => {
            this.validate_submit_report();
        });

        btn_cont.appendChild(submit_btn);

        report_form_cont.prepend(report_form);
        report_form_cont.appendChild(btn_cont);
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
            const response = await fetch('/api/laboratory/single_laboratory_visit_detail', {
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
                this.single_laboratory_data = result.data.radiology_orders;
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

    async delete_laboratory_report_attachment(id) {
        try {
            const response = await fetch('/api/laboratory/delete_attachments_files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    attachment_id: id,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                this.card_to_delete.remove();
                this.single_laboratory_data = result.data;
                this.render_orders(this.single_laboratory_data);
            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    async publish_laboratory_order(id) {
        try {
            const response = await fetch('/api/laboratory/publish_laboratory_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    order_id: id,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                this.single_laboratory_data = result.data;

                // clear all constructor and run example view
                this.render_example();

            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    async revert_laboratory_order(id) {
        try {
            const response = await fetch('/api/laboratory/revert_laboratory_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    order_id: id,
                })
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();

            if (result.success) {
                notify('top_left', result.message, 'success');
                this.single_laboratory_data = result.data;

                // clear all constructor and run example view
                this.render_example();

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
