
const express = require('express');
const router = express.Router();
const { check_cookie, get_cookie, user_agent_infos, ApiHost, set_cookie, RequestHandler } = require('../utility/serverFunctions');


router.post('/get_category', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 240, body); // Add `await` since it's an async function
        console.log('get_category Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /get_category route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/medicine_list', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 250, body); // Add `await` since it's an async function
        console.log('medicine_list Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /medicine_list route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/search_medicine_category', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 270, body); // Add `await` since it's an async function
        console.log('search_medicine Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /search_medicine route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/register_medicine', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 230, body); // Add `await` since it's an async function
        console.log('register_medicine Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /register_medicine route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/register_medicine_category', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 280, body); // Add `await` since it's an async function
        console.log('register_medicine_category Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /register_medicine_category route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/change_medicine_status', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 260, body); // Add `await` since it's an async function
        console.log('change_medicine_status Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /change_medicine_status route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/single_category', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 290, body); // Add `await` since it's an async function
        console.log('single_category Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /single_category route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});





module.exports = router