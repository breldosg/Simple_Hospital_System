import { frontRouter } from "/public/script/route.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { dashboardController } from "../controller/DashboardController.js";




// Define screen components
class HomeScreen {
    PreRender() {
        document.body.innerHTML = `
            <h1>Home Page</h1>
            <p>Welcome to the homepage of our Vanilla JS SPA!</p>
            <a href="/login" style="width: 200px; height: 100px; background-color: green; text-align: center;" data-link >LOGIN</a>
        `;
    }
}


class NotFoundScreen {
    PreRender() {
        document.body.innerHTML = `
            <h1>404 Page Not Found</h1>
            <p>The page you are looking for doesn't exist.</p>
        `;
    }
}

// Define routes
const routes = {
    '/': new HomeScreen(),
    '/login': screenCollection.loginScreen,
    '/dashboard': dashboardController.staffListView,

    '/users': dashboardController.staffListView,
    '/users/userlist': dashboardController.staffListView,
    '/users/adduser': dashboardController.addUserView,
    '/users/attendance': dashboardController.attendanceView,

    '/patient': dashboardController.viewPatientView,
    '/patient/viewpatient': dashboardController.viewPatientView,
    '/patient/addpatient': dashboardController.addPatientView,
    '/patient/activevisit': dashboardController.viewOnProgressView,
    '/patient/viewpatient/:id': dashboardController.singlePatientView,
    '/patient/activevisit/:id': dashboardController.singleVisitView,


    '/pharmacy': dashboardController.viewMedicineView,
    '/pharmacy/viewpharmacyproducts': dashboardController.viewMedicineView,
    '/pharmacy/viewcategory': dashboardController.viewMedicineCategoryView,
    '/pharmacy/addcategory': dashboardController.addMedicineCategoryView,
    '/pharmacy/viewcategory/:id': dashboardController.singleMedicineCategoryView,
    '/pharmacy/orderlist': dashboardController.viewOrderListView,

    '/store': dashboardController.viewMedicineView,
    '/store/viewpharmacyproducts': dashboardController.viewMedicineView,
    '/store/viewcategory': dashboardController.viewMedicineCategoryView,
    '/store/addcategory': dashboardController.addMedicineCategoryView,
    '/store/viewcategory/:id': dashboardController.singleMedicineCategoryView,
    '/store/viewinatakebatch': dashboardController.viewIntakeBatchView,
    '/store/viewinatakebatch/:id': dashboardController.singleIntakeBatchView,
    '/store/orderlist': dashboardController.viewOrderListView,




    '/notice': screenCollection.dashboardScreen,
    '/notice/viewnotice': screenCollection.dashboardScreen,
    '/notice/addnotice': screenCollection.dashboardScreen,

    '404': new NotFoundScreen()
};


// Set up routes
frontRouter.setRoutes(routes);

// listener to listen all a tag with data-link attribute 
document.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'a' && e.target.hasAttribute('data-link')) {
        e.preventDefault();
        frontRouter.navigate(e.target.getAttribute('href'));
    }
});


// pop up a notification initiate

export function notify(type, message, status = success) {

    if (type === 'top_left') {
        const notification_cont = document.querySelector('.alert_collection');
        notification_cont.insertAdjacentHTML('beforeend', `<br-alert status="${status}" message="${message}" ></br-alert>`);
    }
    else if (type === 'login') {
        const notification_cont = document.querySelector('.error_login');
        notification_cont.querySelector('p').innerHTML = message;
        notification_cont.classList.add('active');
    }
    else {
        notification_cont.insertAdjacentHTML('beforeend', `<br-alert status="${status}" message="${message}" ></br-alert>`);
    }

}

export function date_formatter(ymd) {
    const dateee = new Date(ymd);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(dateee);
}
export function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}



export function decodeHTML(html) {
    return html
        .replace(/&amp;/g, '&')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
}


/**
 * Searches an array for a term and returns an array with the matched elements, up to a specified limit.
 * @param {Array} data - The array to search.
 * @param {string} searchTerm - The term to search for.
 * @param {string} [key] - Optional key to search within objects.
 * @param {number} [limit] - Optional limit for the number of results.
 * @returns {Array} - An array of matched elements.
 */
export function searchInArray(data, searchTerm, key, limit = Infinity) {

    // Convert search term to lowercase for case-insensitive comparison
    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = [];

    for (const item of data) {
        if (key && typeof item === "object") {
            // If key is provided, search within objects
            if (item[key]?.toLowerCase().includes(lowerSearchTerm)) {
                results.push(item);
            }
        } else if (typeof item === "string") {
            // For array of strings
            if (item.toLowerCase().includes(lowerSearchTerm)) {
                results.push(item);
            }
        }

        // Stop if the limit is reached
        if (results.length >= limit) {
            break;
        }
    }

    return results;
}

/**
 * Creates a debounce function to limit how often a function can be executed.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
export function debounce(func, delay) {
    let timeout;

    return function (...args) {
        // Capture the context of the function
        const context = this;

        // Clear any existing timeout to reset the delay
        clearTimeout(timeout);

        // Set a new timeout
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}
