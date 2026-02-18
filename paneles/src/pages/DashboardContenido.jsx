
import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Layers, FileText, TrendingUp } from 'lucide-react';

const DashboardContenido = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Jugadores Activos', value: '87', icon: Users, color: 'bg-blue-500' },
    { label: 'Categorías', value: '6', icon: Layers, color: 'bg-purple-500' },
    { label: 'Solicitudes Nuevas', value: '8', icon: FileText, color: 'bg-orange-500' }
  ];

  const playersByCategory = [
    { categoria: 'Sub-8', jugadores: 12 },
    { categoria: 'Sub-10', jugadores: 15 },
    { categoria: 'Sub-12', jugadores: 18 },
    { categoria: 'Sub-14', jugadores: 16 },
    { categoria: 'Sub-16', jugadores: 14 },
    { categoria: 'Sub-18', jugadores: 12 }
  ];

  const recentRequests = [
    { nombre: 'Pedro López', categoria: 'Sub-10', fecha: '2026-02-11', estado: 'Pendiente' },
    { nombre: 'Sofia Ramírez', categoria: 'Sub-12', fecha: '2026-02-10', estado: 'Aprobado' },
    { nombre: 'Miguel Torres', categoria: 'Sub-8', fecha: '2026-02-09', estado: 'Pendiente' },
    { nombre: 'Laura Jiménez', categoria: 'Sub-14', fecha: '2026-02-08', estado: 'Aprobado' },
    { nombre: 'Diego Castro', categoria: 'Sub-16', fecha: '2026-02-07', estado: 'Pendiente' }
  ];

  const getStatusColor = (estado) => {
    return estado === 'Aprobado' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Contenido - Escuela de Fútbol</title>
        <meta name="description" content="Panel de control de contenido de la escuela de fútbol" />
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

        {/* Players by Category */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Jugadores por Categoría</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {playersByCategory.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-[#1a5f3f] transition-colors">
                  <p className="text-sm text-gray-600">{item.categoria}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{item.jugadores}</p>
                  <p className="text-xs text-gray-500 mt-1">jugadores</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Solicitudes Recientes</h2>
              <TrendingUp size={20} className="text-gray-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Solicitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRequests.map((request, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {request.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {request.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.estado)}`}>
                        {request.estado}
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

export default DashboardContenido;
