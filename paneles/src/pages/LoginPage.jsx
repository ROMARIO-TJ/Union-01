
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, User } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu email y contraseña",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales inválidas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setIsLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al iniciar sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - Escuela de Fútbol</title>
        <meta name="description" content="Inicia sesión en el sistema de gestión de la escuela de fútbol" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a5f3f] to-[#0f3d28] px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-[#1a5f3f] p-3 rounded-full">
                  <User size={32} className="text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Escuela de Fútbol</h1>
              <p className="text-gray-600 mt-2">Sistema de Gestión</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1a5f3f] hover:bg-[#144a2f] text-white"
                disabled={isLoading}
              >
                <LogIn size={20} className="mr-2" />
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Demo Login Buttons */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O prueba con una cuenta demo</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin('admin@escuela.com', 'admin123')}
                  disabled={isLoading}
                >
                  <User size={16} className="mr-2" />
                  Admin Financiero
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin('contenido@escuela.com', 'contenido123')}
                  disabled={isLoading}
                >
                  <User size={16} className="mr-2" />
                  Admin de Contenido
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin('padre@escuela.com', 'padre123')}
                  disabled={isLoading}
                >
                  <User size={16} className="mr-2" />
                  Padre de Familia
                </Button>
              </div>
            </div>

            {/* Helper text */}
            <p className="mt-6 text-center text-xs text-gray-500">
              Credenciales de prueba: admin@escuela.com / admin123
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
