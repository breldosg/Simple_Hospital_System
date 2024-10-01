import { dashboardController } from "../controller/DashboardController.js";
import { frontRouter } from "../script/route.js";

export class loginScreen {

    constructor() {
        // globalize the nextpage function
        window.LoginUser = this.LoginUser.bind(this);
    }

    PreRender() {
        document.body.innerHTML = `
        <div class="wrapper">
            <div class="login_cont">

                <br-form callback="LoginUser"  styles="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;

                " class="loginForm">

                    <div class="img_cont">
                        <img src="/public/assets/logo/SubMark.png" alt="">
                    </div>
                    <p class="head_text">LOGIN</p>
                    <br-input styles="
                    border-radius: var(--input_border_r);
                    width: 300px;
                    padding: 15px;
                    background-color: var(--input_background);
                    font-weight: 600;
                    height: 47px;" name="username" placeholder="Username" type="text" required></br-input>
                    
                    
                    <br-input styles="
                    border-radius: var(--input_border_r);
                    width: 300px;
                    padding: 15px;
                    background-color: var(--input_background);
                    font-weight: 600;
                    height: 47px;
                    " placeholder="Enter your password" name="pass" type="password" required></br-input>

                    <br-button class="btn_main" type="submit" >Login</br-button>

                </br-form>

            </div>

        </div>
        `;
    }

    async LoginUser(data) {

        const btn_submit = document.querySelector('br-button[type="submit"]');
        btn_submit.setAttribute('loading', true);


        try {
            // send fetch request to the server with the data
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // Check if the response is successful (status 2xx)
            if (!response.ok) {
                throw new Error('Login failed. Server Error');
            }

            const result = await response.json(); // assuming server responds with JSON data

            if (result.success) {
                frontRouter.navigate('/dashboard');
            }
            else {
                alert(result.message);
                return;  // exit the function if login failed
            }
        } catch (error) {
            // if not successful, display an error message
            console.error('Error:', error);
            alert(error.message); // Show error to user
        }
        finally {
            //remove loader ver on wrapper
            btn_submit.setAttribute('loading', false);
        }
    }


}