
const express = require('express');
const router = express.Router();
const { check_cookie, get_cookie, user_agent_infos, ApiHost, set_cookie, RequestHandler } = require('../utility/serverFunctions');


router.post('/get_role', async (req, res) => {

    if (check_cookie(req)) {
        const user_cookie = get_cookie(req);

        const user_infos = JSON.stringify(user_agent_infos(req));


        const body_data = {
            key: 130,
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
            else if (status == 401) {

                res.sendStatus(401);
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

router.post('/register_staff', async (req, res) => {

    if (check_cookie(req)) {
        const user_cookie = get_cookie(req);

        const user_infos = JSON.stringify(user_agent_infos(req));
        const body = req.body;


        const body_data = {
            key: 100,
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
            else if (status == 401) {

                res.sendStatus(401);
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


router.post('/search_staff', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 140, body); // Add `await` since it's an async function
        console.log('Search Staff Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /search_staff route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});

router.post('/first_data', async (req, res) => {
    const body = req.body;

    try {
        var result = await RequestHandler(req, 170, body); // Add `await` since it's an async function
        console.log('Search Staff Result:', result);

        if (result.success) {
            return res.status(200).json(result); // Send the success response
        } else {
            return res.status(400).json(result); // Send an error status with the message
        }
    } catch (error) {
        console.error('Error in /search_staff route:', error);
        return res.status(500).json({ success: false, message: 'Server error', status: 'error' });
    }
});





module.exports = router