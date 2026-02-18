
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/AuthContext';
import { Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getBreadcrumb = () => {
    const path = location.pathname;
    const breadcrumbs = {
      '/dashboard': 'Dashboard',
      '/jugadores': 'Jugadores',
      
      // Padre
      '/dashboard/padre/hijo': 'Mi Hijo',
      '/dashboard/padre/pagos': 'Mis Pagos',
      '/dashboard/padre/paz-y-salvo': 'Paz y Salvo',

      // Financiero
      '/dashboard/financiero/jugadores': 'Gestión Jugadores',
      '/dashboard/financiero/pagos': 'Control de Pagos',
      '/dashboard/financiero/paz-y-salvo': 'Solicitudes Paz y Salvo',
      '/dashboard/financiero/reportes': 'Reportes Financieros',

      // Contenido
      '/dashboard/contenido/jugadores': 'Directorio Jugadores',
      '/dashboard/contenido/categorias': 'Categorías y Equipos',
      
      '/solicitudes-nuevas': 'Solicitudes Nuevas',
    };
    return breadcrumbs[path] || 'Escuela de Fútbol';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu toggle and breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          <div>
            <p className="text-sm text-gray-500">Inicio / {getBreadcrumb()}</p>
            <h1 className="text-2xl font-bold text-gray-900">{getBreadcrumb()}</h1>
          </div>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-[#1a5f3f] text-white rounded-full">
              <User size={20} />
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
