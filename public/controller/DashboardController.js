// import { staffListView } from "../views/StaffListView.js";

import { AddMedicineCategoryViewPopup } from "../views/AddMedicineCategoryViewPopup.js";
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
import { VisitsClinicalEvaluationPopUpView } from "../popups/VisitsClinicalEvaluationPopUpView.js";
import { AddVitalPopUpView } from "../popups/AddVitalPopUpView.js";
import { VisitVitalCardView } from "../cards/VisitVitalCardView.js";
import { VisitPatientNoteCardView } from "../cards/VisitPatientNoteCardView.js";
import { AddPatientNotePopUpView } from "../popups/AddPatientNotePopUpView.js";
import { VisitClinicalEvaluationCardView } from "../cards/VisitClinicalEvaluationCardView.js";
import { VisitAllergyCardView } from "../cards/visitAllergyCardView.js";
import { VisitAllergyPopUpView } from "../popups/VisitAllergyPopUpView.js";
import { VisitFinalDiagnosisCardView } from "../cards/VisitFinalDiagnosisCardView.js";
import { VisitPlanForNextVisitCardView } from "../cards/VisitPlanForNextVisitCardView.js";
import { VisitPlanForNextVisitPopUpView } from "../popups/VisitPlanForNextVisitPopUpView.js";
import { VisitRadiologyExamCardView } from "../cards/VisitRadiologyExamCardView.js";
import { VisitLabExamCardView } from "../cards/VisitLabExamCardView.js";
import { VisitPrescriptionsCardView } from "../cards/VisitPrescriptionsCardView.js";
import { VisitProceduresCardView } from "../cards/VisitProceduresCardView.js";
import { VisitVaccineCardView } from "../cards/VisitVaccineCardView.js";
import { VisitImplantableDevicesCardView } from "../cards/VisitImplantableDevicesCardView.js";
import { VisitRadiologyExamPopUpView } from "../popups/VisitRadiologyExamPopUpView.js";
import { VisitLabTestOrdersPopUpView } from "../popups/VisitLabTestOrdersPopUpView.js";
import { VisitsPreliminaryDiagnosisPopUpView } from "../popups/VisitsPreliminaryDiagnosisPopUpView.js";
import { VisitPreDiagnosisCardView } from "../cards/VisitPreDiagnosisCardView.js";
import { VisitFinalDiagnosisPopUpView } from "../popups/VisitsFinalDiagnosisPopUpView.js";
import { VisitsProcedurePopUpView } from "../popups/VisitsProcedurePopUpView.js";
import { VisitsImplementableDevicePopUpView } from "../popups/VisitsImplementableDevicePopUpView.js";
import { VisitsVaccinePopUpView } from "../popups/VisitsVaccinePopUpView.js";
import { VisitsPrescriptionPopUpView } from "../popups/VisitsPrescriptionPopUpView.js";
import { VisitsAttachmentPopUpView } from "../popups/VisitAttachmentPopUpView.js";
import { VisitAttachmentsCardView } from "../cards/VisitAttachmentsCardView.js";
import { ViewActiveRadiologyListView } from "../views/viewActiveRadiologyListView.js";
import { SingleVisitRadiologyView } from "../views/SingleVisitRadiologyView.js";
import { ViewActiveLaboratoryListView } from "../views/ViewActiveLaboratoryListView.js";
import { PatientDetailComponent } from "../views/PatientDetailComponent.js";
import { VisitsRadiologyResultPopUpView } from "../popups/VisitsRadiologyResultPopUpView.js";
import { SingleVisitLaboratoryView } from "../views/SingleVisitLaboratoryView.js";
import { ViewActivePharmacyListView } from "../views/ViewActivePharmacyListView.js";
import { SingleVisitPharmacyView } from "../views/SingleVisitPharmacyView.js";
import { ViewActiveBillsListView } from "../views/ViewActiveBillsListView.js";
import { SingleVisitBillingView } from "../views/SingleVisitBillingView.js";
import { VisitsLaboratoryResultPopUpView } from "../popups/VisitsLaboratoryResultPopUpView.js";
import { SingleViewPricesVisitView } from "../views/SingleViewPricesVisitView.js";
import { ViewBillingMedicineView } from "../views/ViewBillingMedicineView.js";
import { UpdatePharmacyProductPricePopUpView } from "../popups/UpdatePharmacyProductPricePopUpView.js";
import { ViewBillingRadiologyView } from "../views/ViewBillingRadiologyView.js";
import { UpdateRadiologyTestPricePopUpView } from "../popups/UpdateRadiologyTestPricePopUpView.js";
import { ViewBillingLaboratoryView } from "../views/ViewBillingLaboratoryView.js";
import { UpdateLaboratoryTestPricePopUpView } from "../popups/UpdateLaboratoryTestPricePopUpView.js";
import { ViewBillingConsultationView } from "../views/ViewBillingConsultationView.js";
import { CreateVisitPricePopUp } from "../popups/CreateVisitPricePopUp.js";
import { UpdateConsultationPricePopUpView } from "../popups/UpdateConsultationPricePopUpView.js";
import { ViewBillingDefaultPriceView } from "../views/ViewBillingDefaultPriceView.js";
import { UpdateDefaultPricePopUpView } from "../popups/UpdateDefaultPricePopUpView.js";
import { CreateInvoiceAndPayBillPopUpView } from "../popups/CreateInvoiceAndPayBillPopUpView.js";
import { UserProfileView } from "../views/UserProfileView.js";
import { RadiologyExamsListView } from "../views/RadiologyExamsListView.js";
import { LaboratoryTestListView } from "../views/LaboratoryTestListView.js";
import { SingleVisitHistoryView } from "../views/SingleVisitHistoryView.js";
import { CreateRadiologyExaminationPopUp } from "../popups/CreateRadiologyExaminationPopUp.js";
import { RadiologyExamsCategoryListView } from "../views/RadiologyExamsCategoryListView.js";
import { AddPatientViewPopup } from "../popups/AddPatientViewPopup.js";
import { DashboardView } from "../views/DashboardView.js";
import { AddUserViewPopup } from "../popups/AddUserViewPopup.js";
import { CreateRadiologyCategoryPopUp } from "../popups/CreateRadiologyCategoryPopUp.js";
import { LaboratoryTestCategoryListView } from "../views/LaboratoryTestCategoryListView.js";
import { CreateLaboratoryCategoryPopUp } from "../popups/CreateLaboratoryCategoryPopUp.js";
import { CreateLaboratoryTestPopUp } from "../popups/CreateLaboratoryTestPopUp.js";
import { SettingsView } from "../views/SettingsView.js";
import { ViewAllProcedureView } from "../views/ViewAllProcedureView.js";
import { ViewBillingProcedureView } from "../views/ViewBillingProcedureView.js";


class DashboardController {

    // Dashboard View   
    dashboardView = new DashboardView();

    // Settings View
    settingsView = new SettingsView();

    // Loader View
    loaderView = new LoaderView();
    confirmDeletePopUpView = new ConfirmDeletePopUpView();
    confirmPopUpView = new ConfirmPopUpView();

    // Staff Views
    staffListView = new StaffListView();
    attendanceView = new AttendanceView();
    userProfileView = new UserProfileView();
    addUserViewPopup = new AddUserViewPopup();


    // Patient Views
    viewPatientView = new ViewPatientView();
    singlePatientView = new SinglePatientView();
    createVisitPopUpView = new CreateVisitPopUpView();
    viewOnProgressView = new ViewOnProgressView();
    patientDetailComponent = new PatientDetailComponent();
    addPatientViewPopup = new AddPatientViewPopup();


    // Procedure Views
    viewAllProcedureView = new ViewAllProcedureView();

    //Patient Visit
    singleVisitView = new SingleVisitView();
    visitsClinicalEvaluationPopUpView = new VisitsClinicalEvaluationPopUpView();
    visitAllergyPopUpView = new VisitAllergyPopUpView();
    visitFinalDiagnosisPopUpView = new VisitFinalDiagnosisPopUpView();
    visitPlanForNextVisitPopUpView = new VisitPlanForNextVisitPopUpView();
    visitRadiologyExamPopUpView = new VisitRadiologyExamPopUpView();

    visitLabTestOrdersPopUpView = new VisitLabTestOrdersPopUpView();
    visitsPreliminaryDiagnosisPopUpView = new VisitsPreliminaryDiagnosisPopUpView();
    visitsProcedurePopUpView = new VisitsProcedurePopUpView();
    visitsImplementableDevicePopUpView = new VisitsImplementableDevicePopUpView();
    visitsVaccinePopUpView = new VisitsVaccinePopUpView();
    visitsPrescriptionPopUpView = new VisitsPrescriptionPopUpView();
    visitsAttachmentPopUpView = new VisitsAttachmentPopUpView();
    visitsRadiologyResultPopUpView = new VisitsRadiologyResultPopUpView();
    visitsLaboratoryResultPopUpView = new VisitsLaboratoryResultPopUpView();
    singleVisitHistoryView = new SingleVisitHistoryView();


    // Patient Visit View Cards
    visitVitalCardView = new VisitVitalCardView();
    visitPatientNoteCardView = new VisitPatientNoteCardView();
    visitClinicalEvaluationCardView = new VisitClinicalEvaluationCardView();
    visitAllergyCardView = new VisitAllergyCardView();
    visitFinalDiagnosisCardView = new VisitFinalDiagnosisCardView();
    visitPlanForNextVisitCardView = new VisitPlanForNextVisitCardView();
    visitRadiologyExamCardView = new VisitRadiologyExamCardView();
    visitLabExamCardView = new VisitLabExamCardView();
    visitPrescriptionsCardView = new VisitPrescriptionsCardView();
    visitProceduresCardView = new VisitProceduresCardView();
    visitVaccineCardView = new VisitVaccineCardView();
    visitImplantableDevicesCardView = new VisitImplantableDevicesCardView();
    visitPreDiagnosisCardView = new VisitPreDiagnosisCardView();
    visitAttachmentsCardView = new VisitAttachmentsCardView();


    // Patient PopUp
    addVitalPopUpView = new AddVitalPopUpView();
    addPatientNotePopUpView = new AddPatientNotePopUpView();



    // Pharmacy And Store Views
    viewMedicineView = new ViewMedicineView();
    viewMedicineCategoryView = new ViewMedicineCategoryView();
    // addMedicineCategoryView = new AddMedicineCategoryView();
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
    viewActivePharmacyListView = new ViewActivePharmacyListView();
    singleVisitPharmacyView = new SingleVisitPharmacyView();
    addMedicineCategoryViewPopup = new AddMedicineCategoryViewPopup();


    // Radiology Section
    viewActiveRadiologyListView = new ViewActiveRadiologyListView();
    singleVisitRadiologyView = new SingleVisitRadiologyView();
    radiologyExamsListView = new RadiologyExamsListView();
    createRadiologyExaminationPopUp = new CreateRadiologyExaminationPopUp();
    radiologyExamsCategoryListView = new RadiologyExamsCategoryListView();
    createRadiologyCategoryPopUp = new CreateRadiologyCategoryPopUp();

    // Billing Section
    viewActiveBillsListView = new ViewActiveBillsListView();
    singleVisitBillingView = new SingleVisitBillingView();
    singleViewPricesVisitView = new SingleViewPricesVisitView();
    viewBillingMedicineView = new ViewBillingMedicineView();
    viewBillingRadiologyView = new ViewBillingRadiologyView();
    viewBillingLaboratoryView = new ViewBillingLaboratoryView();
    viewBillingProcedureView = new ViewBillingProcedureView();
    viewBillingConsultationView = new ViewBillingConsultationView();
    viewBillingDefaultPriceView = new ViewBillingDefaultPriceView();


    // Billing PopUp
    updatePharmacyProductPricePopUpView = new UpdatePharmacyProductPricePopUpView();
    updateRadiologyTestPricePopUpView = new UpdateRadiologyTestPricePopUpView();
    updateLaboratoryTestPricePopUpView = new UpdateLaboratoryTestPricePopUpView();
    createVisitPricePopUp = new CreateVisitPricePopUp();
    updateConsultationPricePopUpView = new UpdateConsultationPricePopUpView();
    updateDefaultPricePopUpView = new UpdateDefaultPricePopUpView();
    createInvoiceAndPayBillPopUpView = new CreateInvoiceAndPayBillPopUpView();

    // Laboratory Section
    viewActiveLaboratoryListView = new ViewActiveLaboratoryListView();
    singleVisitLaboratoryView = new SingleVisitLaboratoryView();
    laboratoryTestListView = new LaboratoryTestListView();
    laboratoryTestCategoryListView = new LaboratoryTestCategoryListView();
    createLaboratoryCategoryPopUp = new CreateLaboratoryCategoryPopUp();
    createLaboratoryTestPopUp = new CreateLaboratoryTestPopUp();
}

export const dashboardController = new DashboardController();