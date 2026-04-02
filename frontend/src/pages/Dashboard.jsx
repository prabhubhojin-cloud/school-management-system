import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiUser, FiBook, FiCalendar,
  FiCheckSquare, FiBarChart2, FiDollarSign,
  FiSettings, FiFileText, FiShield, FiArrowRight, FiMapPin
} from 'react-icons/fi';
import '../styles/Dashboard.css';

const cardStyles = [
  { accent: '#4f46e5', iconBg: '#ede9fe', iconColor: '#4f46e5' },
  { accent: '#059669', iconBg: '#d1fae5', iconColor: '#059669' },
  { accent: '#0284c7', iconBg: '#e0f2fe', iconColor: '#0284c7' },
  { accent: '#d97706', iconBg: '#fef3c7', iconColor: '#d97706' },
  { accent: '#dc2626', iconBg: '#fee2e2', iconColor: '#dc2626' },
  { accent: '#7c3aed', iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { accent: '#0891b2', iconBg: '#cffafe', iconColor: '#0891b2' },
  { accent: '#65a30d', iconBg: '#ecfccb', iconColor: '#65a30d' },
  { accent: '#e11d48', iconBg: '#ffe4e6', iconColor: '#e11d48' },
  { accent: '#9333ea', iconBg: '#f3e8ff', iconColor: '#9333ea' },
];

const allCards = {
  admin: [
    { title: 'Check-In Report',  path: '/checkin/report',    icon: FiMapPin,      description: 'View staff check-ins today' },
    { title: 'Students',         path: '/students',          icon: FiUsers,       description: 'Manage student records' },
    { title: 'Teachers',         path: '/teachers',          icon: FiUser,        description: 'Manage teacher profiles' },
    { title: 'Classes',          path: '/classes',           icon: FiBook,        description: 'Manage class sections' },
    { title: 'Users',            path: '/users',             icon: FiShield,      description: 'Manage user accounts' },
    { title: 'Daily Attendance', path: '/attendance/daily',  icon: FiCheckSquare, description: 'Mark daily attendance' },
    { title: 'Monthly Report',   path: '/attendance/monthly',icon: FiBarChart2,   description: 'View attendance reports' },
    { title: 'Fees',             path: '/fees',              icon: FiDollarSign,  description: 'Fee management & collection' },
    { title: 'Fee Config',       path: '/fee-configuration', icon: FiSettings,    description: 'Configure fee structure' },
    { title: 'Report Cards',     path: '/reportcards',       icon: FiFileText,    description: 'Manage report cards' },
    { title: 'Academic Years',   path: '/academicyears',     icon: FiCalendar,    description: 'Manage academic years' },
  ],
  office_incharge: [
    { title: 'My Check-In',      path: '/checkin',           icon: FiMapPin,      description: 'Mark your presence today' },
    { title: 'Students',         path: '/students',          icon: FiUsers,       description: 'Manage student records' },
    { title: 'Daily Attendance', path: '/attendance/daily',  icon: FiCheckSquare, description: 'Mark daily attendance' },
    { title: 'Monthly Report',   path: '/attendance/monthly',icon: FiBarChart2,   description: 'View attendance reports' },
    { title: 'Fees',             path: '/fees',              icon: FiDollarSign,  description: 'Fee management & collection' },
    { title: 'Report Cards',     path: '/reportcards',       icon: FiFileText,    description: 'Manage report cards' },
    { title: 'Classes',          path: '/classes',           icon: FiBook,        description: 'View classes' },
    { title: 'Academic Years',   path: '/academicyears',     icon: FiCalendar,    description: 'View academic years' },
  ],
  teacher: [
    { title: 'My Check-In',      path: '/checkin',           icon: FiMapPin,      description: 'Mark your presence today' },
    { title: 'My Classes',       path: '/classes',           icon: FiBook,        description: 'View your classes' },
    { title: 'Students',         path: '/students',          icon: FiUsers,       description: 'View student records' },
    { title: 'Daily Attendance', path: '/attendance/daily',  icon: FiCheckSquare, description: 'Mark daily attendance' },
    { title: 'Monthly Report',   path: '/attendance/monthly',icon: FiBarChart2,   description: 'View attendance reports' },
    { title: 'Report Cards',     path: '/reportcards',       icon: FiFileText,    description: 'Manage report cards' },
  ],
  student: [
    { title: 'My Fees',      path: '/fees',        icon: FiDollarSign, description: 'View fee details' },
    { title: 'Report Cards', path: '/reportcards', icon: FiFileText,   description: 'View report cards' },
  ],
  accountant: [
    { title: 'My Check-In', path: '/checkin',           icon: FiMapPin,      description: 'Mark your presence today' },
    { title: 'Fees',        path: '/fees',     icon: FiDollarSign, description: 'Fee management & collection' },
    { title: 'Students', path: '/students', icon: FiUsers,      description: 'View student records' },
  ],
};

const Dashboard = () => {
  const { user, isAdmin, isTeacher, isStudent, isAccountant, isOfficeIncharge } = useAuth();
  const navigate = useNavigate();
  const role = isAdmin ? 'admin' : isTeacher ? 'teacher' : isAccountant ? 'accountant' : isOfficeIncharge ? 'office_incharge' : 'student';
  const cards = allCards[role] || [];

  const firstName = user?.email?.split('@')[0] || 'User';
  const roleLabel = user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1);

  return (
    <div className="dashboard">
      {/* Welcome banner */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1>Good day, {firstName} 👋</h1>
            <p>Here's what you can manage from your dashboard.</p>
          </div>
          <div className="welcome-role-badge">{roleLabel}</div>
        </div>
      </div>

      {/* Cards */}
      <div className="dashboard-section-title">Quick Access</div>
      <div className="dashboard-grid">
        {cards.map((card, i) => {
          const Icon = card.icon;
          const style = cardStyles[i % cardStyles.length];
          return (
            <div
              key={card.path}
              className="dashboard-card"
              style={{ '--card-accent': style.accent }}
              onClick={() => navigate(card.path)}
            >
              <div
                className="card-icon-wrap"
                style={{ background: style.iconBg, color: style.iconColor }}
              >
                <Icon size={20} />
              </div>
              <div className="card-body">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="card-arrow">
                Open <FiArrowRight size={13} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
