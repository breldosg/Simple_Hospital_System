import { dashboardController } from "../controller/DashboardController.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, notify, timeStamp_formatter } from "../script/index.js";

export class UserProfileView {
    constructor() {
        this.activeTab = "My details"; // Default active tab
        window.updatePassword = this.updatePassword.bind(this);
    }

    async PreRender() {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // Fetch user profile data first
        this.profileData = await this.fetchData();
        console.log(this.profileData);
        if (!this.profileData) {
            return;
        }

        // Render initial structure
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.user_profile_cont');

        // Add event listeners for tabs
        this.setupEventListeners();

        // Load initial tab content
        this.loadTabContent(this.activeTab);
    }

    setupEventListeners() {
        const tabs = this.main_container.querySelectorAll('.profile-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeTab = tab.textContent.trim();
                this.updateActiveTab();
                this.loadTabContent(this.activeTab);
            });
        });

        // Add event listener for password visibility toggles
        this.main_container.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = e.target.closest('.password-field').querySelector('input');
                input.type = input.type === 'password' ? 'text' : 'password';
            });
        });

        var edit_profile_btn = this.main_container.querySelector('.edit_profile_btn');
        edit_profile_btn.addEventListener('click', () => {
            dashboardController.addUserViewPopup.PreRender({
                is_update: true,
                data: this.profileData
            });
            console.log(this.profileData);

        });

        // Add event listener for password update form
        const passwordForm = this.main_container.querySelector('.password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Password update logic would go here
                alert('Password updated successfully!');
            });
        }
    }

    updateActiveTab() {
        const tabs = document.querySelectorAll('.profile-tab');
        tabs.forEach(tab => {
            const tabName = tab.textContent.trim();
            if (tabName === this.activeTab) {
                tab.classList.add('active-tab');
            } else {
                tab.classList.remove('active-tab');
            }
        });
    }

    loadTabContent(tabName) {
        const contentContainer = document.querySelector('.tab-content');

        switch (tabName) {
            case "My details":
                contentContainer.innerHTML = this.renderMyDetailsTab();
                break;
            case "Password":
                contentContainer.innerHTML = this.renderPasswordTab();
                this.setupPasswordToggleListeners();
                break;
            case "Login Sessions":
                contentContainer.innerHTML = this.renderLoginSessionsTab();
                break;
            default:
                contentContainer.innerHTML = this.renderMyDetailsTab();
        }
    }

    setupPasswordToggleListeners() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = e.target.closest('.password-field').querySelector('input');
                input.type = input.type === 'password' ? 'text' : 'password';
            });
        });
    }

    renderMyDetailsTab() {
        return `
            <div class="my-details-content scale-up-hor-center">
                <h2>My Details</h2>
                <div class="details-grid">
                    <div class="detail-row">
                        <p class="detail-label">Name</p>
                        <p class="detail-value">${this.profileData.name == null ? 'N/A' : this.profileData.name}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Email</p>
                        <p class="detail-value">${this.profileData.email == null ? 'N/A' : this.profileData.email}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Gender</p>
                        <p class="detail-value">${this.profileData.gender == null ? 'N/A' : this.profileData.gender}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Position</p>
                        <p class="detail-value">${this.profileData.position == null ? 'N/A' : this.profileData.position}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Department</p>
                        <p class="detail-value">${this.profileData.department == null ? 'N/A' : this.profileData.department}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Specialization</p>
                        <p class="detail-value">${this.profileData.specialist == null ? 'N/A' : this.profileData.specialist}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Phone</p>
                        <p class="detail-value">${this.profileData.phone == null ? 'N/A' : this.profileData.phone}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Account Status</p>
                        <p class="detail-value">${this.profileData.verified == null ? 'N/A' : this.profileData.verified ? 'Verified' : 'Unverified'}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Joined</p>
                        <p class="detail-value">${this.profileData.joined_date == null ? 'N/A' : date_formatter(this.profileData.joined_date)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderPasswordTab() {
        return `
            <div class="password-content scale-up-hor-center">
                <h2>Password</h2>
                <p>Please enter your current password to change your password.</p>
                <div class="password-form">
                    <br-form callback="updatePassword" class="password_form">
                    <div class="form-group">
                        <br-input label="Current Password" name="current_password" type="password" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required></br-input>
                    </div>
                    <div class="form-group">
                        <br-input label="New Password" name="new_password" type="password" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required></br-input>
                        <small>Your new password must be more than 8 characters.</small>
                    </div>
                    <div class="form-group">
                        <br-input label="Confirm New Password" name="confirm_new_password" type="password" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required></br-input>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancel</button>
                        <br-button type="submit" class="btn-update">Update password</br-button>
                    </div>
                </br-form>
                </div>
            </div>
        `;
    }

    renderLoginSessionsTab() {
        const sessionsHTML = this.profileData.last_login.map(session => `
            <div class="session-item">
                <div class="session-device">${session.device}</div>
                <div class="session-details">${session.location} • ${timeStamp_formatter(session.date)}</div>
                ${session.current ? '<div class="session-status current">Current</div>' : ''}
            </div>
        `).join('');

        return `
            <div class="login-sessions-content scale-up-hor-center">
                <h2>Login Sessions</h2>
                <div class="sessions-list">
                    ${sessionsHTML}
                </div>
            </div>
        `;
    }

    ViewReturn() {
        return `
    <div class="user_profile_cont">
        <div class="profile-header">
            <div class="profile-avatar">
                <img src="${this.profileData.profile_pic}" alt="User Avatar">
                ${this.profileData.verified ? '<span class="verified-badge">✓</span>' : ''}
            </div>
            <div class="profile-info">
                <h1>${this.profileData.name} #${this.profileData.id}</h1>
                <p class="profile-email">${this.profileData.email || ''}</p>
                <p class="profile-username">@${this.profileData.user_name}</p>
            </div>
            <div class="profile-actions">
                <div class="edit_profile_btn">
                    <span class='switch_icon_edit'></span>
                </div>
            </div>
        </div>
        
        <div class="profile-tabs">
            <div class="profile-tab ${this.activeTab === 'My details' ? 'active-tab' : ''}">My details</div>
            <div class="profile-tab ${this.activeTab === 'Password' ? 'active-tab' : ''}">Password</div>
            <div class="profile-tab ${this.activeTab === 'Login Sessions' ? 'active-tab' : ''}">Login Sessions</div>
        </div>
        
        <div class="tab-content">
            <!-- Tab content will be loaded dynamically -->
        </div>
    </div>
        `;
    }

    async fetchData() {
        try {
            const response = await fetch('/api/users/get_staff_profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
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

            return result.success ? result.data : false;
        } catch (error) {
            console.error('Error:', error);
            notify('top_left', error.message, 'error');
            // Return fallback data in case of error
            return false;
        }
    }

    input_styles() {
        return `
        border-radius: var(--input_main_border_r);
                            width: 50vw;
                            padding: 10px;
                            height: 41px;
                            background-color: transparent;
                            border: 2px solid var(--input_border);`;
    }

    async updatePassword(data) {
        const btn_submit = this.main_container.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);

        const password_form = this.main_container.querySelector('.password_form');

        var confirm_new_password = data.confirm_new_password;
        var new_password = data.new_password;

        if (confirm_new_password != new_password) {
            notify('top_left', 'New password and confirm new password do not match', 'warning');
            btn_submit.setAttribute('loading', false);
            return;
        }

        try {
            const response = await fetch('/api/users/reset_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
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
                password_form.reset();

            } else {
                notify('top_left', result.message, 'warning');
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
        } finally {
            btn_submit.setAttribute('loading', false);
        }
    }
}

