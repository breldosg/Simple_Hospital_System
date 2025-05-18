// import { frontRouter } from "/public/script/route.js";
import { screenCollection } from "../screens/ScreenCollection.js";
import { dashboardController } from "../controller/DashboardController.js";
import { fileCategories, visit_priority, visit_type } from "../custom/customizing.js";
import { frontRouter } from "./route.js";




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
    '/': {
        view: new HomeScreen(),
        title: 'Home'
    },
    '/login': {
        view: screenCollection.loginScreen,
        title: 'Login'
    },
    '/dashboard': {
        view: dashboardController.dashboardView,
        title: 'Dashboard'
    },

    // settings
    '/settings': {
        view: dashboardController.settingsView,
        title: 'Settings'
    },
    '/settings/about_system': {
        view: dashboardController.aboutSystemView,
        title: 'About System'
    },
    '/settings/appearance': {
        view: dashboardController.appearanceSystemView,
        title: 'Appearance'
    },
    '/settings/diagnosis_codes_management': {
        view: dashboardController.diagnosisCodesManagementSettingView,
        title: 'Diagnosis Codes Management'
    },
    '/settings/services_management': {
        view: dashboardController.servicesManagementSettingView,
        title: 'Services Management'
    },
    '/settings/pharmacy_units': {
        view: dashboardController.pharmacyUnitsSystemView,
        title: 'Pharmacy Units'
    },
    '/settings/company_information': {
        view: dashboardController.companyInformationView,
        title: 'Company Information'
    },

    '/users': {
        view: dashboardController.staffListView,
        title: 'All Staff'
    },
    '/users/userlist': {
        view: dashboardController.staffListView,
        title: 'All Staff'
    },
    '/users/attendance': {
        view: dashboardController.attendanceView,
        title: 'Attendance'
    },
    '/users/account': {
        view: dashboardController.userProfileView,
        title: 'User Profile'
    },

    '/patient': {
        view: dashboardController.viewPatientView,
        title: 'All Patients'
    },
    '/patient/viewpatient': {
        view: dashboardController.viewPatientView,
        title: 'All Patients'
    },
    '/patient/activevisit': {
        view: dashboardController.viewOnProgressView,
        title: 'Patient Active Visits'
    },
    '/patient/viewpatient/:id': {
        view: dashboardController.singlePatientView,
        title: 'All Patients'
    },
    '/patient/activevisit/:id': {
        view: dashboardController.singleVisitView,
        title: 'Patient Visit'
    },
    '/patient/visithistory/:id': {
        view: dashboardController.singleVisitHistoryView,
        title: 'Patient Visit History'
    },

    '/pharmacy': {
        view: dashboardController.viewMedicineView,
        title: 'All Pharmacy Products'
    },
    '/pharmacy/viewpharmacyproducts': {
        view: dashboardController.viewMedicineView,
        title: 'All Pharmacy Products'
    },
    '/pharmacy/viewcategory': {
        view: dashboardController.viewMedicineCategoryView,
        title: 'All Pharmacy Categories'
    },
    '/pharmacy/viewcategory/:id': {
        view: dashboardController.singleMedicineCategoryView,
        title: 'Pharmacy Category'
    },
    '/pharmacy/orderlist': {
        view: dashboardController.viewOrderListView,
        title: 'All Pharmacy Orders'
    },
    '/pharmacy/activevisits': {
        view: dashboardController.viewActivePharmacyListView,
        title: 'Visits with Prescriptions'
    },
    '/pharmacy/activevisits/:id': {
        view: dashboardController.singleVisitPharmacyView,
        title: 'Visit with Prescriptions'
    },

    '/store': {
        view: dashboardController.viewMedicineView,
        title: 'All Pharmacy Products'
    },
    '/store/viewpharmacyproducts': {
        view: dashboardController.viewMedicineView,
        title: 'All Pharmacy Products'
    },
    '/store/viewcategory': {
        view: dashboardController.viewMedicineCategoryView,
        title: 'Medicine Categories'
    },
    // '/store/addcategory': {
    //     view: dashboardController.addMedicineCategoryView,
    //     title: 'Medicine Category'
    // },
    '/store/viewcategory/:id': {
        view: dashboardController.singleMedicineCategoryView,
        title: 'Medicine Category'
    },
    '/store/viewinatakebatch': {
        view: dashboardController.viewIntakeBatchView,
        title: 'All Store Intake Batches'
    },
    '/store/viewinatakebatch/:id': {
        view: dashboardController.singleIntakeBatchView,
        title: 'Store Intake Batch'
    },
    '/store/orderlist': {
        view: dashboardController.viewOrderListView,
        title: 'All Pharmacy Orders'
    },

    '/radiology': {
        view: dashboardController.viewActiveRadiologyListView,
        title: 'All Radiology Exams'
    },
    '/radiology/activevisits': {
        view: dashboardController.viewActiveRadiologyListView,
        title: 'Visits with Radiology'
    },
    '/radiology/activevisits/:id': {
        view: dashboardController.singleVisitRadiologyView,
        title: 'Visit with Radiology'
    },
    '/radiology/examslist': {
        view: dashboardController.radiologyExamsListView,
        title: 'All Radiology Exams'
    },
    '/radiology/examscategorylist': {
        view: dashboardController.radiologyExamsCategoryListView,
        title: 'All Radiology Exams Category'
    },

    '/laboratory': {
        view: dashboardController.viewActiveLaboratoryListView,
        title: 'All Laboratory Tests'
    },
    '/laboratory/testlist': {
        view: dashboardController.laboratoryTestListView,
        title: 'All Laboratory Tests'
    },
    '/laboratory/testcategorylist': {
        view: dashboardController.laboratoryTestCategoryListView,
        title: 'All Laboratory Tests'
    },

    '/laboratory/activevisits': {
        view: dashboardController.viewActiveLaboratoryListView,
        title: 'Visits with Laboratory'
    },

    '/laboratory/activevisits/:id': {
        view: dashboardController.singleVisitLaboratoryView,
        title: 'Visit with Laboratory'
    },

    '/procedure': {
        view: dashboardController.viewAllProcedureView,
        title: 'All Procedures'
    },
    '/procedure/viewprocedure': {
        view: dashboardController.viewAllProcedureView,
        title: 'All Procedures'
    },
    '/procedure/activevisits': {
        view: dashboardController.viewActiveProcedureListView,
        title: 'Visits with Procedures'
    },

    '/billing': {
        view: dashboardController.viewActiveBillsListView,
        title: "Visits with Bills"
    },
    '/billing/activebills': {
        view: dashboardController.viewActiveBillsListView,
        title: "Visits with Bills"
    },
    '/billing/viewprices': {
        view: dashboardController.singleViewPricesView,
        title: 'Prices Category'
    },
    '/billing/activebills/:id': {
        view: dashboardController.singleVisitBillingView,
        title: 'Visit Bills'
    },
    '/billing/viewprices/consultation': {
        view: dashboardController.viewBillingConsultationView,
        title: 'Consultation Billing Price'
    },
    '/billing/viewprices/pharmacy': {
        view: dashboardController.viewBillingMedicineView,
        title: 'Pharmacy Billing Price'
    },
    '/billing/viewprices/procedure': {
        view: dashboardController.viewBillingProcedureView,
        title: 'Procedure Billing Price'
    },
    '/billing/viewprices/radiology': {
        view: dashboardController.viewBillingRadiologyView,
        title: 'Radiology Billing Price'
    },
    '/billing/viewprices/laboratory': {
        view: dashboardController.viewBillingLaboratoryView,
        title: 'Laboratory Billing Price'
    },
    '/billing/viewprices/default': {
        view: dashboardController.viewBillingDefaultPriceView,
        title: 'Default Billing Price'
    },
    '/notice': {
        view: screenCollection.dashboardScreen,
        title: 'Notice'
    },
    '/notice/viewnotice': {
        view: screenCollection.dashboardScreen,
        title: 'View Notice'
    },
    '/notice/addnotice': {
        view: screenCollection.dashboardScreen,
        title: 'Add Notice'
    },

    // reports
    '/reports': {
        view: dashboardController.reportsView,
        title: 'Reports Dashboard'
    },
    '/reports/viewreports': {
        view: dashboardController.reportsView,
        title: 'Reports Dashboard'
    },
    '/reports/sales': {
        view: dashboardController.salesReportView,
        title: 'Sales Report'
    },
    '/reports/patient/registration': {
        view: dashboardController.reportsView,
        title: 'Patient Registration Report'
    },
    '/reports/patient/visits': {
        view: dashboardController.reportsView,
        title: 'Patient Visits Report'
    },
    '/reports/billing/revenue': {
        view: dashboardController.reportsView,
        title: 'Revenue Report'
    },
    '/reports/billing/unpaid': {
        view: dashboardController.reportsView,
        title: 'Unpaid Bills Report'
    },
    '/reports/pharmacy/inventory': {
        view: dashboardController.reportsView,
        title: 'Pharmacy Inventory Report'
    },
    '/reports/pharmacy/prescriptions': {
        view: dashboardController.reportsView,
        title: 'Prescription Analytics Report'
    },
    '/reports/laboratory/stats': {
        view: dashboardController.reportsView,
        title: 'Laboratory Statistics Report'
    },
    '/reports/radiology/stats': {
        view: dashboardController.reportsView,
        title: 'Radiology Statistics Report'
    },
    '/reports/staff/attendance': {
        view: dashboardController.reportsView,
        title: 'Staff Attendance Report'
    },
    '/reports/staff/performance': {
        view: dashboardController.reportsView,
        title: 'Staff Performance Report'
    },
    '/reports/patient/demographics': {
        view: dashboardController.reportsView,
        title: 'Patient Demographics Report'
    },
    '/reports/billing/trends': {
        view: dashboardController.reportsView,
        title: 'Payment Trends Report'
    },
    '/reports/pharmacy/stock': {
        view: dashboardController.reportsView,
        title: 'Stock Movement Report'
    },
    '/reports/pharmacy/expiry': {
        view: dashboardController.reportsView,
        title: 'Expiry Tracking Report'
    },
    '/reports/laboratory/turnaround': {
        view: dashboardController.reportsView,
        title: 'Test Turnaround Time Report'
    },
    '/reports/laboratory/equipment': {
        view: dashboardController.reportsView,
        title: 'Laboratory Equipment Usage Report'
    },
    '/reports/radiology/equipment': {
        view: dashboardController.reportsView,
        title: 'Radiology Equipment Utilization Report'
    },
    '/reports/radiology/procedures': {
        view: dashboardController.reportsView,
        title: 'Radiology Procedure Times Report'
    },
    '/reports/staff/workload': {
        view: dashboardController.reportsView,
        title: 'Staff Workload Report'
    },
    '/reports/staff/scheduling': {
        view: dashboardController.reportsView,
        title: 'Staff Scheduling Report'
    },
    '/reports/system/audit': {
        view: dashboardController.reportsView,
        title: 'System Audit Logs'
    },
    '/reports/system/usage': {
        view: dashboardController.reportsView,
        title: 'System Usage Statistics'
    },
    '/reports/system/errors': {
        view: dashboardController.reportsView,
        title: 'System Error Logs'
    },
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


export function timeStamp_formatter(ymd) {
    const dateee = new Date(ymd);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Intl.DateTimeFormat('en-US', options).format(dateee);
}

// export function timeStamp_formatter(ymd) {
//     const dateee = new Date(ymd);
//     const options = { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
//     return new Intl.DateTimeFormat('en-US', options).format(dateee);
// }


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

export function getFileExtension(fileName) {
    return fileName.split('.').pop();
}

export function getFileCategory(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    return Object.keys(fileCategories).find(cat => fileCategories[cat].includes(ext)) || "unknown";
}


export async function download(url, file_name) {
    try {
        const fetchResponse = await fetch(url);

        if (!fetchResponse.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        notify('top_left', 'Download Started.', 'success');
        const responseData = await fetchResponse.blob();

        const objectUrl = URL.createObjectURL(responseData); // Create an Object URL
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = file_name; // You can set a default filename here
        document.body.appendChild(link);
        link.click(); // Trigger the download
        document.body.removeChild(link);
        // Revoke the Object URL after the download to free memory ,wait for some seconds before to make sure it is used before revoked
        setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
    }
    catch (e) {
        console.error('There was a problem with the fetch operation:', e);
        notify('top_left', 'Download Fail.', 'error');

    }

}

export const uploadWithProgress = (url, formData, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);

        // Track progress
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                onProgress(percentComplete); // Call the progress callback
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText)); // Resolve with the response
            } else {
                reject(new Error(xhr.statusText));
            }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
    });
};

export const currency_formatter = (amount, with_symbol = true) => {
    var amount_num = parseFloat(amount);

    if (with_symbol) {
        return amount_num.toLocaleString('en-US', { style: 'currency', currency: 'TZS' })
    }
    else {
        // remove the symbol and the last 2 digits
        return amount_num.toLocaleString('en-US', { style: 'currency', currency: 'TZS' }).replace('TZS', '');
    }
}

export function print_div(div, style) {
    // Create iframe  
    var iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    var doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`  
        <html>  
            <head>  
                <link rel="stylesheet" href="/public/icons/style.css">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/breldosg/Xt-style-pack@main/icons/style.css">
                <link rel="stylesheet" href="/public/styles/styles.css">
                <title>Print</title>  
                <style>  
                    ${style}
                </style>  
            </head>  
            <body>${div.outerHTML}</body>  
        </html>  
    `);
    doc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
}

export function getVisitType(visit_type_word) {
    var type = visit_type.find(type => type.value === visit_type_word).label || visit_type;
    return type;
}

export function getVisitPriority(visit_priority_word) {
    var priority = visit_priority.find(priority => priority.value === visit_priority_word).label || visit_priority;
    return priority;
}

// export function applyStyle(style, id = '') {
//     const styleElement = document.createElement('style');
//     styleElement.textContent = style;
//     styleElement.id = id;
//     document.head.appendChild(styleElement);
// }

// styleManager.js
export function applyStyle(cssString) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssString);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}


export function removeStyle(id) {
    const styleElement = document.getElementById(id);
    if (styleElement) {
        document.head.removeChild(styleElement);
    }
}

export function scrollToItem(container, item, speed = 'normal') {
    if (container && item) {
        container.scrollTo({
            left: item.offsetLeft,
            behavior: speed == 'fast' ? 'auto' : 'smooth',
        });
    }
}


function listen_window_width() {
    console.log(window.innerWidth);
    globalStates.setState({ window_width: window.innerWidth });
    window.addEventListener('resize', (e) => {
        console.log(window.innerWidth);
        globalStates.setState({ window_width: e.target.innerWidth });
    })
}

listen_window_width()