import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Placeholder components - Builder 2, 3, 4 will create real ones
const LoginPage = () => <div className="p-4">Login Page (Placeholder)</div>;
const Layout = () => <div className="p-4"><p>Layout (Placeholder)</p><div className="mt-4 border p-4">Content Here</div></div>;
const CitizenHome = () => <div>CitizenHome (Placeholder)</div>;
const CreateReport = () => <div>CreateReport (Placeholder)</div>;
const ReportDetails = () => <div>ReportDetails (Placeholder)</div>;
const MapPage = () => <div>MapPage (Placeholder)</div>;
const NotificationsPage = () => <div>NotificationsPage (Placeholder)</div>;
const CommunityAdminDashboard = () => <div>CommunityAdminDashboard (Placeholder)</div>;
const AIVerificationCenter = () => <div>AIVerificationCenter (Placeholder)</div>;
const DepartmentDashboard = () => <div>DepartmentDashboard (Placeholder)</div>;
const DepartmentReportView = () => <div>DepartmentReportView (Placeholder)</div>;
const FieldWorkerDashboard = () => <div>FieldWorkerDashboard (Placeholder)</div>;
const SuperAdminDashboard = () => <div>SuperAdminDashboard (Placeholder)</div>;
const AnalyticsPage = () => <div>AnalyticsPage (Placeholder)</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<CitizenHome />} />
        <Route path="/report/new" element={<CreateReport />} />
        <Route path="/report/:id" element={<ReportDetails />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/admin" element={<CommunityAdminDashboard />} />
        <Route path="/admin/ai-verification" element={<AIVerificationCenter />} />
        <Route path="/department" element={<DepartmentDashboard />} />
        <Route path="/department/report/:id" element={<DepartmentReportView />} />
        <Route path="/fieldworker" element={<FieldWorkerDashboard />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
