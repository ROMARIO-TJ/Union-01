import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const useGlobalSettingsStore = defineStore('globalSettings', () => {
    const modules = ref({
        news: {
            enabled: true,
            label: 'Noticias',
            icon: 'fa-solid fa-newspaper',
            description: 'Controla el módulo completo de noticias',
            affects: ['Menú de navegación', 'Página /noticias', 'Sección en Home'],
            routes: ['/noticias'],
            alwaysActive: false
        },
        categories: {
            enabled: true,
            label: 'Categorías',
            icon: 'fa-solid fa-users',
            description: 'Controla el módulo completo de categorías',
            affects: ['Menú de navegación', 'Página /categoria', 'Preview en Home'],
            routes: ['/categoria', '/inscripcion'],
            alwaysActive: false
        },
        gallery: {
            enabled: true,
            label: 'Galería',
            icon: 'fa-solid fa-images',
            description: 'Controla el módulo completo de galería',
            affects: ['Menú de navegación', 'Página /galeria'],
            routes: ['/galeria'],
            alwaysActive: false
        },
        matches: {
            enabled: true,
            label: 'Partidos',
            icon: 'fa-solid fa-futbol',
            description: 'Controla todo lo relacionado con partidos',
            affects: ['Hero Slide', 'Sección Match Center', 'Página /partidos'],
            routes: ['/partidos'],
            alwaysActive: false
        },
        sponsors: {
            enabled: true,
            label: 'Patrocinadores',
            icon: 'fa-solid fa-handshake',
            description: 'Controla el carrusel de patrocinadores en todas las páginas',
            affects: ['Carrusel en todas las páginas del sitio'],
            routes: [],
            alwaysActive: false
        }
    });

    const isLoading = ref(false);
    const error = ref(null);

    // Inicializar sincronizando con el servidor
    const initSettings = async () => {
        isLoading.value = true;
        error.value = null;

        // Carga rápida del respaldo local
        const savedSettings = localStorage.getItem('union_global_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                Object.keys(modules.value).forEach(key => {
                    if (parsed[key] !== undefined) {
                        modules.value[key].enabled = parsed[key].enabled;
                    }
                });
            } catch (e) {
                console.error('Local parse error');
            }
        }

        try {
            const data = await apiService.request('settings', 'GET', { key: 'global_settings' });
            if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                // El backend devuelve el objeto completo
                Object.keys(modules.value).forEach(key => {
                    if (data[key] !== undefined) {
                        modules.value[key].enabled = data[key].enabled;
                    }
                });
                saveToLocalStorage();
            }
        } catch (err) {
            console.error('Error loading global settings from server:', err);
        } finally {
            isLoading.value = false;
        }
    };

    // Guardar en servidor y local
    const saveSettingsToServer = async () => {
        try {
            await apiService.request('settings', 'POST', {
                key: 'global_settings',
                value: modules.value
            });
        } catch (err) {
            console.error('Error saving global settings to server:', err);
        }
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('union_global_settings', JSON.stringify(modules.value));
    };

    // Alternar módulo
    const toggleModule = async (moduleKey) => {
        if (modules.value[moduleKey] && !modules.value[moduleKey].alwaysActive) {
            modules.value[moduleKey].enabled = !modules.value[moduleKey].enabled;
            saveToLocalStorage();
            await saveSettingsToServer();
            return modules.value[moduleKey].enabled;
        }
        return false;
    };

    // Verificar si un módulo está habilitado
    const isModuleEnabled = (moduleKey) => {
        return modules.value[moduleKey]?.enabled ?? true;
    };

    // Verificar si se puede acceder a una ruta
    const canAccessRoute = (routePath) => {
        const alwaysAccessible = ['/', '/club', '/contacto', '/admin'];
        if (alwaysAccessible.some(path => routePath.startsWith(path))) {
            return true;
        }

        for (const [key, module] of Object.entries(modules.value)) {
            if (module.routes && module.routes.length > 0) {
                if (module.routes.some(route => routePath.startsWith(route))) {
                    return module.enabled;
                }
            }
        }
        return true;
    };

    // Restaurar valores por defecto
    const resetToDefaults = async () => {
        Object.keys(modules.value).forEach(key => {
            if (!modules.value[key].alwaysActive) {
                modules.value[key].enabled = true;
            }
        });
        saveToLocalStorage();
        await saveSettingsToServer();
    };

    // Inicializar al cargar
    initSettings();

    return {
        modules,
        isLoading,
        error,
        toggleModule,
        isModuleEnabled,
        canAccessRoute,
        resetToDefaults
    };
});
