

export class dashboardScreen {

    constructor() {
        this.Staff_name = "";
        this.staff_role = "";
    }

    async PreRender() {
        console.log('name', this.Staff_name);

        // if (this.Staff_name == "") {
        const StaffData = await this.fetchData();
        if (StaffData) {
            this.Staff_name = StaffData.name;
            this.staff_role = StaffData.role_name;
        }
        // }
        // else {

        //     // Pre-rendering logic goes here
        this.render();
        //     // this.listeners();
        this.setup()
        // }
    }

    render() {
        document.body.innerHTML = `
        <div class="wrapper">

            <div class="main_container">

                <div class="top_cont">

                    <!-- -----------------------Navigation come here------------------- -->
                    
                    <br-navigation name="${this.Staff_name}" role="${this.staff_role}"></br-navigation>

                </div>

                <div class="update_cont">


                </div>

            </div>

            <div class="popup">

            </div>
            
            <div class="loader_cont active">
                    <div class="loader"></div>
            </div>
        </div>
        `;
    }

    setup() {
        // Remove active class from the loader container if it exists
        const loader_cont = document.querySelector('.loader_cont');
        if (loader_cont) {
            loader_cont.classList.remove('active');
        }
    }

    async fetchData() {
        try {
            const response = await fetch('/api/users/first_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: ''
            });

            if (!response.ok) {
                throw new Error('Server Error');
            }

            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
            return null;
        }
    }

}
