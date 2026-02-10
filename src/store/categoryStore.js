import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';
import escuelaImg from '../assets/img/teams/escuela.png';

export const useCategoryStore = defineStore('categories', () => {

    const categories = ref([]);
    const benefits = ref([]);
    const isLoading = ref(false);

    /* ================================
       DATOS DE RESPALDO (LOCAL)
    ================================= */
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
        {
            id: 1,
            title: '',
            description: 'Desarrollo técnico, táctico y humano',
            icon: 'fa-solid fa-trophy'
        },
        {
            id: 2,
            title: 'Entrenadores Certificados',
            description: 'Profesionales con experiencia comprobada',
            icon: 'fa-solid fa-users'
        },
        {
            id: 3,
            title: 'Instalaciones de Calidad',
            description: 'Canchas y equipamiento adecuado',
            icon: 'fa-solid fa-futbol'
        },
        {
            id: 4,
            title: 'Ambiente Familiar',
            description: 'Valores de respeto y compañerismo',
            icon: 'fa-solid fa-heart'
        }
    ];

    /* ================================
       INICIALIZACIÓN HÍBRIDA
    ================================= */
    const initCategories = async () => {
        isLoading.value = true;

        // 1️⃣ Cargar respaldo local (rápido)
        const localCats = localStorage.getItem('union_categories_v2');
        const localBenefits = localStorage.getItem('union_benefits_v1');

        categories.value = localCats
            ? JSON.parse(localCats)
            : initialCategories;

        benefits.value = localBenefits
            ? JSON.parse(localBenefits)
            : initialBenefits;

        try {
            // 2️⃣ Sincronizar con backend
            const [catsData, benefitsData] = await Promise.all([
                apiService.request('categories').catch(() => null),
                apiService.request('benefits').catch(() => null)
            ]);

            // ✅ CATEGORIES (acepta arrays vacíos)
            if (Array.isArray(catsData)) {
                categories.value = catsData;
                localStorage.setItem(
                    'union_categories_v2',
                    JSON.stringify(catsData)
                );
            }

            // ✅ BENEFITS (FIX CLAVE)
            if (Array.isArray(benefitsData)) {
                benefits.value = benefitsData;
                localStorage.setItem(
                    'union_benefits_v1',
                    JSON.stringify(benefitsData)
                );
            }

        } catch (error) {
            console.warn(
                'Backend no disponible. Usando datos locales.',
                error
            );
        } finally {
            isLoading.value = false;
        }
    };

    /* ================================
       CATEGORIES CRUD
    ================================= */
    const addCategory = async (category) => {
        isLoading.value = true;
        try {
            const res = await apiService.request(
                'categories',
                'POST',
                category
            );
            if (res?.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (e) {
            console.error('Error adding category:', e);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const updateCategory = async (id, updated) => {
        isLoading.value = true;
        try {
            const res = await apiService.request(
                'categories',
                'PUT',
                { ...updated, id }
            );
            if (res?.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (e) {
            console.error('Error updating category:', e);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const deleteCategory = async (id) => {
        isLoading.value = true;
        try {
            const res = await apiService.request(
                'categories',
                'DELETE',
                { id }
            );
            if (res?.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (e) {
            console.error('Error deleting category:', e);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    /* ================================
       BENEFITS CRUD
    ================================= */
    const addBenefit = async (benefit) => {
        isLoading.value = true;
        try {
            const res = await apiService.request(
                'benefits',
                'POST',
                benefit
            );
            if (res?.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (e) {
            console.error('Error adding benefit:', e);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const updateBenefit = async (id, updated) => {
        isLoading.value = true;
        try {
            const res = await apiService.request(
                'benefits',
                'PUT',
                { ...updated, id }
            );
            if (res?.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (e) {
            console.error('Error updating benefit:', e);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const deleteBenefit = async (id) => {
        isLoading.value = true;
        try {
            const res = await apiService.request(
                'benefits',
                'DELETE',
                { id }
            );
            if (res?.status === 'success') {
                await initCategories();
                return true;
            }
        } catch (e) {
            console.error('Error deleting benefit:', e);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    // 🚀 Auto-init
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
