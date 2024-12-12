
const express = require('express');
const router = express.Router();
const { check_cookie, get_cookie, user_agent_infos, ApiHost, RequestHandler } = require('../utility/serverFunctions');


// router.post('/first_data', async (req, res) => {

//     if (check_cookie(req)) {
//         const user_cookie = get_cookie(req);

//         const user_infos = JSON.stringify(user_agent_infos(req));


//         const body_data = {
//             key: 130,
//             user_agent_infos: user_infos,
//         }
//         try {
//             const res2 = await fetch(ApiHost, {
//                 "method": 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${user_cookie}`
//                 },
//                 body: JSON.stringify(body_data)
//             })

//             console.log('result', res2);
//             const result = await res2.json();

//             const { data, status, success } = result;

//             if (success) {

//                 res.send(result);
//             }
//             else if (status == 401) {

//                 res.sendStatus(401);
//             }
//             else {
//                 res.send(result);
//             }

//         }
//         catch (e) {
//             console.log(e);
//             res.send({ success: false, message: "Server error", status: "error" });
//         }
//     }
//     else {
//         res.sendStatus(401);
//         res.send({ success: false, message: "Unauthorized Access", status: "error" });
//     }

// })

router.post('/register_patient', async (req, res) => {

    if (check_cookie(req)) {
        const user_cookie = get_cookie(req);

        const user_infos = JSON.stringify(user_agent_infos(req));
        const body = req.body;


        const body_data = {
            key: 150,
            data: JSON.stringify(body),
            user_agent_infos: user_infos,
        }
        try {
            const res2 = await fetch(ApiHost, {
                "method": 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user_cookie}`
                },
                body: JSON.stringify(body_data)
            })

            console.log('result', res2);
            const result = await res2.json();

            const { data, status, success } = result;

            if (success) {
                res.send(result);
            }
            else {
                res.send(result);
            }

        }
        catch (e) {
            console.log(e);
            res.send({ success: false, message: "Server error", status: "error" });
        }
    }
    else {
        res.sendStatus(401);
        res.send({ success: false, message: "Unauthorized Access", status: "error" });
    }

})


router.post('/search_patient', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 160, body); // Add `await` since it's an async function
        console.log('Search patient Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /search_staff route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/single_patient', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 190, body); // Add `await` since it's an async function
        console.log('Single patient Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /single_patient route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/get_create_visit_open_data', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 200, body); // Add `await` since it's an async function
        console.log('get open create visit data Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /get open create visit data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/create_visit', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 180, body); // Add `await` since it's an async function
        console.log('get open create visit data Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /get open create visit data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/check_out_patient', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 210, body); // Add `await` since it's an async function
        console.log('get open create visit data Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /get open create visit data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/onprogress_visits', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 220, body); // Add `await` since it's an async function

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(200).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /get open create visit data route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/single_visit_detail', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 460, body); // Add `await` since it's an async function
        console.log('single_visit_detail Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /single_visit_detail route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/save_vital', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 470, body); // Add `await` since it's an async function
        console.log('save_vital Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /save_vital route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/save_update_delete_patient_note', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 480, body); // Add `await` since it's an async function
        console.log('save_update_delete_patient_note Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /save_update_delete_patient_note route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});



router.post('/save_clinical_note', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 500, body); // Add `await` since it's an async function
        console.log('save_clinical_note Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /save_clinical_note route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});


router.post('/save_allergy', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 510, body); // Add `await` since it's an async function
        console.log('save_allergy Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /save_allergy route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});





router.post('/save_next_visit_plan', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 520, body); // Add `await` since it's an async function
        console.log('save_next_visit_plan Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /save_next_visit_plan route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});




module.exports = router