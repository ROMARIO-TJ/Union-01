<template>
    <div class="partidos-page">
        <!-- HERO SECTION -->
        <PageHero pageKey="partidos" :defaultImage="clubHeroImg" />

        <!-- FILTER TABS -->
        <section class="filters-section">
            <div class="container">
                <div class="filter-header">
                    <h3 class="filter-title">Selecciona una Categoría para ver <span class="text-accent">Tablas y
                            Partidos</span></h3>
                </div>
                <div class="category-tabs">
                    <button class="tab-btn" :class="{ active: selectedCategory === 'Todos' }"
                        @click="selectedCategory = 'Todos'">
                        Todos
                    </button>
                    <button v-for="cat in tournamentStore.categories" :key="cat" class="tab-btn"
                        :class="{ active: selectedCategory === cat }" @click="selectedCategory = cat">
                        {{ cat }}
                    </button>
                </div>
            </div>
        </section>

        <!-- STANDINGS SECTION (Visible if category selected) -->
        <div v-if="selectedCategory !== 'Todos'" class="standings-section">
            <div class="container">
                <h2 class="section-title">Tabla de <span class="text-accent">Posiciones</span></h2>
                <div v-if="currentStandings && currentStandings.teams.length > 0" class="table-container">
                    <table class="standings-table">
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Equipo</th>
                                <th>PJ</th>
                                <th>PG</th>
                                <th>PE</th>
                                <th>PP</th>
                                <th>DG</th>
                                <th>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(team, index) in currentStandings.teams" :key="index">
                                <td class="pos-cell">{{ index + 1 }}</td>
                                <td class="team-cell">{{ team.name }}</td>
                                <td>{{ team.played }}</td>
                                <td>{{ team.won }}</td>
                                <td>{{ team.drawn }}</td>
                                <td>{{ team.lost }}</td>
                                <td>{{ team.gf - team.ga }}</td>
                                <td class="points-cell">{{ team.points }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="no-data">
                    <p>No hay datos de tabla para esta categoría.</p>
                </div>
            </div>
        </div>

        <!-- UPCOMING MATCHES SECTION -->
        <section class="upcoming-section">
            <div class="container">
                <div class="section-title-wrapper">
                    <h2 class="section-title" style="margin-bottom: 0;">Próximos <span
                            class="text-accent">Encuentros</span></h2>

                    <div class="date-filter" v-if="upcomingDates.length > 0">
                        <select v-model="selectedUpcomingDate" class="date-select">
                            <option value="Todas">Todas las fechas</option>
                            <option v-for="date in upcomingDates" :key="date" :value="date">{{ date }}</option>
                        </select>
                    </div>
                </div>

                <div v-if="displayUpcoming.length > 0" class="matches-grid">
                    <div v-for="match in displayUpcoming" :key="match.id" class="match-card upcoming">
                        <div class="match-header">
                            <span class="match-category">{{ match.category }}</span>
                            <span class="match-date">{{ match.date }} - {{ match.time }}</span>
                        </div>
                        <div class="match-body">
                            <div class="team home">
                                <div class="logo-wrapper">
                                    <img v-if="match.homeLogo || getTeamLogo(match.homeTeam)"
                                        :src="match.homeLogo || getTeamLogo(match.homeTeam)" class="match-team-logo"
                                        :alt="match.homeTeam">
                                    <span v-else class="material-symbols-outlined no-logo-icon">shield</span>
                                </div>
                                <span class="team-name">{{ match.homeTeam }}</span>
                            </div>
                            <div class="vs-badge">VS</div>
                            <div class="team away">
                                <div class="logo-wrapper">
                                    <img v-if="match.awayLogo || getTeamLogo(match.awayTeam)"
                                        :src="match.awayLogo || getTeamLogo(match.awayTeam)" class="match-team-logo"
                                        :alt="match.awayTeam">
                                    <span v-else class="material-symbols-outlined no-logo-icon">shield</span>
                                </div>
                                <span class="team-name">{{ match.awayTeam }}</span>
                            </div>
                        </div>
                        <div class="match-footer">
                            <i class="fa-solid fa-location-dot"></i> {{ match.stadium }}
                        </div>
                    </div>
                </div>
                <div v-else class="no-matches">
                    <i class="fa-regular fa-calendar-xmark"></i>
                    <p>No hay partidos programados por el momento.</p>
                </div>
            </div>
        </section>

        <!-- RESULTS SECTION -->
        <section class="results-section">
            <div class="container">
                <div class="section-title-wrapper">
                    <h2 class="section-title" style="margin-bottom: 0;">Últimos <span
                            class="text-accent">Resultados</span></h2>

                    <div class="date-filter" v-if="finishedDates.length > 0">
                        <select v-model="selectedFinishedDate" class="date-select">
                            <option value="Todas">Todas las fechas</option>
                            <option v-for="date in finishedDates" :key="date" :value="date">{{ date }}</option>
                        </select>
                    </div>
                </div>

                <div v-if="displayFinished.length > 0" class="matches-grid">
                    <div v-for="match in displayFinished" :key="match.id" class="match-card result">
                        <div class="match-header">
                            <span class="match-category">{{ match.category }}</span>
                            <span class="match-date">{{ match.date }}</span>
                        </div>
                        <div class="match-body score-layout">
                            <!-- Local -->
                            <div class="team-result-box home" :class="{ winner: match.homeScore > match.awayScore }">
                                <div class="logo-wrapper result-logo">
                                    <img v-if="match.homeLogo || getTeamLogo(match.homeTeam)"
                                        :src="match.homeLogo || getTeamLogo(match.homeTeam)" class="match-team-logo"
                                        :alt="match.homeTeam">
                                    <span v-else class="material-symbols-outlined no-logo-icon">shield</span>
                                </div>
                                <span class="team-label">{{ match.homeTeam }}</span>
                            </div>

                            <!-- Marcador -->
                            <div class="score-display">
                                <span class="score-num">{{ match.homeScore }}</span>
                                <span class="score-divider">:</span>
                                <span class="score-num">{{ match.awayScore }}</span>
                            </div>

                            <!-- Visitante -->
                            <div class="team-result-box away" :class="{ winner: match.awayScore > match.homeScore }">
                                <div class="logo-wrapper result-logo">
                                    <img v-if="match.awayLogo || getTeamLogo(match.awayTeam)"
                                        :src="match.awayLogo || getTeamLogo(match.awayTeam)" class="match-team-logo"
                                        :alt="match.awayTeam">
                                    <span v-else class="material-symbols-outlined no-logo-icon">shield</span>
                                </div>
                                <span class="team-label">{{ match.awayTeam }}</span>
                            </div>
                        </div>
                        <div class="match-footer">
                            <span class="status-finished">Finalizado</span>
                        </div>
                    </div>
                </div>
                <div v-else class="no-matches">
                    <i class="fa-solid fa-clipboard-list"></i>
                    <p>No hay resultados registrados aún.</p>
                </div>
            </div>
        </section>
        <SponsorsCarousel />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useMatchesStore } from '../store/matchesStore';
import { useTournamentStore } from '../store/tournamentStore';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';
import PageHero from '../components/PageHero.vue';
import clubHeroImg from '../assets/img/heroes/club_hero.png';

const matchesStore = useMatchesStore();
const tournamentStore = useTournamentStore();

const selectedCategory = ref('Todos');

onMounted(() => {
    matchesStore.initMatches();
    tournamentStore.initStandings();
});

const normalize = (cat) =>
    cat?.trim().toLowerCase().replace(/\s+/g, ' ').replace('sub-', 'sub ').replace(/sub(\d+)/, 'sub $1');

const filteredUpcoming = computed(() => {
    let matches = matchesStore.getUpcomingMatches();
    if (selectedCategory.value !== 'Todos') {
        const normalizedSelected = normalize(selectedCategory.value);
        matches = matches.filter(m => normalize(m.category) === normalizedSelected);
    }
    return matches;
});

const filteredFinished = computed(() => {
    let matches = matchesStore.getFinishedMatches();
    if (selectedCategory.value !== 'Todos') {
        const normalizedSelected = normalize(selectedCategory.value);
        matches = matches.filter(m => normalize(m.category) === normalizedSelected);
    }
    return matches;
});

const currentStandings = computed(() => {
    if (selectedCategory.value === 'Todos') return null;
    return tournamentStore.getStandingsByCategory(selectedCategory.value);
});

const getTeamLogo = (teamName) => {
    const name = teamName?.toUpperCase() || '';
    if (name.includes('UNION JAGUERA')) return '/img/Sub-15/UNION_JAGUERA.png';
    if (name.includes('ALIANZA FC')) return '/img/Sub-15/ALIANZA_FC.png';
    if (name.includes('INTER JUNIOR')) return '/img/Sub-15/ITER_JUNIOR_CODAZZI.png';
    if (name.includes('EMBAJADORES')) return '/img/Sub-15/EMBAJADORES_BANCO_MAGDALENA.png';
    if (name.includes('ATLETICO CESAR')) return '/img/Sub-15/ATLETICO_CESAR.png';
    if (name.includes('ATLETAS DEL')) return '/img/Sub-15/ATLETAS_BOSCONIA.png';
    if (name.includes('LA GLORIA')) return '/img/Sub-15/CLUB_ATLETICO_LA_GLORIA.png';
    if (name.includes('FUTURAS ESTRELLAS')) return '/img/Sub-15/FUTURAS_ESTRELLAS_VALLEDUPAR.png';
    if (name.includes('MANCHESTER')) return '/img/Sub-15/MANCHESTER_VALLEDUPAR.png';
    if (name.includes('ACADEMIA VALLENATA')) return '/img/Sub-15/ACADEMIA_VALLENATA.png';
    if (name.includes('DESCANSA')) return '/img/Sub-15/DESCANSO.png';
    if (name.includes('VACAD VALLEDUPAR') || name.includes('ACAD VALLEDUPAR')) return '/img/Sub-15/ACADEMIA_VALLEDUPAR.png';
    return '';
};

const selectedUpcomingDate = ref('Todas');
const selectedFinishedDate = ref('Todas');

const upcomingDates = computed(() => {
    return [...new Set(filteredUpcoming.value.map(m => m.date))];
});

const finishedDates = computed(() => {
    return [...new Set(filteredFinished.value.map(m => m.date))];
});

// Función para aplicar la auto-selección inteligente
const applyAutoSelection = () => {
    if (upcomingDates.value.length > 0) {
        selectedUpcomingDate.value = upcomingDates.value[0];
    } else {
        selectedUpcomingDate.value = 'Todas';
    }

    if (finishedDates.value.length > 0) {
        // En los terminados mostramos siempre la última fecha jugada (asumiendo orden cronológico)
        selectedFinishedDate.value = finishedDates.value[finishedDates.value.length - 1];
    } else {
        selectedFinishedDate.value = 'Todas';
    }
};

// Auto-seleccionar fechas cuando cambia la categoría
watch(selectedCategory, () => {
    applyAutoSelection();
});

// Auto-seleccionar al cargar los datos por primera vez (cuando matches pasa de 0 a tener elementos)
watch(() => matchesStore.matches, (newMatches, oldMatches) => {
    if (newMatches.length > 0 && (!oldMatches || oldMatches.length === 0)) {
        // Usamos un pequeño delay para asegurar que los computed properties (upcomingDates, etc) se hayan actualizado
        setTimeout(() => {
            applyAutoSelection();
        }, 50);
    }
}, { deep: true, immediate: true });

const displayUpcoming = computed(() => {
    if (selectedUpcomingDate.value === 'Todas') return filteredUpcoming.value;
    return filteredUpcoming.value.filter(m => m.date === selectedUpcomingDate.value);
});

const displayFinished = computed(() => {
    if (selectedFinishedDate.value === 'Todas') return filteredFinished.value;
    return filteredFinished.value.filter(m => m.date === selectedFinishedDate.value);
});

</script>

<style scoped>
/* SECTIONS */
/* SECTIONS */
.filters-section {
    padding-top: 3rem;
    padding-bottom: 1rem;
    background: var(--bg-primary);
}

.filter-header {
    text-align: center;
    margin-bottom: 2rem;
}

.filter-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
}

.section-title-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.date-filter {
    display: flex;
    align-items: center;
}

.date-select {
    padding: 0.5rem 1rem;
    border: 2px solid var(--accent-light);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1rem;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.date-select:hover,
.date-select:focus {
    border-color: var(--accent-color);
    outline: none;
}

.upcoming-section,
.results-section,
.standings-section {
    padding: 3rem 0;
}

.upcoming-section {
    background-color: var(--bg-primary);
}

.results-section {
    background-color: var(--bg-secondary);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 800;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-primary);
}

.text-accent {
    color: var(--accent-color);
}

/* MATCHES GRID */
.matches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
}

/* MATCH CARD */
.match-card {
    background: var(--card-bg);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.match-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

:root.dark .match-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.match-header {
    background: rgba(31, 167, 116, 0.1);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.match-category {
    font-weight: 700;
    color: var(--accent-color);
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}

.match-date {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
}

.match-body {
    padding: 2rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.team {
    flex: 1;
    min-width: 0;
    /* Previene que nombres largos ensanchen la tarjeta */
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    font-weight: 700;
    color: var(--text-primary);
    font-size: 1.1rem;
}

.team-identity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 140px;
    /* Limitar ancho para nombres largos */
}

.logo-wrapper {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 50%;
    margin-bottom: 0.5rem;
}

.logo-wrapper.small {
    width: 32px;
    height: 32px;
    margin-bottom: 0;
}

.match-team-logo {
    width: 50px;
    height: 50px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.match-team-logo.small {
    width: 24px;
    height: 24px;
}

.no-logo-icon {
    font-size: 24px;
    color: #cbd5e1;
}

.no-logo-icon.small {
    font-size: 16px;
}

.team-name {
    font-size: 0.8rem;
    /* Nombres más pequeños */
    font-weight: 700;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /* Máximo 2 líneas */
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.vs-badge {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: 900;
    font-size: 0.9rem;
    margin: 0 1rem;
    flex-shrink: 0;
}

.match-footer {
    padding: 1rem 1.5rem;
    background: var(--bg-secondary);
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* RESULTS SPECIFIC REDESIGN */
.score-layout {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 1.5rem !important;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.02));
}

.team-result-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
}

.logo-wrapper.result-logo {
    width: 70px;
    height: 70px;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    border: 2px solid transparent;
}

.winner .logo-wrapper.result-logo {
    border-color: var(--accent-color);
}

.team-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-align: center;
    text-transform: uppercase;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 100px;
}

.winner .team-label {
    color: var(--accent-color);
}

.score-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.2rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    margin: 0 1rem;
}

.score-num {
    font-size: 2.2rem;
    font-weight: 900;
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
}

.score-divider {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-color);
    opacity: 0.5;
}

.status-finished {
    color: var(--accent-color);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
}

/* NO MATCHES STATE */
.no-matches {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
    background: var(--card-bg);
    border-radius: 16px;
    border: 1px dashed rgba(0, 0, 0, 0.1);
}

.no-matches i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

/* FILTERS */
.category-tabs {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.tab-btn {
    padding: 0.8rem 1.5rem;
    border: 2px solid transparent;
    background: var(--card-bg);
    color: var(--text-secondary);
    border-radius: 50px;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.tab-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.tab-btn.active {
    background: var(--accent-color);
    color: #fff;
    box-shadow: 0 8px 20px rgba(31, 167, 116, 0.3);
}

:root.dark .tab-btn {
    background: rgba(255, 255, 255, 0.05);
}

/* STANDINGS TABLE */
.standings-section {
    background: var(--bg-secondary);
}

.table-container {
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    background: var(--card-bg);
}

.standings-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
}

.standings-table th {
    background: var(--accent-color);
    color: #fff;
    padding: 1rem;
    text-align: center;
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
}

.standings-table td {
    padding: 1rem;
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    color: var(--text-secondary);
    font-weight: 500;
}

:root.dark .standings-table td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.standings-table tr:hover {
    background: rgba(0, 0, 0, 0.02);
}

:root.dark .standings-table tr:hover {
    background: rgba(255, 255, 255, 0.02);
}

.team-cell {
    text-align: left !important;
    font-weight: 700 !important;
    color: var(--text-primary) !important;
}

.pos-cell {
    font-weight: 800;
    color: var(--text-secondary);
}

.standings-table tr:nth-child(1) .pos-cell {
    color: #FFD700;
}

/* Gold */
.standings-table tr:nth-child(2) .pos-cell {
    color: #C0C0C0;
}

/* Silver */
.standings-table tr:nth-child(3) .pos-cell {
    color: #CD7F32;
}

/* Bronze */

.points-cell {
    font-weight: 900 !important;
    color: var(--accent-color) !important;
    font-size: 1.1rem;
    background: rgba(31, 167, 116, 0.05);
}

/* RESPONSIVE */
@media (max-width: 768px) {

    .match-card.upcoming .match-body {
        flex-direction: column;
        gap: 1rem;
    }

    .score-layout {
        gap: 0.5rem;
        padding: 1rem !important;
    }

    .score-num {
        font-size: 1.6rem;
    }

    .logo-wrapper.result-logo {
        width: 50px;
        height: 50px;
    }

    .team-label {
        font-size: 0.65rem;
        max-width: 80px;
    }

    .vs-badge {
        margin: 0.5rem 0;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .tab-btn {
        padding: 0.6rem 1rem;
        font-size: 0.9rem;
    }
}
</style>
