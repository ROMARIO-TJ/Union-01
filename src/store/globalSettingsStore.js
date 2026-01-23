import { defineStore } from 'pinia';
import { ref } from 'vue';

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

    // Inicializar desde localStorage o usar valores por defecto
    const initSettings = () => {
        const savedSettings = localStorage.getItem('union_global_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                // Merge saved settings with default structure
                Object.keys(modules.value).forEach(key => {
                    if (parsed[key] !== undefined) {
                        modules.value[key].enabled = parsed[key].enabled;
                    }
                });
            } catch (error) {
                console.error('Error loading global settings:', error);
                saveToLocalStorage();
            }
        } else {
            saveToLocalStorage();
        }
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('union_global_settings', JSON.stringify(modules.value));
    };

    // Alternar módulo
    const toggleModule = (moduleKey) => {
        if (modules.value[moduleKey] && !modules.value[moduleKey].alwaysActive) {
            modules.value[moduleKey].enabled = !modules.value[moduleKey].enabled;
            saveToLocalStorage();
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
        // Rutas siempre accesibles
        const alwaysAccessible = ['/', '/club', '/contacto', '/admin'];

        // Verificar si la ruta es siempre accesible
        if (alwaysAccessible.some(path => routePath.startsWith(path))) {
            return true;
        }

        // Verificar cada módulo
        for (const [key, module] of Object.entries(modules.value)) {
            if (module.routes && module.routes.length > 0) {
                // Si la ruta pertenece a este módulo
                if (module.routes.some(route => routePath.startsWith(route))) {
                    return module.enabled;
                }
            }
        }

        // Si no pertenece a ningún módulo específico, permitir acceso
        return true;
    };

    // Restaurar valores por defecto
    const resetToDefaults = () => {
        Object.keys(modules.value).forEach(key => {
            if (!modules.value[key].alwaysActive) {
                modules.value[key].enabled = true;
            }
        });
        saveToLocalStorage();
    };

    // Inicializar al cargar
    initSettings();

    return {
        modules,
        toggleModule,
        isModuleEnabled,
        canAccessRoute,
        resetToDefaults
    };
});
