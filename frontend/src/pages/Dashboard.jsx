import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin, isTeacher, isStudent, isAccountant } = useAuth();
  const navigate = useNavigate();

  const adminCards = [
    { title: 'Students', path: '/students', icon: '👨‍🎓', description: 'Manage student records' },
    { title: 'Teachers', path: '/teachers', icon: '👨‍🏫', description: 'Manage teacher records' },
    { title: 'Classes', path: '/classes', icon: '🏫', description: 'Manage classes' },
    { title: 'Users', path: '/users', icon: '👥', description: 'Manage user accounts' },
    { title: 'Daily Attendance', path: '/attendance/daily', icon: '📝', description: 'Mark daily attendance' },
    { title: 'Monthly Attendance', path: '/attendance/monthly', icon: '📈', description: 'View attendance reports' },
    { title: 'Fees', path: '/fees', icon: '💰', description: 'Fee management' },
    { title: 'Fee Configuration', path: '/fee-configuration', icon: '⚙️', description: 'Configure fee structure' },
    { title: 'Report Cards', path: '/reportcards', icon: '📊', description: 'Manage report cards' },
    { title: 'Academic Years', path: '/academicyears', icon: '📅', description: 'Manage academic years' },
  ];

  const teacherCards = [
    { title: 'My Classes', path: '/classes', icon: '🏫', description: 'View my classes' },
    { title: 'Students', path: '/students', icon: '👨‍🎓', description: 'View students' },
    { title: 'Daily Attendance', path: '/attendance/daily', icon: '📝', description: 'Mark daily attendance' },
    { title: 'Monthly Attendance', path: '/attendance/monthly', icon: '📈', description: 'View attendance reports' },
    { title: 'Report Cards', path: '/reportcards', icon: '📊', description: 'Manage report cards' },
  ];

  const studentCards = [
    { title: 'My Profile', path: '/profile', icon: '👤', description: 'View my profile' },
    { title: 'My Fees', path: '/fees', icon: '💰', description: 'View fee details' },
    { title: 'Report Cards', path: '/reportcards', icon: '📊', description: 'View report cards' },
  ];

  const accountantCards = [
    { title: 'Fees', path: '/fees', icon: '💰', description: 'Fee management & collection' },
    { title: 'Students', path: '/students', icon: '👨‍🎓', description: 'View student records' },
  ];

  const cards = isAdmin ? adminCards : isTeacher ? teacherCards : isAccountant ? accountantCards : studentCards;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.email}</h1>
        <p className="role-badge">{user?.role?.toUpperCase()}</p>
      </div>

      <div className="dashboard-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(card.path)}
          >
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
