// import { staffListView } from "../views/StaffListView.js";

import { AddMedicineCategoryView } from "../views/AddMedicineCategoryView.js";
import { AddMedicineView } from "../views/AddMedicineView.js";
import { AddPatientView } from "../views/AddPatientView.js";
import { AddUserView } from "../views/AddUserView.js";
import { AttendanceView } from "../views/AttendanceView.js";
import { CreateVisitPopUpView } from "../views/CreateVisitPopUpView.js";
import { LoaderView } from "../views/LoaderView.js";
import { SingleMedicineCategoryView } from "../views/SingleMedicineCategoryView.js";
import { SinglePatientView } from "../views/SinglePatientView.js";
import { StaffListView } from "../views/StaffListView.js";
import { ViewMedicineCategoryView } from "../views/ViewMedicineCategoryView.js";
import { ViewMedicineView } from "../views/ViewMedicineView.js";
import { ViewOnProgressView } from "../views/ViewOnProgressView.js";
import { ViewPatientView } from "../views/ViewPatientView.js";

class DashboardController {
    // Loader View
    loaderView = new LoaderView();

    // Staff Views
    staffListView = new StaffListView();
    addUserView = new AddUserView();
    attendanceView = new AttendanceView();

    // Patient Views
    viewPatientView = new ViewPatientView();
    addPatientView = new AddPatientView();
    singlePatientView = new SinglePatientView();
    createVisitPopUpView = new CreateVisitPopUpView();
    viewOnProgressView = new ViewOnProgressView();

    // Medicine Views
    addMedicineView = new AddMedicineView();
    viewMedicineView = new ViewMedicineView();
    viewMedicineCategoryView = new ViewMedicineCategoryView();
    addMedicineCategoryView = new AddMedicineCategoryView();
    singleMedicineCategoryView = new SingleMedicineCategoryView();



}

export const dashboardController = new DashboardController();