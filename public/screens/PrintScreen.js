
import { applyStyle, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";


export class PrintScreen {

    constructor() {
        applyStyle(this.style());
    }

    async PreRender() {
        // Fetch the staff data from the server using your API
        const StaffData = await this.fetchData();
        if (StaffData) {
            this.Staff_name = StaffData.name;
            this.staff_role = StaffData.role_name;
            this.staff_role_id = StaffData.role;
        }


        globalStates.setState({ user_data: StaffData });
        // Pre-rendering logic goes here
        this.render();
        this.setup()

    }

    render() {
        document.body.innerHTML = `
        <div class="wrapper">

            <div class="main_container">

                <div class="print_cont">


                </div>

            </div>
            <div class="alert_collection">
                <!-- -------------------- pop up here ----------------------- -->
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

            if (result.status == 401) {
                console.log('login');
                frontRouter.navigate('/login');
            }





            return result.success ? result.data : null;
        } catch (error) {
            notify('top_left', error.message, 'error');
            return null;
        }
    }

    style() {
        return `
        .main_container {
            .print_cont{
                width: 100%;
                height: 100%;
                background-color: var(--pure_white_background);
                background: var(--gradient_background);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0px;
                position: relative;
                z-index: 1;
            }
        }
        `
    }

}
