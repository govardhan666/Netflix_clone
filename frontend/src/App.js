import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import Watch from './pages/Watch';
import './styles/App.css';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return !token ? children : <Navigate to="/browse" />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <PrivateRoute>
              <Browse />
            </PrivateRoute>
          }
        />
        <Route
          path="/watch/:contentId"
          element={
            <PrivateRoute>
              <Watch />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/browse" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
