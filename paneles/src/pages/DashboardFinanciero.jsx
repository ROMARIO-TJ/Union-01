
import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, FileCheck, TrendingUp } from 'lucide-react';

const DashboardFinanciero = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Pagos Pendientes', value: '12', icon: Clock, color: 'bg-orange-500' },
    { label: 'Ingresos Totales', value: '$2,500,000', icon: DollarSign, color: 'bg-green-600' },
    { label: 'Solicitudes Paz y Salvo', value: '5', icon: FileCheck, color: 'bg-blue-500' }
  ];

  const recentPayments = [
    { jugador: 'Juan Pérez', monto: '$50,000', fecha: '2026-02-10', estado: 'Pagado' },
    { jugador: 'María González', monto: '$50,000', fecha: '2026-02-09', estado: 'Pagado' },
    { jugador: 'Carlos Rodríguez', monto: '$50,000', fecha: '2026-02-08', estado: 'Pendiente' },
    { jugador: 'Ana Martínez', monto: '$50,000', fecha: '2026-02-07', estado: 'Pagado' },
    { jugador: 'Luis Fernández', monto: '$50,000', fecha: '2026-02-06', estado: 'Vencido' }
  ];

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Pagado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Financiero - Escuela de Fútbol</title>
        <meta name="description" content="Panel de control financiero de la escuela de fútbol" />
      </Helmet>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Payments Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pagos Recientes</h2>
              <TrendingUp size={20} className="text-gray-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jugador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPayments.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.jugador}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.monto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.estado)}`}>
                        {payment.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => navigate('/jugadores')}
              className="bg-[#1a5f3f] hover:bg-[#144a2f]"
            >
              Ver Jugadores
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardFinanciero;
