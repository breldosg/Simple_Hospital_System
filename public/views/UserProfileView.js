import { screenCollection } from "../screens/ScreenCollection.js";
import { date_formatter, timeStamp_formatter } from "../script/index.js";

export class UserProfileView {
    constructor() {
        this.activeTab = "My details"; // Default active tab
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
        const tabs = document.querySelectorAll('.profile-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeTab = tab.textContent.trim();
                this.updateActiveTab();
                this.loadTabContent(this.activeTab);
            });
        });

        // Add event listener for password visibility toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = e.target.closest('.password-field').querySelector('input');
                input.type = input.type === 'password' ? 'text' : 'password';
            });
        });

        // Add event listener for password update form
        const passwordForm = document.querySelector('.password-form');
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
                        <p class="detail-value">${this.profileData.name}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Email</p>
                        <p class="detail-value">${this.profileData.email || ''}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Position</p>
                        <p class="detail-value">${this.profileData.position}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Department</p>
                        <p class="detail-value">Information Technology</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Specialization</p>
                        <p class="detail-value">Developer</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Phone</p>
                        <p class="detail-value">${this.profileData.phone}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Account Status</p>
                        <p class="detail-value">${this.profileData.verified ? 'Verified' : 'Unverified'}</p>
                    </div>
                    <div class="detail-row">
                        <p class="detail-label">Joined</p>
                        <p class="detail-value">${date_formatter(this.profileData.joined_date)}</p>
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
                    <br-form>
                    <div class="form-group">
                        <br-input label="Current Password" name="current_pass" type="password" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required></br-input>
                    </div>
                    <div class="form-group">
                        <br-input label="New Password" name="new_pass" type="password" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required></br-input>
                        <small>Your new password must be more than 8 characters.</small>
                    </div>
                    <div class="form-group">
                        <br-input label="Confirm New Password" name="confirm_new_pass" type="password" styles="
                            ${this.input_styles()}
                        " labelStyles="font-size: 12px;" required></br-input>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancel</button>
                        <button type="submit" class="btn-update">Update password</button>
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
}

