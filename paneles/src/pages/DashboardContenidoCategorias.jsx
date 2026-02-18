
import React from 'react';
import { Helmet } from 'react-helmet';
import { Users, UserCheck } from 'lucide-react';

const DashboardContenidoCategorias = () => {
  const categories = [
    { id: 1, nombre: 'Sub-8', rangoEdad: '6-8 años', numJugadores: 15, entrenador: 'Carlos Ruiz', horario: 'Lun/Mie 16:00' },
    { id: 2, nombre: 'Sub-10', rangoEdad: '9-10 años', numJugadores: 22, entrenador: 'Mario Gomez', horario: 'Mar/Jue 16:00' },
    { id: 3, nombre: 'Sub-12', rangoEdad: '11-12 años', numJugadores: 18, entrenador: 'Ana Silva', horario: 'Lun/Mie 17:30' },
    { id: 4, nombre: 'Sub-14', rangoEdad: '13-14 años', numJugadores: 20, entrenador: 'Pedro Lopez', horario: 'Mar/Jue 17:30' },
    { id: 5, nombre: 'Sub-16', rangoEdad: '15-16 años', numJugadores: 16, entrenador: 'Juan Torres', horario: 'Vie 16:00' },
    { id: 6, nombre: 'Sub-18', rangoEdad: '17-18 años', numJugadores: 14, entrenador: 'Luis Diaz', horario: 'Sab 09:00' },
  ];

  return (
    <>
      <Helmet>
        <title>Categorías - Contenido</title>
        <meta name="description" content="Gestión de categorías" />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Categorías y Equipos</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rango de Edad</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jugadores</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entrenador</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Horario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#1a5f3f] text-white">
                      {cat.nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat.rangoEdad}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users size={16} className="mr-2 text-gray-400" />
                      {cat.numJugadores}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <UserCheck size={16} className="mr-2 text-gray-400" />
                      {cat.entrenador}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat.horario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DashboardContenidoCategorias;
