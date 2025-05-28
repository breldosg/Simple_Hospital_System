// Visit View Add Card
export const visit_add_card_btn = [
    {
        title: 'Clinical Notes',
        body_container_id: 'clinical_group',
        show_if: ['opd', 'emergency'],
        cards: [
            {
                component: 'visitsClinicalEvaluationPopUpView',
                title: 'Clinical Evaluation',
                active_if: {
                    opd: ['addVitalPopUpView'],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency'],

            },
            {
                component: 'visitsPreliminaryDiagnosisPopUpView',
                title: 'Preliminary Diagnosis',
                active_if: {
                    opd: ['visitsClinicalEvaluationPopUpView'],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency']
            },
            {
                component: 'visitPlanForNextVisitPopUpView',
                title: 'Plan for Next Visit',
                active_if: {
                    opd: [],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency']
            },
            {
                component: 'visitsAttachmentPopUpView',
                title: 'Attachments',
                active_if: {
                    opd: [],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT', 'NRS'],
                show_if_visit_type: ['opd', 'emergency']
            },
        ],
    },
    {
        title: 'Diagnosis & Investigation',
        body_container_id: 'diagnosis_group',
        show_if: ['opd', 'emergency', 'walkin'],
        cards: [
            {
                component: 'visitRadiologyExamPopUpView',
                title: 'Radiology Exam',
                active_if: {
                    opd: ['visitsPreliminaryDiagnosisPopUpView'],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency', 'walkin']
            },
            {
                component: 'visitLabTestOrdersPopUpView',
                title: 'Laboratory Test',
                active_if: {
                    opd: ['visitsPreliminaryDiagnosisPopUpView'],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency', 'walkin']
            },
            {
                component: 'visitFinalDiagnosisPopUpView',
                title: 'Final Diagnosis',
                active_if: {
                    opd: ['visitsPreliminaryDiagnosisPopUpView'],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency']
            },
        ],
    },
    {
        title: 'Treatment Plan',
        body_container_id: 'treatment_group',
        show_if: ['opd', 'emergency', 'walkin'],
        cards: [
            {
                component: 'visitsPrescriptionPopUpView',
                title: 'Prescriptions',
                active_if: {
                    opd: ['visitFinalDiagnosisPopUpView'],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency', 'walkin']
            },
            {
                component: 'visitsProcedurePopUpView',
                title: 'Procedures',
                active_if: {
                    opd: ['visitFinalDiagnosisPopUpView'],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency']
            },
            {
                component: 'visitsImplementableDevicePopUpView',
                title: 'Implantable Devices',
                active_if: {
                    opd: ['visitFinalDiagnosisPopUpView'],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency', 'walkin']
            },
            {
                component: 'visitsOtherServicePopUpView',
                title: 'Other Services',
                active_if: {
                    opd: ['visitFinalDiagnosisPopUpView'],
                    emergency: [],
                    walkin: [],
                },
                operator_roles: ['ICT', 'DCT', 'SDCT'],
                show_if_visit_type: ['opd', 'emergency', 'walkin']
            },
        ],
    },
];

// who to see add btn in Visit View 
export const whoToSeeAddBtn = [
    'ICT',
    'DCT',
    'SDCT',
    'NRS',
];

export const allergyTypes = [
    'Medication',
    'Food',
    'Vaccines/Injectables',
    'Insect Venom',
    'Chemical/Industrial Allergens',
    'Environmental',
    'Plants',
    'Occupational',
    'Other',
];

export const allergySeverity = [
    'Mild',
    'Moderate',
    'Severe',
    'Life-Threatening',
];


export const medicine_unit = [
    'Tube',
    'Bottle',
    'Tablet',
    'Capsule',
    'Ampule',
    'Vial',
    'Sacchet',
];

export const consumable_unit = [
    'Liter',
    'Piece',
];


export const duration_unit = [
    'days',
    'months',
    'weeks',
    'years',
];


export const visitsProcedurePopUpViewStages = [
    'procedure', 'surgeon', 'anesthesiologist', 'assistants', 'other'
];

export const visitsProcedurePopUpViewStageDatas = {

    procedure: {
        heading: 'Select Procedure',
        search: {
            available: true,
            placeholder: 'Search procedure',
        },
        search_data_name: 'procedure',
        selected_data: 'selected_procedure',
        max_data: 1,
        is_required: true

    },
    surgeon: {
        heading: 'Select Leading Surgeon',
        search: {
            available: true,
            placeholder: 'Search doctor/nurse name',
        },
        search_data_name: 'staff',
        selected_data: 'selected_leading_surgeon',
        max_data: 1,
        is_required: true

    },
    anesthesiologist: {
        heading: 'Select Anesthesiologist',
        search: {
            available: true,
            placeholder: 'Search anesthesiologist',
        },
        search_data_name: 'staff',
        selected_data: 'selected_anesthesiologist',
        max_data: 1,
        is_required: false
    },
    assistants: {
        heading: 'Select Surgeons/Assistants',
        search: {
            available: true,
            placeholder: 'Search surgeons/assistants',
        },
        search_data_name: 'staff',
        selected_data: 'selected_assistants',
        max_data: 10,
        is_required: false
    },
    other: {
        heading: 'Other Information',
        search: {
            available: false,
            placeholder: 'Search surgeons/assistants',
        },
        search_data_name: 'other',
        selected_data: 'other',
        selected_data_array: ['other_note', 'other_date'],
        is_required: true

    },

};

export const side_slide_selector_data_role_icon_name = {
    procedure: "switch_icon_airline_seat_flat",
    doctor: "switch_icon_user_doctor",
    nurse: "switch_icon_user_nurse",
};

export const attachment_type_selects = [
    'Report',
    'CT Scan',
    'X - ray',
    'Scan',
    'Sonogram',
    'MRI',
    'Blood Report',
    'ECG',
    'Old Patient File',
    'Web Link',
    'NST',
    'ECHO',
    'Other'
];

export const fileCategories = {
    switch_icon_file_pdf: ["pdf"],
    switch_icon_file_image: ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff"],
    switch_icon_file_video: ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"],
    switch_icon_file_audio: ["mp3", "wav", "aac", "ogg", "flac", "m4a"],
    switch_icon_file_word: ["doc", "docx"],
    switch_icon_file_powerpoint: ["ppt", "pptx"],
    switch_icon_file_excel: ["xls", "xlsx"],
    switch_icon_file_csv: ["csv"]
};

export const visit_type = [
    {
        value: 'opd',
        label: 'Out Patient',
    },
    {
        value: 'emergency',
        label: 'Emergency',
    },
    {
        value: 'walkin',
        label: 'Walking',
    },
];

export const doctor_type = [
    {
        value: 'DCT',
        label: 'General Doctor(General Practitioner)',
    },
    {
        value: 'SDCT',
        label: 'Specialist Doctor',
    },

];

export const visit_priority = [
    {
        value: 'normal',
        label: 'Normal',
    },
    {
        value: 'vip',
        label: 'VIP',
    },

];

export const view_price_cards = [
    {
        link: 'consultation',
        icon: 'switch_icon_person_booth',
        title: 'Consultation',
    },
    {
        link: 'pharmacy',
        icon: 'switch_icon_pills',
        title: 'Pharmacy',
    },
    {
        link: 'radiology',
        icon: 'switch_icon_circle_radiation',
        title: 'Radiology',
    },
    {
        link: 'laboratory',
        icon: 'switch_icon_vial',
        title: 'Laboratory',
    },
    {
        link: 'procedure',
        icon: 'switch_icon_scissors',
        title: 'Procedure',
    },
    {
        link: 'other_service',
        icon: 'switch_icon_bars_progress',
        title: 'Other Service',
    },
    {
        link: 'default',
        icon: 'switch_icon_settings_applications',
        title: 'Default Prices',
    },
];


