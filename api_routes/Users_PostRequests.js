
const express = require('express');
const router = express.Router();
const { RequestHandler } = require('../utility/serverFunctions');



router.post('/get_role', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 130, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /get_role route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/register_staff', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 100, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /register_staff route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/search_staff', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 140, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /search_staff route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/first_data', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 170, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /search_staff route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/change_user_account_state', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 320, body); // Add `await` since it's an async function

        return res.status(200).json(result); // Send the success response

    } catch (error) {
        console.error('Error in /change_user_account_state route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



module.exports = router