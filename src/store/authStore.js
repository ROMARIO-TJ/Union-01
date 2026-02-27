import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '../services/api';
import { auth, googleProvider, signInWithPopup } from '../services/firebase';

export const useAuthStore = defineStore('auth', () => {
    // ADMIN STATE
    const adminUser = ref(null);
    const isAdminAuthenticated = ref(false);

    // PARENT STATE
    const parentUser = ref(null);
    const isParentAuthenticated = ref(false);

    const ROLES = {
        ADMIN_CONTENIDO: 'admin_contenido',
        ADMIN_FINANCIERO: 'admin_financiero',
        PADRE_FAMILIA: 'padre_familia'
    };

    // Inicializar desde localStorage
    const initAuth = () => {
        // Admin init
        const savedAdmin = localStorage.getItem('auth_admin');
        if (savedAdmin) {
            try {
                const session = JSON.parse(savedAdmin);
                isAdminAuthenticated.value = true;
                adminUser.value = session;
            } catch (e) {
                localStorage.removeItem('auth_admin');
            }
        }

        // Parent init
        const savedParent = localStorage.getItem('auth_parent');
        if (savedParent) {
            try {
                const session = JSON.parse(savedParent);
                isParentAuthenticated.value = true;
                parentUser.value = session;
            } catch (e) {
                localStorage.removeItem('auth_parent');
            }
        }

        // Cargar estado inicial (esto se hace al iniciar la app)
    };

    // Generic Login (NOW ASYNC)
    const login = async (username, password, type = 'admin') => {
        try {
            const response = await apiService.request('auth', 'POST', {
                email: username,
                password: password,
                _type: type
            });

            if (response.status === 'success' && response.user) {
                const userData = response.user;

                if (type === 'admin') {
                    if (userData.role === ROLES.PADRE_FAMILIA) {
                        return { success: false, error: 'Esta cuenta no tiene permisos administrativos.' };
                    }
                    isAdminAuthenticated.value = true;
                    adminUser.value = userData;
                    localStorage.setItem('auth_admin', JSON.stringify(userData));
                } else {
                    if (userData.role !== ROLES.PADRE_FAMILIA) {
                        return { success: false, error: 'Esta cuenta no es de padre de familia.' };
                    }
                    isParentAuthenticated.value = true;
                    parentUser.value = userData;
                    localStorage.setItem('auth_parent', JSON.stringify(userData));
                }

                return { success: true, user: userData };
            }
            return { success: false, error: response.message || 'Credenciales incorrectas' };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    };

    // Google Login REAL con Firebase
    const loginWithGoogle = async (type = 'parent') => {
        try {
            // 1. Abrir ventana emergente REAL de Google (vía Firebase)
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // 2. Enviar datos a tu API en Hostinger para guardar/actualizar en MySQL
            const response = await apiService.request('auth', 'POST', {
                google_id: user.uid,
                email: user.email,
                name: user.displayName,
                photo: user.photoURL,
                _type: type
            });

            if (response.status === 'success' && response.user) {
                const userData = response.user;
                if (type === 'admin') {
                    isAdminAuthenticated.value = true;
                    adminUser.value = userData;
                    localStorage.setItem('auth_admin', JSON.stringify(userData));
                } else {
                    isParentAuthenticated.value = true;
                    parentUser.value = userData;
                    localStorage.setItem('auth_parent', JSON.stringify(userData));
                }
                return { success: true, user: userData };
            }
            return { success: false, error: 'Error al sincronizar con la base de datos' };
        } catch (err) {
            console.error('Firebase Auth Error Completo:', err);
            // Mostrar el mensaje técnico para diagnosticar
            const errorMsg = err.message || 'Error desconocido';
            if (err.code === 'auth/popup-closed-by-user') {
                return { success: false, error: 'Cerraste la ventana de Google' };
            }
            return { success: false, error: `Error de Google: ${errorMsg}` };
        }
    };

    // Registro de Padres
    const register = async (parentData) => {
        try {
            const response = await apiService.request('users', 'POST', {
                ...parentData,
                role: ROLES.PADRE_FAMILIA
            });

            if (response.status === 'success') {
                // Auto login as parent
                return await login(parentData.email, parentData.password, 'parent');
            }
            return { success: false, error: response.message || 'Error en el registro' };
        } catch (err) {
            return { success: false, error: 'No se pudo completar el registro' };
        }
    };

    const logout = (type = 'admin') => {
        if (type === 'admin') {
            isAdminAuthenticated.value = false;
            adminUser.value = null;
            localStorage.removeItem('auth_admin');
        } else {
            isParentAuthenticated.value = false;
            parentUser.value = null;
            localStorage.removeItem('auth_parent');
        }
    };

    // Keep legacy properties for compatibility during migration if needed, 
    // but better to update everywhere
    const isAuthenticated = computed(() => isAdminAuthenticated.value || isParentAuthenticated.value);
    const user = computed(() => adminUser.value || parentUser.value);

    const hasRole = (role, type = 'admin') => {
        const currentUser = type === 'admin' ? adminUser.value : parentUser.value;
        return currentUser?.role === role;
    };

    initAuth();

    return {
        adminUser,
        isAdminAuthenticated,
        parentUser,
        isParentAuthenticated,
        isAuthenticated, // Legacy (or combined)
        user, // Legacy (or combined)
        ROLES,
        login,
        loginWithGoogle,
        register,
        logout,
        hasRole
    };
});
