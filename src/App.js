import React from "react";
import { Route, Routes } from "react-router-dom";

// Import your components
import DepartmentList from "./Components/department";
import SubDepartmentList from "./Components/subdepartment.js";
import AdminLayout from "./Layout/AdminLayout.jsx";
import AttendanceForm from "./Pages/AttendanceForm.js";
import Dashboard from "./Pages/Dashboard.jsx";
import Holiday from "./Pages/Holiday.js";
import DiagnostiCreate from "./Pages/LeaveApplication.js";
import LeaveApproval from "./Pages/LeaveApproval";
import Leaves from "./Pages/Leaves.js";
import MissingAttendance from "./Pages/MissingAttendance.js";
import MonthlyAttendance from "./Pages/MonthlyAttendance.js";
import WeeklyHoliday from "./Pages/WeeklyHoliday.js";
import Recruitment from "./Components/recruitment.js";
import DiagnosticList from "./Pages/Awardlist.js";
import BackupReset from "./Pages/BackupReset.js";
import LanguageSetup from "./Pages/LanguageSetup.js";
import MessagesTable from "./Pages/Message.js";
import NoticeList from "./Pages/Noticelist.js";
import SentMessagesTable from "./Pages/Sent.js";
import Settings from "./Pages/Setting";
import SetupRulesTable from "./Pages/Setup.js";
import CandidateShortlist from "./Pages/CandidateShortlist.js";
import CandidateSelection from "./Pages/CandidateSelection.js";
import ClientsTable from "./Pages/ClientsTable.js";
import ProjectsTable from "./Pages/ProjectsTable.js";
import ProjectTasksTable from "./Pages/ProjectTasksTable.js";
import ManageProjects from "./Pages/ManageProject.js";
import CompanyDetailsForm from "./Pages/CompanyDetailsForm.js";
import CompanyList from "./Pages/CompanyList.js";
import DoctorDetailsForm from "./Pages/DoctorDetailsForm.js";
import DoctorList from "./Pages/DoctorList.js";
import StaffDetailsForm from "./Pages/StaffDetailsForm.js";
import StaffList from "./Pages/StaffList.js";
import DiagnosticsBookingList from "./Pages/DiagnosticsBookingList.js";
import DoctorAppointmentList from "./Pages/DoctorAppointmentList.js";
import AppointmentBookingForm from "./Pages/AppointmentBookingForm.js";
import DiagnosticDetail from "./Pages/DiagnosticDetail.js";
import DiagnosticsPendingBooking from "./Pages/DiagnosticsPendingBooking.js";
import DoctorAppointmentListPending from "./Pages/DoctorAppointmentListPending.js";
import LoginPage from "./Pages/Login.js";
import CategoryForm from "./Pages/CategoryForm.js";
import CategoryList from "./Pages/CategoryList.js";
import CompanySidebar from "./Components/CompanySidebar.js";
import DiagnosticsAcceptedBooking from "./Pages/DiagnosticsAcceptedBooking.js";
import DiagnosticsRejectedBooking from "./Pages/DiagnosticsRejectedBooking.js";
import AcceptedAppointmentsList from "./Pages/AcceptedAppointmentsList.js";
import RejectedAppointmentsList from "./Pages/RejectedAppointmentsList.js";
import StaffHistory from "./Pages/StaffHistory.js";
import DiagnosticBookingForm from "./Pages/DiagnosticBookingForm.js";
import CouponsPage from "./Pages/CouponPage.js";
import CreateCoupon from "./Pages/CreateCoupon.js";
import UploadDocuments from "./Pages/UploadDocuments.js";
import DocumentTable from "./Pages/DocumentTable.js";
import CouponHistoryTable from "./Pages/CouponHistoryTable.js";
import CreateProductForm from "./Pages/CreateProduct.js";
import ProductList from "./Pages/ProductList.js";
import BookingList from "./Pages/BookingList.js";
import PendingBookingList from "./Pages/PendingBookingList.js";
import CompletedBookingList from "./Pages/CompletedBookingList .js";
import CancelledBookingList from "./Pages/CancelledBookingList .js";
import UserList from "./Pages/UserList.js";
import CreatePoster from "./Pages/CreatePoster.js";
import CreateCategory from "./Pages/CreateCategory.js";
import PosterList from "./Pages/PosterList.js";
import CreateLogo from "./Pages/CreateLogo.js";
import LogoList from "./Pages/LogoList.js";
import CreateBusinessCard from "./Pages/CreateBusinessCard.js";
import CreatePlan from "./Pages/CreatePlan.js";
import PlanList from "./Pages/PlanList.js";
import UsersPlansList from "./Pages/UsersPlansList.js";
import OrdersList from "./Pages/OrdersList.js";
import PrivacyPolicyForm from "./Pages/PrivacyPolicyForm.js";
import PrivacyPolicyPage from "./Pages/PrivacyPolicyPage.js";
import AboutUsFormPage from "./Pages/AboutUsFormPage.js";
import GetAboutUsPage from "./Pages/GetAboutUsPage.js";
import ContactUsPage from "./Pages/ContactUsPage.js";
import GetContactUsPage from "./Pages/GetContactUsPage.js";
import CreateVendor from "./Pages/CreateVendor.js";
import VendorList from "./Pages/VendorList.js";
import RedeemedCouponsList from "./Pages/RedeemedCouponsList.js";
import VendorDocumentList from "./Pages/VendorDocumentList.js";
import VendorInvoiceList from "./Pages/VendorInvoiceList.js";
import ReceivedPayments from "./Pages/ReceivedPayments.js";
import AllPayments from "./Pages/AllPayments.js";
import AllUserCoupons from "./Pages/userCoupons.js";
import UserDetail from "./Pages/UserProfile.js";
import VendorDetail from "./Pages/VendorProfile.js";
import BulkQuizUploader from "./Pages/BulkQuizUploader.js";
import AllQuizzesTable from "./Pages/AllQuizzesTable.js";
import BulkFunFactUploader from "./Pages/BulkFunFactUploader.js";
import AllFunFactsTable from "./Pages/AllFunFactsTable.js";
import AdminNotifications from "./Pages/AdminNotifications.js";
import RegisterPage from "./Pages/RegisterPage.js";
import CreateCourse from "./Pages/CreateCouse.js";
import AllCourses from "./Pages/CoursesList.js";
import CreateEnrollment from "./Pages/CreateEnrollment.js";
import AllEnrollments from "./Pages/AllEnrollments.js";
import CreateLiveClass from "./Pages/CreateLiveClasses.js";
import RegisterMentor from "./Pages/MentorRegister.js";
import AllMentors from "./Pages/AllMentors.js";
import AllLiveClasses from "./Pages/AllLiveClasses.js";
import AddInterview from "./Pages/AddInterview.js";
import AllInterviews from "./Pages/AllInterviews.js";
import PaymentsList from "./Pages/PaymentsList.js";
import CreateUserByAdmin from "./Pages/CreateUserByAdmin.js";
import GenerateInitialInvoice from "./Pages/GenerateInitialInvoice.js";
import InvoicesList from "./Pages/InvoicesList.js";
import CourseModulesList from "./Pages/CourseModuleList.js"
import CourseModuleForm from "./Pages/CourseModuleForm.js"
import AddMentorToEnrollment from "./Pages/AddMentorToEnrollment.js";
import MentorsWithBatches from "./Pages/MentorsWithBatches.js";
import FormsManagement from "./Pages/FormManagement.js";
import AttendanceList from "./Pages/AttendanceList.js";
import GetAllQuizzes from "./Pages/GetAllQuizzes.js";
import GetAllSubmissions from "./Pages/GetAllSubmissions.js";
import CreateCertificate from "./Pages/CreateCertificate.js";
import CertificateList from "./Pages/CertificateList.js";
import AdminProfile from "./Pages/AdminProfile.js";
import DownloadCoursePdf from "./Pages/DownloadCoursePdf.js";
import PopupManagement from "./Pages/PopupManagement.js";
import GetAllTasks from "./Pages/GetAllTasks.js";




function App() {
  return (
    <Routes>
      {/* Login page rendered outside AdminLayout */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* All other routes inside AdminLayout */}
      <Route
        path="/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/department" element={<DepartmentList />} />
              <Route path="/subdepartment" element={<SubDepartmentList />} />
              <Route path="/attendanceform" element={<AttendanceForm />} />
              <Route path="/monthlyattendance" element={<MonthlyAttendance />} />
              <Route path="/missingattendance" element={<MissingAttendance />} />
              <Route path="/weeklyholiday" element={<WeeklyHoliday />} />
              <Route path="/holiday" element={<Holiday />} />
              <Route path="/create-diagnostic" element={<DiagnostiCreate />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/leaveapproval" element={<LeaveApproval />} />
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/setting" element={<Settings />} />
              <Route path="/languagesetup" element={<LanguageSetup />} />
              <Route path="/backupreset" element={<BackupReset />} />
              <Route path="/diagnosticlist" element={<DiagnosticList />} />
              <Route path="/message" element={<MessagesTable />} />
              <Route path="/noticelist" element={<NoticeList />} />
              <Route path="/sentlist" element={<SentMessagesTable />} />
              <Route path="/setuplist" element={<SetupRulesTable />} />
              <Route path="/candidate-shortlist" element={<CandidateShortlist />} />
              <Route path="/selectedcandidates" element={<CandidateSelection />} />
              <Route path="/clients" element={<ClientsTable />} />
              <Route path="/projects" element={<ProjectsTable />} />
              <Route path="/task" element={<ProjectTasksTable />} />
              <Route path="/manage-project" element={<ManageProjects />} />
              <Route path="/company-register" element={<CompanyDetailsForm />} />
              <Route path="/companylist" element={<CompanyList />} />
              <Route path="/create-doctor" element={<DoctorDetailsForm />} />
              <Route path="/doctorlist" element={<DoctorList />} />
              <Route path="/staff-register" element={<StaffDetailsForm />} />
              <Route path="/stafflist" element={<StaffList />} />
              <Route path="/diagnosticslist" element={<DiagnosticsBookingList />} />
              <Route path="/diagnosticsacceptedlist" element={<DiagnosticsAcceptedBooking />} />
              <Route path="/diagnosticsrejectedlist" element={<DiagnosticsRejectedBooking />} />
              <Route path="/doctoracceptedlist" element={<AcceptedAppointmentsList />} />
              <Route path="/doctorrejectedlist" element={<RejectedAppointmentsList />} />
              <Route path="/appintmentlist" element={<DoctorAppointmentList />} />
              <Route path="/appintmentbooking" element={<AppointmentBookingForm />} />
              <Route path="/diagnostic-center/:id" element={<DiagnosticDetail />} />
              <Route path="/diagnosticpending" element={<DiagnosticsPendingBooking />} />
              <Route path="/doctorpendingbookings" element={<DoctorAppointmentListPending />} />
              <Route path="/categoryform" element={<CategoryForm />} />
              <Route path="/categorylist" element={<CategoryList />} />
              <Route path="/add-product" element={<CreateProductForm />} />
              <Route path="/productlist" element={<ProductList />} />
              <Route path="/allorders" element={<BookingList />} />
              <Route path="/pendingorders" element={<PendingBookingList />} />
              <Route path="/completedorders" element={<CompletedBookingList />} />
              <Route path="/cancelledorders" element={<CancelledBookingList />} />
              <Route path="/companysidebar" element={<CompanySidebar />} />
              <Route path="/staff-history/:staffId" element={<StaffHistory />} /> {/* Route for StaffHistory */}
              <Route path="/book-diagnostic" element={<DiagnosticBookingForm />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/couponshistory" element={<CouponHistoryTable />} />
              <Route path="/create-coupon" element={<CreateCoupon />} />
              <Route path="/upload-docs" element={<UploadDocuments />} />
              <Route path="/docs" element={<DocumentTable />} />
              <Route path="/user-coupons" element={<AllUserCoupons />} />
              <Route path="/create-category" element={<CreateCategory />} />
              <Route path="/categorylist" element={<CategoryList />} />
              <Route path="/create-poster" element={<CreatePoster />} />
              <Route path="/posterlist" element={<PosterList />} />
              <Route path="/create-logo" element={<CreateLogo />} />
              <Route path="/logolist" element={<LogoList />} />
              <Route path="/create-businesscard" element={<CreateBusinessCard />} />
              <Route path="/create-plan" element={<CreatePlan />} />
              <Route path="/planlist" element={<PlanList />} />
              <Route path="/userplanlist" element={<UsersPlansList />} />
              <Route path="/orderlist" element={<OrdersList />} />
              <Route path="/create-privacy" element={<PrivacyPolicyForm />} />
              <Route path="/get-policy" element={<PrivacyPolicyPage />} />
              <Route path="/aboutus" element={<AboutUsFormPage />} />
              <Route path="/getaboutus" element={<GetAboutUsPage />} />
              <Route path="/contactus" element={<ContactUsPage />} />
              <Route path="/getcontactus" element={<GetContactUsPage />} />
              <Route path="/create-vendor" element={<CreateVendor />} />
              <Route path="/vendorlist" element={<VendorList />} />
              <Route path="/vendordocumentlist" element={<VendorDocumentList />} />
              <Route path="/redeemed-coupons" element={<RedeemedCouponsList />} />
              <Route path="/payment" element={<VendorInvoiceList />} />
              <Route path="/rcvdpayment" element={< ReceivedPayments />} />
              <Route path="/allpayments" element={< AllPayments />} />
              <Route path="/vendor/:id" element={<VendorDetail />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/:userId" element={<UserDetail />} />
              <Route path="/add-bulk-quiz" element={<BulkQuizUploader />} />
              <Route path="/quizzes" element={<AllQuizzesTable />} />
              <Route path="/add-bulk-funfacts" element={<BulkFunFactUploader />} />
              <Route path="/allfanfacts" element={<AllFunFactsTable />} />
               <Route path="/notifications" element={<AdminNotifications />} />
              <Route path="/create-course" element={<CreateCourse />} />
              <Route path="/courselist" element={<AllCourses />} />
              <Route path="/create-enrollment" element={<CreateEnrollment />} />
              <Route path="/allenrollments" element={<AllEnrollments />} />
              <Route path="/createliveclass" element={<CreateLiveClass />} />
              <Route path="/creatementor" element={<RegisterMentor />} />
              <Route path="/mentorlist" element={<AllMentors />} />
              <Route path="/liveclasses" element={<AllLiveClasses />} />
              <Route path="/add-interview" element={<AddInterview />} />
              <Route path="/interviewlist" element={<AllInterviews />} />
              <Route path="/paymentlist" element={<PaymentsList />} />
              <Route path="/createuser" element={<CreateUserByAdmin />} />
              <Route path="/generateinvoice" element={<GenerateInitialInvoice />} />
              <Route path="/invoicelist" element={<InvoicesList />} />
              <Route path="/course-modules" element={<CourseModulesList />} />
              <Route path="/course-modules/create" element={<CourseModuleForm />} />
              <Route path="/course-modules/edit/:id" element={<CourseModuleForm />} />
              <Route path="/addmentortoenrollered" element={<AddMentorToEnrollment />} />
              <Route path="/mentorswithbatches" element={<MentorsWithBatches />} />
              <Route path="/usercontactformlist" element={<FormsManagement />} />
              <Route path="/attendancelist" element={<AttendanceList />} />
              <Route path="/allquizzes" element={<GetAllQuizzes />} />
              <Route path="/allsubmissionquizzes" element={<GetAllSubmissions />} />
              <Route path="/add-certificate" element={<CreateCertificate />} />
              <Route path="/certificate-list" element={<CertificateList />} />
              <Route path="/adminprofile" element={<AdminProfile />} />
              <Route path="/allpdfs" element={<DownloadCoursePdf />} />
              <Route path="/popup" element={<PopupManagement />} />
              <Route path="/alltasks" element={<GetAllTasks />} />









            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}

export default App;
