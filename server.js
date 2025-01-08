const express = require('express');
const path = require('path');
const app = express();
const port = 4000;
const { check_cookie, get_cookie, user_agent_infos, trailing_slashes } = require('./utility/serverFunctions.js');
const cookieParser = require('cookie-parser');

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

// apiRouter
app.use('/api/auth', apiRouterAuth);
app.use('/api/users', apiRouterUsers);
app.use('/api/patient', apiRouterPatient);
app.use('/api/pharmacy', apiRouterPharmacy);


app.get(['/', '/login'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})



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
