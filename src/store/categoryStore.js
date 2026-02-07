import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';
import escuelaImg from '../assets/img/teams/escuela.png';

export const useCategoryStore = defineStore('categories', () => {
    const categories = ref([]);
    const benefits = ref([]);
    const isLoading = ref(false);

    const initialCategories = [
        {
            id: 1,
            name: 'Escuela de Formación',
            age: '6 a 12 años',
            schedule: 'Lunes, Miércoles y Viernes',
            time: '16:00 - 17:30',
            coach: 'Prof. Juan Martínez',
            icon: 'fa-solid fa-child-reaching',
            teamImage: escuelaImg
        },
        {
            id: 2,
            name: 'Sub-13',
            age: '11 a 13 años',
            schedule: 'Martes y Jueves',
            time: '17:00 - 18:30',
            coach: 'Prof. Carlos Gómez',
            icon: 'fa-solid fa-person-running',
            teamImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 3,
            name: 'Sub-15',
            age: '13 a 15 años',
            schedule: 'Lunes, Miércoles y Viernes',
            time: '18:00 - 19:30',
            coach: 'Prof. Miguel Rodríguez',
            icon: 'fa-solid fa-person-kicking',
            teamImage: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=600&auto=format&fit=crop'
        }
    ];

    const initialBenefits = [
        { id: 1, title: 'Formación Integral', description: 'Desarrollo técnico, táctico y humano', icon: 'fa-solid fa-trophy' },
        { id: 2, title: 'Entrenadores Certificados', description: 'Profesionales con experiencia comprobada', icon: 'fa-solid fa-users' },
        { id: 3, title: 'Instalaciones de Calidad', description: 'Canchas y equipamiento adecuado', icon: 'fa-solid fa-futbol' },
        { id: 4, title: 'Ambiente Familiar', description: 'Valores de respeto y compañerismo', icon: 'fa-solid fa-heart' }
    ];

    // Inicializar con recuperación de datos híbrida
    const initCategories = async () => {
        isLoading.value = true;

        // 1. Cargar datos locales como respaldo inmediato para evitar "pantalla en blanco"
        const localCats = localStorage.getItem('union_categories_v2');
        const localBenefits = localStorage.getItem('union_benefits_v1');

        if (localCats) categories.value = JSON.parse(localCats);
        else categories.value = initialCategories;

        if (localBenefits) benefits.value = JSON.parse(localBenefits);
        else benefits.value = initialBenefits;

        try {
            // 2. Intentar sincronizar con el backend de Hostinger
            const [catsData, benefitsData] = await Promise.all([
                apiService.request('categories').catch(() => null),
                apiService.request('benefits').catch(() => null)
            ]);

            // Si el servidor responde con datos (no vacío), actualizamos
            if (catsData && catsData.length > 0) {
                categories.value = catsData;
                localStorage.setItem('union_categories_v2', JSON.stringify(catsData));
            }
            if (benefitsData && benefitsData.length > 0) {
                benefits.value = benefitsData;
                localStorage.setItem('union_benefits_v1', JSON.stringify(benefitsData));
            }

        } catch (error) {
            console.warn('Conexión con Hostinger fallida. Usando datos guardados localmente.');
        } finally {
            isLoading.value = false;
        }
    };

    // --- CATEGORIES ---
    const addCategory = async (category) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('categories', 'POST', category);
            if (result.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (error) {
            console.error('Error adding category:', error);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const updateCategory = async (id, updated) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('categories', 'PUT', { ...updated, id });
            if (result.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (error) {
            console.error('Error updating category:', error);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const deleteCategory = async (id) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('categories', 'DELETE', { id });
            if (result.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    // --- BENEFITS ---
    const addBenefit = async (benefit) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('benefits', 'POST', benefit);
            if (result.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (error) {
            console.error('Error adding benefit:', error);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const updateBenefit = async (id, updated) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('benefits', 'PUT', { ...updated, id });
            if (result.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (error) {
            console.error('Error updating benefit:', error);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const deleteBenefit = async (id) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('benefits', 'DELETE', { id });
            if (result.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (error) {
            console.error('Error deleting benefit:', error);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    initCategories();

    return {
        categories,
        benefits,
        isLoading,
        initCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        addBenefit,
        updateBenefit,
        deleteBenefit
    };
});
