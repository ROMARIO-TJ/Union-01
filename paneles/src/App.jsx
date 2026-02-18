
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContextProvider, useAuth } from '@/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';

// Pages
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import JugadoresPage from '@/pages/JugadoresPage'; // Legacy shared page

// Padre Pages
import DashboardPadreHijo from '@/pages/DashboardPadreHijo';
import DashboardPadrePagos from '@/pages/DashboardPadrePagos';
import DashboardPadrePazySalvo from '@/pages/DashboardPadrePazySalvo';

// Financiero Pages
import DashboardFinancieroJugadores from '@/pages/DashboardFinancieroJugadores';
import DashboardFinancieroPagos from '@/pages/DashboardFinancieroPagos';
import DashboardFinancieroPazySalvo from '@/pages/DashboardFinancieroPazySalvo';
import DashboardFinancieroReportes from '@/pages/DashboardFinancieroReportes';

// Contenido Pages
import DashboardContenidoJugadores from '@/pages/DashboardContenidoJugadores';
import DashboardContenidoCategorias from '@/pages/DashboardContenidoCategorias';


function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a5f3f] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Main Dashboard - Routes to role specific landing */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Legacy/Shared Routes */}
      <Route
        path="/jugadores"
        element={
          <ProtectedRoute allowedRoles={['admin_financiero', 'admin_contenido']}>
            <DashboardLayout>
              <JugadoresPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Padre Routes */}
      <Route path="/dashboard/padre/hijo" element={
        <ProtectedRoute allowedRoles={['padre_familia']}>
          <DashboardLayout><DashboardPadreHijo /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/dashboard/padre/pagos" element={
        <ProtectedRoute allowedRoles={['padre_familia']}>
          <DashboardLayout><DashboardPadrePagos /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/dashboard/padre/paz-y-salvo" element={
        <ProtectedRoute allowedRoles={['padre_familia']}>
          <DashboardLayout><DashboardPadrePazySalvo /></DashboardLayout>
        </ProtectedRoute>
      }/>


      {/* Financiero Routes */}
      <Route path="/dashboard/financiero/jugadores" element={
        <ProtectedRoute allowedRoles={['admin_financiero']}>
          <DashboardLayout><DashboardFinancieroJugadores /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/dashboard/financiero/pagos" element={
        <ProtectedRoute allowedRoles={['admin_financiero']}>
          <DashboardLayout><DashboardFinancieroPagos /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/dashboard/financiero/paz-y-salvo" element={
        <ProtectedRoute allowedRoles={['admin_financiero']}>
          <DashboardLayout><DashboardFinancieroPazySalvo /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/dashboard/financiero/reportes" element={
        <ProtectedRoute allowedRoles={['admin_financiero']}>
          <DashboardLayout><DashboardFinancieroReportes /></DashboardLayout>
        </ProtectedRoute>
      }/>


      {/* Contenido Routes */}
      <Route path="/dashboard/contenido/jugadores" element={
        <ProtectedRoute allowedRoles={['admin_contenido']}>
          <DashboardLayout><DashboardContenidoJugadores /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/dashboard/contenido/categorias" element={
        <ProtectedRoute allowedRoles={['admin_contenido']}>
          <DashboardLayout><DashboardContenidoCategorias /></DashboardLayout>
        </ProtectedRoute>
      }/>


      {/* Catch all - redirect to dashboard or login */}
      <Route
        path="*"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <ScrollToTop />
        <AppRoutes />
        <Toaster />
      </Router>
    </AuthContextProvider>
  );
}

export default App;
