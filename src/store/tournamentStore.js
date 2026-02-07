import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const useTournamentStore = defineStore('tournament', () => {
    const standings = ref([]);

    // Data structure example:
    // {
    //   id: 'sub-20',
    //   category: 'Sub-20',
    //   teams: [
    //     { name: 'Unión Jeguera', played: 5, won: 3, drawn: 1, lost: 1, gf: 10, ga: 5, points: 10 },
    //     ...
    //   ]
    // }

    const categories = ['Sub 13', 'Sub 15', 'Sub 17', 'Sub 20', 'Primera C'];

    const isLoading = ref(false);
    const error = ref(null);

    const initStandings = async () => {
        isLoading.value = true;
        error.value = null;

        const saved = localStorage.getItem('union_standings');
        if (saved) {
            standings.value = JSON.parse(saved);
        } else {
            standings.value = categories.map(cat => ({
                id: cat.toLowerCase().replace(/\s+/g, '-'),
                category: cat,
                teams: []
            }));
        }

        try {
            const data = await apiService.request('settings', 'GET', { key: 'tournament_standings' });
            if (data && Array.isArray(data)) {
                standings.value = data;
                saveLocally();
            }
        } catch (err) {
            console.error('Error loading tournament standings:', err);
        } finally {
            isLoading.value = false;
        }
    };

    const saveToServer = async () => {
        try {
            await apiService.request('settings', 'POST', {
                key: 'tournament_standings',
                value: standings.value
            });
        } catch (err) {
            console.error('Error saving standings to server:', err);
        }
    };

    const saveLocally = () => {
        localStorage.setItem('union_standings', JSON.stringify(standings.value));
    };

    const getStandingsByCategory = (categoryName) => {
        return standings.value.find(s => s.category === categoryName) || null;
    };

    const updateStandings = async (categoryId, teamsData) => {
        isLoading.value = true;

        // Calcular nuevo estado
        const newStandings = JSON.parse(JSON.stringify(standings.value));
        const index = newStandings.findIndex(s => s.id === categoryId);

        if (index !== -1) {
            newStandings[index].teams = teamsData;
            // Auto sort
            newStandings[index].teams.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                const diffA = a.gf - a.ga;
                const diffB = b.gf - b.ga;
                return diffB - diffA;
            });

            try {
                await apiService.request('settings', 'POST', {
                    key: 'tournament_standings',
                    value: newStandings
                });
                await initStandings();
                return true;
            } catch (err) {
                console.error('Error saving standings:', err);
            } finally {
                isLoading.value = false;
            }
        }
        isLoading.value = false;
        return false;
    };

    initStandings();

    return {
        standings,
        categories,
        isLoading,
        error,
        initStandings,
        getStandingsByCategory,
        updateStandings
    };
});
