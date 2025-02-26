import { dashboardController } from "../controller/DashboardController.js";
import { notify } from "../script/index.js";
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
        const staff_role_id = this.getAttribute('role_id') || '';
        const nameInitial = staff_name.split('')[0];

        this.shadowRoot.innerHTML = `
        <style>${this.Styles()}</style>
        ${this.createTopNavigation(staff_name, staff_role, nameInitial)}
        ${this.createNavigationChoices(staff_role_id)}
    `;
    }

    createTopNavigation(staffName, staffRole, nameInitial) {
        return `
            <div class="top">
                <div class="nav_cont">
                    ${this.createMainNavItems(this.getAttribute('role_id'))}
                </div>
                <div class="staff_cont" id="user_profile">
                    <div class="word_cont">
                        <p class="main_name">${staffName}</p>
                        <p class="sub_name">${staffRole}</p>
                    </div>
                    <div class="imag">
                        <span>${nameInitial}</span>
                    </div>
                    <div class="profile-dropdown">
                        <div class="email-section">
                            <p class="email">${staffName.toLowerCase()}@gmail.com</p>
                        </div>
                        <div class="menu-items">
                            <a href="/users/account" class="menu-item" data-link>
                                ACCOUNT SETTINGS
                            </a>
                            <a href="/logout" class="menu-item">
                                LOG OUT
                                <span class='switch_icon_exit_to_app'></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createMainNavItems(roleId) {
        // Define navigation items per role
        const roleNavItems = {
            // Doctor role
            'DCT': [
                { label: 'Patients', link: '/patient' },
                { label: 'Notice', link: '/notice' }
            ],
            // Admin/ICT role
            'ICT': [
                { label: 'Users', link: '/users' },
                { label: 'Patients', link: '/patient' },
                { label: 'Pharmacy', link: '/pharmacy' },
                { label: 'Radiology', link: '/radiology' },
                { label: 'Laboratory', link: '/laboratory' },
                { label: 'Store', link: '/store' },
                { label: 'Billing', link: '/billing' },
                { label: 'Notice', link: '/notice' }
            ],
            // Pharmacist role
            'RPT': [
                { label: 'Pharmacy', link: '/pharmacy' },
                { label: 'Store', link: '/store' },
                { label: 'Notice', link: '/notice' }
            ],
            // Lab technician role
            'LBT': [
                { label: 'Laboratory', link: '/laboratory' },
                { label: 'Notice', link: '/notice' }
            ],
            // Radiologist role
            'RDT': [
                { label: 'Radiology', link: '/radiology' },
                { label: 'Notice', link: '/notice' }
            ],
            // Billing role
            'BIL': [
                { label: 'Billing', link: '/billing' },
                { label: 'Notice', link: '/notice' }
            ]
        };

        // Get navigation items for the role, fallback to empty array if role not found
        const navItems = roleNavItems[roleId] || [];

        return navItems.map((item, index) =>
            `<div link="${item.link}" class="nav_item ${index === 0 ? 'active' : ''}">${item.label}</div>`
        ).join('');
    }

    createNavigationChoices(roleId) {
        // Define navigation sections per role
        const roleNavigationSections = {
            'DCT': [
                {
                    type: '/patient',
                    choices: [
                        { label: 'View Patient', href: '/patient/viewpatient' },
                        { label: 'On Progress Visits', href: '/patient/activevisit' }
                    ]
                },

                {
                    type: '/notice',
                    choices: [
                        { label: 'View All notice', href: '/notice/viewnotice' }
                    ]
                }
            ],
            'ICT': [
                {
                    type: '/users',
                    choices: [
                        { label: 'User List', href: '/users/userlist' },
                        { label: 'Add User', href: '/users/adduser' },
                        { label: 'Attendance', href: '/users/attendance' }
                    ]
                },
                {
                    type: '/patient',
                    choices: [
                        { label: 'View Patient', href: '/patient/viewpatient' },
                        { label: 'Add Patient', href: '/patient/addpatient' },
                        { label: 'On Progress Visits', href: '/patient/activevisit' }
                    ]
                },
                {
                    type: '/pharmacy',
                    choices: [
                        { label: 'View All Products', href: '/pharmacy/viewpharmacyproducts' },
                        { label: 'View All category', href: '/pharmacy/viewcategory' },
                        { label: 'Add category', href: '/pharmacy/addcategory' },
                        { label: 'Order List', href: '/pharmacy/orderlist' },
                        { label: 'Active Visits', href: '/pharmacy/activevisits' }
                    ]
                },
                {
                    type: '/radiology',
                    choices: [
                        { label: 'Active Visits', href: '/radiology/activevisits' },
                    ]
                },
                {
                    type: '/laboratory',
                    choices: [
                        { label: 'Active Visits', href: '/laboratory/activevisits' },
                    ]
                },
                {
                    type: '/store',
                    choices: [
                        { label: 'View All Products', href: '/store/viewpharmacyproducts' },
                        { label: 'View All category', href: '/store/viewcategory' },
                        { label: 'Add category', href: '/store/addcategory' },
                        { label: 'View All batch', href: '/store/viewinatakebatch' },
                        { label: 'Pharmacy Orders', href: '/store/orderlist' }
                    ]
                },
                {
                    type: '/billing',
                    choices: [
                        { label: 'View Active Bills', href: '/billing/activebills' },
                        { label: 'View Prices', href: '/billing/viewprices' },
                    ]
                },
                {
                    type: '/notice',
                    choices: [
                        { label: 'View All notice', href: '/notice/viewnotice' },
                        { label: 'Add notice', href: '/notice/addnotice' }
                    ]
                }
            ],
            'RPT': [
                {
                    type: '/pharmacy',
                    choices: [
                        { label: 'View All Products', href: '/pharmacy/viewpharmacyproducts' },
                        { label: 'View All category', href: '/pharmacy/viewcategory' },
                        { label: 'Active Visits', href: '/pharmacy/activevisits' }
                    ]
                },
                {
                    type: '/store',
                    choices: [
                        { label: 'View All Products', href: '/store/viewpharmacyproducts' },
                        { label: 'View All batch', href: '/store/viewinatakebatch' }
                    ]
                },
                {
                    type: '/notice',
                    choices: [
                        { label: 'View All notice', href: '/notice/viewnotice' }
                    ]
                }
            ],
            'LBT': [
                {
                    type: '/laboratory',
                    choices: [
                        { label: 'Active Visits', href: '/laboratory/activevisits' }
                    ]
                },
                {
                    type: '/notice',
                    choices: [
                        { label: 'View All notice', href: '/notice/viewnotice' }
                    ]
                }
            ],
            'RDT': [
                {
                    type: '/radiology',
                    choices: [
                        { label: 'Active Visits', href: '/radiology/activevisits' }
                    ]
                },
                {
                    type: '/notice',
                    choices: [
                        { label: 'View All notice', href: '/notice/viewnotice' }
                    ]
                }
            ],
            'BIL': [
                {
                    type: '/billing',
                    choices: [
                        { label: 'View Active Bills', href: '/billing/activebills' },
                        { label: 'View Prices', href: '/billing/viewprices' }
                    ]
                },
                {
                    type: '/notice',
                    choices: [
                        { label: 'View All notice', href: '/notice/viewnotice' }
                    ]
                }
            ]
        };

        const navigationSections = roleNavigationSections[roleId] || [];

        return `
            <div class="choice_collection">
                ${navigationSections.map(section => `
                    <div class="nav_collection ${section.type === '/users' ? 'active' : ''}" type="${section.type}">
                        ${section.choices.map(choice =>
            `<a href="${choice.href}" data-link class="choice_item">${choice.label}</a>`
        ).join('')}
                    </div>
                `).join('')}
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
        font-family: inherit;
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
        height: 45%;
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
                font-size: 14px;
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
            position: relative;

            * {
                color: var(--white);
            }


            .word_cont {
                text-align: right;

                .main_name {
                    font-weight: bold;
                    text-transform: capitalize;
                    font-size: 14px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    display: inline-block;
                }

                .sub_name {
                    font-weight: 400;
                    font-size:10px;
                    text-transform: capitalize;
                }
            }

            .imag {
                width: 40px;
                height: 40px;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: bold;
                background-color: var(--white_op);
            }

            .profile-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--white);
                border-radius: var(--main_border_r);
                min-width: 200px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: all 0.3s ease;
                z-index: 1000;
                margin-top: 5px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            

            .email-section {
                padding: 12px;
                border-bottom: 1px solid var(--border_color);
            }

            .email {
                color: var(--main_text);
                font-size: 12px;
                opacity: 0.8;
            }

            .menu-items {
                padding: 8px 0;
            }

            .menu-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                color: var(--main_text);
                font-size: 12px;
                cursor: pointer;
                transition: background-color 0.2s;

                span{
                    font-size: 14px;
                    color: var(--main_text);
                }
            }

            .menu-item:hover {
                background-color: var(--pri_op);
                color: var(--pri_color);
            }

            .icon-sign-out {
                margin-left: 8px;
                font-size: 14px;
            }
        }
            .staff_cont:hover .profile-dropdown,
            .staff_cont:focus-within .profile-dropdown {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

    }

    .choice_collection {
        width: 100%;
        height: 55%;
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
            padding: 9px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            border-radius: var(--main_border_r);
            cursor: pointer;
            font-size: 12px;
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

        // Add logout functionality
        const logoutButton = this.shadowRoot.querySelector('a[href="/logout"]');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                // frontRouter.navigate(e.target.getAttribute('href'));
                this.logout();

            });
        }
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

    async logout() {
        dashboardController.loaderView.render();
        try {
            const response = await fetch('/api/Auth/logout', {
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

            console.log(result);


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

                setTimeout(() => {
                    document.body.style.transition = 'opacity 0.5s ease';
                    document.body.style.opacity = '0';
                    setTimeout(() => {
                        frontRouter.navigate('/login');
                        document.body.style.opacity = '1';
                    }, 500);
                }, 500);
                return true;
            } else {
                notify('top_left', result.message, 'warning');
                return false;
            }
        } catch (error) {
            notify('top_left', error.message, 'error');
            return false;
        }
    }
}

