import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const usePlayersStore = defineStore('players', () => {
    const players = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const initPlayers = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await apiService.request('players');
            if (data && Array.isArray(data)) {
                players.value = data.map(p => ({
                    ...p,
                    fullName: p.fullName || p.name || p.playerName,
                    parentEmail: p.parentEmail || p.email,
                    paymentStatus: p.paymentStatus || p.paymentstatus || 'Pendiente'
                }));
            }
        } catch (err) {
            console.error('Error loading players:', err);
            error.value = 'Error al sincronizar jugadores.';
        } finally {
            isLoading.value = false;
        }
    };

    const addPlayer = async (playerData) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('players', 'POST', playerData);
            if (result.status === 'success') {
                await initPlayers();
                return { success: true };
            }
            return { success: false, message: result.message || 'Error desconocido del servidor' };
        } catch (err) {
            console.error('Error adding player:', err);
            return { success: false, message: err.message };
        } finally {
            isLoading.value = false;
        }
    };

    const updatePlayerStatus = async (id, status) => {
        isLoading.value = true;
        try {
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
            const normalized = (Array.isArray(data) ? data : []).map(p => ({
                ...p,
                fullName: p.fullName || p.name || p.playerName,
                parentEmail: p.parentEmail || p.email,
                paymentStatus: p.paymentStatus || p.paymentstatus || 'Pendiente'
            }));
            players.value = normalized;
            return normalized;
        } catch (err) {
            console.error('Error loading parent players:', err);
            players.value = [];
            return [];
        } finally {
            isLoading.value = false;
        }
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
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updatePlayer = async (id, playerData) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('players', 'PATCH', { id, ...playerData });
            if (result.status === 'success') {
                await initPlayers();
                return { success: true };
            }
            return { success: false, message: result.message || 'Error desconocido del servidor' };
        } catch (err) {
            console.error('Error updating player:', err);
            return { success: false, message: err.message };
        } finally {
            isLoading.value = false;
        }
    };

    const updateParentEmail = async (id, parentEmail) => {
        return await updatePlayer(id, { parentEmail });
    };

    const updatePlayerDni = async (id, dni) => {
        return await updatePlayer(id, { dni });
    };

    const updateSponsorship = async (id, sponsorshipData) => {
        return await updatePlayer(id, sponsorshipData);
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
        updatePlayer,
        updateParentEmail,
        updatePlayerDni,
        updateSponsorship,
        deletePlayer
    };
});
