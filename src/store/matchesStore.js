import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const useMatchesStore = defineStore('matches', () => {
    const matches = ref([]);

    // Datos iniciales
    const initialMatches = [
        {
            id: 1,
            category: 'Primera División',
            homeTeam: 'Unión Jeguera',
            awayTeam: 'Dep. Rival',
            date: '15 Ago',
            time: '16:00',
            stadium: 'Estadio Municipal',
            homeScore: null,
            awayScore: null,
            status: 'scheduled' // scheduled, finished
        },
        {
            id: 2,
            category: 'Sub-20',
            homeTeam: 'Unión Jeguera',
            awayTeam: 'Atlético Futuro',
            date: '16 Ago',
            time: '14:00',
            stadium: 'Cancha Auxiliar',
            homeScore: null,
            awayScore: null,
            status: 'scheduled'
        },
        {
            id: 3,
            category: 'Femenino',
            homeTeam: 'Unión Jeguera',
            awayTeam: 'Real F.C.',
            date: '17 Ago',
            time: '18:30',
            stadium: 'Estadio Municipal',
            homeScore: null,
            awayScore: null,
            status: 'scheduled'
        }
    ];

    const isLoading = ref(false);
    const error = ref(null);

    // Inicializar sincronizando con el servidor
    const initMatches = async () => {
        isLoading.value = true;
        error.value = null;

        // Respaldo local inmediato
        const savedMatches = localStorage.getItem('union_matches');
        if (savedMatches) {
            matches.value = JSON.parse(savedMatches);
        } else {
            matches.value = initialMatches;
        }

        try {
            const data = await apiService.request('matches');
            if (data && Array.isArray(data)) {
                matches.value = data;
                saveToLocalStorage();
            }
        } catch (err) {
            console.error('Error loading matches:', err);
            error.value = 'Error al sincronizar partidos.';
        } finally {
            isLoading.value = false;
        }
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('union_matches', JSON.stringify(matches.value));
    };

    // CRUD Operations
    const addMatch = async (match) => {
        try {
            const result = await apiService.request('matches', 'POST', match);
            if (result.status === 'success') {
                await initMatches();
                return true;
            }
        } catch (err) {
            console.error('Error adding match:', err);
        }
        return false;
    };

    const updateMatch = async (id, updatedMatch) => {
        try {
            const result = await apiService.request('matches', 'PUT', { ...updatedMatch, id });
            if (result.status === 'success') {
                await initMatches();
                return true;
            }
        } catch (err) {
            console.error('Error updating match:', err);
        }
        return false;
    };

    const deleteMatch = async (id) => {
        try {
            const result = await apiService.request('matches', 'DELETE', { id });
            if (result.status === 'success') {
                await initMatches();
                return true;
            }
        } catch (err) {
            console.error('Error deleting match:', err);
        }
        return false;
    };

    const getMatchById = (id) => {
        return matches.value.find(m => m.id === parseInt(id));
    };

    const getUpcomingMatches = () => {
        return matches.value
            .filter(m => m.status === 'scheduled')
            .sort((a, b) => {
                const dateA = parseDate(a.date, a.time);
                const dateB = parseDate(b.date, b.time);
                return dateA - dateB;
            });
    };

    // Helper para parsear fechas "15 Ago" a objetos Date
    const parseDate = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return new Date(8640000000000000);

        const months = {
            'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
        };

        const parts = dateStr.trim().split(' ');
        if (parts.length < 2) return new Date(8640000000000000);

        const day = parseInt(parts[0]);
        const monthAbbr = parts[1].toLowerCase().replace('.', '').substring(0, 3);
        const [hours, minutes] = timeStr.split(':');

        if (months[monthAbbr] === undefined) return new Date(8640000000000000);

        const date = new Date();
        date.setMonth(months[monthAbbr]);
        date.setDate(day);
        date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);

        const now = new Date();
        if (date < now && (now.getMonth() > date.getMonth())) {
            date.setFullYear(now.getFullYear() + 1);
        }
        return date;
    };

    const getFinishedMatches = () => {
        return matches.value.filter(m => m.status === 'finished');
    };

    // Inicializar al cargar
    initMatches();

    return {
        matches,
        isLoading,
        error,
        addMatch,
        updateMatch,
        deleteMatch,
        getMatchById,
        getUpcomingMatches,
        getFinishedMatches
    };
});
