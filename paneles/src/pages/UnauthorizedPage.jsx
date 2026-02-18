
import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Acceso Denegado - Escuela de Fútbol</title>
        <meta name="description" content="No tienes permisos para acceder a esta página" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <ShieldAlert size={48} className="text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h1>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder a esta página. Por favor, contacta al administrador si crees que esto es un error.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#1a5f3f] hover:bg-[#144a2f]"
            >
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnauthorizedPage;
