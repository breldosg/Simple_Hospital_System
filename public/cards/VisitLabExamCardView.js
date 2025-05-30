import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, timeStamp_formatter } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitLabExamCardView {
    constructor() {
        this.visit_id = null;
        this.data = [];
        this.selectedIds = new Set();
        this.isSelectAllActive = false;
        this.singleSelectedToDelete = '';
        this.singleSelectedToDelete_id = '';
        this.visit_status = null;
        this.edit_mode = false;
        // Bind methods
        this.remove_order_lab_exam_request = this.remove_order_lab_exam_request.bind(this);
        this.remove_lab_exam_request_bulk = this.remove_lab_exam_request_bulk.bind(this);

        // Add to window for callback access
        window.remove_order_lab_exam_request = this.remove_order_lab_exam_request;
        window.remove_lab_exam_request_bulk = this.remove_lab_exam_request_bulk;
    }

    async PreRender(params = {}) {
        const { data = [], visit_id, state = "creation", visit_status } = params;

        if (!document.querySelector('.update_cont')) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.resetState(data, visit_id, state, params.visit_status);


        // First render the main card structure
        if (this.state === "creation") {
            const container = document.querySelector('.single_visit_cont .more_visit_cards #diagnosis_group .card_group_cont');
            const addButton = container.querySelector('.add_card_btn');
            const card = this.createMainCard();

            if (addButton) {
                addButton.insertAdjacentElement('beforebegin', card);
            } else {
                container.appendChild(card);
            }

            dashboardController.singleVisitView.add_to_rendered_card_array('visitLabTestOrdersPopUpView');
        }

        // Then initialize data and render the lab test cards
        await this.initializeData();
        this.renderLabTestCards(this.data);
    }

    async resetState(data, visit_id, state, visit_status) {
        this.data = data;
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

    async initializeData() {
        // Only fetch data if we're in creation state and no data was provided
        if (this.state === "creation" && (!this.data || this.data.length === 0)) {
            this.data = await this.fetch_laboratory_request(this.visit_id);

        }
    }

    async render() {

        if (this.state === "creation") {
            const container = document.querySelector('.single_visit_cont .more_visit_cards #diagnosis_group .card_group_cont');
            const addButton = container.querySelector('.add_card_btn');
            const card = this.createMainCard();

            if (addButton) {
                addButton.insertAdjacentElement('beforebegin', card);
            } else {
                container.appendChild(card);
            }

            dashboardController.singleVisitView.add_to_rendered_card_array('visitLabTestOrdersPopUpView');

        }
        // Render lab test cards with current data
        this.renderLabTestCards(this.data);

    }

    createMainCard() {
        const card = document.createElement('div');
        card.className = 'more_visit_detail_card lab_test_cont_cont ';

        card.innerHTML = `
            <div class="head_part">
                <div class="top_heading">
                    <h4 class="heading">Laboratory Test</h4>
                </div>
                <div class="btn_section"></div>
            </div>
            <div class="body_part lab_test_cont"></div>
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
        addBtn.id = 'add_lab_test';
        addBtn.innerHTML = '<span class="switch_icon_add"></span>';

        if (this.edit_mode) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();


                const pendingIds = this.data
                    .filter(item => item.status === 'pending')
                    .map(item => item.lab_test_id);




                dashboardController.visitLabTestOrdersPopUpView.PreRender({
                    visit_id: this.visit_id,
                    state: 'modify',
                    data: pendingIds,
                    visit_status: this.visit_status,
                });
            });
        }

        return addBtn;
    }

    createSelectAllCheckbox() {
        const checkbox = document.createElement('div');
        checkbox.className = 'lab_test_check_box check_box';
        checkbox.id = 'main_lab_test_check_box';
        checkbox.title = "Select all laboratory test";
        checkbox.innerHTML = '<span class="switch_icon_indeterminate_check_box"></span>';

        checkbox.addEventListener('click', (e) => this.handleSelectAllClick(e));
        return checkbox;
    }

    handleSelectAllClick(e) {
        e.preventDefault();
        const checkbox = e.currentTarget;
        const span = checkbox.querySelector('span');
        const cards = document.querySelectorAll('.lab_test_cont_cont .lab_test_cont .lab_test_card');

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
            const checkbox = card.querySelector('.lab_test_check_box');
            if (!checkbox.classList.contains('inactive')) {
                this.make_checkbox_active(checkbox);
                const id = parseInt(card.getAttribute('data_src'));
                this.selectedIds.add(id);
            }
        });
    }

    deselectAll(cards) {
        cards.forEach(card => {
            const checkbox = card.querySelector('.lab_test_check_box');
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

    createCancelButton() {
        const btn = document.createElement('div');
        btn.className = 'cancel_btn';
        btn.title = "Cancel selecting laboratory test";
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
        btn.title = "Delete all selected laboratory test";
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
            callback: 'remove_lab_exam_request_bulk',
            parameter: selectedIds,
            title: 'Remove Selected Laboratory Orders',
            sub_heading: `You have selected ${selectedIds.length} laboratory orders.`,
            description: 'Are you sure you want to remove these selected laboratory orders?',
            ok_btn: 'Remove',
            cancel_btn: 'Cancel'
        });
    }

    renderLabTestCards(data_list) {
        const container = document.querySelector('.lab_test_cont_cont .body_part');
        container.innerHTML = '';
        data_list.forEach(data => {
            const card = this.createLabTestCard(data);
            container.prepend(card);
        });
    }

    createLabTestCard(data) {
        const card = document.createElement('div');
        card.className = 'lab_test_card';
        card.setAttribute('data_src', data.id);

        const isPending = data.status === 'pending';

        card.innerHTML = this.getLabTestCardTemplate(data, isPending);
        if (this.edit_mode) {
            this.attachCardListeners(card, data, isPending);
        }

        card.addEventListener('click', (e) => {
            if (data.status === 'complete') {
                // radiology result popup
                dashboardController.visitsLaboratoryResultPopUpView.PreRender({
                    data: data,
                });
            }
            else {
                notify('top_left', 'Order is not published yet.', 'warning');
            }

        });

        return card;
    }

    getLabTestCardTemplate(data, isPending) {
        return `
            <div class="left">
                <div class="check_box lab_test_check_box ${isPending ? '' : 'inactive'}">
                    <span class='switch_icon_check_box_outline_blank'></span>
                </div>
                <div class="word">
                    <p class="title">${data.lab_test_name}</p>
                    <p class="created_by">${data.created_by}</p>
                    <p class="date">${timeStamp_formatter(data.created_at)}</p>
                </div>
            </div>
            <div class="right">
                <div title="${data.status}" class="status ${data.status}"></div>
                ${this.edit_mode ? `<div title="Delete this order." class="more_btn order_delete_btn ${isPending ? '' : 'inactive'}">
                    <span class='switch_icon_delete'></span>
                </div>` : ``}
            </div>
        `;
    }

    attachCardListeners(card, data, isPending) {
        if (!isPending) return;

        const checkbox = card.querySelector('.lab_test_check_box');
        const deleteBtn = card.querySelector('.order_delete_btn');

        checkbox.addEventListener('click', (e) => this.handleCheckboxClick(e, checkbox, data.id));
        deleteBtn.addEventListener('click', (e) => this.handleDeleteClick(e, deleteBtn, data, card));
    }

    handleCheckboxClick(e, checkbox, id) {
        e.preventDefault();
        e.stopPropagation();

        const isChecked = checkbox.querySelector('span').classList.contains('switch_icon_check_box');

        if (isChecked) {
            this.selectedIds.delete(id);
            this.make_checkbox_inactive(checkbox);
        } else {
            this.selectedIds.add(id);
            this.make_checkbox_active(checkbox);
        }

        this.updateSelectionUI();
    }

    handleDeleteClick(e, deleteBtn, data, card) {
        e.preventDefault();
        e.stopPropagation();

        if (deleteBtn.classList.contains('inactive')) return;

        dashboardController.confirmPopUpView.PreRender({
            callback: 'remove_order_lab_exam_request',
            parameter: data.id,
            title: 'Remove Laboratory Order Request',
            sub_heading: `Order For: ${data.name}`,
            description: 'Are you sure you want to remove this order?',
            ok_btn: 'Remove',
            cancel_btn: 'Cancel'
        });

        this.singleSelectedToDelete = card;
        this.singleSelectedToDelete_id = data.id;
    }

    updateSelectionUI() {
        if (!this.isSelectAllActive && this.selectedIds.size > 0) {
            this.initializeMultipleSelection();
        } else if (this.isSelectAllActive) {
            const mainCheckbox = document.querySelector('#main_lab_test_check_box');
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
        const body_part = document.querySelector('.lab_test_cont_cont .lab_test_cont');
        const container = document.querySelector('.lab_test_cont_cont .top_heading');
        const btnSection = document.querySelector('.lab_test_cont_cont .btn_section');

        body_part.classList.add('selectionMode');
        container.prepend(this.createSelectAllCheckbox());
        btnSection.innerHTML = '';
        btnSection.append(
            this.createCancelButton(),
            this.createDeleteButton()
        );
    }

    exitSelectionMode() {
        const body_part = document.querySelector('.lab_test_cont_cont .lab_test_cont');
        const cards = body_part.querySelectorAll('.lab_test_card');
        this.deselectAll(cards);

        body_part.classList.remove('selectionMode');

        // Remove selection controls
        const selectAllCheckbox = document.querySelector('#main_lab_test_check_box');
        if (selectAllCheckbox) {
            selectAllCheckbox.remove();
        }

        this.isSelectAllActive = false;

        // Reset button section
        const btnSection = document.querySelector('.lab_test_cont_cont .btn_section');
        btnSection.innerHTML = '';
        btnSection.appendChild(this.createAddButton());
    }

    make_checkbox_active(checkbox) {
        if (checkbox.classList.contains('inactive')) return;

        const span = checkbox.querySelector('span');
        checkbox.classList.add('checked');
        span.classList.remove('switch_icon_check_box_outline_blank', 'switch_icon_indeterminate_check_box');
        span.classList.add('switch_icon_check_box');
    }

    make_checkbox_inactive(checkbox) {
        const span = checkbox.querySelector('span');
        checkbox.classList.remove('checked');
        span.classList.remove('switch_icon_check_box', 'switch_icon_indeterminate_check_box');
        span.classList.add('switch_icon_check_box_outline_blank');
    }

    make_checkbox_indeterminate(checkbox) {
        const span = checkbox.querySelector('span');
        checkbox.classList.add('checked');
        span.classList.remove('switch_icon_check_box_outline_blank', 'switch_icon_check_box');
        span.classList.add('switch_icon_indeterminate_check_box');
    }

    async handleDeleteLabExamRequest(ids, state = 'multiple') {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_lab_test_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.visit_id,
                    lab_order_id: ids,
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
                this.data = this.data.filter(item => item.id != this.singleSelectedToDelete_id);
                this.singleSelectedToDelete = '';
                this.singleSelectedToDelete_id = '';
            } else {
                // Update the view with new data for bulk deletion
                this.PreRender({
                    visit_id: this.visit_id,
                    state: 'modify',
                    data: result.data,
                    visit_status: this.visit_status

                });

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

    remove_order_lab_exam_request(id) {
        return this.handleDeleteLabExamRequest([id], 'single');
    }

    remove_lab_exam_request_bulk(ids) {
        return this.handleDeleteLabExamRequest(ids, 'multiple');
    }

    async fetch_laboratory_request(visit_id) {
        try {
            const response = await fetch('/api/laboratory/get_laboratory_test_order_list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: visit_id,
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
            return result.data;
        } catch (error) {
            notify('top_left', error.message, 'error');
        }
    }
}