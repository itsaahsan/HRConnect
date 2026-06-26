import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEmployees from './pages/admin/Employees';
import AdminEmployeeDetail from './pages/admin/EmployeeDetail';
import AdminAddEmployee from './pages/admin/AddEmployee';
import AdminEditEmployee from './pages/admin/EditEmployee';
import AdminDepartments from './pages/admin/Departments';
import AdminAttendance from './pages/admin/Attendance';
import AdminLeaves from './pages/admin/Leaves';
import AdminPayroll from './pages/admin/Payroll';
import AdminReports from './pages/admin/Reports';
import AdminHolidays from './pages/admin/Holidays';
import AdminActivityLog from './pages/admin/ActivityLog';
import AdminSettings from './pages/admin/Settings';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerAttendance from './pages/manager/Attendance';
import ManagerLeaves from './pages/manager/Leaves';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeaves from './pages/employee/Leaves';
import EmployeePayslips from './pages/employee/Payslips';
import EmployeeProfile from './pages/employee/Profile';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={
        user.role === 'admin' ? '/admin/dashboard' :
        user.role === 'manager' ? '/manager/dashboard' :
        '/employee/dashboard'
      } replace /> : <Login />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="employees/new" element={<AdminAddEmployee />} />
        <Route path="employees/:id" element={<AdminEmployeeDetail />} />
        <Route path="employees/:id/edit" element={<AdminEditEmployee />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="leaves" element={<AdminLeaves />} />
        <Route path="payroll" element={<AdminPayroll />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="holidays" element={<AdminHolidays />} />
        <Route path="activity" element={<AdminActivityLog />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Manager Routes */}
      <Route path="/manager/*" element={
        <ProtectedRoute allowedRoles={['manager']}>
          <ManagerLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="attendance" element={<ManagerAttendance />} />
        <Route path="leaves" element={<ManagerLeaves />} />
      </Route>

      {/* Employee Routes */}
      <Route path="/employee/*" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <EmployeeLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="attendance" element={<EmployeeAttendance />} />
        <Route path="leaves" element={<EmployeeLeaves />} />
        <Route path="payslips" element={<EmployeePayslips />} />
        <Route path="profile" element={<EmployeeProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Layout components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="employees/new" element={<AdminAddEmployee />} />
            <Route path="employees/:id" element={<AdminEmployeeDetail />} />
            <Route path="employees/:id/edit" element={<AdminEditEmployee />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="leaves" element={<AdminLeaves />} />
            <Route path="payroll" element={<AdminPayroll />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="holidays" element={<AdminHolidays />} />
            <Route path="activity" element={<AdminActivityLog />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const ManagerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6">
          <Routes>
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="attendance" element={<ManagerAttendance />} />
            <Route path="leaves" element={<ManagerLeaves />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const EmployeeLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6">
          <Routes>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="leaves" element={<EmployeeLeaves />} />
            <Route path="payslips" element={<EmployeePayslips />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
