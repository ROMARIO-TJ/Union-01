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
                players.value = data;
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
        try {
            const result = await apiService.request('players', 'POST', playerData);
            if (result.status === 'success') {
                await initPlayers();
                return true;
            }
        } catch (err) {
            console.error('Error adding player:', err);
        }
        return false;
    };

    // Actualizar estado del jugador
    const updatePlayerStatus = async (id, status) => {
        try {
            // El backend usa PATCH para estatus en players
            const result = await apiService.request('players', 'PATCH', { id, status });
            if (result.status === 'success') {
                await initPlayers();
                return true;
            }
        } catch (err) {
            console.error('Error updating player status:', err);
        }
        return false;
    };

    // Eliminar registro
    const deletePlayer = async (id) => {
        try {
            const result = await apiService.request('players', 'DELETE', { id });
            if (result.status === 'success') {
                await initPlayers();
                return true;
            }
        } catch (err) {
            console.error('Error deleting player:', err);
        }
        return false;
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('club_players', JSON.stringify(players.value));
    };

    // Inicializar al cargar
    initPlayers();

    return {
        players,
        isLoading,
        error,
        addPlayer,
        updatePlayerStatus,
        deletePlayer
    };
});
