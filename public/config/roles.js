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
                    { label: 'View All Patient', href: '/patient/viewpatient' },
                    { label: 'Active Visits', href: '/patient/activevisit' }
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

    // Receptionist role
    RPT: {
        name: 'Receptionist',
        navItems: [
            { label: 'Patients', link: '/patient' },
            { label: 'Notice', link: '/notice' }
        ],
        navigationSections: [
            {
                type: '/patient',
                choices: [
                    { label: 'View All Patient', href: '/patient/viewpatient' },
                    { label: 'Active Visits', href: '/patient/activevisit' }
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
                    { label: 'View All Patient', href: '/patient/viewpatient' },
                    { label: 'Active Visits', href: '/patient/activevisit' }
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
                    { label: 'Attendance', href: '/users/attendance' }
                ]
            },
            {
                type: '/patient',
                choices: [
                    { label: 'View All Patient', href: '/patient/viewpatient' },
                    { label: 'Active Visits', href: '/patient/activevisit' }
                ]
            },
            {
                type: '/pharmacy',
                choices: [
                    { label: 'View All Products', href: '/pharmacy/viewpharmacyproducts' },
                    { label: 'View All category', href: '/pharmacy/viewcategory' },
                    { label: 'Order List', href: '/pharmacy/orderlist' },
                    { label: 'Active Visits', href: '/pharmacy/activevisits' }
                ]
            },
            {
                type: '/radiology',
                choices: [
                    { label: 'Active Visits', href: '/radiology/activevisits' },
                    { label: 'Exams List', href: '/radiology/examslist' },
                    { label: 'Exams Category List', href: '/radiology/examscategorylist' }
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
    RMS: {
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
                    { label: 'Exams List', href: '/radiology/examslist' },
                    { label: 'Exams Category List', href: '/radiology/examscategorylist' }
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

// Role definitions for ViewPatientView btns and actions
export const VIEW_PATIENT_BTNS = {
    DCT: {
        btn_role: ['view_visit', 'view_patient'],
        btn_action: ['view_visit', 'view_patient']
    },
    NRS: {
        btn_role: ['view_visit', 'view_patient'],
        btn_action: ['view_visit', 'view_patient']
    },
    RPT: {
        btn_role: ['create_visit', 'checkout', 'view_patient'],
        btn_action: ['view_patient']
    },
    ICT: {
        btn_role: ['view_visit', 'create_visit', 'checkout', 'view_patient'],
        btn_action: ['view_visit', 'view_patient']
    }
}

export const ALLOW_TO_ADD_PATIENT = ['ICT', 'RPT'];
export const ALLOW_TO_ADD_VISIT = ['ICT', 'RPT'];
export const ALLOW_TO_CHECKOUT = ['ICT', 'RPT'];

