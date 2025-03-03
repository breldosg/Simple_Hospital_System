import { screenCollection } from "../screens/ScreenCollection.js";

export class UserProfileView {
    constructor() {
        this.isFormChanged = false;
    }

    async PreRender() {
        // Ensure dashboard is rendered
        const check_dashboard = document.querySelector('.update_cont');
        if (!check_dashboard) {
            await screenCollection.dashboardScreen.PreRender();
        }

        // Render initial structure
        const cont = document.querySelector('.update_cont');
        cont.innerHTML = this.ViewReturn();

        this.main_container = document.querySelector('.user_profile_cont');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const inputs = document.querySelectorAll('.profile-input');

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.isFormChanged = true;
            });
        });

        const editProfileBtn = document.querySelector('.edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                // Handle edit profile click
                console.log('Edit profile clicked');
            });
        }

        const changePasswordBtn = document.querySelector('.change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                // Handle change password click
                console.log('Change password clicked');
            });
        }

        const deleteAccountBtn = document.querySelector('.delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                // Handle delete account click
                console.log('Delete account clicked');
            });
        }
    }

    async saveChanges() {
        // Collect form data
        const formData = {
            email: document.querySelector('#email').value,
            phone: document.querySelector('#phone').value
        };

        // TODO: Implement API call to save changes
        console.log('Saving changes:', formData);

        // Reset form state
        this.isFormChanged = false;
    }

    ViewReturn() {
        return `
    <div class="user_profile_cont">
        <div class="user_profile_card">
            <div class="user-header">
                <div class="user-info">
                    <div class="profile-image">

                    </div>
                    <input type="text" id="username" class="profile_name_input" value="Kelvin John" />
                </div>
                <div class="edit-profile-btn">
                    <button class="btn_styles change-password-btn">Update Password</button>
                    <button class="btn_styles delete-account-btn">Delete Account</button>
                </div>
            </div>

            <div class="profile-section">
                <p class="profile-section-title">User Information</p>

                <div class="profile-form">
                    <div class="form-content">
                        <div class="form-group">
                            <p>Date of Birth</p>
                            <input type="date" id="date_of_birth" class="profile-input"/>
                        </div>

                        <div class="form-group">
                            <p>Gender</p>
                            <select id="gender" class="profile-select">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <p>Mobile Number</p>
                            <input type="tel" id="phone" class="profile-input" value="+1 675 346 23-10" />
                        </div>

                        <div class="form-group">
                            <p>Secondary Phone Number</p>
                            <input type="tel" id="secondary_phone" class="profile-input" value="+1 675 346 23-10" />
                        </div>
                        
                        <div class="form-group">
                            <p>Nationality</p>
                            <input type="text" id="nationality" class="profile-input" value="American" />
                        </div>
                        
                        <div class="form-group">
                            <p>Address</p>
                            <input type="text" id="address" class="profile-input" value="123 Main St, Anytown, USA" />
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button class=" btn_styles change-password-btn">Update Profile</button>
                        <button class=" btn_styles delete-account-btn">Cancel Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
        `;
    }


}