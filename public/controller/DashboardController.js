// import { staffListView } from "../views/StaffListView.js";

import { AddMedicineView } from "../views/AddMedicineView.js";
import { AddPatientView } from "../views/AddPatientView.js";
import { AddUserView } from "../views/AddUserView.js";
import { AttendanceView } from "../views/AttendanceView.js";
import { CreateVisitPopUpView } from "../views/CreateVisitPopUpView.js";
import { LoaderView } from "../views/LoaderView.js";
import { SinglePatientView } from "../views/SinglePatientView.js";
import { StaffListView } from "../views/StaffListView.js";
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



}

export const dashboardController = new DashboardController();