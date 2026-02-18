
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DashboardContenidoJugadores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const players = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    nombre: `Futbolista ${i + 1}`,
    categoria: ['Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16'][Math.floor(Math.random() * 5)],
    edad: Math.floor(Math.random() * 10) + 6,
    posicion: ['Portero', 'Defensa', 'Centrocampista', 'Delantero'][Math.floor(Math.random() * 4)],
    numeroCamiseta: Math.floor(Math.random() * 20) + 1,
  }));

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Jugadores - Contenido</title>
        <meta name="description" content="Directorio de jugadores" />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Directorio de Jugadores</h1>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <Users size={40} />
              </div>
              <h3 className="font-bold text-gray-900">{player.nombre}</h3>
              <p className="text-[#1a5f3f] font-medium text-sm mb-2">{player.categoria}</p>
              
              <div className="w-full grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Posición</span>
                  <span>{player.posicion}</span>
                </div>
                <div className="flex flex-col border-l border-gray-200">
                  <span className="text-xs text-gray-400">Camiseta</span>
                  <span>#{player.numeroCamiseta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardContenidoJugadores;
