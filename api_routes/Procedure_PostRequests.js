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
    get_category: 1270,
    create_procedure: 1280,
    update_procedure: 1290,
    search_visit_with_procedure_order: 1300,
    update_procedure_price: 1310,
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
        if (req.file) { // For single file upload
            formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);
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
        if (req.file) {
            fs.unlink(req.file.path, err => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        if (data.status === 401) {
            return res.sendStatus(401);
        }

        return res.send(data);

    } catch (error) {
        console.error('Upload error:', error);

        // Clean up files in case of error
        if (req.file) {
            fs.unlink(req.file.path, err => {
                if (err) console.error('Error deleting file:', err);
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
router.post('/upload_attachments', upload.single('file'), handleFileUpload);

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