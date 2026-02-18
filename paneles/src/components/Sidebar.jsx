
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileCheck, 
  FileText, 
  User, 
  CreditCard, 
  LogOut,
  X,
  PieChart,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Updated menu items with correct paths
  const menuItems = {
    admin_financiero: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, implemented: true },
      { name: 'Jugadores', path: '/dashboard/financiero/jugadores', icon: Users, implemented: true },
      { name: 'Gestión Financiera', path: '/dashboard/financiero/pagos', icon: DollarSign, implemented: true },
      { name: 'Solicitudes Paz y Salvo', path: '/dashboard/financiero/paz-y-salvo', icon: FileCheck, implemented: true },
      { name: 'Reportes', path: '/dashboard/financiero/reportes', icon: PieChart, implemented: true }
    ],
    admin_contenido: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, implemented: true },
      { name: 'Jugadores', path: '/dashboard/contenido/jugadores', icon: Users, implemented: true },
      { name: 'Categorías', path: '/dashboard/contenido/categorias', icon: Layers, implemented: true },
      { name: 'Solicitudes Nuevas', path: '/solicitudes-nuevas', icon: FileText, implemented: false }
    ],
    padre_familia: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, implemented: true },
      { name: 'Mi Hijo', path: '/dashboard/padre/hijo', icon: User, implemented: true },
      { name: 'Mis Pagos', path: '/dashboard/padre/pagos', icon: CreditCard, implemented: true },
      { name: 'Paz y Salvo', path: '/dashboard/padre/paz-y-salvo', icon: FileCheck, implemented: true }
    ]
  };

  const currentMenuItems = menuItems[user?.role] || [];

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  const handleNavClick = (item) => {
    if (item.implemented) {
      navigate(item.path);
    } else {
      toast({
        title: "🚧 Esta función aún no está implementada",
        description: "¡Puedes solicitarla en tu próximo prompt! 🚀"
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a5f3f] text-white transform transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold">Escuela Fútbol</h2>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-white/10 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-white/10">
          <p className="text-sm text-white/70">Conectado como:</p>
          <p className="font-semibold truncate">{user?.email}</p>
          <p className="text-xs text-white/60 mt-1 capitalize">
            {user?.role?.replace('_', ' ')}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {currentMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                      isActive 
                        ? "bg-white text-[#1a5f3f] font-semibold" 
                        : "hover:bg-white/10 text-white"
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
