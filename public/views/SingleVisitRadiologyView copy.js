import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";

export class SingleVisitRadiologyView {
    constructor() {
        // Initialize state
        this.state = {
            visitId: null,
            activeLeftSection: 'orders',
            activeRightSection: 'report',
            uploadedFiles: [],
            reportData: {
                comparison: '',
                findings: '',
                impression: '',
                recommendation: ''
            },
            isLoading: false
        };

        // Initialize elements cache
        this.elements = {};

        // Bind methods to maintain 'this' context
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
        this.handleOrderClick = this.handleOrderClick.bind(this);
        this.handleAttachmentAction = this.handleAttachmentAction.bind(this);
    }

    async PreRender(params) {
        try {
            this.setLoading(true);
            await this.ensureDashboardExists();
            this.state.visitId = params.id;
            this.renderInitialStructure();
            await this.initializeView();
            this.attachEventListeners();
        } catch (error) {
            notify('top_left', 'Failed to initialize view: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        if (this.elements.loader) {
            this.elements.loader.classList.toggle('active', isLoading);
        }
    }

    async ensureDashboardExists() {
        const dashboardExists = document.querySelector('.update_cont');
        if (!dashboardExists) {
            await screenCollection.dashboardScreen.PreRender();
        }
    }

    renderInitialStructure() {
        const container = document.querySelector('.update_cont');
        container.innerHTML = this.ViewReturn(this.state.isLoading ? 'active' : '');
        this.mainContainer = document.querySelector('.single_radiology_visit_cont');
        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            loader: this.mainContainer.querySelector('.loader_cont'),
            leftSections: this.mainContainer.querySelectorAll('.left_card .section_selection'),
            rightSections: this.mainContainer.querySelectorAll('.right_card .section_selection'),
            orderSection: this.mainContainer.querySelector('.order_section'),
            illnessSection: this.mainContainer.querySelector('.illness_section'),
            reportSection: this.mainContainer.querySelector('.report'),
            attachmentsSection: this.mainContainer.querySelector('.list'),
            dropzone: this.mainContainer.querySelector('#dropzone'),
            fileInput: this.mainContainer.querySelector('#file_input'),
            browseButton: this.mainContainer.querySelector('#browse_btn'),
            fileList: this.mainContainer.querySelector('.file_list'),
            reportTextareas: this.mainContainer.querySelectorAll('.report textarea'),
            submitReportBtn: this.mainContainer.querySelector('.report .btn_cont .btn'),
            imageList: this.mainContainer.querySelector('.image_list')
        };
    }

    async initializeView() {
        const visitData = await this.fetchVisitData();
        if (!visitData) return;

        this.renderPatientCard(visitData.patient_data);
        await Promise.all([
            this.loadOrders(),
            this.loadIllnessInfo(),
            this.loadReport(),
            this.loadAttachments()
        ]);
    }

    attachEventListeners() {
        // Section toggles
        this.elements.leftSections.forEach(section => {
            section.addEventListener('click', () => this.toggleSection(section, 'left'));
        });

        this.elements.rightSections.forEach(section => {
            section.addEventListener('click', () => this.toggleSection(section, 'right'));
        });

        // File upload
        this.elements.dropzone.addEventListener('dragover', this.handleDragOver);
        this.elements.dropzone.addEventListener('dragleave', this.handleDragLeave);
        this.elements.dropzone.addEventListener('drop', this.handleDrop);
        this.elements.browseButton.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', () => this.handleFileUpload(this.elements.fileInput.files));

        // Report handling
        this.elements.reportTextareas.forEach(textarea => {
            textarea.addEventListener('input', this.handleReportInput.bind(this));
            textarea.addEventListener('blur', this.validateReportField.bind(this));
        });

        this.elements.submitReportBtn.addEventListener('click', this.submitReport.bind(this));

        // Order handling
        this.elements.orderSection.addEventListener('click', this.handleOrderClick);

        // Attachment handling
        this.elements.imageList.addEventListener('click', this.handleAttachmentAction);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.elements.dropzone.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.elements.dropzone.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.elements.dropzone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        this.handleFileUpload(files);
    }

    async handleFileUpload(files) {
        if (!files.length) return;

        if (files.length > 5) {
            notify('top_left', 'Maximum 5 files allowed', 'warning');
            return;
        }

        try {
            this.setLoading(true);
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('files[]', file);
            });
            formData.append('visit_id', this.state.visitId);

            const response = await fetch('/api/radiology/upload-attachments', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Upload failed');

            notify('top_left', 'Files uploaded successfully', 'success');
            await this.loadAttachments();
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            this.setLoading(false);
            this.elements.fileInput.value = ''; // Reset file input
        }
    }

    handleReportInput(e) {
        const field = e.target.name;
        this.state.reportData[field] = e.target.value;
    }

    validateReportField(e) {
        const field = e.target;
        if (!field.value.trim()) {
            field.classList.add('error');
            notify('top_left', `${field.name} cannot be empty`, 'warning');
        } else {
            field.classList.remove('error');
        }
    }

    async handleOrderClick(e) {
        const orderCard = e.target.closest('.order_card');
        if (!orderCard) return;

        const orderId = orderCard.dataset.orderId;
        if (e.target.classList.contains('btn')) {
            await this.serveOrder(orderId);
        } else {
            await this.viewOrderDetails(orderId);
        }
    }

    handleAttachmentAction(e) {
        const attachmentCard = e.target.closest('.image_card');
        if (!attachmentCard) return;

        const attachmentId = attachmentCard.dataset.attachmentId;
        if (e.target.closest('.open_btn')) {
            this.openAttachment(attachmentId);
        } else if (e.target.closest('.delete_btn')) {
            this.deleteAttachment(attachmentId);
        }
    }

    async serveOrder(orderId) {
        try {
            this.setLoading(true);
            const response = await fetch('/api/radiology/serve-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    visit_id: this.state.visitId
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to serve order');

            notify('top_left', 'Order served successfully', 'success');
            await this.loadOrders();
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async submitReport() {
        // Validate all fields
        const isValid = Object.entries(this.state.reportData).every(([key, value]) => {
            if (!value.trim()) {
                notify('top_left', `${key} is required`, 'warning');
                return false;
            }
            return true;
        });

        if (!isValid) return;

        try {
            this.setLoading(true);
            const response = await fetch('/api/radiology/submit-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.state.visitId,
                    ...this.state.reportData
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to submit report');

            notify('top_left', 'Report submitted successfully', 'success');

            // Clear form after successful submission
            this.elements.reportTextareas.forEach(textarea => {
                textarea.value = '';
            });
            this.state.reportData = {
                comparison: '',
                findings: '',
                impression: '',
                recommendation: ''
            };
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async loadOrders() {
        try {
            const response = await fetch(`/api/radiology/orders/${this.state.visitId}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to load orders');

            this.elements.orderSection.innerHTML = this.renderOrders(result.data);
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
    }

    async loadAttachments() {
        try {
            const response = await fetch(`/api/radiology/attachments/${this.state.visitId}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to load attachments');

            this.elements.imageList.innerHTML = this.renderAttachments(result.data);
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
    }

    // ... Original ViewReturn and style methods remain the same ...

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
                <div class="section_selection active">
                    <p>Orders List</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>
                <div class="section_selection">
                    <p>Illness Info</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>
            </div>
    
            <div class="bottom">
    
                <div class="section order_section scroll_bar">
    
                    <div class="order_card">
                        <div class="info">
                            <p class="title">CT SCAN ABDOMINAL</p>
                            <p class="created_by">Kelvin Godliving</p>
                            <p class="date">Feb 1, 2025</p>
                        </div>
                        <div class="action">
                            <div class="status pending"></div>
                            <div class="action_btn_cont">
                                <button type="submit" class="btn">Serve</button>
                            </div>
                        </div>
                    </div>
    
                </div>
    
    
                <div class="section illness_section scroll_bar">
    
                    <div class="illness_card">
                        <p class="head">Symptoms</p>
                        <ul>
                            <li>Lorem ipsum dolor sit amet.</li>
                            <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat, odio?</li>
                            <li>Lorem, ipsum dolor.</li>
                            <li>Lorem ipsum dolor sit amet consectetur adipisicing.</li>
                        </ul>
                    </div>
    
                    <div class="illness_card">
                        <p class="head">Diagnosis</p>
                        <ul>
                            <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat, odio?</li>
                            <li>Lorem ipsum dolor sit amet.</li>
                            
                        </ul>
                    </div>
                    
                    
                </div>
    
    
            </div>
    
        </div>
    
        <div class="right_card">
    
            <div class="top">
    
                <div class="section_selection active">
                    <p>Report</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>
    
                <div class="section_selection ">
                    <p>Attachments</p>
                    <div class="line">
                        <div class="line_in"></div>
                    </div>
                </div>
            </div>
    
            <div class="bottom">
    
                <div class="section">
    
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
    
                <div class="section list scroll_bar">
    
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
                                <div class="open_btn btn" title="Open Attachment">
                                    <span class="switch_icon_open_in_browser"></span>
                                </div>
                                <div class="delete_btn btn" title="Delete Attachment">
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

    // Helper method to render orders
    renderOrders(orders) {
        return orders.map(order => `
            <div class="order_card" data-order-id="${order.id}">
                <div class="info">
                    <p class="title">${order.title}</p>
                    <p class="created_by">${order.created_by}</p>
                    <p class="date">${date_formatter(order.created_at)}</p>
                </div>
                <div class="action">
                    <div class="status ${order.status.toLowerCase()}"></div>
                    <div class="action_btn_cont">
                        ${order.status === 'PENDING' ? '<button type="submit" class="btn">Serve</button>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Helper method to render attachments
    renderAttachments(attachments) {
        return attachments.map(attachment => `
            <div class="image_card" data-attachment-id="${attachment.id}">
                <div class="info_side">
                    <div class="img_cont">
                        <img src="${attachment.thumbnail_url}" alt="${attachment.title}">
                    </div>
                    <div class="info_cont">
                        <p class="title">${attachment.title}</p>
                        <div class="g_cont">
                            <p class="word">${attachment.uploaded_by}</p>
                            <p class="word">${date_formatter(attachment.created_at)}</p>
                        </div>
                    </div>
                </div>
                <div class="action_side">
                    <div class="open_btn btn" title="Open Attachment">
                        <span class="switch_icon_open_in_browser"></span>
                    </div>
                    <div class="delete_btn btn" title="Delete Attachment">
                        <span class="switch_icon_delete"></span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async fetchVisitData() {
        try {
            this.setLoading(true);
            const response = await fetch('/api/patient/single_visit_detail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.state.visitId,
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch visit data');

            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        } finally {
            this.setLoading(false);
        }
    }

    async loadReport() {
        try {
            const response = await fetch(`/api/radiology/report/${this.state.visitId}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to load report');

            // Update textareas with existing report data if it exists
            if (result.data) {
                Object.entries(result.data).forEach(([key, value]) => {
                    const textarea = this.elements.reportTextareas.find(el => el.name === key);
                    if (textarea) {
                        textarea.value = value;
                        this.state.reportData[key] = value;
                    }
                });
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
    }

    async loadIllnessInfo() {
        try {
            const response = await fetch(`/api/radiology/illness/${this.state.visitId}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to load illness info');

            this.elements.illnessSection.innerHTML = this.renderIllnessInfo(result.data);
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
    }

    renderIllnessInfo(data) {
        return `
            <div class="illness_card">
                <p class="head">Symptoms</p>
                <ul>
                    ${data.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                </ul>
            </div>

            <div class="illness_card">
                <p class="head">Diagnosis</p>
                <ul>
                    ${data.diagnosis.map(diagnosis => `<li>${diagnosis}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    async openAttachment(attachmentId) {
        try {
            const response = await fetch(`/api/radiology/attachment/${attachmentId}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch attachment');

            // Open attachment in new window/tab
            window.open(result.data.url, '_blank');
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
    }

    async deleteAttachment(attachmentId) {
        if (!confirm('Are you sure you want to delete this attachment?')) return;

        try {
            this.setLoading(true);
            const response = await fetch(`/api/radiology/attachment/${attachmentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.state.visitId
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to delete attachment');

            notify('top_left', 'Attachment deleted successfully', 'success');
            await this.loadAttachments();
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async viewOrderDetails(orderId) {
        try {
            const response = await fetch(`/api/radiology/order/${orderId}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch order details');

            // You could implement a modal or some other UI to show the details
            // For now, let's just log it
            console.log('Order details:', result.data);
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
    }

    renderPatientCard(data) {
        if (!this.mainContainer) return;
        
        const patientCard = this.mainContainer.querySelector('.top_card');
        if (!patientCard) return;

        patientCard.innerHTML = `
            <div class="Patient_imag">
                <img src="${data?.Patient_img || '/assets/default-avatar.png'}" alt="Patient Image">
            </div>

            <div class="patient_detail">
                <div class="card name_card">
                    <div class="dit_group">
                        <p class="name">${data?.name || 'N/A'}</p>
                        <p class="description">Patient id: <span>${data?.id || 'N/A'}</span></p>
                    </div>
                </div>

                <div class="card">
                    ${[
                        { 
                            icon: 'user', 
                            value: data?.gender || 'N/A' 
                        },
                        { 
                            icon: 'calendar_check', 
                            value: data ? `${date_formatter(data.dob)} (${data.age.amount} ${data.age.unit})` : 'N/A'
                        },
                        { 
                            icon: 'location_dot', 
                            value: data ? `${data.address} (${data.nationality})` : 'N/A'
                        },
                        { 
                            icon: 'phone', 
                            value: data ? `${data.phone}${data.alt_phone ? ' / ' + data.alt_phone : ''}` : 'N/A'
                        },
                        { 
                            icon: 'briefcase', 
                            value: data?.occupation || 'N/A'
                        }
                    ].map(item => `
                        <div class="icon_card">
                            <span class='switch_icon_${item.icon}'></span>
                            <p>${item.value}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="loader_cont ${this.state.isLoading ? 'active' : ''}">
                <div class="loader"></div>
            </div>
        `;

        // Handle image load error
        const patientImage = patientCard.querySelector('.Patient_imag img');
        patientImage.onerror = () => {
            patientImage.src = '/assets/default-avatar.png';
        };

        // Cache the new elements
        this.elements = {
            ...this.elements,
            patientImage,
            patientName: patientCard.querySelector('.name'),
            patientId: patientCard.querySelector('.description span'),
            patientDetails: patientCard.querySelectorAll('.icon_card p')
        };
    }

    updatePatientDetails(newData) {
        if (!this.elements.patientName || !newData) return;

        this.elements.patientName.textContent = newData.name;
        this.elements.patientId.textContent = newData.id;

        const detailsData = [
            newData.gender,
            `${date_formatter(newData.dob)} (${newData.age.amount} ${newData.age.unit})`,
            `${newData.address} (${newData.nationality})`,
            `${newData.phone}${newData.alt_phone ? ' / ' + newData.alt_phone : ''}`,
            newData.occupation
        ];

        this.elements.patientDetails.forEach((element, index) => {
            element.textContent = detailsData[index] || 'N/A';
        });

        if (newData.Patient_img) {
            this.elements.patientImage.src = newData.Patient_img;
        }
    }

    // Helper method to format patient age
    formatAge(dob) {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Return appropriate unit (years, months, or days)
        if (age > 0) {
            return { amount: age, unit: 'years' };
        } else {
            const months = monthDiff + 12;
            if (months > 0) {
                return { amount: months, unit: 'months' };
            } else {
                const days = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
                return { amount: days, unit: 'days' };
            }
        }
    }

}

