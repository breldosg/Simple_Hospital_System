import { applyStyle, notify } from "../script/index.js";
import { frontRouter } from "../script/route.js";

export class loginScreen {

    constructor() {
        // globalize the LoginUser function
        window.LoginUser = this.LoginUser.bind(this);
        this.is_sent = false;
        applyStyle(this.style(),'login_screen_style')
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
                    padding: 5px 15px;
                    background-color: var(--input_background);
                    font-weight: 600;
                    height: 47px;" name="username" placeholder="Username" type="text" required></br-input>
                    
                    
                    <br-input styles="
                    border-radius: var(--input_border_r);
                    width: 300px;
                    padding: 5px 15px;
                    background-color: var(--input_background);
                    font-weight: 600;
                    height: 47px;
                    " placeholder="Enter your password" name="pass" type="password" required></br-input>

                    <br-button class="btn_main" type="submit" >Login</br-button>

                    
                    <div class="error_login">
                        <p></p>
                    </div>
                </br-form>
                    

            </div>

        </div>
        `;
    }

    async LoginUser(data) {

        if (this.is_sent) return; // prevent sending request twice
        this.is_sent = true;

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

            // assuming server responds with JSON data

            if (result.success) {
                frontRouter.navigate('/dashboard');
            }
            else {
                notify('login', result.message, 'error');
                return;  // exit the function if login failed
            }
        } catch (error) {
            // if not successful, display an error message
            console.error('Error:', error);
            notify('login', error.message, 'error');
        }
        finally {
            this.is_sent = false;  // reset is_sent flag to false for next request
            //remove loader ver on wrapper
            btn_submit.setAttribute('loading', false);
        }
    }

    style() {
        return `
        .login_cont {
            width: 100%;
            height: 100%;
            position: relative;
            background-color: var(--white_background);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 10px;

            .loginForm {
                /* box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); */
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                z-index: 2;

                .img_cont {
                    width: 75px;
                    height: 75px;

                    img {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        object-fit: contain;
                        object-position: center;
                    }
                }

                .head_text {
                    font-size: 30px;
                    font-weight: 700;
                }

                input {
                    border-radius: var(--input_border_r);
                    width: 300px;
                    padding: 15px;
                    background-color: var(--input_background);
                    border: none;
                    font-weight: 600;
                    height: 47px;
                }

                .password-container {
                    border-radius: var(--input_border_r);
                    background-color: var(--input_background);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 300px;
                    padding: 15px;
                    height: 47px;
                    overflow: hidden;

                    .password-input {
                        width: calc(100% - 40px);
                        padding: 0px;
                        height: 100%;
                        border: none;
                        background: transparent;
                        font-weight: 600;
                        border-radius: 0;
                    }

                    .toggle-password {
                        cursor: pointer;
                        font-size: 18px;
                        width: 30px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        /* background-color: rebeccapurple; */
                    }
                }
            }

            .error_login {
                width: 100%;
                padding: 20px;
                background-color: var(--error_background_color);
                border: 1.5px var(--error_color) solid;
                border-radius: 30px;
                opacity: 0;

                p {
                    text-align: center;
                    font-weight: 500;
                    color: var(--white);
                }
            }

            .error_login.active {
                opacity: 1;
            }
        }

        .login_cont:before {
            content: "";
            position: absolute;
            z-index: 1;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            /* background-image: url(../files/background.jpg);
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center; */
            background-color: #797c85;
            opacity: 0.5;
            background-image: repeating-radial-gradient(circle at 0 0,
                    transparent 0,
                    #797c85 7px),
                repeating-linear-gradient(#bec6a055, #bec6a0);
            opacity: 0.2;
        }
        `
    }


}