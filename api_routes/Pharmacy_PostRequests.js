const express = require('express');
const router = express.Router();
const {createRouteHandler } = require('../utility/serverFunctions');

// Route configuration object
const ROUTE_CONFIG = {
    // Category Management
    get_category: 240,
    single_category: 290,
    update_category: 300,
    
    // Product Management
    product_list: 250,
    create_product: 230,
    receive_product: 360,
    
    // Medicine Management
    register_medicine: 230,
    change_medicine_status: 260,
    search_medicine_category: 270,
    
    // Medicine Category Management
    register_medicine_category: 280,
    delete_medicine_category: 310,
    
    // Batch Management
    register_intake_batch: 330,
    search_intake_batch: 340,
    single_batch_data: 350,
    single_batch_product_list: 370,
    close_batch: 380,
    remove_product_to_batch: 450,
    
    // Order Management
    receive_order_list: 390,
    search_order_list: 400,
    remove_order_request: 410,
    deny_approve_pharmacy_order: 420,
    approve_order: 420,
    update_order: 440,
    receive_order_request: 430
};



// Register all routes
Object.entries(ROUTE_CONFIG).forEach(([routeName, handlerCode]) => {
    router.post(`/${routeName}`, createRouteHandler(routeName, handlerCode));
});

module.exports = router;