import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const usePlayersStore = defineStore('players', () => {
    const players = ref([]);

    const isLoading = ref(false);
    const error = ref(null);

    // Inicializar sincronizando con el servidor
    const initPlayers = async () => {
        isLoading.value = true;
        error.value = null;

        // Respaldo local
        const savedPlayers = localStorage.getItem('club_players');
        if (savedPlayers) {
            players.value = JSON.parse(savedPlayers);
        }

        try {
            const data = await apiService.request('players');
            if (data && Array.isArray(data)) {
                // Normalización de campos para evitar problemas de mayúsculas/minúsculas del servidor
                players.value = data.map(p => ({
                    ...p,
                    paymentStatus: p.paymentStatus || p.paymentstatus || 'Pendiente'
                }));
                saveToLocalStorage();
            }
        } catch (err) {
            console.error('Error loading players:', err);
            error.value = 'Error al sincronizar jugadores.';
        } finally {
            isLoading.value = false;
        }
    };

    // Agregar nuevo registro de jugador
    const addPlayer = async (playerData) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('players', 'POST', playerData);
            if (result.status === 'success') {
                await initPlayers();
                return true;
            }
        } catch (err) {
            console.error('Error adding player:', err);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    // Actualizar estado del jugador
    const updatePlayerStatus = async (id, status) => {
        isLoading.value = true;
        try {
            // El backend usa PATCH para estatus en players
            const result = await apiService.request('players', 'PATCH', { id, status });
            if (result.status === 'success') {
                await initPlayers();
                return true;
            }
        } catch (err) {
            console.error('Error updating player status:', err);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    // Eliminar registro
    const deletePlayer = async (id) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('players', 'DELETE', { id });
            if (result.status === 'success') {
                await initPlayers();
                return true;
            }
        } catch (err) {
            console.error('Error deleting player:', err);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const fetchPlayersByParent = async (email) => {
        isLoading.value = true;
        try {
            const data = await apiService.request('players', 'GET', { parentEmail: email });
            if (data && Array.isArray(data)) {
                return data.map(p => ({
                    ...p,
                    paymentStatus: p.paymentStatus || p.paymentstatus || 'Pendiente'
                }));
            }
        } catch (err) {
            console.error('Error loading parent players:', err);
        } finally {
            isLoading.value = false;
        }
        return [];
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('club_players', JSON.stringify(players.value));
    };

    const updatePaymentStatus = async (id, paymentStatus) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('players', 'PATCH', { id, paymentStatus: paymentStatus });
            if (result.status === 'success') {
                await initPlayers();
                return true;
            } else {
                throw new Error(result.message || 'Error desconocido del servidor');
            }
        } catch (err) {
            console.error('Error updating payment status:', err);
            throw err; // Re-lanzar para que el componente lo atrape
        } finally {
            isLoading.value = false;
        }
    };

    const updateParentEmail = async (id, parentEmail) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('players', 'PATCH', { id, parentEmail });
            if (result.status === 'success') {
                await initPlayers();
                return true;
            } else {
                throw new Error(result.message || 'Error al actualizar el correo');
            }
        } catch (err) {
            console.error('Error updating parent email:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // Inicializar al cargar
    initPlayers();

    return {
        players,
        isLoading,
        error,
        initPlayers,
        addPlayer,
        fetchPlayersByParent,
        updatePlayerStatus,
        updatePaymentStatus,
        updateParentEmail,
        deletePlayer
    };
});
