
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Filter, User, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DashboardFinancieroJugadores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for 15+ players
  const players = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    nombre: `Jugador ${i + 1} Apellido`,
    categoria: ['Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16'][Math.floor(Math.random() * 5)],
    numeroCamiseta: Math.floor(Math.random() * 99) + 1,
    estadoPago: ['Al día', 'Pendiente', 'Vencido'][Math.floor(Math.random() * 3)],
    ultimoPago: `2026-0${Math.floor(Math.random() * 2) + 1}-${Math.floor(Math.random() * 28) + 1}`,
  }));

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || player.categoria === categoryFilter;
    const matchesStatus = statusFilter === 'all' || player.estadoPago === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      'Al día': 'bg-green-100 text-green-800 border-green-200',
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Vencido': 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Gestión Jugadores - Financiero</title>
        <meta name="description" content="Listado de jugadores y estado financiero" />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Listado de Jugadores</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar jugador..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select 
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las Categorías</option>
              <option value="Sub-8">Sub-8</option>
              <option value="Sub-10">Sub-10</option>
              <option value="Sub-12">Sub-12</option>
              <option value="Sub-14">Sub-14</option>
              <option value="Sub-16">Sub-16</option>
            </select>
          </div>
          <div>
            <select 
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="Al día">Al día</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Vencido">Vencido</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dorsal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Pago</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                          <User size={16} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{player.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{player.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{player.numeroCamiseta}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(player.estadoPago)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{player.ultimoPago}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-[#1a5f3f] hover:text-[#154d32] flex items-center justify-end gap-1 ml-auto">
                        <DollarSign size={16} /> Ver Pagos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Mostrando {filteredPlayers.length} jugadores
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardFinancieroJugadores;
