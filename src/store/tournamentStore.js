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

        // Estructura de datos por defecto (por si el servidor no tiene nada aún)
        const defaultStandings = categories.map(cat => {
            const id = cat.toLowerCase().replace(/\s+/g, '-');
            let teams = [];

            // Cargar datos iniciales para Sub 15
            if (cat === 'Sub 15') {
                teams = [
                    { name: 'CLUB ATLETICO LA GLORIA', played: 1, won: 1, drawn: 0, lost: 0, gf: 5, ga: 1, points: 3 },
                    { name: 'ATLETAS DEL MAÑANA', played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 0, points: 3 },
                    { name: 'UNION JAGUERA', played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 0, points: 3 },
                    { name: 'LOS EMBAJADORES DE EL BANCO', played: 1, won: 1, drawn: 0, lost: 0, gf: 5, ga: 1, points: 3 },
                    { name: 'INTER JUNIOR', played: 1, won: 1, drawn: 0, lost: 0, gf: 2, ga: 0, points: 3 },
                    { name: 'MANCHESTER VALLEDUPAR', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
                    { name: 'ACADEMIA VALLENATA', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 5, points: 0 },
                    { name: 'ALIANZA FC "B"', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 2, points: 0 },
                    { name: 'FUTURAS ESTRELLAS', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 3, points: 0 },
                    { name: 'ATLETICO CESAR FC', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 3, points: 0 },
                    { name: '"B"ACAD VALLEDUPAR FC', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 5, points: 0 }
                ].sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
            }

            return { id, category: cat, teams };
        });

        // PRIMERO: Intentar cargar siempre desde el servidor
        // El servidor es la fuente de verdad para que el hosting funcione
        // para todos los visitantes
        try {
            const response = await apiService.request('settings', 'GET', { key: 'tournament_standings' });
            const data = response?.data;

            if (data && Array.isArray(data)) {
                // ✅ El servidor tiene datos — usarlos como fuente principal
                standings.value = data;
                saveLocally();
            } else {
                // El servidor no tiene datos aún — usar localStorage o defaults
                const saved = localStorage.getItem('union_standings');
                if (saved) {
                    standings.value = JSON.parse(saved);
                } else {
                    standings.value = defaultStandings;
                }
            }
        } catch (err) {
            console.error('Error loading tournament standings from server:', err);
            // FALLBACK: si el servidor falla, usar localStorage como respaldo de emergencia
            const saved = localStorage.getItem('union_standings');
            if (saved) {
                standings.value = JSON.parse(saved);
            } else {
                standings.value = defaultStandings;
            }
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
    const recalculateAllStandings = async (matches) => {
        const newStandings = JSON.parse(JSON.stringify(standings.value));

        const normalize = (cat) => cat?.trim().toLowerCase().replace(/\s+/g, ' ').replace('sub-', 'sub ').replace(/sub(\d+)/, 'sub $1');

        newStandings.forEach(categoryStandings => {
            const catMatches = matches.filter(m =>
                m.status === 'finished' &&
                normalize(m.category) === normalize(categoryStandings.category)
            );

            // ✅ CORRECCIÓN: Reconstruir equipos completamente desde los partidos
            // En lugar de intentar hacer match con nombres pre-registrados que pueden
            // ser diferentes (ej: 'C.A LA GLORIA' vs 'CLUB ATLETICO LA GLORIA'),
            // vaciamos la lista y la reconstruimos desde cero con los nombres exactos
            // que están en los partidos.
            categoryStandings.teams = [];

            catMatches.forEach(m => {
                const homeScore = parseInt(m.homeScore);
                const awayScore = parseInt(m.awayScore);
                if (isNaN(homeScore) || isNaN(awayScore)) return;

                const isHomeDescansa = m.homeTeam?.toUpperCase().includes('DESCANSA');
                const isAwayDescansa = m.awayTeam?.toUpperCase().includes('DESCANSA');

                if (isHomeDescansa || isAwayDescansa) return;

                const updateTeam = (teamName, goalsFor, goalsAgainst) => {
                    let team = categoryStandings.teams.find(t => t.name.toUpperCase() === teamName.toUpperCase());
                    if (!team) {
                        team = { name: teamName, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
                        categoryStandings.teams.push(team);
                    }
                    team.played += 1;
                    team.gf += goalsFor;
                    team.ga += goalsAgainst;
                    if (goalsFor > goalsAgainst) {
                        team.won += 1;
                        team.points += 3;
                    } else if (goalsFor === goalsAgainst) {
                        team.drawn += 1;
                        team.points += 1;
                    } else {
                        team.lost += 1;
                    }
                };

                updateTeam(m.homeTeam, homeScore, awayScore);
                updateTeam(m.awayTeam, awayScore, homeScore);
            });

            categoryStandings.teams.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                const diffA = a.gf - a.ga;
                const diffB = b.gf - b.ga;
                if (diffB !== diffA) return diffB - diffA;
                return b.gf - a.gf;
            });
        });

        standings.value = newStandings;
        saveLocally();
        await saveToServer();
    };

    initStandings();

    return {
        standings,
        categories,
        isLoading,
        error,
        initStandings,
        getStandingsByCategory,
        updateStandings,
        recalculateAllStandings
    };
});
