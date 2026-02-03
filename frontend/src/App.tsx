import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import EventList from '@/pages/events/EventList';
import EventDetail from '@/pages/events/EventDetail';
import CreateEvent from '@/pages/organizer/CreateEvent';
import MyRegistrations from '@/pages/student/MyRegistrations';
import DashboardLayout from '@/layouts/DashboardLayout';
import StudentDashboard from '@/pages/dashboard/StudentDashboard';
import OrganizerDashboard from '@/pages/dashboard/OrganizerDashboard';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import EventAttendance from '@/pages/organizer/EventAttendance';
import MyCertificates from '@/pages/student/MyCertificates';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const DashboardRouter = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'STUDENT': return <StudentDashboard />;
    case 'ORGANIZER': return <OrganizerDashboard />;
    case 'ADMIN': return <AdminDashboard />;
    default: return <div>Unknown Role</div>;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/my-registrations" element={<MyRegistrations />} />
            <Route path="/my-certificates" element={<MyCertificates />} />
            <Route path="/organizer/create-event" element={<CreateEvent />} />
            <Route path="/organizer/events/:id/attendance" element={<EventAttendance />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
