import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { User, Shield, CheckCircle, Clock, CreditCard } from 'lucide-react';
const DashboardPadre = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const childData = {
    nombre: 'Juan Pérez',
    edad: 10,
    categoria: 'Sub-10',
    numeroCamiseta: 7
  };
  const paymentStatus = {
    estado: 'Al día',
    color: 'green',
    ultimoPago: '2026-02-01',
    proximoPago: '2026-03-01'
  };
  const recentPayments = [{
    fecha: '2026-02-01',
    monto: '$50,000',
    concepto: 'Mensualidad Febrero',
    estado: 'Pagado'
  }, {
    fecha: '2026-01-01',
    monto: '$50,000',
    concepto: 'Mensualidad Enero',
    estado: 'Pagado'
  }, {
    fecha: '2025-12-01',
    monto: '$50,000',
    concepto: 'Mensualidad Diciembre',
    estado: 'Pagado'
  }, {
    fecha: '2025-11-01',
    monto: '$50,000',
    concepto: 'Mensualidad Noviembre',
    estado: 'Pagado'
  }];
  const handleRequestPazSalvo = () => {
    toast({
      title: "🚧 Función en desarrollo",
      description: "La solicitud de Paz y Salvo estará disponible próximamente. ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };
  const getStatusStyle = () => {
    switch (paymentStatus.color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  return <>
      <Helmet>
        <title>Dashboard Padre - Escuela de Fútbol</title>
        <meta name="description" content="Panel de información para padres de familia" />
      </Helmet>

      <div className="space-y-6">
        {/* Child Information Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#1a5f3f] p-2 rounded-lg">
              <User size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información del Jugador</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="text-lg font-semibold text-gray-900">{childData.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Edad</p>
              <p className="text-lg font-semibold text-gray-900">{childData.edad} años</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Categoría</p>
              <p className="text-lg font-semibold text-gray-900">{childData.categoria}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Número de Camiseta</p>
              <p className="text-lg font-semibold text-gray-900">#{childData.numeroCamiseta}</p>
            </div>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className={`rounded-lg shadow p-6 border-2 ${getStatusStyle()}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} />
              <h2 className="text-xl font-semibold">Estado de Pagos</h2>
            </div>
            <span className="text-2xl font-bold">{paymentStatus.estado}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <div>
                <p className="text-sm font-medium">Último Pago</p>
                <p className="text-sm">{paymentStatus.ultimoPago}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard size={18} />
              <div>
                <p className="text-sm font-medium">Próximo Pago</p>
                <p className="text-sm">{paymentStatus.proximoPago}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleRequestPazSalvo} className="bg-white text-[#1a5f3f] hover:bg-gray-50 border border-[#1a5f3f]">
              <Shield size={18} className="mr-2" />
              Solicitar Paz y Salvo
            </Button>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historial de Pagos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPayments.map((payment, index) => <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.monto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.concepto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {payment.estado}
                      </span>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>;
};
export default DashboardPadre;