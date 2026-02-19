import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // ADMIN STATE
    const adminUser = ref(null);
    const isAdminAuthenticated = ref(false);

    // PARENT STATE
    const parentUser = ref(null);
    const isParentAuthenticated = ref(false);

    const parents = ref([]); // Lista de padres registrados dinámicamente

    const ROLES = {
        ADMIN_CONTENIDO: 'admin_contenido',
        ADMIN_FINANCIERO: 'admin_financiero',
        PADRE_FAMILIA: 'padre_familia'
    };

    const CREDENTIALS = [
        { username: 'union', role: ROLES.ADMIN_CONTENIDO, password: 'union3023', name: 'Administración Unión Jeguera' },
        { username: 'roma', role: ROLES.ADMIN_FINANCIERO, password: '302304', name: 'Finanzas Unión Jeguera' },
        { username: 'padre', role: ROLES.PADRE_FAMILIA, password: 'padre123', name: 'Padre Demo', child_id: 1 }
    ];

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

        // Cargar padres registrados
        const savedParents = localStorage.getItem('registered_parents');
        if (savedParents) {
            parents.value = JSON.parse(savedParents);
        }
    };

    // Generic Login
    const login = (username, password, type = 'admin') => {
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
            const { password, ...userData } = foundUser;

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

        // Auto login as parent
        return login(parentData.email, parentData.password, 'parent');
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
        register,
        logout,
        hasRole
    };
});
