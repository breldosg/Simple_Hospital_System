import { dashboardController } from "../controller/DashboardController.js";
import { visit_add_card_btn } from "../custom/customizing.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, date_formatter, notify, scrollToItem, timeStamp_formatter, uploadWithProgress } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class SingleVisitRadiologyView {
    constructor() {
        // delete_radiology_report_attachment
        window.delete_radiology_report_attachment = this.delete_radiology_report_attachment.bind(this);
        this.visit_id = null;
        this.current_clicked = null;
        this.single_radiology_data = null;
        this.active_order_data = null;
        this.on_uploading_cards = [];
        this.card_to_delete = null;
        this.edit_mode = true;

        applyStyle(this.style(), 'SingleVisitRadiologyView');
    }

    async PreRender(params) {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // Update state but don't trigger render yet
        this.current_clicked = null;
        this.single_radiology_data = null;
        this.active_order_data = null;
        this.on_uploading_cards = [];
        this.card_to_delete = null;

        this.rendered_card = [];
        this.visit_id = params.id;

        // Render initial structure
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn('active');

        this.main_container = document.querySelector('.single_radiology_visit_cont');

        // Render patient detail component
        dashboardController.patientDetailComponent.PreRender({
            container: this.main_container,
            visit_id: this.visit_id,
            location: 'other_pages',
        })

        this.render(this.visit_id);
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
<div class="single_radiology_visit_cont">
    
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
                    <p class="title">${order.radiology_name}</p>
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
                    this.publish_radiology_order(order.id)
                });
            }

            const revertBtn = card.querySelector('.action_btn_cont button[type="revert"]');
            if (revertBtn) {
                revertBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.revert_radiology_order(order.id)
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
                this.render_order_infos_and_form(order.report, order.report_attachment);
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
        const bodyContainer = this.main_container.querySelector(' .more_visit_detail');
        const body = this.main_container.querySelector(' .right_card');
        scrollToItem(bodyContainer, body, 'fast');
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
        uploadWithProgress('/api/radiology/upload_attachments', formData, (progress) => {
            if (this.active_order_data.id == order_id) {
                const progress_bar = card.querySelector('.uploading_progress .counter');
                progress_bar.innerHTML = `${progress}%`;
            }
        }).then(response => {
            if (this.active_order_data.id == order_id) {
                card.remove();

                this.single_radiology_data.forEach(data => {
                    if (data.id == order_id) {
                        data.report_attachment.push(response.data[0]);
                        data.status = 'approved';
                    }
                })

                // the complete pending uploading file on the list
                this.on_uploading_cards = this.on_uploading_cards.filter(data => (data.file_card_id.toString() != file_card_id.toString()));
                var attachment_to_render = this.single_radiology_data.find(data => data.id == this.active_order_data.id);
                this.render_uploaded_attachments(attachment_to_render.report_attachment);

            }
            this.render_orders(this.single_radiology_data);

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
                        callback: 'delete_radiology_report_attachment',
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
        const bodyContainer = this.main_container.querySelector(' .more_visit_detail');
        const body = this.main_container.querySelector('.right_card');
        scrollToItem(bodyContainer, this.main_container.querySelector('.left_card'), 'fast');
        console.log('hapa');

        body.innerHTML = `
                <div class="example">
                    <p>No Order Selected</p>
                </div>
            `;

        this.render_orders(this.single_radiology_data);
        this.current_clicked = null;
        this.active_order_data = null;

    }

    async validate_submit_report() {
        const form = this.main_container.querySelectorAll('#report_form textarea');
        var data_to_submit = {};

        let isValid = true;
        form.forEach(input => {
            if (input.hasAttribute('required')) {
                var value = input.value.trim();
                if (value == '') {
                    isValid = false;
                    input.classList.add('error');
                }
                else {
                    input.classList.remove('error');
                    data_to_submit[input.name] = value;
                }
            }
            else {
                input.classList.remove('error');
                data_to_submit[input.name] = input.value;
            }
        });

        if (!isValid) {
            notify('top_left', 'Please fill all fields.', 'warning');
            return;
        }

        await this.submit_report(data_to_submit);
    }

    async submit_report(data) {

        const btn = this.main_container.querySelector('.bottom .submit');
        btn.setAttribute('loading', true);
        var active_data = this.active_order_data;

        var body_form = {
            ...data,
            visit_id: this.visit_id,
            order_id: this.active_order_data.id
        };

        try {
            const response = await fetch('/api/radiology/save_radiology_order_report', {
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
            this.single_radiology_data.forEach(data => {
                if (data.id == active_data.id) {
                    data.report = result.data;
                    data.status = 'approved';
                }
            })



            if (active_data.id == this.active_order_data.id) {
                this.render_report_view(result.data);
            }

            this.render_orders(this.single_radiology_data);

        } catch (error) {
            console.error('Error:', error);
            notify('top_left', 'Failed To Save Prescription.', 'error');
        } finally {
            btn.removeAttribute('loading');
        }

    }

    render_report_view(report_data) {

        const report_form = this.main_container.querySelector('#report_form');
        report_form.innerHTML = '';

        const report_fields = ['comparison', 'findings', 'impression', 'recommendation'];
        const required_fields = ['findings', 'impression'];

        report_fields.forEach(field => {
            const input_container = document.createElement('div');
            input_container.classList.add('input_cont');

            input_container.innerHTML = `
                <p class="label">${field.charAt(0).toUpperCase() + field.slice(1)}</p>
                <textarea name="${field}" ${required_fields.includes(field) ? 'required' : ''} class="textarea ${this.edit_mode ? '' : 'disabled'}">${report_data[field] ?? ''}</textarea>
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

        report_form.appendChild(btn_cont);
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
            const response = await fetch('/api/radiology/single_visit_with_radiology_order_detail', {
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


                this.single_radiology_data = result.data.radiology_orders;
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


    async delete_radiology_report_attachment(id) {
        try {
            const response = await fetch('/api/radiology/delete_attachments_files', {
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
                this.card_to_delete.remove();
                this.single_radiology_data = result.data;
                this.render_orders(this.single_radiology_data);
            } else {
                notify('top_left', result.message, 'warning');
                return null;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }


    async publish_radiology_order(id) {
        try {
            const response = await fetch('/api/radiology/publish_radiology_order', {
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
                this.single_radiology_data = result.data;

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

    async revert_radiology_order(id) {
        try {
            const response = await fetch('/api/radiology/revert_radiology_order', {
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
                this.single_radiology_data = result.data;

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

    style() {
        return `

        .single_radiology_visit_cont {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            overflow-y: scroll;


            .loader_cont {
                border-radius: var(--main_border_r);
                position: absolute;
            }

            

            .more_visit_detail {
                width: 100%;
                display: grid;
                grid-template-columns: repeat(3, minmax(300px, 1fr));
                gap: 20px;
                height: 100%;
                flex: none;

                .btn {
                    border: none;
                    background-color: var(--pri_color);
                    padding: 10px 10px;
                    font-weight: bold;
                    font-size: 12px;
                    color: var(--white);
                    cursor: pointer;
                    border-radius: var(--input_main_border_r);
                    text-align: center;
                    width: 103px;
                }

                .cancel {
                    background-color: var(--gray_text);
                }


                .left_card {
                    height: 100%;
                    background-color: var(--pure_white_background);
                    border-radius: var(--main_border_r);
                    padding: var(--main_padding);
                    overflow: auto;
                    gap: 5px;
                    display: flex;
                    flex-direction: column;

                    .top {
                        width: 100%;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        .section_selection {
                            padding: 10px;
                            display: flex;
                            flex-direction: column;
                            gap: 5px;
                            width: 45%;
                            cursor: pointer;
                            border-radius: var(--main_border_r);

                            .line {
                                width: 100%;
                                height: 4px;
                                border-radius: 3px;
                                overflow: hidden;

                                .line_in {
                                    width: 0%;
                                    height: 100%;
                                    background-color: var(--light_pri_color);
                                }

                            }

                            p {
                                font-size: 14px;
                                font-weight: 600;
                            }
                        }

                        .section_selection.active {
                            background-color: var(--pri_op2);

                            p {
                                color: var(--light_pri_color);
                            }

                            .line_in {
                                width: 100%;
                                -webkit-animation: scale-in-hor-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                                animation: scale-in-hor-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                            }
                        }

                        .section_selection:hover {
                            background-color: var(--pri_op2);
                            color: var(--white);
                            border-radius: 5px;

                            p {
                                color: var(--light_pri_color);
                            }

                            .line_in {
                                width: 100%;
                                -webkit-animation: scale-in-hor-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                                animation: scale-in-hor-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                            }
                        }
                    }

                    .bottom {
                        height: calc(100% - 50px);
                        width: 100%;
                        overflow: hidden;
                        display: flex;
                        gap: var(--main_padding);

                        .section {
                            width: 100%;
                            height: 100%;
                            flex: none;
                            padding-block: 10px;

                        }

                        .order_section {
                            overflow-y: scroll;
                            display: flex;
                            flex-direction: column;
                            gap: 5px;


                            .order_card {
                                display: flex;
                                justify-content: space-between;
                                width: 100%;
                                height: 90px;
                                padding: 20px;
                                border-radius: var(--main_border_r);
                                border: solid 1px var(--pri_border_color);
                                cursor: pointer;

                                .info {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: start;
                                    justify-content: center;
                                    width: 50%;

                                    .title {
                                        font-weight: 900;
                                        width: 100%;
                                        white-space: nowrap;
                                        text-overflow: ellipsis;
                                        overflow: hidden;
                                        display: inline-block;
                                    }

                                    .created_by,
                                    .date {
                                        font-size: 10px;
                                        width: 100%;
                                        white-space: nowrap;
                                        text-overflow: ellipsis;
                                        overflow: hidden;
                                        display: inline-block;
                                    }
                                }


                                .action {
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    height: 100%;
                                    gap: 10px;

                                    .status {
                                        width: 10px;
                                        height: 10px;
                                        border-radius: 5px;
                                    }

                                    .complete {
                                        background-color: var(--success_color);
                                    }

                                    .approved {
                                        background-color: var(--warning_color);
                                    }

                                    .pending {
                                        background-color: var(--error_color);
                                    }
                                }
                            }

                            .order_card:hover {
                                background: var(--pri_op1);
                            }

                            .order_card.active {
                                background: var(--pri_op1);
                            }

                        }

                        .illness_section {
                            overflow-y: scroll;
                            display: flex;
                            flex-direction: column;
                            gap: 15px;


                            .illness_card {
                                display: flex;
                                flex-direction: column;
                                gap: 8px;

                                .head {
                                    color: var(--pri_color);
                                    padding-bottom: 10px;
                                    font-weight: 700;
                                    border-bottom: 2px solid var(--active_color);
                                    font-size: 14px;
                                }

                                ul {
                                    display: flex;
                                    flex-direction: column;
                                    gap: 5px;
                                    font-weight: 600;
                                    padding-left: 15px;

                                    li {
                                        width: 90%;
                                    }
                                }
                            }
                        }

                    }
                }

                .right_card {
                    height: 100%;
                    grid-column-start: 2;
                    grid-column-end: 4;
                    background-color: var(--pure_white_background);
                    border-radius: var(--main_border_r);
                    padding: var(--main_padding);
                    overflow-y: auto;

                    .top {
                        width: 100%;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        .section_selection {
                            padding: 10px;
                            display: flex;
                            flex-direction: column;
                            gap: 5px;
                            width: 45%;
                            cursor: pointer;
                            border-radius: var(--main_border_r);

                            .line {
                                width: 100%;
                                height: 4px;
                                border-radius: 3px;
                                overflow: hidden;

                                .line_in {
                                    width: 0%;
                                    height: 100%;
                                    background-color: var(--light_pri_color);
                                }

                            }

                            p {
                                font-size: 14px;
                                font-weight: 600;
                            }
                        }

                        .section_selection.active {
                            background-color: var(--pri_op2);

                            p {
                                color: var(--light_pri_color);
                            }

                            .line_in {
                                width: 100%;
                                -webkit-animation: scale-in-hor-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                                animation: scale-in-hor-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                            }
                        }

                        .section_selection:hover {
                            background-color: var(--pri_op2);
                            color: var(--white);
                            border-radius: 5px;

                            p {
                                color: var(--light_pri_color);
                            }

                            .line_in {
                                width: 100%;
                                -webkit-animation: scale-in-hor-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                                animation: scale-in-hor-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                            }
                        }
                    }

                    .bottom {
                        height: calc(100% - 50px);
                        width: 100%;
                        overflow: hidden;
                        display: flex;
                        gap: var(--main_padding);

                        .section {
                            width: 100%;
                            height: 100%;
                            flex: none;
                            padding-block: 10px;

                            .dropzone {
                                border: 2px dashed var(--input_border);
                                border-radius: 8px;
                                padding: 20px 32px;
                                text-align: center;
                                transition: border-color 0.3s;

                                .folder_icon {
                                    margin-bottom: 16px;

                                    span {
                                        color: var(--pri_color);
                                        font-size: 30px;
                                    }
                                }

                                .title {
                                    font-weight: 700;

                                    .browse_btn {
                                        color: var(--pri_color);
                                        background: none;
                                        border: none;
                                        font-weight: 900;
                                        cursor: pointer;
                                    }
                                }

                                .note {
                                    margin: 0 0 8px 0;
                                    color: var(--gray_text);
                                }
                            }

                            .dragover {
                                border-color: #00bcd4;
                                background: #f0fdff;
                            }

                            .file_list {
                                display: flex;
                                flex-direction: column;
                                gap: 10px;
                                height: 100%;
                                overflow-y: scroll;


                                .file_card {
                                    display: flex;
                                    justify-content: space-between;
                                    width: 100%;
                                    height: auto;
                                    cursor: pointer;
                                    padding: 10px;
                                    border-radius: var(--main_border_r);
                                    border: solid 1px var(--pri_border_color);
                                    overflow: hidden;
                                    flex: none;

                                    .info_side {
                                        display: flex;
                                        align-items: center;
                                        gap: 10px;
                                        width: 70%;


                                        .img_cont {
                                            width: 60px;
                                            height: 60px;
                                            position: relative;
                                            border-radius: 10px;
                                            overflow: hidden;
                                            flex: none;

                                            img {
                                                width: 100%;
                                                height: 100%;
                                                object-fit: cover;
                                                object-position: center center;
                                            }
                                        }

                                        .info_cont {
                                            display: flex;
                                            flex-direction: column;
                                            width: calc(100% - 60px);

                                            .title {
                                                font-size: 16px;
                                                font-weight: 900;
                                            }

                                            p {
                                                width: 100%;
                                                white-space: nowrap;
                                                text-overflow: ellipsis;
                                                overflow: hidden;
                                                display: inline-block;
                                            }
                                        }

                                    }

                                    .uploading {
                                        width: 30%;
                                        justify-content: end;
                                    }

                                    .action_side {
                                        height: 100%;
                                        display: flex;
                                        align-items: center;
                                        gap: 10px;

                                        .icon_btn {
                                            width: 35px;
                                            height: 35px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            cursor: pointer;
                                            border-radius: 5px;
                                            flex: 0 0 auto;

                                            span {
                                                font-size: 16px;
                                            }
                                        }

                                        .open_btn:hover {
                                            background-color: var(--pri_op);

                                            span {
                                                color: var(--pri_color);
                                            }
                                        }

                                        .delete_btn:hover {
                                            background-color: var(--white_error_color_op1);

                                            span {
                                                color: var(--error_color);
                                            }
                                        }

                                        .uploading_progress {
                                            height: 100%;
                                            display: flex;
                                            flex-direction: column;
                                            justify-content: center;
                                            align-items: center;
                                            /* gap: 5px; */

                                            .title {
                                                font-weight: 700;
                                                font-size: 10px;
                                            }

                                            .counter {
                                                font-weight: 900;
                                                font-size: 16px;
                                            }
                                        }

                                    }
                                }

                                .file_card:hover {
                                    background: var(--pri_op1);
                                }
                            }

                            .report {
                                width: 100%;
                                height: 100%;
                                display: flex;
                                flex-direction: column;
                                gap: 10px;

                                .input_cont {
                                    width: 100%;
                                    height: 40%;

                                    .textarea {
                                        width: 100%;
                                        height: calc(100% - 14px);
                                        border: 2px solid var(--input_border);
                                        padding: 10px;
                                        border-radius: 8px;
                                        resize: none;
                                        overflow-y: scroll;
                                        outline: none;
                                        background-color: transparent;
                                    }

                                    .error {
                                        border-color: var(--error_color);
                                    }
                                }

                                .btn_cont {
                                    width: 100%;
                                    height: 50px;
                                    display: flex;
                                    justify-content: end;
                                    align-items: center;
                                    gap: 10px;
                                    flex: none;

                                    .staff_data {
                                        margin-right: auto;

                                        .label {
                                            font-weight: 600;
                                            color: var(--gray_text);
                                        }
                                    }
                                }

                            }

                        }

                        .list {
                            overflow-y: scroll;
                            gap: 5px;
                            display: flex;
                            flex-direction: column;
                        }
                    }
                }

            }


        }

        @media screen and (max-width: 850px) {
            .single_radiology_visit_cont{
                .more_visit_detail {
                    display: flex;
                    flex-direction: row;
                    gap: 10px;
                    overflow-x: hidden;
                    flex:none;
                    scroll-snap-type: x mandatory;
                    scroll-behavior: smooth;

                    .left_card,.right_card{
                        scroll-snap-align: start;
                        width: 100%;
                        flex:none;
                    }
                }
            }
        }

        `
    }

}
