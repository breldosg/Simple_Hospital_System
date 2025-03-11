// Role definitions and their associated navigation configurations
export const ROLES = {
    // Doctor role
    DCT: {
        name: 'Doctor',
        navItems: [
            { label: 'Patients', link: '/patient' },
            { label: 'Notice', link: '/notice' }
        ],
        navigationSections: [
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
        ]
    },

    // Nurse role
    NRS: {
        name: 'Nurse',
        navItems: [
            { label: 'Patients', link: '/patient' },
            { label: 'Notice', link: '/notice' }
        ],
        navigationSections: [
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
        ]
    },

    // Admin/ICT role
    ICT: {
        name: 'Admin',
        navItems: [
            { label: 'Users', link: '/users' },
            { label: 'Patients', link: '/patient' },
            { label: 'Pharmacy', link: '/pharmacy' },
            { label: 'Radiology', link: '/radiology' },
            { label: 'Laboratory', link: '/laboratory' },
            { label: 'Store', link: '/store' },
            { label: 'Billing', link: '/billing' },
            { label: 'Notice', link: '/notice' }
        ],
        navigationSections: [
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
                    { label: 'Exams List', href: '/radiology/examslist' }
                ]
            },
            {
                type: '/laboratory',
                choices: [
                    { label: 'Active Visits', href: '/laboratory/activevisits' },
                    { label: 'Test List', href: '/laboratory/testlist' },
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
        ]
    },

    // Pharmacist role
    RPT: {
        name: 'Pharmacist',
        navItems: [
            { label: 'Pharmacy', link: '/pharmacy' },
            { label: 'Store', link: '/store' },
            { label: 'Notice', link: '/notice' }
        ],
        navigationSections: [
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
        ]
    },

    // Lab technician role
    LBT: {
        name: 'Lab Technician',
        navItems: [
            { label: 'Laboratory', link: '/laboratory' },
            { label: 'Notice', link: '/notice' }
        ],
        navigationSections: [
            {
                type: '/laboratory',
                choices: [
                    { label: 'Active Visits', href: '/laboratory/activevisits' },
                    { label: 'Test List', href: '/laboratory/testlist' },
                ]
            },
            {
                type: '/notice',
                choices: [
                    { label: 'View All notice', href: '/notice/viewnotice' }
                ]
            }
        ]
    },

    // Radiologist role
    RDT: {
        name: 'Radiologist',
        navItems: [
            { label: 'Radiology', link: '/radiology' },
            { label: 'Notice', link: '/notice' }
        ],
        navigationSections: [
            {
                type: '/radiology',
                choices: [
                    { label: 'Active Visits', href: '/radiology/activevisits' },
                    { label: 'Exams List', href: '/radiology/examslist' }
                ]
            },
            {
                type: '/notice',
                choices: [
                    { label: 'View All notice', href: '/notice/viewnotice' }
                ]
            }
        ]
    },

    // Billing role
    BIL: {
        name: 'Billing',
        navItems: [
            { label: 'Billing', link: '/billing' },
            { label: 'Notice', link: '/notice' }
        ],
        navigationSections: [
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
    }
}; 