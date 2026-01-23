import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false);
    const user = ref(null);

    // Credenciales por defecto
    const DEFAULT_CREDENTIALS = {
        username: 'admin',
        password: '12345'
    };

    // Inicializar desde localStorage
    const initAuth = () => {
        const savedAuth = localStorage.getItem('admin_session');
        if (savedAuth) {
            const session = JSON.parse(savedAuth);
            if (session.isAuthenticated) {
                isAuthenticated.value = true;
                user.value = session.user;
            }
        }
    };

    // Login
    const login = (username, password) => {
        if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
            isAuthenticated.value = true;
            user.value = { username };

            // Guardar sesión
            localStorage.setItem('admin_session', JSON.stringify({
                isAuthenticated: true,
                user: { username }
            }));

            return { success: true };
        }
        return { success: false, error: 'Credenciales incorrectas' };
    };

    // Logout
    const logout = () => {
        isAuthenticated.value = false;
        user.value = null;
        localStorage.removeItem('admin_session');
    };

    // Inicializar al cargar
    initAuth();

    return {
        isAuthenticated,
        user,
        login,
        logout
    };
});
