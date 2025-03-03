import { dashboardController } from "../controller/DashboardController.js";
import { attachment_type_selects } from "../custom/customizing.js";
import { notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitsAttachmentPopUpView {
    constructor() {
        this.files = [];
        this.visit_id = '';
        this.state = 'creation';
    }

    async PreRender(params = '') {
        this.visit_id = params.visit_id || '';
        this.state = params.state || 'creation';
        this.visit_status = params.visit_status ? params.visit_status : 'checked_out';

        const popup = document.querySelector('.popup');
        popup.classList.add('active');
        popup.innerHTML = this.ViewReturn();

        this.container = document.querySelector('.attachment_popup');
        this.attachListeners();
        // this.addStyles();
    }

    ViewReturn() {
        return `
            <div class="container attachment_popup">
                <div class="popup_header">
                    <h2>Attachments</h2>
                    <div class="close_btn" id="close_popup">
                        <span class='switch_icon_close'></span>
                    </div>
                </div>

                <div class="popup_body">
                    <div class="form_group">
                        <br-select required name="allergy_type" id="attachment_type" fontSize="12px" label="Attachment Type" placeholder="Select Attachment type"
                            styles="${this.selectorStyle()}" labelStyles="font-size: 12px !important;">
        ${attachment_type_selects.map((type) => {
            return `<br-option type="checkbox" value="${type}">${type}</br-option>`
        }).join('')}
                        </br-select>

                    <br-input placeholder="Enter additional information" id="attachment_note" name="allergy_note"
                        label="Note" required type="textarea" styles="
                        border-radius: var(--input_main_border_r);
                        width: 552px;
                        padding: 10px;
                        height: 61px;
                        background-color: transparent;
                        border: 2px solid var(--input_border);
                        " labelStyles="font-size: 12px;"></br-input>
                    </div>

                    <div class="dropzone" id="dropzone">
                        <div class="dropzone_content">
                            <div class="folder_icon">
                                <span class='switch_icon_folder_open'></span>
                            </div>
                            <p class="title">Drag Files Here Or <button class="browse_btn" id="browse_btn">Browse</button></p>
                            <p class="note">You can upload up to 5 files at a time.</p>
                            
                            <input type="file" id="file_input" max="5" multiple hidden>
                        </div>
                        <div class="file_list scroll_bar" id="file_list"></div>
                    </div>

                    <div class="button_group">
                        <button class="cancel_btn" id="cancel_btn">Cancel</button>
                        <button class="submit_btn disabled" id="submit_btn">Submit</button>
                    </div>
                </div>
            </div>
        `;
    }

    attachListeners() {
        const closeBtn = this.container.querySelector('#close_popup');
        const cancelBtn = this.container.querySelector('#cancel_btn');
        const browseBtn = this.container.querySelector('#browse_btn');
        const fileInput = this.container.querySelector('#file_input');
        const dropzone = this.container.querySelector('#dropzone');
        const attachmentType = this.container.querySelector('#attachment_type');
        const submitBtn = this.container.querySelector('#submit_btn');

        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        browseBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });

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

        attachmentType.addEventListener('change', () => {
            console.log('Attachment type changed');

            this.updateSubmitButton();
        });

        submitBtn.addEventListener('click', () => {
            this.handleSubmit();
        });
    }

    selectorStyle() {
        return `
        border-radius: var(--input_main_border_r);
        width: 100%;
        padding: 10px;
        height: 41px;
        background-color: transparent;
        border: 2px solid var(--input_border);
        `;
    }

    handleFiles(newFiles) {
        // check file limit 
        if (this.files.length + newFiles.length > 6) {
            // Add error notification here
            notify('top_left', 'Maximum limit reached! You can only upload up to 5 files.', 'warning');
            return;
        }
        this.files = [...this.files, ...newFiles];
        this.updateFileList();
        this.updateSubmitButton();
    }

    updateFileList() {
        const fileList = this.container.querySelector('#file_list');
        fileList.innerHTML = this.files.map((file, index) => `
            <div class="file_item">
                <p>${file.name}</p>
                <button class="remove_btn" data-index="${index}">
                    <span class='switch_icon_close'></span>
                </button>
            </div>
        `).join('');

        // Add remove button listeners
        fileList.querySelectorAll('.remove_btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.files.splice(parseInt(btn.dataset.index), 1);
                this.updateFileList();
                this.updateSubmitButton();
            });
        });
    }

    updateSubmitButton() {
        const submitBtn = this.container.querySelector('#submit_btn');
        const attachmentType = this.container.querySelector('#attachment_type');

        if (!attachmentType.getValue() || this.files.length == 0) {
            submitBtn.classList.add('disabled');
            return;
        }
        submitBtn.classList.remove('disabled');
    }

    async handleSubmit() {

        const attachmentNote = this.container.querySelector('#attachment_note').getValue();
        const attachmentType = this.container.querySelector('#attachment_type').getValue();
        if (!attachmentType || this.files.length === 0) return;

        const formData = new FormData();
        formData.append('visit_id', this.visit_id);
        formData.append('attachment_type', attachmentType);
        formData.append('attachment_note', attachmentNote);

        this.files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('/api/patient/upload_attachments', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

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
                dashboardController.visitAttachmentsCardView.PreRender({
                    visit_id: this.visit_id,
                    data: result.data,
                    state: this.state,
                    visit_status: this.visit_status
                });
                notify('top_left', result.message, 'success');
                this.close();
            }
            else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', 'Fail To Upload Files.', 'error');
        }
    }

    close() {
        const popup = document.querySelector('.popup');
        popup.classList.remove('active');
        popup.innerHTML = '';
    }


}