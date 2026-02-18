
import React from 'react';
import { Helmet } from 'react-helmet';
import { CreditCard, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DashboardPadrePagos = () => {
  // Mock payment data
  const payments = [
    { id: 1, fecha: '2026-02-01', concepto: 'Mensualidad Febrero 2026', monto: 50000, metodo: 'Transferencia', estado: 'Pagado' },
    { id: 2, fecha: '2026-01-01', concepto: 'Mensualidad Enero 2026', monto: 50000, metodo: 'Efectivo', estado: 'Pagado' },
    { id: 3, fecha: '2025-12-01', concepto: 'Mensualidad Diciembre 2025', monto: 50000, metodo: 'Transferencia', estado: 'Pagado' },
    { id: 4, fecha: '2025-11-01', concepto: 'Mensualidad Noviembre 2025', monto: 50000, metodo: 'Transferencia', estado: 'Pagado' },
    { id: 5, fecha: '2025-10-01', concepto: 'Mensualidad Octubre 2025', monto: 50000, metodo: 'Efectivo', estado: 'Pagado' },
    { id: 6, fecha: '2025-09-01', concepto: 'Uniforme Oficial', monto: 120000, metodo: 'Transferencia', estado: 'Pagado' },
    { id: 7, fecha: '2025-09-01', concepto: 'Mensualidad Septiembre 2025', monto: 50000, metodo: 'Transferencia', estado: 'Pagado' },
    { id: 8, fecha: '2025-08-01', concepto: 'Matrícula 2025', monto: 150000, metodo: 'Efectivo', estado: 'Pagado' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pagado':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">Pagado</span>;
      case 'Pendiente':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Pendiente</span>;
      case 'Vencido':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Vencido</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Desconocido</span>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Mis Pagos - Escuela de Fútbol</title>
        <meta name="description" content="Historial de pagos" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Historial de Pagos</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download size={16} /> Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <Input placeholder="Buscar por concepto..." className="pl-9" />
          </div>
          <div className="w-full sm:w-48">
             <select className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]">
               <option value="all">Todos los años</option>
               <option value="2026">2026</option>
               <option value="2025">2025</option>
             </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.concepto}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.monto.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.metodo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.estado)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-[#1a5f3f] hover:text-[#154d32]">Recibo</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPadrePagos;
