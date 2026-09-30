import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import components
import Layout from './components/Layout';

// Import pages
import LoginPage from './pages/LoginPage';
import CitizenHome from './pages/CitizenHome';
import CreateReport from './pages/CreateReport';
import ReportDetails from './pages/ReportDetails';
import MapPage from './pages/MapPage';
import NotificationsPage from './pages/NotificationsPage';
import CommunityAdminDashboard from './pages/CommunityAdminDashboard';
import AIVerificationCenter from './pages/AIVerificationCenter';
import DepartmentDashboard from './pages/DepartmentDashboard';
import DepartmentReportView from './pages/DepartmentReportView';
import FieldWorkerDashboard from './pages/FieldWorkerDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AnalyticsPage from './pages/AnalyticsPage';

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
