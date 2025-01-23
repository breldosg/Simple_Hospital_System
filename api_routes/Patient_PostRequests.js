
const express = require('express');
const router = express.Router();
const { RequestHandler } = require('../utility/serverFunctions');


router.post('/register_patient', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 150, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /register_patient route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/search_patient', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 160, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /search_staff route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/single_patient', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 190, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /single_patient route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/get_create_visit_open_data', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 200, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /get open create visit data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/create_visit', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 180, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /get open create visit data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/check_out_patient', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 210, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /get open create visit data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/onprogress_visits', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 220, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /get open create visit data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/single_visit_detail', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 460, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /single_visit_detail route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/save_vital', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 470, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_vital route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/save_update_delete_patient_note', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 480, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_update_delete_patient_note route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/save_clinical_note', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 500, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_clinical_note route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/save_allergy', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 510, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_allergy route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/save_next_visit_plan', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 520, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_next_visit_plan route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/get_radiology_data', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 530, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /get_radiology_data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/get_lab_test_data', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 550, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /get_lab_test_data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});




router.post('/save_radiology_order', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 540, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_radiology_order route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/save_lab_test_order', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 560, body); // Add `await` since it's an async function


        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_lab_test_order route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/delete_lab_test_order', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 570, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /delete_lab_test_order route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/delete_radiology_test_order', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 580, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /delete_radiology_test_order route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});





router.post('/create_delete_pre_diagnosis', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 590, body); // Add `await` since it's an async function
        console.log('create_delete_pre_diagnosis Result:', result);

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /create_delete_pre_diagnosis route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/create_delete_final_diagnosis', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 600, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /create_delete_final_diagnosis route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/get_data_add_procedure_form', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 610, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /get_data_add_procedure_form route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/save_implantable_devices', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 620, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response
    } catch (error) {
        console.error('Error in /save_implantable_devices route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/delete_implantable_devices', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 630, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response
    } catch (error) {
        console.error('Error in /delete_implantable_devices route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/save_vaccine_order', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 640, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_vaccine_order route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/delete_vaccine_order', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 650, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response
    } catch (error) {
        console.error('Error in /delete_vaccine_order route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/save_procedure_order', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 660, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_procedure_order route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/delete_procedure_order', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 670, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /delete_procedure_order route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});




router.post('/save_prescription', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 680, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /save_prescription route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});





module.exports = router