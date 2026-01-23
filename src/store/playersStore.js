import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePlayersStore = defineStore('players', () => {
    const players = ref([]);

    // Inicializar desde localStorage
    const initPlayers = () => {
        const savedPlayers = localStorage.getItem('club_players');
        if (savedPlayers) {
            players.value = JSON.parse(savedPlayers);
        }
    };

    // Agregar nuevo registro de jugador
    const addPlayer = (playerData) => {
        const newPlayer = {
            id: Date.now(),
            registrationDate: new Date().toLocaleDateString(),
            status: 'Pendiente', // Pendiente, Aceptado, Rechazado
            ...playerData
        };
        players.value.push(newPlayer);
        saveToLocalStorage();
        return newPlayer;
    };

    // Actualizar estado del jugador
    const updatePlayerStatus = (id, status) => {
        const index = players.value.findIndex(p => p.id === id);
        if (index !== -1) {
            players.value[index].status = status;
            saveToLocalStorage();
        }
    };

    // Eliminar registro
    const deletePlayer = (id) => {
        players.value = players.value.filter(p => p.id !== id);
        saveToLocalStorage();
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('club_players', JSON.stringify(players.value));
    };

    // Inicializar al cargar
    initPlayers();

    return {
        players,
        addPlayer,
        updatePlayerStatus,
        deletePlayer
    };
});
