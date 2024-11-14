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
    '/patient/onprogresspatient': dashboardController.viewOnProgressView,
    '/patient/viewpatient/:id': dashboardController.singlePatientView,


    '/pharmacy': screenCollection.dashboardScreen,
    '/pharmacy/viewmedicine': dashboardController.viewMedicineView,
    '/pharmacy/addmedicine': dashboardController.addMedicineView,
    '/pharmacy/viewcategory': dashboardController.viewMedicineCategoryView,
    '/pharmacy/addcategory': dashboardController.addMedicineCategoryView,
    '/pharmacy/viewcategory/:id': dashboardController.singleMedicineCategoryView,
    '/pharmacy/addinatakebatch': dashboardController.addIntakeBatchView,
    '/pharmacy/viewinatakebatch': dashboardController.viewIntakeBatchView,
    '/pharmacy/recieveinatakebatch': screenCollection.dashboardScreen,
    '/pharmacy/viewinatakebatch/:id': dashboardController.singleIntakeBatchView,


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

export function decodeHTML(html) {
    return html
        .replace(/&amp;/g, '&')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
}
