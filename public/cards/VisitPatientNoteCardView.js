import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { applyStyle, date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitPatientNoteCardView {
    constructor() {
        this.state = {
            visitId: null,
            notes: [],
            allergies: [],
            vaccines: [],
            isLoading: false,
            mounted: false,
            activeCardType: 'all' // Default view is now 'all'
        };

        // Bind methods
        this.save_patient_note = this.save_patient_note.bind(this);
        this.deletePatientNoteOnCard = this.deleteNote.bind(this);
        this.renderNoteCards = this.renderNoteCards.bind(this);
        this.renderAllergyCards = this.renderAllergyCards.bind(this);
        this.renderVaccineCards = this.renderVaccineCards.bind(this);
        this.switchCardType = this.switchCardType.bind(this);
        this.updateState = this.updateState.bind(this);
        this.delete_allergy_request = this.delete_allergy_request.bind(this);
        this.delete_vaccine_request = this.delete_vaccine_request.bind(this);


        this.visit_status = null;
        this.edit_mode = false;

        window.save_patient_note = this.save_patient_note;
        window.delete_allergy_request = this.delete_allergy_request;
        window.delete_vaccine_request = this.delete_vaccine_request;
        window.deletePatientNoteOnCard = this.deletePatientNoteOnCard;

        this.card_to_delete = null;
        applyStyle(this.style(), 'patient_cards_cont');
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
        // Only render if component is mounted
        if (this.state.mounted) {
            this.renderCurrentCardType();
        }
    }

    renderCurrentCardType() {
        switch (this.state.activeCardType) {
            case 'all':
                this.renderAllCards();
                break;
            case 'notes':
                this.renderNoteCards();
                break;
            case 'allergies':
                this.renderAllergyCards();
                break;
            case 'vaccines':
                this.renderVaccineCards();
                break;
        }
    }

    switchCardType(cardType) {
        this.updateState({ activeCardType: cardType });
        // Update UI to show which tab is active
        const tabs = document.querySelectorAll('.card_type_tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-type') === cardType) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    async PreRender(params) {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        this.card_to_delete = null;
        this.visit_status = params.visit_status ? params.visit_status : "checked_out";
        this.edit_mode = false;
        if (this.visit_status == "active") {
            this.edit_mode = true;
        }


        // Update state but don't trigger render yet
        this.state = {
            ...this.state,
            notes: params.data.note || [],
            allergies: params.data.allergy || [],
            vaccines: params.data.vaccine || [],
            visitId: params.visit_id,
            edit_mode: this.edit_mode,
            visit_status: this.visit_status,
            activeCardType: 'all'
        };

        // Create and mount the component
        const cont = document.querySelector('.single_visit_cont .more_visit_detail');
        if (cont) {
            cont.classList.add('active');
            cont.appendChild(this.ViewReturn());

            // Set up tab listeners
            const tabs = document.querySelectorAll('.card_type_tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchCardType(tab.getAttribute('data-type'));
                });
            });

            // Mark as mounted and then render notes
            this.state.mounted = true;
            this.renderCurrentCardType();
        }
    }

    createNoteCard(data) {
        const card = document.createElement('div');
        card.className = 'note_card';

        card.innerHTML = `
            <div class="card_head">
                <div class="card_info">
                    <p class="date">${date_formatter(data.created_at)}</p>
                    <p class="title">${data.created_by}</p>
                </div>
                <div class="card_actions">
                    <div class="delete_btn btn ${this.edit_mode ? "" : "visibility_hidden"}" data-note-id="${data.id}">
                        <span class='switch_icon_delete'></span>
                    </div>
                </div>
            </div>
            <p class="detail">${data.note}</p>
        `;

        const deleteBtn = card.querySelector('.delete_btn');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            dashboardController.confirmPopUpView.PreRender({
                callback: 'deletePatientNoteOnCard',
                parameter: data.id,
                title: 'Remove Note',
                sub_heading: `Note Created By: ${data.created_by}`,
                description: 'Are you sure you want to delete this note?',
                ok_btn: 'Delete',
                cancel_btn: 'Cancel'
            });

        });

        return card;
    }

    async save_patient_note(data_old) {
        const btn_submit = document.querySelector('br-button[type="submit"]');
        if (btn_submit) {
            btn_submit.setAttribute('loading', true);
        }

        try {
            const response = await fetch('/api/patient/save_update_delete_patient_note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data_old,
                    visit_id: this.state.visitId,
                    action: 'create'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update vital. Server Error');
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
                dashboardController.addPatientNotePopUpView.close();

                this.RefetchData();
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            if (btn_submit) {
                btn_submit.setAttribute('loading', false);
            }
        }
    }

    ViewReturn() {
        const card = document.createElement('div');
        card.className = 'more_visit_detail_card patient_cards_cont';

        card.innerHTML = `
            <div class="full_screen_overlay">
                <div class="full_screen">
                    <div class="head_part">
                        <div class="title_section">
                            <h4 class="heading">Patient Records</h4>
                        </div>
                        <div class="card_type_tabs">
                            <p class="card_type_tab active" data-type="all">All</p>
                            <p class="card_type_tab" data-type="notes">Notes</p>
                            <p class="card_type_tab" data-type="allergies">Allergies</p>
                            <p class="card_type_tab" data-type="vaccines">Vaccines</p>
                        </div>

                        <div class="card_type_btn_group">
                            <div class="more_btn" id="more_patient_expand_btn">
                                <span class='switch_icon_expand'></span>
                            </div>
                            <div class="more_btn ${this.edit_mode ? "" : "visibility_hidden"}" id="more_patient_options_btn">
                            <span class='switch_icon_more_vert'></span>
                                <div class="option_menu_popup">
                                    <div class="option_item" data-action="add_note">
                                        <span class="switch_icon_add"></span>
                                        <p>Add Patient Note</p>
                                    </div>
                                    <div class="option_item" data-action="add_allergy">
                                        <span class="switch_icon_add"></span>
                                        <p>Add Allergy</p>
                                    </div>
                                    <div class="option_item" data-action="add_vaccine">
                                        <span class="switch_icon_add"></span>
                                        <p>Add Vaccine</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="body_part card_content_area"></div>
                </div>
            </div>
        `;

        const moreBtn = card.querySelector('#more_patient_options_btn');
        const optionMenu = card.querySelector('.option_menu_popup');
        const expandBtn = card.querySelector('#more_patient_expand_btn');
        const fullScreenOverlay = card.querySelector('.full_screen_overlay');
        const contentArea = card.querySelector('.card_content_area');
        const fullScreen = card.querySelector('.full_screen');

        // Add expand functionality with smooth transition
        expandBtn.addEventListener('click', () => {
            // Toggle expanded class on the container
            if (!fullScreenOverlay.classList.contains('active')) {
                // Expanding
                expandBtn.querySelector('span').className = 'switch_icon_minimize';
                fullScreenOverlay.classList.add('active');

            } else {
                // Collapsing
                expandBtn.querySelector('span').className = 'switch_icon_expand';
                fullScreenOverlay.classList.remove('active');
            }
        });

        if (this.edit_mode) {
            // Toggle menu on more button click
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent click from propagating to document
                optionMenu.classList.toggle('active');
            });

            // Add click event listeners to each option
            const optionItems = card.querySelectorAll('.option_item');
            optionItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent click from propagating
                    const action = item.getAttribute('data-action');

                    // Handle different actions
                    switch (action) {
                        case 'add_note':

                            dashboardController.addPatientNotePopUpView.PreRender();
                            break;
                        case 'add_allergy':

                            dashboardController.visitAllergyPopUpView.PreRender(
                                {
                                    visit_id: this.state.visitId,
                                    state: 'modify',
                                    visit_status: this.state.visit_status,
                                }
                            );
                            break;
                        case 'add_vaccine':

                            dashboardController.visitsVaccinePopUpView.PreRender(
                                {
                                    visit_id: this.state.visitId,
                                    state: 'modify',
                                }
                            );
                            break;
                    }

                    // Hide menu after selection
                    optionMenu.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', () => {
                if (optionMenu.classList.contains('active')) {
                    optionMenu.classList.remove('active');
                }
            });
        }

        return card;
    }

    renderAllCards() {
        // Safe guard against rendering before mount
        if (!this.state.mounted) return;

        const container = document.querySelector('.patient_cards_cont .card_content_area');
        if (!container) return;

        // Clear existing cards
        container.innerHTML = '';

        // Combine all items into a single array with type information
        const allItems = [
            ...this.state.notes.map(note => ({ ...note, type: 'note' })),
            ...this.state.allergies.map(allergy => ({ ...allergy, type: 'allergy' })),
            ...this.state.vaccines.map(vaccine => ({ ...vaccine, type: 'vaccine' }))
        ];

        // Sort by creation date (newest first)
        allItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (allItems.length < 1) {
            container.innerHTML = `
                <div class="start_cont">
                    <p class="start_view_overlay">No Records Found</p>
                </div>
            `;
            return;
        }

        // Render all items
        allItems.forEach(item => {
            let card;
            switch (item.type) {
                case 'note':
                    card = this.createNoteCard(item);
                    break;
                case 'allergy':
                    card = this.createAllergyCard(item);
                    break;
                case 'vaccine':
                    card = this.createVaccineCard(item);
                    break;
            }
            if (card) {
                container.appendChild(card);
            }
        });
    }

    createAllergyCard(data) {
        const card = document.createElement('div');
        card.className = 'allergy_card';

        card.innerHTML = `
            <div class="top">
                <div class="left">
                    <p class="date">${date_formatter(data.created_at)}</p>
                    <p class="created_by">${data.created_by}</p>
                </div>
                <div class="right">
                    <div class="delete_btn btn ${this.visit_status == "active" ? "" : "visibility_hidden"}" title="Delete this allergy." id="delete_patient_allergy">
                        <span class='switch_icon_delete'></span>
                    </div>
                </div>
            </div>

            <div class="data">
                <p class="head">Allergen Type:</p>
                <p class="description">${data.allergy_type}</p>
            </div>
            
            <div class="data">
                <p class="head">Reaction Type:</p>
                <p class="description">${data.allergy_reaction}</p>
            </div>
            
            <div class="data specific_allergy">
                <p class="head">Specific Allergen:</p>
                <p class="description">${data.allergy_specific}</p>
            </div>
            
            <div class="data">
                <p class="head">Allergy Severity:</p>
                <p class="description">${data.allergy_severity}</p>
            </div>
            
            <div class="data">
                <p class="head">Allergy Condition:</p>
                <p class="description">${data.allergy_condition}</p>
            </div>
        `;

        const deleteBtn = card.querySelector('.delete_btn');
        if (this.visit_status == "active") {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                dashboardController.confirmPopUpView.PreRender({
                    callback: 'delete_allergy_request',
                    parameter: data.id,
                    title: 'Delete Allergy',
                    sub_heading: `Allergy: ${data.allergy_type}`,
                    description: 'Are you sure you want to delete this allergy?',
                    ok_btn: 'Delete',
                    cancel_btn: 'Cancel'
                });

                this.singleAllergyToDelete = card;
            });
        }

        return card;
    }

    createVaccineCard(data) {
        const card = document.createElement('div');
        card.className = 'vaccine_card';

        card.innerHTML = `
            <div class="top">
                <div class="left">
                    <p class="date">${date_formatter(data.created_at)}</p>
                    <p class="created_by">${data.created_by}</p>
                </div>
                <div class="right">
                    <div class="delete_btn btn ${this.edit_mode ? "" : "visibility_hidden"}" id="delete_patient_vaccine">
                        <span class='switch_icon_delete'></span>
                    </div>
                </div>
            </div>

            <div class="data">
                <p class="head">Vaccine Name:</p>
                <p class="description">${data.vaccine_name}</p>
            </div>
            
            <div class="data">
                <p class="head">Given Date:</p>
                <p class="description">${date_formatter(data.given_date)}</p>
            </div>
            
            ${data.note ? `
            <div class="data note">
                <p class="head">Note</p>
                <p class="description">${data.note}</p>
            </div>
            ` : ''}
        `;

        const deleteBtn = card.querySelector('.delete_btn');
        if (this.edit_mode) {
            deleteBtn.addEventListener('click', () => {
                dashboardController.confirmPopUpView.PreRender({
                    callback: 'delete_vaccine_request',
                    parameter: data.id,
                    title: 'Delete Vaccine Record',
                    sub_heading: `Vaccine: ${data.vaccine_name}`,
                    description: 'Are you sure you want to delete this vaccine record?',
                    ok_btn: 'Delete',
                    cancel_btn: 'Cancel'
                });

                this.singleVaccineToDelete = card;
            });
        }

        return card;
    }

    renderAllergyCards() {
        // Safe guard against rendering before mount
        if (!this.state.mounted) return;

        const container = document.querySelector('.patient_cards_cont .card_content_area');
        if (!container) return;

        // Clear existing cards
        container.innerHTML = '';

        if (this.state.allergies.length < 1) {
            container.innerHTML = `
                <div class="start_cont">
                    <p class="start_view_overlay">No Allergies Found</p>
                </div>
            `;
            return;
        }

        // Render allergies
        this.state.allergies.forEach(data => {
            const card = document.createElement('div');
            card.className = 'allergy_card';

            card.innerHTML = `
                <div class="top">
                    <div class="left">
                        <p class="date">${date_formatter(data.created_at)}</p>
                        <p class="created_by">${data.created_by}</p>
                    </div>
                    <div class="right">
                        <div class="delete_btn btn ${this.visit_status == "active" ? "" : "visibility_hidden"}" title="Delete this allergy." id="delete_patient_allergy">
                            <span class='switch_icon_delete'></span>
                        </div>
                    </div>
                </div>

                <div class="data">
                    <p class="head">Allergen Type:</p>
                    <p class="description">${data.allergy_type}</p>
                </div>
                
                <div class="data">
                    <p class="head">Reaction Type:</p>
                    <p class="description">${data.allergy_reaction}</p>
                </div>
                
                <div class="data specific_allergy">
                    <p class="head">Specific Allergen:</p>
                    <p class="description">${data.allergy_specific}</p>
                </div>
                
                <div class="data">
                    <p class="head">Allergy Severity:</p>
                    <p class="description">${data.allergy_severity}</p>
                </div>
                
                <div class="data">
                    <p class="head">Allergy Condition:</p>
                    <p class="description">${data.allergy_condition}</p>
                </div>
            `;

            const deleteBtn = card.querySelector('.delete_btn');
            if (this.visit_status == "active") {
                deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'delete_allergy_request',
                        parameter: data.id,
                        title: 'Delete Allergy',
                        sub_heading: `Allergy: ${data.allergy_type}`,
                        description: 'Are you sure you want to delete this allergy?',
                        ok_btn: 'Delete',
                        cancel_btn: 'Cancel'
                    });

                    this.singleAllergyToDelete = card;
                });
            }

            container.prepend(card);
        });
    }

    renderVaccineCards() {
        // Safe guard against rendering before mount
        if (!this.state.mounted) return;

        const container = document.querySelector('.patient_cards_cont .card_content_area');
        if (!container) return;

        // Clear existing cards
        container.innerHTML = '';

        if (this.state.vaccines.length < 1) {
            container.innerHTML = `
                <div class="start_cont">
                    <p class="start_view_overlay">No Vaccines Found</p>
                </div>
            `;
            return;
        }

        // Render vaccines
        this.state.vaccines.forEach(data => {
            const card = document.createElement('div');
            card.className = 'vaccine_card';

            card.innerHTML = `
                <div class="top">
                    <div class="left">
                        <p class="date">${date_formatter(data.created_at)}</p>
                        <p class="created_by">${data.created_by}</p>
                    </div>
                    <div class="right">
                        <div class="delete_btn btn ${this.edit_mode ? "" : "visibility_hidden"}" id="delete_patient_vaccine">
                            <span class='switch_icon_delete'></span>
                        </div>
                    </div>
                </div>

                <div class="data">
                    <p class="head">Vaccine Name:</p>
                    <p class="description">${data.vaccine_name}</p>
                </div>
                
                <div class="data">
                    <p class="head">Given Date:</p>
                    <p class="description">${date_formatter(data.given_date)}</p>
                </div>
                
                ${data.note ? `
                <div class="data note">
                    <p class="head">Note</p>
                    <p class="description">${data.note}</p>
                </div>
                ` : ''}
            `;

            const deleteBtn = card.querySelector('.delete_btn');
            if (this.edit_mode) {
                deleteBtn.addEventListener('click', () => {
                    dashboardController.confirmPopUpView.PreRender({
                        callback: 'delete_vaccine_request',
                        parameter: data.id,
                        title: 'Delete Vaccine Record',
                        sub_heading: `Vaccine: ${data.vaccine_name}`,
                        description: 'Are you sure you want to delete this vaccine record?',
                        ok_btn: 'Delete',
                        cancel_btn: 'Cancel'
                    });

                    this.singleVaccineToDelete = card;
                });
            }

            container.prepend(card);
        });
    }

    renderNoteCards() {
        // Safe guard against rendering before mount
        if (!this.state.mounted) return;

        const container = document.querySelector('.patient_cards_cont .card_content_area');
        if (!container) return;

        // Clear existing cards
        container.innerHTML = '';

        if (this.state.notes.length < 1) {
            container.innerHTML = `
                <div class="start_cont">
                    <p class="start_view_overlay">No Patient Notes Found</p>
                </div>
            `;
            return;
        }

        // Render notes
        this.state.notes.forEach(note => {
            container.prepend(this.createNoteCard(note));
        });
    }

    async deleteNote(noteId) {

        console.log(noteId);

        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/save_update_delete_patient_note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    note_id: noteId,
                    action: 'delete'
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

            notify('top_left', 'Note deleted successfully', 'success');

            // Update the state by filtering out the deleted note
            this.updateState({
                notes: this.state.notes.filter(note => note.id !== noteId)
            });

        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            dashboardController.loaderView.remove();
        }
    }

    async delete_allergy_request(id) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_allergy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.state.visitId,
                    allergy_id: id
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


            this.singleAllergyToDelete.remove();
            this.singleAllergyToDelete = null;

            // Also update the state by filtering out the deleted vaccine
            this.updateState({
                allergies: this.state.allergies.filter(allergy => allergy.id !== id)
            });

        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            dashboardController.loaderView.remove();
        }
    }

    async delete_vaccine_request(ids) {
        dashboardController.loaderView.render();

        try {
            const response = await fetch('/api/patient/delete_vaccine_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_id: this.state.visitId,
                    vaccine_ids: [ids],
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

            if (this.singleVaccineToDelete) {
                this.singleVaccineToDelete.remove();
                this.singleVaccineToDelete = null;

                // Also update the state by filtering out the deleted vaccine
                this.updateState({
                    vaccines: this.state.vaccines.filter(vaccine => vaccine.id !== ids)
                });
            }

        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            dashboardController.loaderView.remove();
        }
    }


    async RefetchData() {
        try {
            const response = await fetch('/api/patient/get_patient_notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visit_id: this.state.visitId,
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
                this.state.notes = result.data.note;
                this.state.allergies = result.data.allergy;
                this.state.vaccines = result.data.vaccine;
                this.renderCurrentCardType();
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
            @media screen and (max-width: 850px) {
                .patient_cards_cont {
                    width: 100%;
                    flex:none;
                }
            }
            .patient_cards_cont {
                scroll-snap-align: start;
                    height: 323px;
                    flex: none;
                    background-color: var(--pure_white_background);
                    border-radius: var(--main_border_r);
                    padding: var(--main_padding);

                     * {
                            transition: all 0s;
                        }


                &.expanded .card_content_area {
                    height: auto;
                    max-height: 500px;
                    overflow-y: auto;
                }

                .head_part {
                    position: relative;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .title_section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .card_type_tabs {
                    display: flex;
                    gap: 10px;
                    margin-left: 20px;
                }

                .card_type_tab {
                    padding: 8px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .card_type_tab.active {
                    background: var(--pri_color);
                    color: white;
                }

                .card_type_btn_group{
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .more_btn {
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 5px;
                    flex: none;
                    cursor: pointer;
                    position: relative;


                }

                .more_btn:hover {
                    background-color: var(--pri_op);
                    cursor: pointer;
                    span {
                        color: var(--light_pri_color);
                    }
                }

                .option_menu_popup {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 200px;
                    background-color: var(--pure_white_background);
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 100;
                    opacity: 0;
                    padding: 10px;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: all 0.2s ease-in-out;
                    
                    &.active {
                        opacity: 1;
                        visibility: visible;
                        transform: translateY(0);
                    }
                    
                    .option_item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 12px 15px;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                        border-radius: 10px;
                        
                        &:hover {
                            background-color: var(--pri_op);
                            
                            span {
                                color: var(--light_pri_color);
                            }
                            
                            p {
                                color: var(--light_pri_color);
                            }
                        }
                        
                        span {
                            color: var(--gray_text);
                            font-size: 14px;
                        }
                        
                        p {
                            font-weight: 500;
                            color: var(--gray_text);
                        }
                    }
                }

                /* Common card content area styles */
                .card_content_area {
                    display: flex;
                    flex-direction: row !important;
                    flex-wrap: wrap;
                    align-content: start;
                    overflow: auto;
                    gap: 15px;
                    margin-top: 15px;
                    min-height: 238px;
                    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                }

                .start_cont {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    .start_view_overlay {
                        font-size: 16px;
                        color: var(--gray_text);
                    }
                }

                /* Note card styles */
                        .note_card {
                            border-radius: var(--main_border_r);
                            border: solid 1px var(--pri_border_color);
                            padding: var(--main_padding);
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                            width: 32.5%;
                            min-width: 280px;
                            height: 180px;
                            overflow: hidden;
                            flex: none;
                            cursor: pointer;

                            .card_head {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;

                                .btn {
                                    width: 35px;
                                    height: 35px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border-radius: 5px;
                                    flex: none;
                                    cursor: pointer;

                                    span {
                                        font-size: 16px;
                                    }
                                }

                                .delete_btn:hover {
                                    background-color: var(--white_error_color_op1);

                                    span {
                                        color: var(--error_color);
                                    }
                                }
                            }

                            .date {
                                font-size: 20px;
                                font-weight: 900;
                            }

                            .detail {
                                display: -webkit-box;
                                -webkit-box-orient: vertical;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                -webkit-line-clamp: 7;
                            }
                        }

                        .note_card:hover {
                            background: var(--pri_op1);
                        }

                /* Allergy card styles */
                .allergy_card {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: 32.5%;
                    min-width: 280px;
                    padding: 20px;
                    border-radius: var(--main_border_r);
                    border: solid 1px var(--pri_border_color);
                    cursor: pointer;
                    height: 100%;
                    max-height: 238px;
                    overflow: hidden;
                    flex: none;

                    .top {
                        border: none;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .left {
                            width: 70%;
                        }

                        .right {
                            display: flex;
                            gap: 10px;

                            .btn {
                                width: 35px;
                                height: 35px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border-radius: 5px;
                                flex: none;
                                cursor: pointer;

                                span {
                                    font-size: 16px;
                                }
                            }

                            .btn:hover {
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
                        }

                        .date {
                            font-size: 20px;
                            font-weight: 900;
                        }
                    }

                    .data {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-block: 2px;
                        border-bottom: 1px solid var(--input_border);

                        .head {
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            display: inline-block;
                        }

                        .description {
                            width: 40%;
                            font-weight: 600;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            display: inline-block;
                        }
                    }

                    .data:last-child {
                        border: none;
                    }
                }

                .allergy_card:hover {
                    background: var(--pri_op1);
                }

                /* Vaccine card styles */
                .vaccine_card {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: 33.5%;
                    min-width: 280px;
                    padding: 20px;
                    border-radius: var(--main_border_r);
                    border: solid 1px var(--pri_border_color);
                    cursor: pointer;
                    height: 100%;
                    max-height: 238px;
                    overflow: hidden;
                    flex: none;

                    .top {
                        border: none;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .left {
                            width: 70%;
                        }

                        .right {
                            display: flex;
                            gap: 10px;

                            .btn {
                                width: 35px;
                                height: 35px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border-radius: 5px;
                                flex: none;
                                cursor: pointer;

                                span {
                                    font-size: 16px;
                                }
                            }

                            .btn:hover {
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
                        }

                        .date {
                            font-size: 20px;
                            font-weight: 900;
                        }

                    }

                    .data {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-block: 2px;
                        border-bottom: 1px solid var(--input_border);

                        .head {
                            font-weight: 500;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            display: inline-block;
                        }

                        .description {
                            width: 40%;
                            font-weight: 600;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            display: inline-block;
                        }
                    }

                    .note {
                        align-items: left;
                        flex-direction: column;
                        gap: 10px;

                        .head {
                            font-weight: 700;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            display: inline-block;
                            width: 100%;
                        }

                        .description {
                            width: 100%;
                            font-weight: 400;
                            white-space: unset;
                            text-overflow: unset;
                            overflow: unset;
                            display: unset;
                            word-break: break-all;
                        }
                    }

                    .data:last-child {
                        border: none;
                    }
                }

                .vaccine_card:hover {
                    background: var(--pri_op1);
                }

                /* Fullscreen overlay styles */
                    .full_screen_overlay {
                        width: auto;
                        height: 100%;

                        .full_screen {
                            background-color: var(--pure_white_background);
                            display: flex;
                            flex-direction: column;
                            height: 100%;
                        }
                    }

                    /* Changed from absolute for better fullscreen */
                    .full_screen_overlay.active {
                        position: absolute;
                        transform: translate(-50%, -50%);
                        left: 50%;
                        top: 50%;
                        z-index: 1000;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: var(--black-op2);
                        opacity: 1;

                       
                        .full_screen {
                            border-radius: var(--main_border_r);
                            padding: var(--main_padding);
                            background-color: var(--pure_white_background);
                            height: 90%;
                            width: 90%;
                            max-width: 1300px;
                            max-height: 650px;

                            .card_content_area{
                                height: 100%;
                            }
                        }
                    }
                }
            }

            
        `;
    }


}