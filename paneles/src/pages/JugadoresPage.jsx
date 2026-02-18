
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Filter, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const JugadoresPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const players = [
    { id: 1, nombre: 'Juan Pérez', edad: 10, categoria: 'Sub-10', numeroCamiseta: 7, estadoPago: 'Al día', documentos: ['Certificado médico', 'Autorización padres', 'Registro civil'] },
    { id: 2, nombre: 'María González', edad: 12, categoria: 'Sub-12', numeroCamiseta: 10, estadoPago: 'Al día', documentos: ['Certificado médico', 'Autorización padres'] },
    { id: 3, nombre: 'Carlos Rodríguez', edad: 8, categoria: 'Sub-8', numeroCamiseta: 5, estadoPago: 'Vencido', documentos: ['Certificado médico', 'Autorización padres', 'Registro civil'] },
    { id: 4, nombre: 'Ana Martínez', edad: 14, categoria: 'Sub-14', numeroCamiseta: 11, estadoPago: 'Al día', documentos: ['Certificado médico', 'Autorización padres'] },
    { id: 5, nombre: 'Luis Fernández', edad: 16, categoria: 'Sub-16', numeroCamiseta: 9, estadoPago: 'Parcial', documentos: ['Certificado médico', 'Autorización padres', 'Registro civil'] },
    { id: 6, nombre: 'Sofia Ramírez', edad: 12, categoria: 'Sub-12', numeroCamiseta: 8, estadoPago: 'Al día', documentos: ['Certificado médico', 'Autorización padres'] },
    { id: 7, nombre: 'Miguel Torres', edad: 8, categoria: 'Sub-8', numeroCamiseta: 3, estadoPago: 'Al día', documentos: ['Certificado médico', 'Autorización padres'] },
    { id: 8, nombre: 'Laura Jiménez', edad: 14, categoria: 'Sub-14', numeroCamiseta: 14, estadoPago: 'Vencido', documentos: ['Certificado médico', 'Autorización padres', 'Registro civil'] },
    { id: 9, nombre: 'Diego Castro', edad: 16, categoria: 'Sub-16', numeroCamiseta: 6, estadoPago: 'Al día', documentos: ['Certificado médico', 'Autorización padres'] }
  ];

  const categories = ['all', 'Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18'];

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || player.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Al día':
        return 'bg-green-100 text-green-800';
      case 'Vencido':
        return 'bg-red-100 text-red-800';
      case 'Parcial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Jugadores - Escuela de Fútbol</title>
        <meta name="description" content="Gestión de jugadores de la escuela de fútbol" />
      </Helmet>

      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Buscar jugador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 pl-10 pr-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Todas las categorías' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#1a5f3f] p-3 rounded-full">
                      <User size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{player.nombre}</h3>
                      <p className="text-sm text-gray-600">{player.categoria}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Edad:</span>
                    <span className="font-medium text-gray-900">{player.edad} años</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Camiseta:</span>
                    <span className="font-medium text-gray-900">#{player.numeroCamiseta}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-gray-600">Estado de Pago:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(player.estadoPago)}`}>
                      {player.estadoPago}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No se encontraron jugadores</p>
          </div>
        )}

        {/* Player Detail Dialog */}
        <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Información del Jugador</DialogTitle>
              <DialogDescription>
                Detalles completos del jugador seleccionado
              </DialogDescription>
            </DialogHeader>
            {selectedPlayer && (
              <div className="space-y-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">{selectedPlayer.nombre}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Edad:</span>
                      <span className="font-medium text-gray-900">{selectedPlayer.edad} años</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categoría:</span>
                      <span className="font-medium text-gray-900">{selectedPlayer.categoria}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número de Camiseta:</span>
                      <span className="font-medium text-gray-900">#{selectedPlayer.numeroCamiseta}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estado de Pago:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPlayer.estadoPago)}`}>
                        {selectedPlayer.estadoPago}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Documentos</h4>
                  <ul className="space-y-1">
                    {selectedPlayer.documentos.map((doc, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#1a5f3f] rounded-full"></span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={() => setSelectedPlayer(null)}
                  className="w-full bg-[#1a5f3f] hover:bg-[#144a2f]"
                >
                  Cerrar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default JugadoresPage;
