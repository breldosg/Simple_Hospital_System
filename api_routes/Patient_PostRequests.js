const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { createRouteHandler, user_agent_infos, get_cookie, check_cookie, ApiHost } = require('../utility/serverFunctions');

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
    delete_allergy: 730,
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
    save_prescription: 680,
    delete_prescription_order: 710,

    // Attachments
    upload_attachments: 690,
    delete_attachment_order: 700,


    // Radiology
    search_visit_with_radiology_order: 720,
};


// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});



const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});

const handleFileUpload = async (req, res) => {
    if (!check_cookie(req)) {
        return res.status(401).send({
            success: false,
            message: "Unauthorized Access",
            status: "error"
        });
    }

    const user_cookie = get_cookie(req);
    const user_infos = JSON.stringify(user_agent_infos(req));

    try {

        const formData = new FormData();

        // Add files to form data
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                formData.append('files[]', fs.createReadStream(file.path), file.originalname);
            }
        }

        // Add key as form field
        formData.append('key', ROUTE_CONFIG.upload_attachments.toString());

        // Add data as a JSON string in a form field
        const dataObject = {
            ...req.body,
        };
        formData.append('data', JSON.stringify(dataObject));

        // Add user agent info
        formData.append('user_agent_infos', user_infos);

        const response = await fetch(ApiHost, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user_cookie}`,
                ...formData.getHeaders()
            },
            body: formData
        });


        const data = await response.json();

        // Clean up uploaded files
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }

        if (data.status === 401) {
            return res.sendStatus(401);
        }

        return res.send(data);

    } catch (error) {
        console.error('Upload error:', error);

        // Clean up files in case of error
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }

        return res.status(500).send({
            success: false,
            message: "Server error",
            status: "error"
        });
    }
};

// Register file upload route
router.post('/upload_attachments', upload.array('files'), handleFileUpload);

// Register all other routes
Object.entries(ROUTE_CONFIG).forEach(([routeName, handlerCode]) => {
    if (routeName !== 'upload_attachments') { // Skip file upload route as it's handled separately
        router.post(`/${routeName}`, createRouteHandler(routeName, handlerCode));
    }
});

// Multer error handler middleware
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send({
                success: false,
                message: 'File too large. Maximum size is 5MB',
                status: 'error'
            });
        }
        return res.status(400).send({
            success: false,
            message: err.message,
            status: 'error'
        });
    }
    next(err);
});

module.exports = router;