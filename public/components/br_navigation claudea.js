import { frontRouter } from "../script/route.js";

export class BrCustomNavigation extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.initializeComponent();
    }

    initializeComponent() {
        this.render();
        this.setupEventListeners();
        this.setupInitialState();

        // Ensure navigation state is updated on browser back/forward
        window.addEventListener('popstate', () => this.setupInitialState());
    }

    render() {
        const { staffName, staffRole, nameInitial } = this.extractComponentData();

        this.shadowRoot.innerHTML = `
            <style>${this.getStyles()}</style>
            ${this.createTopNavigation(staffName, staffRole, nameInitial)}
            ${this.createNavigationChoices()}
        `;
    }

    extractComponentData() {
        const staffName = this.getAttribute('name') || '';
        const staffRole = this.getAttribute('role') || '';
        const nameInitial = staffName.charAt(0).toLocaleUpperCase();

        return { staffName, staffRole, nameInitial };
    }

    createTopNavigation(staffName, staffRole, nameInitial) {
        return `
            <div class="top">
                <div class="nav_cont">
                    ${this.createMainNavItems()}
                </div>
                <div class="staff_cont">
                    <div class="word_cont">
                        <p class="main_name">${staffName}</p>
                        <p class="sub_name">${staffRole}</p>
                    </div>
                    <div class="imag">
                        <span>${nameInitial}</span>
                    </div>
                </div>
            </div>
        `;
    }

    createMainNavItems() {
        const navItems = [
            { label: 'Users', link: '/users' },
            { label: 'Patients', link: '/patient' },
            { label: 'Pharmacy', link: '/pharmacy' },
            { label: 'Store', link: '/store' },
            { label: 'Notice', link: '/notice' }
        ];

        return navItems.map((item, index) => 
            `<div link="${item.link}" class="nav_item ${index === 0 ? 'active' : ''}">${item.label}</div>`
        ).join('');
    }

    createNavigationChoices() {
        const navigationSections = [
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
                    { label: 'Order List', href: '/pharmacy/orderlist' }
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
                type: '/notice',
                choices: [
                    { label: 'View All notice', href: '/notice/viewnotice' },
                    { label: 'Add notice', href: '/notice/addnotice' }
                ]
            }
        ];

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

    setupEventListeners() {
        this.setupLinkClickListeners();
        this.setupNavItemClickListeners();
    }

    setupLinkClickListeners() {
        const links = this.shadowRoot.querySelectorAll('a[data-link]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active from all links
                links.forEach(l => l.classList.remove('active'));
                
                // Add active to clicked link
                link.classList.add('active');

                // Navigate using frontRouter
                frontRouter.navigate(link.getAttribute('href'));
            });
        });
    }

    setupNavItemClickListeners() {
        const navItems = this.shadowRoot.querySelectorAll('.nav_item');
        const navCollections = this.shadowRoot.querySelectorAll('.nav_collection');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active nav item
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Update active nav collection
                navCollections.forEach(nav => {
                    const shouldBeActive = nav.getAttribute('type') === item.getAttribute('link');
                    nav.classList.toggle('active', shouldBeActive);
                });
            });
        });
    }

    setupInitialState() {
        const currentPath = window.location.pathname.toLowerCase();
        const pathParts = currentPath.split('/').filter(Boolean);

        this.updateMainNavigation(pathParts[0] || 'users');
        this.updateSubNavigation(pathParts);
    }

    updateMainNavigation(currentSection) {
        const navItems = this.shadowRoot.querySelectorAll('.nav_item');
        const navCollections = this.shadowRoot.querySelectorAll('.nav_collection');

        navItems.forEach(item => {
            const isActive = item.getAttribute('link').slice(1) === currentSection;
            item.classList.toggle('active', isActive);
        });

        navCollections.forEach(nav => {
            const isActive = nav.getAttribute('type').slice(1) === currentSection;
            nav.classList.toggle('active', isActive);
        });
    }

    updateSubNavigation(pathParts) {
        if (pathParts.length < 2) {
            // If no specific sub-navigation, activate first item
            const firstChoiceInActiveCollection = 
                this.shadowRoot.querySelector('.nav_collection.active .choice_item');
            
            if (firstChoiceInActiveCollection) {
                firstChoiceInActiveCollection.classList.add('active');
            }
            return;
        }

        const choiceNavs = this.shadowRoot.querySelectorAll('.choice_item');
        const fullPath = '/' + pathParts.join('/');

        choiceNavs.forEach(choiceNav => {
            const isActive = choiceNav.getAttribute('href') === fullPath;
            choiceNav.classList.toggle('active', isActive);
        });
    }

    getStyles() {
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
            }

            .nav_cont {
                display: flex;
                align-items: end;
                height: 100%;
            }

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

            .staff_cont {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                gap: 10px;
            }

            .staff_cont * {
                color: var(--white);
            }

            .word_cont {
                text-align: right;
            }

            .main_name {
                font-weight: bold;
                text-transform: capitalize;
                font-size: 14px;
            }

            .sub_name {
                font-weight: 400;
                font-size: 10px;
                text-transform: capitalize;
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

            .choice_collection {
                width: 100%;
                height: 55%;
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 0 50px;
                position: relative;
            }

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
        `;
    }
}