import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, download, getFileCategory, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitAttachmentsCardView {
    constructor() {
        this.visit_id = null;
        this.datas = [];
        this.state = "creation";
        this.visit_status = null;
        this.edit_mode = false;
        window.remove_attachment_request = this.remove_attachment_request.bind(this);
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
            const cont = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont');
            const add_btn = document.querySelector('.single_visit_cont .more_visit_cards #clinical_group .card_group_cont .add_card_btn');
            if (add_btn) {
                add_btn.insertAdjacentElement('beforebegin', this.ViewReturn())
            }
            else {
                cont.appendChild(this.ViewReturn());
            }
            dashboardController.singleVisitView.add_to_rendered_card_array('visitsAttachmentPopUpView');
        }

        this.main_cont = document.querySelector('.attachment_card_cont_cont');

        this.renderAttachmentCards();

    }

    renderAttachmentCards() {
        const container = this.main_cont.querySelector('.body_part')

        container.innerHTML = '';

        if (this.datas.length > 0) {
            this.datas.forEach((data) => {


                const card = document.createElement('div');
                card.className = 'attachment_card';
                card.setAttribute('title', 'View Attachment');

                card.innerHTML = `
                    <div class="top">
                        <div class="icon">
                            <span class='${getFileCategory(data.file_name)}'></span>
                        </div>
                        <div class="other">
                            <div class="info">
                                <p class="head">${data.type}</p>
                                <div class="description">
                                    <p class="date">${date_formatter(data.created_at)}</p>
                                    <p class="created_by">${data.created_by}</p>
                                </div>
                            </div>
                            
                            <div class="action_btn">
                                <div class="btn download_btn" title="Download Attachment">
                                    <span class='switch_icon_file_download1'></span>
                                </div>
    
                                ${this.edit_mode ? `<div class="btn delete_btn" title="Remove Attachment">
                                    <span class='switch_icon_delete'></span>
                                </div>` : ``}
                            </div>

                        </div>
                    </div>
${data.note ? `
                    <div class="bottom">

                        <div class="note_cont">
                            <p class="head">Note</p>
                            <p class="note">${data.note}</p>    
                        </div>
                    </div>
                    `
                        : ''
                    }
                `;
                card.addEventListener('click', () => {
                    // open the link in black tab
                    window.open(data.url, '_blank');
                });

                // delete listener
                const download_btn = card.querySelector('.download_btn');
                download_btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    download(data.url, data.file_name);
                });
                // delete listener
                const delete_btn = card.querySelector('.delete_btn');
                if (delete_btn) {
                    delete_btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'remove_attachment_request',
                        parameter: data.id,
                        title: 'Remove Attachment',
                        sub_heading: `Attachment: ${data.type}`,
                        description: 'Are you sure you want to remove this attachment?',
                        ok_btn: 'Remove',
                        cancel_btn: 'Cancel'
                    });

                    this.singleSelectedToDelete = card;

                    });
                }

                container.prepend(card);
            })


        }

        this.datas = [];
    }

    ViewReturn() {
        const card = document.createElement('div');
        card.className = 'more_visit_detail_card';
        card.classList.add('attachment_card_cont_cont');

        card.innerHTML = `
            <div class="head_part">
                <h4 class="heading">Attachments</h4>

                <div class="add_btn ${this.edit_mode ? "" : "visibility_hidden"}" id="add_attachment">
                    <span class='switch_icon_add'></span>
                </div>
            </div>

            <div class="body_part attachment_card_cont scroll_bar">

                <!-- <div class="attachment_card">
                    <div class="top">
                        <div class="icon">
                            <span class='switch_icon_file_pdf'></span>
                        </div>
                        <div class="other">
                            <div class="info">
                                <p class="head">CT Scan</p>
                                <div class="description">
                                    <p class="date">12th May 2021</p>
                                    <p class="created_by">Dr. John Doe</p>
                                </div>
                            </div>
                            
                            <div class="action_btn">
                                <div class="btn">
                                    <span class='switch_icon_file_download1'></span>
                                </div>
    
                                <div class="btn delete_btn">
                                    <span class='switch_icon_delete'></span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="bottom">

                        <div class="note_cont">
                            <p class="head">Note</p>
                            <p class="note">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque quod consectetur debitis eligendi repellendus, dignissimos quae ullam provident illo non.</p>
                        </div>
                    
                    </div>

                </div> -->
                    
                </div>

            </div>
        `;

        const add_btn = card.querySelector('#add_attachment');
        if (this.edit_mode) {
            add_btn.addEventListener('click', () => {
                dashboardController.visitsAttachmentPopUpView.PreRender(
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

    async remove_attachment_request(id) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_attachment_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    attachment_id: id
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

            this.PreRender({
                data: result.data,
                state: 'modify',
                visit_id: this.visit_id
            });
            // if (this.singleSelectedToDelete) {
            //     this.singleSelectedToDelete.remove();
            //     this.singleSelectedToDelete = '';
            // }

        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            dashboardController.loaderView.remove();
        }
    }

}