
import React from 'react';
import { Helmet } from 'react-helmet';
import { User, Calendar, Shirt, Activity, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const DashboardPadreHijo = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Mock data for a child
  const childData = {
    nombre: 'Juan Pérez',
    fechaNacimiento: '2015-05-15',
    edad: 10,
    categoria: 'Sub-10',
    posicion: 'Delantero',
    numeroCamiseta: 7,
    altura: '1.45m',
    peso: '38kg',
    estadoPago: 'Al día', // 'Al día', 'Vencido', 'Pendiente'
    proximoPago: '2026-03-01'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Al día': return 'text-green-600 bg-green-100 border-green-200';
      case 'Pendiente': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Vencido': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <>
      <Helmet>
        <title>Mi Hijo - Escuela de Fútbol</title>
        <meta name="description" content="Perfil del jugador" />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Perfil del Jugador</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-[#1a5f3f] px-6 py-8 text-white flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <User size={64} className="text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold">{childData.nombre}</h2>
              <p className="text-white/80 text-lg mt-1">{childData.categoria} - #{childData.numeroCamiseta}</p>
              <div className={`mt-3 inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30`}>
                {childData.posicion}
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={20} className="text-[#1a5f3f]" />
                Datos Personales
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Edad</span>
                  <span className="font-medium">{childData.edad} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha Nacimiento</span>
                  <span className="font-medium">{childData.fechaNacimiento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Altura</span>
                  <span className="font-medium">{childData.altura}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Peso</span>
                  <span className="font-medium">{childData.peso}</span>
                </div>
              </div>
            </div>

            {/* Sport Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shirt size={20} className="text-[#1a5f3f]" />
                Datos Deportivos
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Categoría</span>
                  <span className="font-medium">{childData.categoria}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dorsal</span>
                  <span className="font-medium">#{childData.numeroCamiseta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Posición</span>
                  <span className="font-medium">{childData.posicion}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard size={20} className="text-[#1a5f3f]" />
                Estado Financiero
              </h3>
              <div className={`p-4 rounded-lg border-2 ${getStatusColor(childData.estadoPago)}`}>
                <div className="text-center mb-3">
                  <span className="block text-sm opacity-80 uppercase tracking-wide font-semibold">Estado Actual</span>
                  <span className="block text-2xl font-bold mt-1">{childData.estadoPago}</span>
                </div>
                <div className="border-t border-current/20 pt-3 mt-3 flex justify-between items-center text-sm">
                  <span className="opacity-80">Próximo vencimiento:</span>
                  <span className="font-bold">{childData.proximoPago}</span>
                </div>
              </div>
              <Button 
                className="w-full bg-[#1a5f3f] hover:bg-[#154d32]"
                onClick={() => navigate('/dashboard/padre/paz-y-salvo')} // Navigate to Paz y Salvo page
              >
                Solicitar Paz y Salvo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPadreHijo;
