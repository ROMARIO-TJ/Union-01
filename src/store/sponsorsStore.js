import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const useSponsorsStore = defineStore('sponsors', () => {
    const sponsors = ref([]);

    // Datos iniciales
    const initialSponsors = [
        { id: 1, name: 'Sponsor 1', icon: 'fa-solid fa-building' },
        { id: 2, name: 'Sponsor 2', icon: 'fa-solid fa-store' },
        { id: 3, name: 'Sponsor 3', icon: 'fa-solid fa-shop' },
        { id: 4, name: 'Sponsor 4', icon: 'fa-solid fa-industry' },
        { id: 5, name: 'Sponsor 5', icon: 'fa-solid fa-briefcase' },
        { id: 6, name: 'Sponsor 6', icon: 'fa-solid fa-handshake' }
    ];

    const isLoading = ref(false);
    const error = ref(null);

    // Inicializar sincronizando con el servidor
    const initSponsors = async () => {
        isLoading.value = true;
        error.value = null;

        // Respaldo local
        const savedSponsors = localStorage.getItem('union_sponsors');
        if (savedSponsors) {
            sponsors.value = JSON.parse(savedSponsors);
        } else {
            sponsors.value = initialSponsors;
        }

        try {
            const data = await apiService.request('sponsors');
            if (data && Array.isArray(data)) {
                sponsors.value = data.map(item => ({
                    ...item,
                    image: item.logo || item.image || ''
                }));
                saveToLocalStorage();
            }
        } catch (err) {
            console.error('Error loading sponsors:', err);
            error.value = 'Error al sincronizar patrocinadores.';
        } finally {
            isLoading.value = false;
        }
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('union_sponsors', JSON.stringify(sponsors.value));
    };

    // CRUD Operations
    const addSponsor = async (sponsor) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('sponsors', 'POST', sponsor);
            if (result.status === 'success') {
                await initSponsors();
                return true;
            }
        } catch (err) {
            console.error('Error adding sponsor:', err);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const updateSponsor = async (id, updatedSponsor) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('sponsors', 'PUT', { ...updatedSponsor, id });
            if (result.status === 'success') {
                await initSponsors();
                return true;
            }
        } catch (err) {
            console.error('Error updating sponsor:', err);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const deleteSponsor = async (id) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('sponsors', 'DELETE', { id });
            if (result.status === 'success') {
                await initSponsors();
                return true;
            }
        } catch (err) {
            console.error('Error deleting sponsor:', err);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const getSponsorById = (id) => {
        return sponsors.value.find(s => s.id === parseInt(id));
    };

    // Inicializar al cargar
    initSponsors();

    return {
        sponsors,
        isLoading,
        error,
        addSponsor,
        updateSponsor,
        deleteSponsor,
        getSponsorById
    };
});
