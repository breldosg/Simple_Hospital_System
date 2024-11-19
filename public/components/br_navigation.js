import { frontRouter } from "../script/route.js";

export class BrCustomNavigation extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.setup();
        this.listeners();
        window.addEventListener('popstate', () => {
            this.setup();
        });
    }

    render() {
        const staff_name = this.getAttribute('name') || '';
        const staff_role = this.getAttribute('role') || '';
        const nameInitial = staff_name.split('')[0];

        this.shadowRoot.innerHTML = `
<style>

${this.Styles()}

</style>

<div class="top">
    <div class="nav_cont">

        <div link="/users" class="nav_item active">Users</div>
        <div link="/patient" class="nav_item">Patients</div>
        <div link="/pharmacy" class="nav_item">Pharmacy</div>
        <div link="/store" class="nav_item">Store</div>
        <div link="/notice" class="nav_item">Notice</div>

    </div>

    <div class="staff_cont">
        <div class="word_cont">
            <p class="main_name">${staff_name}</p>
            <p class="sub_name">${staff_role}</p>
        </div>
        <div class="imag">
            <span>${nameInitial.toLocaleUpperCase()}</span>
        </div>
    </div>
</div>
<div class="choice_collection">

    <div class="nav_collection active" type="/users">

        <a href="/users/userlist" data-link class="choice_item active">User List</a>
        <a href="/users/adduser" data-link class="choice_item ">Add User</a>
        <a href="/users/attendance" data-link class="choice_item">Attendance</a>

    </div>

    <div class="nav_collection" type="/patient">

        <a href="/patient/viewpatient" data-link class="choice_item">View Patient</a>
        <a href="/patient/addpatient" data-link class="choice_item">Add Patient</a>
        <a href="/patient/onprogresspatient" data-link class="choice_item">On Progress</a>

    </div>

    <div class="nav_collection" type="/pharmacy">
        <a href="/pharmacy/viewpharmacyproducts" data-link class="choice_item">View All Products</a>
        <a href="/pharmacy/viewcategory" data-link class="choice_item">View All category</a>
        <a href="/pharmacy/addcategory" data-link class="choice_item">Add category</a>
    </div>

    <div class="nav_collection" type="/store">
        <a href="/store/viewpharmacyproducts" data-link class="choice_item">View All Products</a>
        <a href="/store/viewcategory" data-link class="choice_item">View All category</a>
        <a href="/store/addcategory" data-link class="choice_item">Add category</a>
        <a href="/store/viewinatakebatch" data-link class="choice_item">View All batch</a>
    </div>

    <div class="nav_collection " type="/notice">

        <a href="/notice/viewnotice" data-link class="choice_item">View All notice</a>
        <a href="/notice/addnotice" data-link class="choice_item">Add notice</a>

    </div>
</div>
`;
    }

    Styles() {
        return `
            @import url('https://cdn.jsdelivr.net/gh/breldosg/Xt-style-pack@main/icons/style.css');

    * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        font-family: "DM Sans", sans-serif;
        color: var(--main_text);
        transition: all 0.3s ease-in;
    }

    a {
        text-decoration: none;
    }

    :host {
        width: 100%;
        height: 100%;
        background-color: var(--white);
        display: flex;
        flex-direction: column;
        /* justify-content: space-between; */
        align-items: center;
    }

    .top {
        width: 100%;
        background-color: var(--pri_color);
        height: 40%;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
        padding: 0 50px;

        .nav_cont {
            display: flex;
            align-items: end;
            height: 100%;

            .nav_item {
                display: flex;
                justify-content: center;
                align-items: center;
                padding-inline: 20px;
                border-radius: 5px 5px 0 0;
                height: 80%;
                cursor: pointer;
                font-weight: bold;
                color: var(--white);
            }

            .nav_item.active {
                background-color: white;
                color: var(--main_text);
            }

        }

        .staff_cont {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            gap: 10px;

            * {
                color: var(--white);
            }


            .word_cont {
                text-align: right;

                .main_name {
                    font-weight: bold;
                    text-transform: capitalize;
                }

                .sub_name {
                    font-weight: 400;
                    font-size:13px;
                    text-transform: capitalize;
                }
            }

            .imag {
                width: 50px;
                height: 50px;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: bold;
                background-color: var(--white_op);
            }

        }

    }

    .choice_collection {
        width: 100%;
        height: 60%;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 50px;
        position: relative;


        .nav_collection {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0 50px;
            gap: 10px;
            position: absolute;
            top: 0%;
            left: 0%;
            background-color: var(--white);
            z-index: 0;
            opacity: 0;
        }

        .nav_collection.active {
            z-index: 1;
            opacity: 1;
        }

        .choice_item {
            height: 40px;
            padding-inline: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            border-radius: var(--main_border_r);
            cursor: pointer;
        }

        .choice_item.active {
            background-color: var(--pri_op);
            color: var(--pri_color);
        }

    }
        `;
    }

    listeners() {
        const links = this.shadowRoot.querySelectorAll('a');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (e.target.tagName.toLowerCase() === 'a' && e.target.hasAttribute('data-link')) {
                    e.preventDefault();
                    links.forEach(rLink => {
                        rLink.classList.remove('active');
                    })
                    link.classList.add('active');

                    frontRouter.navigate(e.target.getAttribute('href'));
                }
            });
        })

        const nav_item = this.shadowRoot.querySelectorAll('.nav_item');
        const nav_collection = this.shadowRoot.querySelectorAll('.nav_collection');

        nav_item.forEach(item => {
            item.addEventListener('click', () => {
                nav_item.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                nav_collection.forEach(nav => {
                    if (nav.getAttribute('type') === item.getAttribute('link')) {
                        nav.classList.add('active');
                    } else {
                        nav.classList.remove('active');
                    }
                })

            })
        })

    }

    setup() {
        // Get the current path, default to '/users' if on '/dashboard'
        const rawPath = window.location.pathname.toLowerCase();

        // Find all nav items
        const navs = this.shadowRoot.querySelectorAll('.nav_item');
        const nav_collection = this.shadowRoot.querySelectorAll('.nav_collection');
        const choiceNavs = this.shadowRoot.querySelectorAll('.choice_item');
        let activeFound = false;

        //split path that found by /
        const pathParts = rawPath.split('/');
        pathParts.shift(); // remove empty string at the beginning


        // nav_collection.forEach(nav => {
        //     if (nav.getAttribute('type') === '/' + pathParts[0]) {
        //         nav.classList.add('active');
        //         activeFound = true;
        //         choiceNavs.forEach(choiceNav => {
        //             if (choiceNav.getAttribute('href') === '/' + pathParts.join('/')) {
        //                 choiceNav.classList.add('active');
        //             } else {
        //                 choiceNav.classList.remove('active');
        //             }
        //         })
        //     }
        //     else {
        //         nav.classList.remove('active');
        //     }
        // });

        // navs.forEach(nav => {
        //     const navPath = nav.getAttribute('link').toLowerCase();

        //     if (navPath === '/' + pathParts[0]) {
        //         nav.classList.add('active');
        //         activeFound = true;

        //         if (pathParts.length == 2) {
        //             choiceNavs.forEach(choiceNav => {
        //                 if (choiceNav.getAttribute('href') === '/' + pathParts.join('/')) {
        //                     choiceNav.classList.add('active');
        //                 } else {
        //                     choiceNav.classList.remove('active');
        //                 }
        //             })
        //         }

        //     } else {
        //         nav.classList.remove('active');
        //     }

        // });

        // // If no matching nav item was found, set the first item as active
        // if (!activeFound && navs.length > 0) {
        //     navs[0].classList.add('active');
        //     nav_collection[0].classList.add('active');
        // }

        navs.forEach(nav => {
            const navPath = nav.getAttribute('link').toLowerCase();

            if (navPath === '/' + pathParts[0]) {
                nav.classList.add('active');
                activeFound = true;
            }
            else {
                nav.classList.remove('active');
            }
        })

        if (!activeFound && navs.length > 0) {
            navs[0].classList.add('active');
            activeFound = false;
        }

        nav_collection.forEach(nav => {
            const navPath = nav.getAttribute('type');



            if (navPath === '/' + pathParts[0]) {
                nav.classList.add('active');
                activeFound = true;

                if (pathParts.length >= 2) {

                    // remove the other path out of the first two
                    pathParts.splice(2, 1)
                    choiceNavs.forEach(choiceNav => {

                        if (choiceNav.getAttribute('href') === '/' + pathParts.join('/')) {
                            choiceNav.classList.add('active');
                        } else {
                            choiceNav.classList.remove('active');
                        }
                    })
                }
                else {

                    const nav_choices = this.shadowRoot.querySelectorAll('.nav_collection.active .choice_item');

                    if (nav_choices.length > 0) {
                        nav_choices[0].classList.add('active');
                    }

                }
            }

            else {
                nav.classList.remove('active');
            }
        })

        if (!activeFound && nav_collection.length > 0) {
            nav_collection[0].classList.add('active');
            activeFound = false;
        }
    }
}