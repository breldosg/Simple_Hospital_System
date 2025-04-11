const express = require('express');
const path = require('path');
const app = express();
const port = 4000;
const { check_cookie, get_cookie, user_agent_infos, trailing_slashes, ApiHost } = require('./utility/serverFunctions.js');
const cookieParser = require('cookie-parser');
const { pipeline } = require("stream");
const { promisify } = require("util");
const pipelineAsync = promisify(pipeline);

// Use cookie-parser middleware
app.use(trailing_slashes)
app.use(express.json());
app.use(cookieParser());


// Serve static files from the "public" directory
app.use('/public', express.static(path.join(__dirname, 'public')));

const apiRouterAuth = require('./api_routes/Auth_PostRequests.js');
const apiRouterUsers = require('./api_routes/Users_PostRequests.js');
const apiRouterPatient = require('./api_routes/Patient_PostRequests.js');
const apiRouterPharmacy = require('./api_routes/Pharmacy_PostRequests.js');
const apiRouterRadiology = require('./api_routes/Radiology_PostRequests.js');
const apiRouterProcedure = require('./api_routes/Procedure_PostRequests.js');
const apiRouterLaboratory = require('./api_routes/Laboratory_PostRequests.js');
const apiRouterBilling = require('./api_routes/Billing_PostRequests.js');
const apiRouterReports = require('./api_routes/Reports_PostRequests.js');
// apiRouter
app.use('/api/auth', apiRouterAuth);
app.use('/api/users', apiRouterUsers);
app.use('/api/patient', apiRouterPatient);
app.use('/api/pharmacy', apiRouterPharmacy);
app.use('/api/radiology', apiRouterRadiology);
app.use('/api/laboratory', apiRouterLaboratory);
app.use('/api/billing', apiRouterBilling);
app.use('/api/procedure', apiRouterProcedure);
app.use('/api/reports', apiRouterReports);

app.get(['/', '/login'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})


app.get("/attachments/:filename", async (req, res) => {
    const { filename } = req.params;
    const imageUrl = `${ApiHost}/assets/attachments/${filename}`;

    console.log('imageUrl:', imageUrl);
    

    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return res.status(404).send("Image not found");
        }
// Set correct content type
res.set("Content-Type", response.headers.get("content-type"));

// Stream the response properly
await pipelineAsync(response.body, res);
    } catch (error) {
        console.error("Error fetching image:", error);
        res.status(500).send("Server error");
    }
});

app.get("/images/:filename", async (req, res) => {
    const { filename } = req.params;
    const imageUrl = `${ApiHost}/assets/images/${filename}`;

    console.log('imageUrl:', imageUrl);
    

    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return res.status(404).send("Image not found");
        }
// Set correct content type
res.set("Content-Type", response.headers.get("content-type"));

// Stream the response properly
await pipelineAsync(response.body, res);
    } catch (error) {
        console.error("Error fetching image:", error);
        res.status(500).send("Server error");
    }
});



app.get('*', async (req, res) => {

    const token_available = check_cookie(req);

    if (token_available) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
    else {
        res.redirect(`/login`);
    }
})








app.listen(process.env.PORT || port, () => {
    console.log('Server is running');
})
