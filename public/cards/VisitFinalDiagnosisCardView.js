import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitFinalDiagnosisCardView {
    constructor() {
        this.visit_id = null;
        this.datas = [];
        this.selectedIds = new Set();
        this.isSelectAllActive = false;
        this.visit_status = null;
        this.edit_mode = false;

        // Bind methods
        this.remove_final_diagnosis_request = this.remove_final_diagnosis_request.bind(this);
        this.remove_final_diagnosis_request_bulk = this.remove_final_diagnosis_request_bulk.bind(this);

        // Add to window for callback access
        window.remove_final_diagnosis_request = this.remove_final_diagnosis_request;
        window.remove_final_diagnosis_request_bulk = this.remove_final_diagnosis_request_bulk;

    }

    async PreRender(params = {}) {
        const { data = [], visit_id, state = "creation" } = params;

        if (!document.querySelector('.update_cont')) {
            await screenCollection.dashboardScreen.PreRender();
        }


        this.resetState(data, visit_id, state, params.visit_status);
        this.render();

        this.renderSingleCards();
    }

    resetState(data, visit_id, state, visit_status) {
        this.datas = data;
        this.visit_id = visit_id;
        this.state = state;
        this.isSelectAllActive = false;
        this.selectedIds.clear();
        this.visit_status = visit_status ? visit_status : "checked_out";
        this.edit_mode = false;
        if (this.visit_status == "active") {
            this.edit_mode = true;
        }
    }

    render() {
        if (this.state !== "creation") return;

        const container = document.querySelector('.single_visit_cont .more_visit_cards #diagnosis_group .card_group_cont');
        const addButton = container.querySelector('.add_card_btn');
        const card = this.createMainCard();

        if (addButton) {
            addButton.insertAdjacentElement('beforebegin', card);
        } else {
            container.appendChild(card);
        }

        dashboardController.singleVisitView.add_to_rendered_card_array('visitFinalDiagnosisPopUpView');
    }

    createMainCard() {
        const card = document.createElement('div');
        card.className = 'more_visit_detail_card final_diagnosis_cont_cont';

        card.innerHTML = `
            <div class="head_part">
                <div class="top_heading">
                    <h4 class="heading">Final Diagnosis</h4>
                </div>
                <div class="btn_section"></div>
            </div>
            <div class="body_part final_diagnosis_cont"></div>
        `;

        // Add the add button by default
        const btnSection = card.querySelector('.btn_section');

        btnSection.appendChild(this.createAddButton());


        return card;
    }

    createAddButton() {
        const addBtn = document.createElement('div');
        addBtn.className = 'add_btn';
        if (!this.edit_mode) {
            addBtn.classList.add("visibility_hidden");
        }
        addBtn.id = 'add_pre_diagnosis_exam';
        addBtn.innerHTML = '<span class="switch_icon_add"></span>';

        if (this.edit_mode) {
            addBtn.addEventListener('click', () => {
                dashboardController.visitFinalDiagnosisPopUpView.PreRender({
                    visit_id: this.visit_id,
                    state: 'modify',
                    visit_status: this.visit_status,
                });
            });
        }

        return addBtn;
    }

    createSelectAllCheckbox() {
        const checkbox = document.createElement('div');
        checkbox.className = 'final_diagnosis_check_box check_box';
        checkbox.id = 'main_final_diagnosis_check_box';
        checkbox.title = "Select all final diagnosis";
        checkbox.innerHTML = '<span class="switch_icon_indeterminate_check_box"></span>';

        checkbox.addEventListener('click', (e) => this.handleSelectAllClick(e));
        return checkbox;
    }

    handleSelectAllClick(e) {
        e.preventDefault();
        const checkbox = e.currentTarget;
        const span = checkbox.querySelector('span');
        const cards = document.querySelectorAll('.final_diagnosis_cont_cont .final_diagnosis_cont .final_diagnosis_card');

        if (span.classList.contains('switch_icon_indeterminate_check_box')) {
            this.deselectAll(cards);
            this.updateCheckboxState(checkbox, false);
        } else if (span.classList.contains('switch_icon_check_box_outline_blank')) {
            this.selectAll(cards);
            this.updateCheckboxState(checkbox, true);
        } else {
            this.deselectAll(cards);
            this.updateCheckboxState(checkbox, false);
        }
    }

    selectAll(cards) {
        cards.forEach(card => {
            const checkbox = card.querySelector('.final_diagnosis_check_box');
            if (!checkbox.classList.contains('inactive')) {
                this.make_checkbox_active(checkbox);
                const id = parseInt(card.getAttribute('data_src'));
                this.selectedIds.add(id);
            }
        });
    }

    deselectAll(cards) {
        cards.forEach(card => {
            const checkbox = card.querySelector('.final_diagnosis_check_box');
            this.make_checkbox_inactive(checkbox);
        });
        this.selectedIds.clear();
    }

    updateCheckboxState(checkbox, isChecked) {
        const span = checkbox.querySelector('span');
        span.className = isChecked ?
            'switch_icon_check_box' :
            'switch_icon_check_box_outline_blank';
    }

    renderSingleCards() {
        const container = document.querySelector('.final_diagnosis_cont_cont .body_part');

        container.innerHTML = '';
        this.datas.forEach(data => {
            const card = this.createContentCard(data);
            container.prepend(card);
        });
    }

    createContentCard(data) {
        const card = document.createElement('div');
        card.className = 'final_diagnosis_card';
        card.setAttribute('data_src', data.id);
        card.innerHTML = `
            <div class="left">
                <div class="check_box final_diagnosis_check_box">
                    <span class='switch_icon_check_box_outline_blank'></span>
                </div>
                <div class="word">
                    <p class="title">${data.diagnosis}</p>
                    <p class="created_by">${data.created_by}</p>
                    <p class="date">${date_formatter(data.created_at)}</p>
                </div>
            </div>
            <div class="right">
            ${this.edit_mode ? `<div title="Delete this diagnosis." class="more_btn order_delete_btn">
                    <span class='switch_icon_delete'></span>
                </div>` : ``}
            </div>
        `;

        if (this.edit_mode) {
            this.attachCardListeners(card, data);
        }
        return card;
    }

    attachCardListeners(card, data) {

        const checkbox = card.querySelector('.final_diagnosis_check_box');
        const deleteBtn = card.querySelector('.order_delete_btn');

        checkbox.addEventListener('click', (e) => this.handleCheckboxClick(e, checkbox, data.id));
        deleteBtn.addEventListener('click', (e) => this.handleDeleteClick(e, deleteBtn, data, card));
    }

    handleDeleteClick(e, deleteBtn, data, card) {
        e.preventDefault();


        if (deleteBtn.classList.contains('inactive')) return;

        dashboardController.confirmPopUpView.PreRender({
            callback: 'remove_final_diagnosis_request',
            parameter: data.id,
            title: 'Remove Final Diagnosis Request',
            sub_heading: `Diagnosis For: ${data.diagnosis}`,
            description: 'Are you sure you want to remove this diagnosis?',
            ok_btn: 'Remove',
            cancel_btn: 'Cancel'
        });

        this.singleSelectedToDelete = card;
        this.singleSelectedToDelete_id = data.id;
    }


    handleCheckboxClick(e, checkbox, id) {
        e.preventDefault();

        const isChecked = checkbox.querySelector('span').classList.contains('switch_icon_check_box');

        console.log(this.datas);

        console.log(id);


        if (isChecked) {
            this.selectedIds.delete(id);
            this.make_checkbox_inactive(checkbox);
        } else {
            this.selectedIds.add(id);
            this.make_checkbox_active(checkbox);
        }


        this.updateSelectionUI();
    }

    updateSelectionUI() {
        if (!this.isSelectAllActive && this.selectedIds.size > 0) {
            this.initializeMultipleSelection();
        } else if (this.isSelectAllActive) {
            const mainCheckbox = document.querySelector('.final_diagnosis_cont_cont #main_final_diagnosis_check_box');
            this.updateMainCheckboxState(mainCheckbox);
        }
    }

    updateMainCheckboxState(mainCheckbox) {
        const totalPendingCards = this.datas.filter(d => d.status === 'pending').length;

        if (this.selectedIds.size === 0) {
            this.make_checkbox_inactive(mainCheckbox);
        } else if (this.selectedIds.size === totalPendingCards) {
            this.make_checkbox_active(mainCheckbox);
        } else {
            this.make_checkbox_indeterminate(mainCheckbox);
        }
    }

    initializeMultipleSelection() {
        this.isSelectAllActive = true;
        this.renderSelectionControls();
    }

    renderSelectionControls() {
        const container = document.querySelector('.final_diagnosis_cont_cont .top_heading');
        const btnSection = document.querySelector('.final_diagnosis_cont_cont .btn_section');
        const body_part = document.querySelector('.final_diagnosis_cont_cont .final_diagnosis_cont');
        body_part.classList.add('selectionMode');

        container.prepend(this.createSelectAllCheckbox());
        btnSection.innerHTML = '';
        btnSection.append(
            this.createCancelButton(),
            this.createDeleteButton()
        );
    }

    createCancelButton() {
        const btn = document.createElement('div');
        btn.className = 'cancel_btn';
        btn.title = "Cancel selected radiology exams";
        btn.innerHTML = '<span class="switch_icon_cancel"></span>';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.exitSelectionMode();
        });

        return btn;
    }

    createDeleteButton() {
        const btn = document.createElement('div');
        btn.className = 'delete_btn';
        btn.title = "Delete all selected radiology exams";
        btn.innerHTML = '<span class="switch_icon_delete"></span>';

        btn.addEventListener('click', (e) => this.handleBulkDeleteClick(e));

        return btn;
    }

    handleBulkDeleteClick(e) {
        e.stopPropagation();
        if (this.selectedIds.size === 0) {
            notify('top_left', 'Please select at least one order to remove.', 'warning');
            return;
        }

        const selectedIds = Array.from(this.selectedIds);
        dashboardController.confirmPopUpView.PreRender({
            callback: 'remove_final_diagnosis_request_bulk',
            parameter: selectedIds,
            title: 'Remove Selected Diagnosis',
            sub_heading: `You have selected ${selectedIds.length} diagnosis.`,
            description: 'Are you sure you want to remove these selected diagnosis?',
            ok_btn: 'Remove',
            cancel_btn: 'Cancel'
        });
    }

    remove_final_diagnosis_request(id) {
        return this.handleFinalDiagnosisRequest([id], 'single');
    }

    remove_final_diagnosis_request_bulk(ids) {
        return this.handleFinalDiagnosisRequest(ids, 'multiple');
    }

    exitSelectionMode() {
        const body_part = document.querySelector('.final_diagnosis_cont_cont .final_diagnosis_cont');
        const cards = body_part.querySelectorAll('.final_diagnosis_card');
        this.deselectAll(cards);
        body_part.classList.remove('selectionMode');

        // Remove selection controls
        const selectAllCheckbox = document.querySelector('.final_diagnosis_cont_cont #main_final_diagnosis_check_box');
        if (selectAllCheckbox) {
            selectAllCheckbox.remove();
        }

        this.isSelectAllActive = false;

        // Reset button section
        const btnSection = document.querySelector('.final_diagnosis_cont_cont .btn_section');
        btnSection.innerHTML = '';
        btnSection.appendChild(this.createAddButton());
    }

    async handleFinalDiagnosisRequest(ids, state = 'single') {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/create_delete_final_diagnosis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete',
                    visit_id: this.visit_id,
                    diagnosis: ids,
                    state
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

            if (state === 'single' && this.singleSelectedToDelete) {
                this.singleSelectedToDelete.remove();
                this.datas = this.datas.filter(item => item.id != this.singleSelectedToDelete_id);
                if (this.selectedIds.has(this.singleSelectedToDelete_id)) {
                    this.selectedIds.delete(this.singleSelectedToDelete_id);
                }
                this.singleSelectedToDelete = '';
                this.singleSelectedToDelete_id = '';
            } else {
                // Update the view with new data for bulk deletion
                this.datas = result.data;
                this.selectedIds.clear();

                this.renderSingleCards();
                // Exit selection mode
                this.exitSelectionMode();

            }

            // Clear selected IDs after successful deletion
            this.selectedIds.clear();

        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            dashboardController.loaderView.remove();
        }
    }

    make_checkbox_active(checkbox) {
        const span = checkbox.querySelector('span');
        if (!checkbox.classList.contains('inactive')) {
            checkbox.classList.add('checked');
            span.classList.remove('switch_icon_check_box_outline_blank');
            span.classList.add('switch_icon_check_box');
        }
    }

    make_checkbox_inactive(checkbox) {
        const span = checkbox.querySelector('span');
        checkbox.classList.remove('checked');
        span.classList.remove('switch_icon_check_box');
        span.classList.add('switch_icon_check_box_outline_blank');
    }

    make_checkbox_indeterminate(checkbox) {
        const span = checkbox.querySelector('span');
        checkbox.classList.add('checked');
        span.classList.remove('switch_icon_check_box_outline_blank');
        span.classList.add('switch_icon_indeterminate_check_box');
    }
}
