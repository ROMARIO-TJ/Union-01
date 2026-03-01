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
                <div class="section-header-centered">
                    <h2 class="section-title">Tabla de <span class="text-accent">Posiciones</span></h2>
                    <p class="section-subtitle">Clasifican los mejores <span class="highlight-text">4 equipos</span> a
                        la siguiente fase</p>
                </div>

                <div v-if="currentStandings && currentStandings.teams.length > 0"
                    class="table-container premium-shadow">
                    <table class="standings-table">
                        <thead>
                            <tr class="desktop-only-header">
                                <th>Pos</th>
                                <th>Equipo</th>
                                <th>PJ</th>
                                <th>PG</th>
                                <th>PE</th>
                                <th>PP</th>
                                <th>DG</th>
                                <th>Pts</th>
                            </tr>
                            <tr class="mobile-only-header">
                                <th>#</th>
                                <th>Equipo</th>
                                <th>PJ</th>
                                <th>G</th>
                                <th>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(team, index) in currentStandings.teams" :key="index"
                                :class="{ 'classification-zone': index < 4 }">
                                <td class="pos-cell">
                                    <div class="pos-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
                                </td>
                                <td class="team-cell">
                                    <div class="team-info">
                                        <div class="team-logo-mini">
                                            <img v-if="getTeamLogo(team.name)" :src="getTeamLogo(team.name)"
                                                :alt="team.name">
                                            <span v-else class="material-symbols-outlined">shield</span>
                                        </div>
                                        <span class="team-name-text">{{ team.name }}</span>
                                    </div>
                                </td>
                                <!-- Desktop Stats -->
                                <td class="desktop-stat">{{ team.played }}</td>
                                <td class="desktop-stat">{{ team.won }}</td>
                                <td class="desktop-stat">{{ team.drawn }}</td>
                                <td class="desktop-stat">{{ team.lost }}</td>
                                <td class="dg-cell desktop-stat"
                                    :class="{ 'pos-dg': (team.gf - team.ga) > 0, 'neg-dg': (team.gf - team.ga) < 0 }">
                                    {{ (team.gf - team.ga) > 0 ? '+' : '' }}{{ team.gf - team.ga }}
                                </td>

                                <!-- Mobile Stats (Condensed) -->
                                <td class="mobile-stat">{{ team.played }}</td>
                                <td class="mobile-stat goals-stat">{{ team.gf }}:{{ team.ga }}</td>

                                <td class="points-cell">
                                    <span class="pts-badge">{{ team.points }}</span>
                                </td>
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
                            <option v-for="date in upcomingDates" :key="date" :value="date">{{ getFechaLabel(date) }}
                            </option>
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
                            <option v-for="date in finishedDates" :key="date" :value="date">{{ getFechaLabel(date) }}
                            </option>
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

// Mapeo de fechas del calendario oficial DIFUTBOL a "Fecha N"
const dateToFechaMap = {
    '21 Feb': 'Fecha 1', '28 Feb': 'Fecha 2', '07 Mar': 'Fecha 3', '14 Mar': 'Fecha 4',
    '21 Mar': 'Fecha 5', '28 Mar': 'Fecha 6', '11 Abr': 'Fecha 7', '18 Abr': 'Fecha 8',
    '25 Abr': 'Fecha 9', '02 May': 'Fecha 10', '09 May': 'Fecha 11', '16 May': 'Fecha 12',
    '23 May': 'Fecha 13', '30 May': 'Fecha 14', '06 Jun': 'Fecha 15', '13 Jun': 'Fecha 16',
    '20 Jun': 'Fecha 17', '27 Jun': 'Fecha 18', '04 Jul': 'Fecha 19', '11 Jul': 'Fecha 20',
    '18 Jul': 'Fecha 21', '25 Jul': 'Fecha 22'
};

const getFechaLabel = (date) => {
    const label = dateToFechaMap[date];
    return label ? `${label} - ${date}` : date;
};

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
        // Seleccionamos la primera posición porque ahora vienen ordenados temporalmente descendiendo
        selectedFinishedDate.value = finishedDates.value[0];
    } else {
        selectedFinishedDate.value = 'Todas';
    }
};

// Auto-seleccionar fechas cuando cambia la categoría
watch(selectedCategory, () => {
    applyAutoSelection();
});

// Auto-seleccionar cuando los datos se cargan (desde servidor o localStorage)
watch(() => matchesStore.matches.length, () => {
    applyAutoSelection();
}, { immediate: true });

// Respaldo: al montar la página, aplicar selección tras un breve delay
onMounted(() => {
    setTimeout(() => {
        applyAutoSelection();
    }, 300);
});

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

/* STANDINGS TABLE PREMIUM REDESIGN */
.standings-section {
    background: var(--bg-secondary);
    padding: 4rem 0;
}

.section-header-centered {
    text-align: center;
    margin-bottom: 3rem;
}

.section-subtitle {
    margin-top: -1.5rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.highlight-text {
    color: var(--accent-color);
    font-weight: 800;
}

.table-container.premium-shadow {
    position: relative;
    overflow-x: auto;
    border-radius: 20px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.03);
}

.table-container.premium-shadow::before {
    content: "";
    position: absolute;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    height: 350px;
    background-image: url('../assets/img/logosinfondo.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.08;
    pointer-events: none;
    z-index: 0;
}

.standings-table {
    position: relative;
    z-index: 1;
    width: 100%;
    border-collapse: collapse;
    min-width: 750px;
    border: none;
}

.standings-table th {
    background: var(--accent-color);
    color: #fff;
    padding: 1.2rem;
    text-align: center;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: none;
    /* Eliminamos bordes individuales que puedan crear huecos */
}

.standings-table td {
    padding: 1.2rem 1rem;
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease;
}

.standings-table tr:last-child td {
    border-bottom: none;
}

/* CLASSIFICATION ZONE HIGHLIGHT */
.classification-zone {
    background: rgba(31, 167, 116, 0.05);
}

/* Reemplazamos el borde lateral por una línea más limpia que no mueva la tabla */
.classification-zone td:first-child {
    box-shadow: inset 4px 0 0 var(--accent-color);
}

/* POS BADGES */
.pos-cell {
    width: 80px;
}

.pos-badge {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-weight: 800;
    font-size: 0.9rem;
}

.rank-1,
.rank-2,
.rank-3,
.rank-4 {
    background: var(--accent-color);
    color: white;
    box-shadow: 0 4px 10px rgba(31, 167, 116, 0.3);
}

/* TEAM INFO CELL */
.team-cell {
    text-align: left !important;
    min-width: 250px;
}

.team-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.team-logo-mini {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    padding: 5px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.team-logo-mini img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.team-name-text {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 1.05rem;
}

/* DG CELL */
.dg-cell {
    font-family: 'Inter', monospace;
    font-weight: 700;
}

.pos-dg {
    color: var(--accent-color);
}

.neg-dg {
    color: #ef4444;
}

/* POINTS CELL */
.points-cell {
    width: 100px;
}

.pts-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: rgba(31, 167, 116, 0.1);
    color: var(--accent-color);
    border-radius: 10px;
    font-weight: 900;
    font-size: 1.1rem;
    min-width: 50px;
    text-align: center;
}

.classification-zone .pts-badge {
    background: var(--accent-color);
    color: white;
    box-shadow: 0 4px 12px rgba(31, 167, 116, 0.2);
}

.standings-table tr:hover td {
    background: rgba(0, 0, 0, 0.02);
}

:root.dark .team-logo-mini {
    background: rgba(255, 255, 255, 0.1);
}

/* FLASH SCORE MOBILE ADAPTATION */
.mobile-only-header,
.mobile-stat {
    display: none;
}

/* RESPONSIVE */
@media (max-width: 768px) {

    .desktop-only-header,
    .desktop-stat {
        display: none;
    }

    .mobile-only-header {
        /* Eliminamos el flex para que actúe como fila de tabla real */
        display: table-row !important;
    }

    .mobile-stat {
        display: table-cell !important;
    }

    .standings-table {
        min-width: 100%;
        width: 100%;
        table-layout: fixed;
        /* Mantenemos fixed para controlar los anchos exactos */
    }

    .standings-table th,
    .standings-table td {
        font-size: 0.75rem;
        padding: 0.6rem 0.15rem;
        vertical-align: middle;
    }

    /* Definimos anchos fijos para que el THEAD y el TBODY se alineen perfectamente */
    .pos-cell,
    .mobile-only-header th:first-child {
        width: 30px;
    }

    .team-cell,
    .mobile-only-header th:nth-child(2) {
        width: auto;
        /* El resto del espacio */
    }

    .mobile-stat,
    .mobile-only-header th:nth-child(3),
    .mobile-only-header th:nth-child(4) {
        width: 35px;
        text-align: center;
    }

    .goals-stat {
        width: 45px !important;
    }

    .points-cell,
    .mobile-only-header th:last-child {
        width: 40px;
    }

    .classification-zone,
    tr {
        /* Quitamos el flex de las filas del cuerpo para que se alineen con las columnas */
        display: table-row;
    }

    .points-cell {
        width: 35px;
        /* Puntos pegados al borde derecho */
        padding-right: 0.4rem !important;
    }

    .pos-badge {
        width: 100%;
        border-radius: 0px;
    }

    .team-name-text {
        font-size: 0.7rem;
    }

    .pts-badge {
        padding: 0.1rem 0;
        min-width: 18px;
        font-size: 0.6rem;
        border-radius: 4px;
        /* display: block; */
        margin: 0 auto;
    }

    .container {
        padding: 0 0.3rem;
    }

    .table-container.premium-shadow {
        border-radius: 8px;
    }

    .table-container.premium-shadow::before {
        width: 180px;
        height: 180px;
        opacity: 0.12;
        /* Un poco más visible en móvil por ser pequeño */
    }

    .standings-section {
        padding: 2rem 0;
    }

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
