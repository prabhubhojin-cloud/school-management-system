import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMenu, FiX, FiHome, FiUsers, FiUser, FiBook,
  FiCalendar, FiCheckSquare, FiBarChart2, FiDollarSign,
  FiSettings, FiShield, FiFileText, FiLogOut, FiGrid, FiMapPin
} from 'react-icons/fi';
import '../../styles/Layout.css';

const allNavItems = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: FiHome, roles: ['admin', 'teacher', 'student', 'accountant', 'office_incharge'] },
    ],
  },
  {
    section: 'Academic',
    items: [
      { label: 'Students',       path: '/students',      icon: FiUsers,    roles: ['admin', 'teacher', 'accountant', 'office_incharge'] },
      { label: 'Teachers',       path: '/teachers',      icon: FiUser,     roles: ['admin'] },
      { label: 'Classes',        path: '/classes',       icon: FiBook,     roles: ['admin', 'teacher', 'office_incharge'] },
      { label: 'Academic Years', path: '/academicyears', icon: FiCalendar, roles: ['admin', 'office_incharge'] },
    ],
  },
  {
    section: 'Attendance',
    items: [
      { label: 'Daily',   path: '/attendance/daily',   icon: FiCheckSquare, roles: ['admin', 'teacher', 'office_incharge'] },
      { label: 'Monthly', path: '/attendance/monthly', icon: FiBarChart2,   roles: ['admin', 'teacher', 'office_incharge'] },
    ],
  },
  {
    section: 'Finance',
    items: [
      { label: 'Fees',              path: '/fees',              icon: FiDollarSign, roles: ['admin', 'accountant', 'student', 'office_incharge'] },
      { label: 'Fee Configuration', path: '/fee-configuration', icon: FiSettings,   roles: ['admin'] },
    ],
  },
  {
    section: 'Reports',
    items: [
      { label: 'Report Cards', path: '/reportcards', icon: FiFileText, roles: ['admin', 'teacher', 'student', 'office_incharge'] },
    ],
  },
  {
    section: 'Check-In',
    items: [
      { label: 'My Check-In',    path: '/checkin',        icon: FiMapPin,   roles: ['teacher', 'office_incharge', 'accountant'] },
      { label: 'Check-In Report', path: '/checkin/report', icon: FiBarChart2, roles: ['admin'] },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Users', path: '/users', icon: FiShield, roles: ['admin'] },
    ],
  },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on large screen resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 1024) setSidebarOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userRole = user?.role;
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  // Current page label for breadcrumb
  const currentPage = allNavItems
    .flatMap(s => s.items)
    .find(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  return (
    <div className="layout">
      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
          <div className="sidebar-brand-icon">
            <FiGrid size={18} />
          </div>
          <div className="sidebar-brand-text">
            <span>School Manager</span>
            <span>Management System</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {allNavItems.map(section => {
            const visibleItems = section.items.filter(item =>
              !userRole || item.roles.includes(userRole)
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.section}>
                <div className="nav-section-label">{section.section}</div>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <button
                      key={item.path}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon size={17} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.email}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <FiLogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-wrapper">
        {/* Top header */}
        <header className="top-header">
          <div className="top-header-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(v => !v)}>
              {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
            <span className="breadcrumb">
              {currentPage?.label || 'School Management System'}
            </span>
          </div>
          <div className="top-header-right">
            <div className="header-user-pill">
              <div className="header-avatar">{initials}</div>
              <span className="header-email">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
