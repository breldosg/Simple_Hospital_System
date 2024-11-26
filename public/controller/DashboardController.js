// import { staffListView } from "../views/StaffListView.js";

import { AddMedicineCategoryView } from "../views/AddMedicineCategoryView.js";
import { AddPatientView } from "../views/AddPatientView.js";
import { AddUserView } from "../views/AddUserView.js";
import { AttendanceView } from "../views/AttendanceView.js";
import { ConfirmDeletePopUpView } from "../popups/ConfirmDeletePopUpView.js";
import { CreateProductPopUpView } from "../popups/CreateProductPopUpView.js";
import { CreateVisitPopUpView } from "../popups/CreateVisitPopUpView.js";
import { LoaderView } from "../views/LoaderView.js";
import { ReceiveIntakeBatchPopUpView } from "../popups/ReceiveIntakeBatchPopUpView.js";
import { SingleIntakeBatchView } from "../views/SingleIntakeBatchView.js";
import { SingleMedicineCategoryView } from "../views/SingleMedicineCategoryView.js";
import { SinglePatientView } from "../views/SinglePatientView.js";
import { StaffListView } from "../views/StaffListView.js";
import { UpdateCategoryPopUpView } from "../popups/UpdateCategoryPopUpView.js";
import { ViewIntakeBatchView } from "../views/ViewIntakeBatchView.js";
import { ViewMedicineCategoryView } from "../views/ViewMedicineCategoryView.js";
import { ViewMedicineView } from "../views/ViewMedicineView.js";
import { ViewOnProgressView } from "../views/ViewOnProgressView.js";
import { ViewPatientView } from "../views/ViewPatientView.js";
import { CreateBatchPopUpView } from "../popups/CreateBatchPopUpView.js";
import { ConfirmPopUpView } from "../popups/ConfirmPopUpView.js";
import { ViewOrderListView } from "../views/ViewOrderListView.js";
import { PlaceOrderPopUpView } from "../popups/PlaceOrderPopUpView.js";
import { ApprovePharmacyOrderPopUpView } from "../popups/ApprovePharmacyOrderPopUpView.js";
import { SingleVisitView } from "../views/SingleVisitView.js";

class DashboardController {
    // Loader View
    loaderView = new LoaderView();
    confirmDeletePopUpView = new ConfirmDeletePopUpView();
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

    // Pharmacy And Store Views
    viewMedicineView = new ViewMedicineView();
    viewMedicineCategoryView = new ViewMedicineCategoryView();
    addMedicineCategoryView = new AddMedicineCategoryView();
    singleMedicineCategoryView = new SingleMedicineCategoryView();
    updateCategoryPopUpView = new UpdateCategoryPopUpView();
    viewIntakeBatchView = new ViewIntakeBatchView();
    singleIntakeBatchView = new SingleIntakeBatchView();
    receiveIntakeBatchPopUpView = new ReceiveIntakeBatchPopUpView();
    createProductPopUpView = new CreateProductPopUpView();
    createBatchPopUpView = new CreateBatchPopUpView();
    viewOrderListView = new ViewOrderListView();
    placeOrderPopUpView = new PlaceOrderPopUpView();
    approvePharmacyOrderPopUpView = new ApprovePharmacyOrderPopUpView();
    singleVisitView = new SingleVisitView();



}

export const dashboardController = new DashboardController();