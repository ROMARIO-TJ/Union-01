import { defineStore } from 'pinia';
import { ref } from 'vue';

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

    const initStandings = () => {
        const saved = localStorage.getItem('union_standings');
        if (saved) {
            standings.value = JSON.parse(saved);
        } else {
            // Initialize with empty tables for known categories
            standings.value = categories.map(cat => ({
                id: cat.toLowerCase().replace(/\s+/g, '-'),
                category: cat,
                teams: []
            }));
            save();
        }
    };

    const save = () => {
        localStorage.setItem('union_standings', JSON.stringify(standings.value));
    };

    const getStandingsByCategory = (categoryName) => {
        return standings.value.find(s => s.category === categoryName) || null;
    };

    const updateStandings = (categoryId, teamsData) => {
        const index = standings.value.findIndex(s => s.id === categoryId);
        if (index !== -1) {
            standings.value[index].teams = teamsData;
            // Auto sort by points (desc) then goal diff (desc)
            standings.value[index].teams.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                const diffA = a.gf - a.ga;
                const diffB = b.gf - b.ga;
                return diffB - diffA;
            });
            save();
            return true;
        }
        return false;
    };

    initStandings();

    return {
        standings,
        categories,
        getStandingsByCategory,
        updateStandings
    };
});
