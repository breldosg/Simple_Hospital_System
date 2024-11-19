
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

// product_list
router.post('/product_list', async (req, res) => {
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
        console.error('Error in /product_list route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/receive_product', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 360, body); // Add `await` since it's an async function
        console.log('receive_product Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /receive_product route:', error);
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


router.post('/update_category', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 300, body); // Add `await` since it's an async function
        console.log('update_category Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /update_category route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/delete_medicine_category', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 310, body); // Add `await` since it's an async function
        console.log('delete_medicine_category Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /delete_medicine_category route:', error);
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



router.post('/register_intake_batch', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 330, body); // Add `await` since it's an async function
        console.log('register_intake_batch Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /register_intake_batch route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/create_product', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 230, body); // Add `await` since it's an async function
        console.log('create_product Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /create_product route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/search_intake_batch', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 340, body); // Add `await` since it's an async function
        console.log('search_intake_batch Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /search_intake_batch route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/single_batch_data', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 350, body); // Add `await` since it's an async function
        console.log('single_batch_data Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /single_batch_data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/single_batch_product_list', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 370, body); // Add `await` since it's an async function
        console.log('single_batch_product_list Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /single_batch_product_list route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/close_batch', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 380, body); // Add `await` since it's an async function
        console.log('close_batch Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /close_batch route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});





module.exports = router