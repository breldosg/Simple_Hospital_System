// Role definitions and their associated navigation configurations
export const ROLES = {
    // Doctor role
    DCT: {
        name: 'Doctor',
        navItems: [
            { label: 'Patients', link: '/patient' },
            { label: 'Store&Pharmacy', link: '/store' },
            { label: 'Procedure', link: '/procedure' },
            { label: 'Reports', link: '/reports' },
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
                type: '/reports',
                choices: [
                    { label: 'All Reports', href: '/reports/viewreports' }
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
            { label: 'Reports', link: '/reports' },
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
                type: '/reports',
                choices: [
                    { label: 'All Reports', href: '/reports/viewreports' }
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
            { label: 'Reports', link: '/reports' },
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
                type: '/reports',
                choices: [
                    { label: 'All Reports', href: '/reports/viewreports' }
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
            { label: 'Reports', link: '/reports' },
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
                    { label: 'Active Visits', href: '/procedure/activevisits' },
                    { label: 'View All Procedure', href: '/procedure/viewprocedure' },
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
                type: '/reports',
                choices: [
                    { label: 'All Reports', href: '/reports/viewreports' }
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






// Report configurations and access control
export const REPORTS_CONFIG = {
    // Patient Reports
    patient_reports: {
        title: "Patient Reports",
        icon: "switch_icon_users_line",
        reports: {
            patient_registration: {
                name: "Patient Registration",
                icon: "switch_icon_users_line",
                description: "New patient registrations over time",
                roles: ["ICT", "RPT", "DCT", "SDCT"],
                endpoint: "/reports/patient/registration"
            },
            patient_visits: {
                name: "Patient Visits",
                icon: "switch_icon_users_line",
                description: "Patient visit statistics and trends",
                roles: ["ICT", "RPT", "DCT", "SDCT"],
                endpoint: "/reports/patient/visits"
            },
            patient_demographics: {
                name: "Patient Demographics",
                icon: "switch_icon_users_line",
                description: "Patient age, gender, and location statistics",
                roles: ["ICT", "RPT"],
                endpoint: "/reports/patient/demographics"
            }
        }
    },

    // Billing Reports
    billing_reports: {
        title: "Billing Reports",
        icon: "switch_icon_money_bill_1_wave",
        reports: {
            revenue: {
                name: "Revenue Report",
                icon: "switch_icon_money_bill_1_wave",
                description: "Overall revenue and financial statistics",
                roles: ["ICT", "ACT"],
                endpoint: "/reports/billing/revenue"
            },
            unpaid_bills: {
                name: "Unpaid Bills",
                icon: "switch_icon_money_bill_1_wave",
                description: "List of pending payments",
                roles: ["ICT", "ACT", "RPT"],
                endpoint: "/reports/billing/unpaid"
            },
            payment_trends: {
                name: "Payment Trends",
                icon: "switch_icon_money_bill_1_wave",
                description: "Analysis of payment patterns and methods",
                roles: ["ICT", "ACT"],
                endpoint: "/reports/billing/trends"
            }
        }
    },

    // Pharmacy Reports
    pharmacy_reports: {
        title: "Pharmacy Reports",
        icon: "switch_icon_pills",
        reports: {
            inventory: {
                name: "Inventory Status",
                icon: "switch_icon_pills",
                description: "Current stock levels and usage",
                roles: ["ICT", "HPMS", "PMS", "STR"],
                endpoint: "/reports/pharmacy/inventory"
            },
            prescriptions: {
                name: "Prescription Analytics",
                icon: "switch_icon_pills",
                description: "Prescription patterns and statistics",
                roles: ["ICT", "HPMS", "DCT", "SDCT"],
                endpoint: "/reports/pharmacy/prescriptions"
            },
            stock_movement: {
                name: "Stock Movement",
                icon: "switch_icon_pills",
                description: "Analysis of stock inflow and outflow",
                roles: ["ICT", "HPMS", "STR"],
                endpoint: "/reports/pharmacy/stock"
            },
            expiry_tracking: {
                name: "Expiry Tracking",
                icon: "switch_icon_pills",
                description: "Track medicines nearing expiry",
                roles: ["ICT", "HPMS", "PMS"],
                endpoint: "/reports/pharmacy/expiry"
            }
        }
    },

    // Laboratory Reports
    laboratory_reports: {
        title: "Laboratory Reports",
        icon: "switch_icon_vial",
        reports: {
            test_stats: {
                name: "Test Statistics",
                icon: "switch_icon_vial",
                description: "Laboratory test statistics and trends",
                roles: ["ICT", "LAB", "DCT", "SDCT"],
                endpoint: "/reports/laboratory/stats"
            },
            test_turnaround: {
                name: "Test Turnaround Time",
                icon: "switch_icon_vial",
                description: "Analysis of test completion times",
                roles: ["ICT", "LAB"],
                endpoint: "/reports/laboratory/turnaround"
            },
            equipment_usage: {
                name: "Equipment Usage",
                icon: "switch_icon_vial",
                description: "Laboratory equipment utilization stats",
                roles: ["ICT", "LAB"],
                endpoint: "/reports/laboratory/equipment"
            }
        }
    },

    // Radiology Reports
    radiology_reports: {
        title: "Radiology Reports",
        icon: "switch_icon_airline_seat_flat",
        reports: {
            exam_stats: {
                name: "Examination Statistics",
                icon: "switch_icon_airline_seat_flat",
                description: "Radiology examination statistics",
                roles: ["ICT", "RDL", "DCT", "SDCT"],
                endpoint: "/reports/radiology/stats"
            },
            equipment_utilization: {
                name: "Equipment Utilization",
                icon: "switch_icon_airline_seat_flat",
                description: "Usage statistics of radiology equipment",
                roles: ["ICT", "RDL"],
                endpoint: "/reports/radiology/equipment"
            },
            procedure_times: {
                name: "Procedure Times",
                icon: "switch_icon_airline_seat_flat",
                description: "Average duration of radiology procedures",
                roles: ["ICT", "RDL"],
                endpoint: "/reports/radiology/procedures"
            }
        }
    },

    // Staff Reports
    staff_reports: {
        title: "Staff Reports",
        icon: "switch_icon_user",
        reports: {
            attendance: {
                name: "Staff Attendance",
                icon: "switch_icon_user",
                description: "Staff attendance and scheduling",
                roles: ["ICT"],
                endpoint: "/reports/staff/attendance"
            },
            performance: {
                name: "Staff Performance",
                icon: "switch_icon_user",
                description: "Staff performance metrics",
                roles: ["ICT"],
                endpoint: "/reports/staff/performance"
            },
            workload: {
                name: "Staff Workload",
                icon: "switch_icon_user",
                description: "Analysis of staff workload distribution",
                roles: ["ICT"],
                endpoint: "/reports/staff/workload"
            },
            scheduling: {
                name: "Staff Scheduling",
                icon: "switch_icon_user",
                description: "Staff shift patterns and coverage",
                roles: ["ICT"],
                endpoint: "/reports/staff/scheduling"
            }
        }
    },

    // System Reports
    system_reports: {
        title: "System Reports",
        icon: "switch_icon_settings_applications",
        reports: {
            audit_logs: {
                name: "Audit Logs",
                icon: "switch_icon_settings_applications",
                description: "System access and change logs",
                roles: ["ICT"],
                endpoint: "/reports/system/audit"
            },
            system_usage: {
                name: "System Usage",
                icon: "switch_icon_settings_applications",
                description: "System utilization statistics",
                roles: ["ICT"],
                endpoint: "/reports/system/usage"
            },
            error_logs: {
                name: "Error Logs",
                icon: "switch_icon_settings_applications",
                description: "System error and warning logs",
                roles: ["ICT"],
                endpoint: "/reports/system/errors"
            }
        }
    }
};





