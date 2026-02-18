
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Download, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DashboardFinancieroPagos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for 20+ payments
  const payments = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    jugador: `Jugador ${Math.floor(Math.random() * 15) + 1}`,
    monto: 50000,
    fecha: `2026-02-${Math.floor(Math.random() * 28) + 1}`.replace(/-(\d)$/, '-0$1'),
    estado: ['Pagado', 'Pendiente', 'Vencido'][Math.floor(Math.random() * 3)],
    metodo: ['Efectivo', 'Transferencia', 'Tarjeta'][Math.floor(Math.random() * 3)],
    referencia: `REF-${Math.floor(Math.random() * 100000)}`
  }));

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.jugador.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      'Pagado': 'bg-green-100 text-green-800',
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Vencido': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Gestión Pagos - Financiero</title>
        <meta name="description" content="Control de pagos y transacciones" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Control de Pagos</h1>
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Exportar Reporte
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar por nombre de jugador..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select 
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Vencido">Vencido</option>
            </select>
          </div>
          <div className="relative">
             <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <Input type="date" className="pl-9" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.jugador}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{p.referencia}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.metodo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${p.monto.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(p.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Mostrando {filteredPayments.length} transacciones
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardFinancieroPagos;
