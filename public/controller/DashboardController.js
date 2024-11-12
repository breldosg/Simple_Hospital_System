// import { staffListView } from "../views/StaffListView.js";

import { AddIntakeBatchView } from "../views/AddIntakeBatchView.js";
import { AddMedicineCategoryView } from "../views/AddMedicineCategoryView.js";
import { AddMedicineView } from "../views/AddMedicineView.js";
import { AddPatientView } from "../views/AddPatientView.js";
import { AddUserView } from "../views/AddUserView.js";
import { AttendanceView } from "../views/AttendanceView.js";
import { ConfirmPopUpView } from "../views/ConfirmPopUpView.js";
import { CreateProductPopUpView } from "../views/CreateProductPopUpView.js";
import { CreateVisitPopUpView } from "../views/CreateVisitPopUpView.js";
import { LoaderView } from "../views/LoaderView.js";
import { ReceiveIntakeBatchPopUpView } from "../views/ReceiveIntakeBatchPopUpView.js";
import { SingleIntakeBatchView } from "../views/SingleIntakeBatchView.js";
import { SingleMedicineCategoryView } from "../views/SingleMedicineCategoryView.js";
import { SinglePatientView } from "../views/SinglePatientView.js";
import { StaffListView } from "../views/StaffListView.js";
import { UpdateCategoryPopUpView } from "../views/UpdateCategoryPopUpView.js";
import { ViewIntakeBatchView } from "../views/ViewIntakeBatchView.js";
import { ViewMedicineCategoryView } from "../views/ViewMedicineCategoryView.js";
import { ViewMedicineView } from "../views/ViewMedicineView.js";
import { ViewOnProgressView } from "../views/ViewOnProgressView.js";
import { ViewPatientView } from "../views/ViewPatientView.js";

class DashboardController {
    // Loader View
    loaderView = new LoaderView();
    confirmPopUpView = new ConfirmPopUpView();

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
    updateCategoryPopUpView = new UpdateCategoryPopUpView();
    addIntakeBatchView = new AddIntakeBatchView();
    viewIntakeBatchView = new ViewIntakeBatchView();
    singleIntakeBatchView = new SingleIntakeBatchView();
    receiveIntakeBatchPopUpView = new ReceiveIntakeBatchPopUpView();
    createProductPopUpView = new CreateProductPopUpView();



}

export const dashboardController = new DashboardController();