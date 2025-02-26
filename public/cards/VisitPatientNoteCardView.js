import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class VisitPatientNoteCardView {
    constructor() {
        this.state = {
            visitId: null,
            notes: [],
            isLoading: false,
            mounted: false
        };

        // Bind methods
        this.save_patient_note = this.save_patient_note.bind(this);
        this.deleteNote = this.deleteNote.bind(this);
        this.renderNoteCards = this.renderNoteCards.bind(this);
        this.updateState = this.updateState.bind(this);

        window.save_patient_note = this.save_patient_note;
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
        // Only render if component is mounted
        if (this.state.mounted) {
            this.renderNoteCards();
        }
    }

    async PreRender(params) {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // Update state but don't trigger render yet
        this.state = {
            ...this.state,
            notes: params.data || [],
            visitId: params.visit_id
        };

        // Create and mount the component
        const cont = document.querySelector('.single_visit_cont .more_visit_detail');
        if (cont) {
            cont.classList.add('active');
            cont.appendChild(this.ViewReturn());

            // Mark as mounted and then render notes
            this.state.mounted = true;
            this.renderNoteCards();
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
                    <div class="delete_btn btn" data-note-id="${data.id}">
                        <span class='switch_icon_delete'></span>
                    </div>
                </div>
            </div>
            <p class="detail">${data.note}</p>
        `;

        const deleteBtn = card.querySelector('.delete_btn');
        deleteBtn.addEventListener('click', () => this.deleteNote(data.id));

        return card;
    }

    renderNoteCards() {
        // Safe guard against rendering before mount
        if (!this.state.mounted) return;

        const container = document.querySelector('.patient_note_cards_cont_cont .body_part');
        if (!container) return;

        // Clear existing cards
        container.innerHTML = '';

        if (this.state.notes.length < 1) {
            container.innerHTML = `
                <div class="start_cont">
                    <p class="start_view_overlay">No Patient Note Found</p>
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
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        this.updateState({ isLoading: true });

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

            if (!response.ok) {
                throw new Error('Failed to delete note. Server Error');
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
                this.updateState({
                    notes: this.state.notes.filter(note => note.id !== noteId)
                });
                notify('top_left', 'Note deleted successfully', 'success');
            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            this.updateState({ isLoading: false });
        }
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

                this.updateState({
                    notes: [result.data, ...this.state.notes]
                });
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
        card.className = 'more_visit_detail_card patient_note_cards_cont_cont';

        card.innerHTML = `
            <div class="full_screen_overlay">
                <div class="full_screen">
                    <div class="head_part">
                        <h4 class="heading">Patient Note</h4>
                        <div class="add_btn" id="add_patient_note_btn">
                            <span class='switch_icon_add'></span>
                        </div>
                    </div>
                    <div class="body_part patient_note_cards_cont"></div>
                </div>
            </div>
        `;

        const addBtn = card.querySelector('#add_patient_note_btn');
        addBtn.addEventListener('click', () => {
            dashboardController.addPatientNotePopUpView.PreRender();
        });

        return card;
    }
}