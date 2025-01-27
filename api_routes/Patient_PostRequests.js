const express = require('express');
const router = express.Router();
const { createRouteHandler } = require('../utility/serverFunctions');

// Route configuration object
const ROUTE_CONFIG = {
    // Patient Management
    register_patient: 150,
    search_patient: 160,
    single_patient: 190,

    // Visit Management
    get_create_visit_open_data: 200,
    create_visit: 180,
    check_out_patient: 210,
    onprogress_visits: 220,
    single_visit_detail: 460,

    // Clinical Documentation
    save_vital: 470,
    save_update_delete_patient_note: 480,
    save_clinical_note: 500,
    save_allergy: 510,
    save_next_visit_plan: 520,

    // Diagnostic Orders
    get_radiology_data: 530,
    get_lab_test_data: 550,
    save_radiology_order: 540,
    save_lab_test_order: 560,
    delete_lab_test_order: 570,
    delete_radiology_test_order: 580,

    // Diagnosis Management
    create_delete_pre_diagnosis: 590,
    create_delete_final_diagnosis: 600,

    // Procedures and Devices
    get_data_add_procedure_form: 610,
    save_implantable_devices: 620,
    delete_implantable_devices: 630,

    // Vaccines
    save_vaccine_order: 640,
    delete_vaccine_order: 650,

    // Procedures
    save_procedure_order: 660,
    delete_procedure_order: 670,

    // Prescriptions
    save_prescription: 680
};




// Register all routes
Object.entries(ROUTE_CONFIG).forEach(([routeName, handlerCode]) => {
    router.post(`/${routeName}`, createRouteHandler(routeName, handlerCode));
});

module.exports = router;