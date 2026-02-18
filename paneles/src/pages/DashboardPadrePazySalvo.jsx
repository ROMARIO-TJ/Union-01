
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { FileCheck, Send, Clock, CheckCircle, XCircle, Calendar, RefreshCcw, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const DashboardPadrePazySalvo = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    motivo: '',
    fecha_solicitada: '',
    descripcion: ''
  });

  // Mock previous requests
  const [requests, setRequests] = useState([
    { id: 1, fecha_creacion: '2026-02-10', fecha_solicitada: '2026-02-15', motivo: 'Retiro Temporal', descripcion: 'Viaje familiar por 2 meses', estado: 'Pendiente' },
    { id: 2, fecha_creacion: '2025-11-15', fecha_solicitada: '2025-11-20', motivo: 'Fin de Año', descripcion: 'Certificado para colegio', estado: 'Aprobado' },
    { id: 3, fecha_creacion: '2025-06-20', fecha_solicitada: '2025-06-25', motivo: 'Torneo Externo', descripcion: 'Requisito liga local', estado: 'Rechazado' },
  ]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleClear = () => {
    setFormData({
      motivo: '',
      fecha_solicitada: '',
      descripcion: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.motivo || !formData.fecha_solicitada || !formData.descripcion) {
      toast({
        title: "Campos incompletos",
        description: "Por favor diligencia todos los campos del formulario.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newRequest = {
        id: requests.length + 1,
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_solicitada: formData.fecha_solicitada,
        motivo: formData.motivo,
        descripcion: formData.descripcion,
        estado: 'Pendiente'
      };

      setRequests([newRequest, ...requests]);
      setIsSubmitting(false);
      handleClear();
      
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de Paz y Salvo ha sido creada exitosamente.",
        className: "bg-[#1f5233] text-white border-none"
      });
    }, 1500);
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Aprobado': 
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle size={12} /> Aprobado
          </span>
        );
      case 'Rechazado': 
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircle size={12} /> Rechazado
          </span>
        );
      default: 
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock size={12} /> Pendiente
          </span>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Solicitud Paz y Salvo - Escuela de Fútbol</title>
        <meta name="description" content="Gestión de solicitudes de paz y salvo para padres de familia" />
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1f5233]">Paz y Salvo</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona tus certificados y revisa el estado de tus solicitudes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#1f5233] px-6 py-4 border-b border-[#1f5233]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileCheck size={20} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">Nueva Solicitud</h2>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="motivo" className="text-gray-700 font-medium">Motivo de la solicitud</Label>
                  <select 
                    id="motivo"
                    value={formData.motivo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f5233] focus:border-transparent transition-all"
                  >
                    <option value="">Seleccione un motivo...</option>
                    <option value="Retiro Definitivo">Retiro Definitivo</option>
                    <option value="Retiro Temporal">Retiro Temporal</option>
                    <option value="Trámite Torneo">Trámite Torneo</option>
                    <option value="Certificado Colegio">Certificado Colegio</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_solicitada" className="text-gray-700 font-medium">Fecha Requerida</Label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      id="fecha_solicitada"
                      value={formData.fecha_solicitada}
                      onChange={handleInputChange}
                      className="pl-10 focus:ring-[#1f5233]"
                    />
                    <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500">Fecha para la cual necesitas el documento</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-gray-700 font-medium">Descripción / Comentarios</Label>
                  <textarea 
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="4"
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f5233] focus:border-transparent transition-all resize-none"
                    placeholder="Describe brevemente por qué necesitas el paz y salvo o detalles adicionales..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Eraser size={16} className="mr-2" /> Limpiar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1f5233] hover:bg-[#163c25] text-white transition-all shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send size={16} className="mr-2" /> Enviar Solicitud
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Clock size={20} className="text-[#1f5233]" />
                Historial de Solicitudes
              </h2>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Total: {requests.length}
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
              {requests.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <div key={req.id} className="p-5 hover:bg-gray-50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-base">{req.motivo}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar size={10} /> Solicitado: {req.fecha_creacion}
                          </span>
                        </div>
                        {getStatusBadge(req.estado)}
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md mt-3 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200">
                        <p className="text-sm text-gray-600 line-clamp-2 italic">
                          "{req.descripcion}"
                        </p>
                        <div className="mt-2 text-xs font-medium text-[#1f5233]">
                          Para: {req.fecha_solicitada}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <FileCheck size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">No hay solicitudes</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Aún no has realizado ninguna solicitud de paz y salvo. Utiliza el formulario para crear una nueva.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPadrePazySalvo;
