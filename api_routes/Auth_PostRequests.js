
const express = require('express');
const router = express.Router();
const { check_cookie, get_cookie, user_agent_infos, ApiHost, set_cookie } = require('../utility/serverFunctions');


router.post('/registerStaff', async (req, res) => {

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

            const data = await res2.json();

            const { status, message, success, token } = data;

            if (success) {

                res.send(data);
            }
            else if (status == 401) {

                res.sendStatus(401);
            }
            else {
                res.send(data);
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

router.post('/login', async (req, res) => {
    const user_infos = JSON.stringify(user_agent_infos(req));
    const body = req.body;
    console.log(body);


    const body_data = {
        key: 110,
        data: JSON.stringify(body),
        user_agent_infos: user_infos,
    }

    try {
        const res2 = await fetch(ApiHost, {
            "method": 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body_data)
        })

        const data = await res2.json();

        // const { status, message, success, token } = data;
        const { status, message, success } = data;
        if (success) {
            set_cookie(res, data);
        }
        else if (status == 401) {
            res.sendStatus(401);
        }
        else {
            res.send(data);
        }

    }
    catch (e) {
        console.log(e);
        res.send({ success: false, message: "Server error", status: "error" });
    }


})


module.exports = router