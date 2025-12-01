import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import AcademicYears from './pages/AcademicYears';
import Fees from './pages/Fees';
import FeeConfiguration from './pages/FeeConfiguration';
import Users from './pages/Users';
import DailyAttendance from './pages/DailyAttendance';
import MonthlyAttendance from './pages/MonthlyAttendance';
import './styles/App.css';
import './styles/Form.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="classes" element={<Classes />} />
              <Route path="academicyears" element={<AcademicYears />} />
              <Route path="fees" element={<Fees />} />
              <Route path="fee-configuration" element={<FeeConfiguration />} />
              <Route path="users" element={<Users />} />
              <Route path="attendance/daily" element={<DailyAttendance />} />
              <Route path="attendance/monthly" element={<MonthlyAttendance />} />
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
