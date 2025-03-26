// Role definitions and their associated navigation configurations
export const ROLES = {
    // Doctor role
    DCT: {
        name: 'Doctor',
        navItems: [
            { label: 'Patients', link: '/patient' },
            { label: 'Store&Pharmacy', link: '/store' },
            { label: 'Procedure', link: '/procedure' },
            { label: 'Notice', link: '/notice' },
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
                type: '/store',
                choices: [
                    { label: 'View All Products', href: '/store/viewpharmacyproducts' },
                ]
            },
            {
                type: '/procedure',
                choices: [
                    { label: 'View All Procedure', href: '/procedure/viewprocedure' },
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

    // Specialist Doctor role
    SDCT: {
        name: 'Specialist Doctor',
        navItems: [
            { label: 'Patients', link: '/patient' },
            { label: 'Store & Pharmacy', link: '/store' },
            { label: 'Procedure', link: '/procedure' },
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
                type: '/store',
                choices: [
                    { label: 'View All Products', href: '/store/viewpharmacyproducts' },
                ]
            },
            {
                type: '/procedure',
                choices: [
                    { label: 'View All Procedure', href: '/procedure/viewprocedure' },
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
            { label: 'Billing', link: '/billing' },
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
                type: '/billing',
                choices: [
                    { label: 'View Active Bills', href: '/billing/activebills' },
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
            { label: 'Procedure', link: '/procedure' },
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
                    { label: 'Test Category List', href: '/laboratory/testcategorylist' }
                ]
            },
            {
                type: '/procedure',
                choices: [
                    { label: 'View All Procedure', href: '/procedure/viewprocedure' },
                    { label: 'Add Procedure', href: '/procedure/addprocedure' },
                    { label: 'Add Procedure Category', href: '/procedure/addprocedurecategory' }
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
            },

        ]
    },

    // Head Pharmacist role
    HPMS: {
        name: 'Head Pharmacist',
        navItems: [
            { label: 'Pharmacy', link: '/pharmacy' },
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
                type: '/notice',
                choices: [
                    { label: 'View All notice', href: '/notice/viewnotice' }
                ]
            }
        ]
    },

    // Pharmacist role
    PMS: {
        name: 'Pharmacist',
        navItems: [
            { label: 'Pharmacy', link: '/pharmacy' },
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
                type: '/notice',
                choices: [
                    { label: 'View All notice', href: '/notice/viewnotice' }
                ]
            }
        ]
    },

    // Store Manager role
    STR: {
        name: 'Store Manager',
        navItems: [
            { label: 'Store', link: '/store' },
            { label: 'Notice', link: '/notice' }
        ],
        navigationSections: [
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
                type: '/notice',
                choices: [
                    { label: 'View All notice', href: '/notice/viewnotice' }
                ]
            }
        ]
    },

    // Laboratory Technician role
    LAB: {
        name: 'Laboratory Technician',
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
                    { label: 'Test Category List', href: '/laboratory/testcategorylist' }
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
    RDL: {
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
    ACT: {
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
}



// Role definitions for ViewPatientView btns and actions
export const VIEW_PATIENT_BTNS = {
    DCT: {
        btn_role: ['view_visit', 'view_patient'],
        btn_action: ['view_visit', 'view_patient']
    },
    SDCT: {
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



// lab section
export const ALLOW_TO_OPEN_LABORATORY_TEST = ['ICT', 'HLAB', 'LAB'];
export const ALLOW_TO_OPEN_LABORATORY_TEST_CATEGORY = ['ICT', 'HLAB', 'LAB'];

export const ALLOW_TO_ADD_UPDATE_TEST = ['ICT', 'HLAB'];
export const ALLOW_TO_ADD_UPDATE_TEST_CATEGORY = ['ICT', 'HLAB'];

// radiology section
export const ALLOW_TO_OPEN_RADIOLOGY_EXAM = ['ICT', 'HRDL', 'RDL'];
export const ALLOW_TO_OPEN_RADIOLOGY_EXAM_CATEGORY = ['ICT', 'HRDL', 'RDL'];

export const ALLOW_TO_ADD_UPDATE_EXAM = ['ICT', 'HRDL'];
export const ALLOW_TO_ADD_UPDATE_EXAM_CATEGORY = ['ICT', 'HRDL'];


// store section
export const ALLOW_TO_ADD_UPDATE_PRODUCT = ['ICT', 'STR', 'HPMS'];
export const ALLOW_TO_ADD_UPDATE_BATCH = ['ICT', 'STR'];
export const ALLOW_TO_ADD_UPDATE_CATEGORY = ['ICT', 'STR'];





