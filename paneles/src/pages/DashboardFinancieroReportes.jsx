
import React from 'react';
import { Helmet } from 'react-helmet';
import { DollarSign, AlertCircle, TrendingUp, Wallet } from 'lucide-react';

// Note: In a real app we'd use a charting library like Recharts or Chart.js
// For this demo, we'll build simple CSS-based visualizations

const DashboardFinancieroReportes = () => {
  const metrics = [
    { label: 'Recaudo Total (Mes)', value: '$12,500,000', icon: Wallet, color: 'text-green-600 bg-green-100' },
    { label: 'Cartera Pendiente', value: '$3,200,000', icon: AlertCircle, color: 'text-yellow-600 bg-yellow-100' },
    { label: 'Cartera Vencida', value: '$1,800,000', icon: TrendingUp, color: 'text-red-600 bg-red-100' },
  ];

  // Mock data for visualizations
  const monthlyIncome = [40, 65, 55, 80, 70, 95]; // Percentages relative to max
  const months = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'];
  
  const pendingByCategory = [
    { name: 'Sub-8', value: 15, color: 'bg-blue-400' },
    { name: 'Sub-10', value: 25, color: 'bg-green-400' },
    { name: 'Sub-12', value: 20, color: 'bg-yellow-400' },
    { name: 'Sub-14', value: 30, color: 'bg-orange-400' },
    { name: 'Sub-16', value: 10, color: 'bg-red-400' },
  ];

  return (
    <>
      <Helmet>
        <title>Reportes Financieros - Escuela de Fútbol</title>
        <meta name="description" content="Reportes y estadísticas financieras" />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes Financieros</h1>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Income Chart Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Ingresos Mensuales</h3>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {monthlyIncome.map((height, idx) => (
                <div key={idx} className="flex flex-col items-center w-full group cursor-pointer">
                  <div className="relative w-full flex justify-center">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded">
                      ${height * 100000}
                    </div>
                    <div 
                      className="w-4/5 bg-[#1a5f3f] rounded-t-sm hover:bg-[#154d32] transition-colors"
                      style={{ height: `${height * 2.5}px` }} 
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{months[idx]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending by Category Pie Chart Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Pendientes por Categoría</h3>
            <div className="flex flex-col gap-4">
              {pendingByCategory.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-16 text-sm text-gray-600 font-medium">{cat.name}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cat.color}`} 
                      style={{ width: `${cat.value}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm text-gray-600 text-right">{cat.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded text-sm text-gray-600 text-center">
              La categoría Sub-14 presenta el mayor índice de morosidad este mes.
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Estados de Pago</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 border rounded-lg border-green-200 bg-green-50">
              <div className="text-3xl font-bold text-green-700">65%</div>
              <div className="text-sm text-green-600 mt-1">Al día</div>
            </div>
            <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
              <div className="text-3xl font-bold text-yellow-700">25%</div>
              <div className="text-sm text-yellow-600 mt-1">Pendiente</div>
            </div>
            <div className="p-4 border rounded-lg border-red-200 bg-red-50">
              <div className="text-3xl font-bold text-red-700">10%</div>
              <div className="text-sm text-red-600 mt-1">Vencido</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardFinancieroReportes;
