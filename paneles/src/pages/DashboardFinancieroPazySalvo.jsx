
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { FileCheck, Check, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const DashboardFinancieroPazySalvo = () => {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [comment, setComment] = useState('');

  // Mock requests
  const [requests, setRequests] = useState([
    { id: 1, jugador: 'Juan Pérez', fecha: '2026-02-12', motivo: 'Retiro Temporal', urgencia: 'Media', estado: 'Pendiente' },
    { id: 2, jugador: 'Carlos Diaz', fecha: '2026-02-11', motivo: 'Torneo', urgencia: 'Alta', estado: 'Pendiente' },
    { id: 3, jugador: 'Ana Maria', fecha: '2026-02-10', motivo: 'Personal', urgencia: 'Baja', estado: 'Pendiente' },
    { id: 4, jugador: 'Pedro Pablo', fecha: '2026-02-09', motivo: 'Retiro Definitivo', urgencia: 'Media', estado: 'Pendiente' },
    { id: 5, jugador: 'Luisa Lane', fecha: '2026-02-08', motivo: 'Trámite', urgencia: 'Baja', estado: 'Aprobado' },
    { id: 6, jugador: 'Clark Kent', fecha: '2026-02-07', motivo: 'Torneo', urgencia: 'Alta', estado: 'Rechazado' },
  ]);

  const handleAction = (req, type) => {
    setSelectedRequest(req);
    setActionType(type);
    setComment('');
  };

  const submitAction = () => {
    // In a real app, update backend here
    const newStatus = actionType === 'approve' ? 'Aprobado' : 'Rechazado';
    setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, estado: newStatus } : r));
    
    toast({
      title: `Solicitud ${newStatus}`,
      description: `La solicitud de ${selectedRequest.jugador} ha sido ${newStatus.toLowerCase()}.`,
    });
    
    setSelectedRequest(null);
    setActionType(null);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Alta': return 'text-red-600 bg-red-50';
      case 'Media': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <>
      <Helmet>
        <title>Solicitudes Paz y Salvo - Financiero</title>
        <meta name="description" content="Gestión de solicitudes de paz y salvo" />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Paz y Salvo</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.jugador}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.motivo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(req.urgencia)}`}>
                        {req.urgencia}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        req.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        req.estado === 'Aprobado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {req.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {req.estado === 'Pendiente' && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleAction(req, 'approve')}
                          >
                            <Check size={16} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleAction(req, 'reject')}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Modal */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
              </DialogTitle>
              <DialogDescription>
                {selectedRequest && `Procesando solicitud de ${selectedRequest.jugador}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <label className="text-sm font-medium text-gray-700 block">
                Comentarios / Motivo
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1a5f3f] focus:outline-none"
                rows="4"
                placeholder={actionType === 'approve' ? "Instrucciones de entrega..." : "Motivo del rechazo..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancelar</Button>
              <Button 
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                onClick={submitAction}
              >
                {actionType === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default DashboardFinancieroPazySalvo;
