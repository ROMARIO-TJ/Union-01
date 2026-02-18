
import React from 'react';
import { useAuth } from '@/AuthContext';
import DashboardFinanciero from '@/pages/DashboardFinanciero';
import DashboardContenido from '@/pages/DashboardContenido';
import DashboardPadre from '@/pages/DashboardPadre';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin_financiero') {
    return <DashboardFinanciero />;
  } else if (user?.role === 'admin_contenido') {
    return <DashboardContenido />;
  } else if (user?.role === 'padre_familia') {
    return <DashboardPadre />;
  }

  return (
    <div className="text-center p-8">
      <p className="text-gray-600">Rol de usuario no reconocido</p>
    </div>
  );
};

export default Dashboard;
