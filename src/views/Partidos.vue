<template>
    <div class="partidos-page">
        <!-- HERO SECTION -->
        <PageHero pageKey="partidos" :defaultImage="clubHeroImg" />

        <!-- FILTER TABS -->
        <section class="filters-section">
            <div class="container">
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
                <h2 class="section-title">Próximos <span class="text-accent">Encuentros</span></h2>

                <div v-if="upcomingMatches.length > 0" class="matches-grid">
                    <div v-for="match in upcomingMatches" :key="match.id" class="match-card upcoming">
                        <div class="match-header">
                            <span class="match-category">{{ match.category }}</span>
                            <span class="match-date">{{ match.date }} - {{ match.time }}</span>
                        </div>
                        <div class="match-body">
                            <div class="team home">
                                <span class="team-name">{{ match.homeTeam }}</span>
                            </div>
                            <div class="vs-badge">VS</div>
                            <div class="team away">
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
                <h2 class="section-title">Últimos <span class="text-accent">Resultados</span></h2>

                <div v-if="finishedMatches.length > 0" class="matches-grid">
                    <div v-for="match in finishedMatches" :key="match.id" class="match-card result">
                        <div class="match-header">
                            <span class="match-category">{{ match.category }}</span>
                            <span class="match-date">{{ match.date }}</span>
                        </div>
                        <div class="match-body">
                            <div class="team home" :class="{ winner: match.homeScore > match.awayScore }">
                                <span class="team-name">{{ match.homeTeam }}</span>
                                <span class="score">{{ match.homeScore }}</span>
                            </div>
                            <div class="vs-badge">-</div>
                            <div class="team away" :class="{ winner: match.awayScore > match.homeScore }">
                                <span class="score">{{ match.awayScore }}</span>
                                <span class="team-name">{{ match.awayTeam }}</span>
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
import { ref, computed } from 'vue';
import { useMatchesStore } from '../store/matchesStore';
import { useTournamentStore } from '../store/tournamentStore';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';
import PageHero from '../components/PageHero.vue';
import clubHeroImg from '../assets/img/heroes/club_hero.png';

const matchesStore = useMatchesStore();
const tournamentStore = useTournamentStore();

const selectedCategory = ref('Todos');

const filteredUpcoming = computed(() => {
    let matches = matchesStore.getUpcomingMatches();
    if (selectedCategory.value !== 'Todos') {
        matches = matches.filter(m => m.category === selectedCategory.value);
    }
    return matches;
});

const filteredFinished = computed(() => {
    let matches = matchesStore.getFinishedMatches();
    if (selectedCategory.value !== 'Todos') {
        matches = matches.filter(m => m.category === selectedCategory.value);
    }
    return matches;
});

const currentStandings = computed(() => {
    if (selectedCategory.value === 'Todos') return null;
    return tournamentStore.getStandingsByCategory(selectedCategory.value);
});

// Update template refs to use filtered computed props (done in template replacement below if needed, here we just rename for consistency)
const upcomingMatches = filteredUpcoming;
const finishedMatches = filteredFinished;
</script>

<style scoped>
/* SECTIONS */
/* SECTIONS */
.filters-section {
    padding-top: 3rem;
    padding-bottom: 1rem;
    background: var(--bg-primary);
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
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-weight: 700;
    color: var(--text-primary);
    font-size: 1.2rem;
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

/* RESULTS SPECIFIC */
.match-card.result .match-body {
    padding: 1.5rem;
}

.match-card.result .team {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.5rem;
}

.match-card.result .team.home {
    text-align: right;
}

.match-card.result .team.away {
    flex-direction: row;
    /* Keep standard order for away */
    text-align: left;
}

.match-card.result .score {
    font-size: 1.8rem;
    font-weight: 900;
    color: var(--text-primary);
}

.match-card.result .team.winner .score {
    color: var(--accent-color);
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

    .match-card.upcoming .match-body,
    .match-card.result .match-body {
        flex-direction: column;
        gap: 1rem;
    }

    .match-card.result .team {
        width: 100%;
        justify-content: center;
        /* Center content when stacked */
    }

    .match-card.result .team.home {
        text-align: center;
        flex-direction: row-reverse;
        /* Keep score next to name but centered */
        justify-content: center;
        gap: 1rem;
    }

    .match-card.result .team.away {
        text-align: center;
        justify-content: center;
        gap: 1rem;
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
