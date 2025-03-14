const express = require('express');
const router = express.Router();
const { createRouteHandler } = require('../utility/serverFunctions');

// Route configuration object
const ROUTE_CONFIG = {
    // Staff Management
    register_staff: 100,
    search_staff: 140,

    // Role Management
    get_role: 130,

    // User Account Management
    change_user_account_state: 320,

    // System Data
    first_data: 170,

    // User Profile
    get_staff_profile: 1130
};


// Register all routes
Object.entries(ROUTE_CONFIG).forEach(([routeName, handlerCode]) => {
    router.post(`/${routeName}`, createRouteHandler(routeName, handlerCode));
});

module.exports = router;