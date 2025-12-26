import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserDashboard from './dashboards/UserDashboard';
import CompanyDashboard from './dashboards/CompanyDashboard';
import OrganizationDashboard from './dashboards/OrganizationDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.type) {
    case 'company':
      return <CompanyDashboard />;
    case 'organization':
      return <OrganizationDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'job_seeker':
    default:
      return <UserDashboard />;
  }
};

export default Dashboard;



