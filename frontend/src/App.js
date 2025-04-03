import React, { useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { 
  ThemeProvider, 
  CssBaseline,
  Box
} from '@mui/material';
import theme from './theme';

// Pages
import Dashboard from './pages/Dashboard';
import BookRoom from './pages/BookRoom';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRooms from './pages/admin/ManageRooms';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UserProfile from './components/UserProfile';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalLoader from './components/GlobalLoader';
import GlobalNotification from './components/GlobalNotification';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GlobalProvider, useGlobal } from './contexts/GlobalContext';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component - checks if user is admin
const AdminRoute = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return currentUser?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

// Layout Component with Navbar and Sidebar
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isLoading } = useGlobal();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Global Components */}
      <GlobalLoader open={isLoading} />
      <GlobalNotification />
      
      <Navbar toggleSidebar={toggleSidebar} />
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {isAuthenticated && (
          <Sidebar 
            open={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
            {children}
          </ErrorBoundary>
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalProvider>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/book-room" 
                  element={
                    <PrivateRoute>
                      <BookRoom />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/my-bookings" 
                  element={
                    <PrivateRoute>
                      <MyBookings />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Box>
                        <UserProfile />
                      </Box>
                    </PrivateRoute>
                  } 
                />

                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/rooms" 
                  element={
                    <AdminRoute>
                      <ManageRooms />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/bookings" 
                  element={
                    <AdminRoute>
                      <ManageBookings />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <AdminRoute>
                      <ManageUsers />
                    </AdminRoute>
                  } 
                />

                {/* Default Redirect */}
                <Route 
                  path="/" 
                  element={<Navigate to="/dashboard" />} 
                />
                <Route 
                  path="*" 
                  element={<Navigate to="/dashboard" />} 
                />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </GlobalProvider>
    </ThemeProvider>
  );
}

export default App;
