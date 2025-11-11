import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { MapsProvider } from './contexts/MapsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RideRequest from './pages/RideRequest';
import DriverDashboard from './pages/DriverDashboard';
import RideHistory from './pages/RideHistory';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MapsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/request-ride" element={
                  <ProtectedRoute>
                    <Layout>
                      <RideRequest />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/driver-dashboard" element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <Layout>
                      <DriverDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/ride-history" element={
                  <ProtectedRoute>
                    <Layout>
                      <RideHistory />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Redirect unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </MapsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
