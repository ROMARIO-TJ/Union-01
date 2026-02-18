import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false);
    const user = ref(null);
    const parents = ref([]); // Lista de padres registrados dinámicamente

    // Credenciales por defecto
    const ROLES = {
        ADMIN_CONTENIDO: 'admin_contenido',
        ADMIN_FINANCIERO: 'admin_financiero',
        PADRE_FAMILIA: 'padre_familia'
    };

    const CREDENTIALS = [
        { username: 'admin', role: ROLES.ADMIN_CONTENIDO, password: 'admin123', name: 'Administrador de Contenido' },
        { username: 'financiero', role: ROLES.ADMIN_FINANCIERO, password: 'financiero123', name: 'Administrador Financiero' },
        { username: 'padre', role: ROLES.PADRE_FAMILIA, password: 'padre123', name: 'Padre Demo', child_id: 1 },
        { username: 'padre@prueba.com', role: ROLES.PADRE_FAMILIA, password: '123456', name: 'Usuario Prueba' },
        { username: 'union', role: ROLES.ADMIN_CONTENIDO, password: 'union3023', name: 'Unión Jeguera' }
    ];

    // Inicializar desde localStorage
    const initAuth = () => {
        const savedAuth = localStorage.getItem('auth_user');
        if (savedAuth) {
            try {
                const session = JSON.parse(savedAuth);
                isAuthenticated.value = true;
                user.value = session;
            } catch (e) {
                localStorage.removeItem('auth_user');
            }
        }

        // Cargar padres registrados
        const savedParents = localStorage.getItem('registered_parents');
        if (savedParents) {
            parents.value = JSON.parse(savedParents);
        }
    };

    // Login
    const login = (username, password) => {
        // Primero buscar en los predefinidos
        let foundUser = CREDENTIALS.find(u => u.username === username && u.password === password);

        // Si no está, buscar en los padres registrados (usando email como username)
        if (!foundUser) {
            foundUser = parents.value.find(p => p.email === username && p.password === password);
            if (foundUser) {
                foundUser = { ...foundUser, role: ROLES.PADRE_FAMILIA };
            }
        }

        if (foundUser) {
            isAuthenticated.value = true;
            const { password, ...userData } = foundUser;
            user.value = userData;
            localStorage.setItem('auth_user', JSON.stringify(userData));
            return { success: true, user: userData };
        }
        return { success: false, error: 'Credenciales incorrectas' };
    };

    // Registro de Padres
    const register = (parentData) => {
        const exists = parents.value.some(p => p.email === parentData.email);
        if (exists) return { success: false, error: 'El correo ya está registrado' };

        const newParent = {
            ...parentData,
            role: ROLES.PADRE_FAMILIA,
            id: Date.now()
        };

        parents.value.push(newParent);
        localStorage.setItem('registered_parents', JSON.stringify(parents.value));

        // Auto login
        return login(parentData.email, parentData.password);
    };

    const logout = () => {
        isAuthenticated.value = false;
        user.value = null;
        localStorage.removeItem('auth_user');
    };

    const hasRole = (role) => user.value?.role === role;

    initAuth();

    return {
        isAuthenticated,
        user,
        ROLES,
        login,
        register,
        logout,
        hasRole
    };
});
