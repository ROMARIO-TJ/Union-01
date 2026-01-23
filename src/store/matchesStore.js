import { defineStore } from 'pinia';
import { ref } from 'vue';

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

    // Inicializar desde localStorage o usar datos iniciales
    const initMatches = () => {
        const savedMatches = localStorage.getItem('union_matches');
        if (savedMatches) {
            matches.value = JSON.parse(savedMatches);
        } else {
            matches.value = initialMatches;
            saveToLocalStorage();
        }
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('union_matches', JSON.stringify(matches.value));
    };

    // CRUD Operations
    const addMatch = (match) => {
        const newId = matches.value.length > 0 ? Math.max(...matches.value.map(m => m.id)) + 1 : 1;
        const newMatch = {
            ...match,
            id: newId,
            homeScore: match.homeScore || null,
            awayScore: match.awayScore || null,
            status: match.status || 'scheduled'
        };
        matches.value.push(newMatch);
        saveToLocalStorage();
        return newMatch;
    };

    const updateMatch = (id, updatedMatch) => {
        const index = matches.value.findIndex(m => m.id === id);
        if (index !== -1) {
            matches.value[index] = { ...matches.value[index], ...updatedMatch };
            saveToLocalStorage();
            return true;
        }
        return false;
    };

    const deleteMatch = (id) => {
        const index = matches.value.findIndex(m => m.id === id);
        if (index !== -1) {
            matches.value.splice(index, 1);
            saveToLocalStorage();
            return true;
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
        if (!dateStr || !timeStr) return new Date(8640000000000000); // Max valid date if missing

        const months = {
            'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
        };

        // Normalize input: lowercase and remove accents usually not needed for these abbrs but good practice
        const parts = dateStr.trim().split(' ');
        if (parts.length < 2) {
            console.warn('Invalid date format:', dateStr);
            return new Date(8640000000000000);
        }

        const day = parseInt(parts[0]);
        // Clean month str: remove dots, lowercase (e.g. "Ago." -> "ago")
        const monthAbbr = parts[1].toLowerCase().replace('.', '').substring(0, 3);

        const [hours, minutes] = timeStr.split(':');

        if (months[monthAbbr] === undefined) {
            console.warn('Unknown month:', monthAbbr, 'in', dateStr);
            return new Date(8640000000000000);
        }

        const date = new Date();
        date.setMonth(months[monthAbbr]);
        date.setDate(day);
        date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);

        // Si la fecha ya pasó este año, asumir que es del año siguiente
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
        addMatch,
        updateMatch,
        deleteMatch,
        getMatchById,
        getUpcomingMatches,
        getFinishedMatches
    };
});
