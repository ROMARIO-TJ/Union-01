<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNewsStore } from '../store/newsStore';
import { useMatchesStore } from '../store/matchesStore';
import { useSponsorsStore } from '../store/sponsorsStore';
import { useCategoryStore } from '../store/categoryStore';
import { usePlayersStore } from '../store/playersStore';
import { useGlobalSettingsStore } from '../store/globalSettingsStore';
import { useHomeSettingsStore } from '../store/homeSettingsStore';
import HomeHero from '../components/HomeHero.vue';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';

const newsStore = useNewsStore();
const matchesStore = useMatchesStore();
const sponsorsStore = useSponsorsStore();
const categoryStore = useCategoryStore();
const playersStore = usePlayersStore();
const globalSettings = useGlobalSettingsStore();
const homeSettings = useHomeSettingsStore();

// =======================
// ORDEN DE CATEGORÍAS (HOME)
// =======================
const orderedCategories = computed(() => {
  if (!categoryStore.categories) return [];

  const orderValue = (name) => {
    const n = name.toLowerCase();
    if (n.includes('escuela')) return 0;
    const sub = n.match(/sub[\s-]*(\d+)/);
    if (sub) return 100 + parseInt(sub[1]);
    if (n.includes('primera')) return 300;
    return 999;
  };

  return [...categoryStore.categories].sort(
    (a, b) => orderValue(a.name) - orderValue(b.name)
  );
});

const latestNews = computed(() => newsStore.getLatestNews(3));

// Solo mostrar los próximos encuentros de la fecha MÁS CERCANA (La próxima jornada)
const upcomingMatches = computed(() => {
  const allUpcoming = matchesStore.getUpcomingMatches();
  if (allUpcoming.length === 0) return [];

  // Como `getUpcomingMatches()` ya viene ordenado cronológicamente, 
  // la primera fecha del array es la fecha más próxima a jugarse.
  const nextDate = allUpcoming[0].date;

  // Solo devolvemos los partidos que correspondan a esa próxima fecha
  return allUpcoming.filter(m => m.date === nextDate);
});

const carousel = ref(null);
const valuesSection = ref(null);
const isValuesVisible = ref(false);

let observer = null;

const scrollLeft = () => {
  if (carousel.value) {
    carousel.value.scrollBy({ left: -carousel.value.clientWidth, behavior: 'smooth' });
  }
};

const scrollRight = () => {
  if (carousel.value) {
    carousel.value.scrollBy({ left: carousel.value.clientWidth, behavior: 'smooth' });
  }
};

onMounted(() => {
  // Sincronizar datos vitales
  playersStore.initPlayers();
  matchesStore.initMatches();
  categoryStore.initCategories();

  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      isValuesVisible.value = true;
      observer.unobserve(entry.target);
    }
  }, {
    threshold: 0.2
  });

  if (valuesSection.value) {
    observer.observe(valuesSection.value);
  }
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
</script>

<template>
  <div class="home-view">
    <!-- HERO SECTION -->
    <HomeHero />

    <!-- LATEST NEWS SECTION (AHORA SEGUNDA) -->
    <section v-if="globalSettings.modules.news.enabled && homeSettings.sections.latestNews.enabled"
      class="latest-news py-24 bg-secondary">
      <div class="container">
        <div class="section-header flex justify-between items-end mb-12">
          <div>
            <span class="text-primary font-bold tracking-widest uppercase text-xs">Actualidad</span>
            <h2 class="section-title mt-2">Últimas <span class="text-primary italic">Noticias</span></h2>
          </div>
          <router-link to="/noticias" class="view-all-link">Todas las noticias <span
              class="material-symbols-outlined">east</span></router-link>
        </div>

        <div class="news-grid">
          <article v-for="article in latestNews" :key="article.id" class="news-card-modern group">
            <div class="news-img">
              <img :src="article.image" :alt="article.title">
              <span class="news-cat-tag">Actualidad</span>
            </div>
            <div class="news-body">
              <span class="news-date-txt">{{ article.date }}</span>
              <h3 class="news-title-txt group-hover:text-primary transition-colors">{{ article.title }}</h3>
              <p class="news-excerpt-txt">{{ article.excerpt }}</p>
              <router-link :to="`/noticias/${article.id}`" class="news-link">Leer más <span
                  class="material-symbols-outlined">arrow_right_alt</span></router-link>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- MATCH CENTER SECTION -->
    <section v-if="globalSettings.modules.matches.enabled && homeSettings.sections.matchCenter.enabled"
      class="match-center-section py-24">
      <div class="container">
        <div class="section-header mb-12 flex justify-between items-end">
          <div>
            <span class="text-primary font-bold tracking-widest uppercase text-xs">Próximos Encuentros</span>
            <h2 class="section-title mt-2">Centro de <span class="text-primary italic">Partidos</span></h2>
          </div>
          <div class="carousel-controls flex gap-4">
            <button @click="scrollLeft" class="control-btn"><span
                class="material-symbols-outlined">chevron_left</span></button>
            <button @click="scrollRight" class="control-btn"><span
                class="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>

        <div class="matches-carousel no-scrollbar" ref="carousel">
          <div v-for="match in upcomingMatches" :key="match.id" class="match-card-modern">
            <div class="match-card-inner">
              <div class="match-top">
                <span class="match-cat">{{ match.category }}</span>
                <span class="match-date-badge">{{ match.date }} - {{ match.time }}</span>
              </div>

              <div class="teams-grid">
                <div class="team-v">
                  <div class="team-logo-box">
                    <img v-if="match.homeLogo || getTeamLogo(match.homeTeam)"
                      :src="match.homeLogo || getTeamLogo(match.homeTeam)" :alt="match.homeTeam" />
                    <span v-else class="material-symbols-outlined text-slate-400">shield</span>
                  </div>
                  <span class="team-n">{{ match.homeTeam }}</span>
                </div>

                <div class="vs-v">
                  <span class="vs-txt">VS</span>
                </div>

                <div class="team-v">
                  <div class="team-logo-box">
                    <img v-if="match.awayLogo || getTeamLogo(match.awayTeam)"
                      :src="match.awayLogo || getTeamLogo(match.awayTeam)" :alt="match.awayTeam" />
                    <span v-else class="material-symbols-outlined text-slate-400">shield</span>
                  </div>
                  <span class="team-n">{{ match.awayTeam }}</span>
                </div>
              </div>

              <div class="match-bottom">
                <span class="stadium-txt"><span class="material-symbols-outlined text-xs">location_on</span> {{
                  match.stadium }}</span>
                <router-link to="/partidos" class="btn-more">Detalles <span
                    class="material-symbols-outlined">north_east</span></router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORÍAS SHOWCASE -->
    <section v-if="globalSettings.modules.categories.enabled && homeSettings.sections.categories.enabled"
      class="categories-showcase-section py-24 bg-secondary">
      <div class="container">
        <div class="showcase-wrapper">
          <div class="showcase-content">
            <h2 class="section-title mt-2">Formando el <span class="text-primary italic">Futuro</span></h2>
            <p class="mt-6 text-slate-500 leading-relaxed text-lg">
              Contamos con una estructura sólida de categorías que abarcan todas las edades, desde la iniciación
              deportiva hasta la alta competencia. Nuestro compromiso es la formación integral de cada deportista que
              viste nuestros colores.
            </p>

            <div class="mt-10">
              <router-link to="/categoria" class="btn btn-primary btn-hero-lg">Ver todas las categorías <span
                  class="material-symbols-outlined">arrow_forward</span></router-link>
            </div>
          </div>

          <div class="showcase-visual">
            <div class="main-image-box logo-showcase-bg">
              <img src="../assets/img/logosinfondo.png" alt="Unión Jaguera" class="showcase-logo-img">
              <div class="glass-stats-card">
                <div class="stat-item">
                  <span class="stat-num">{{ categoryStore.categories.length }}</span>
                  <span class="stat-label">Categorías</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-num">{{ playersStore.players.length }}</span>
                  <span class="stat-label">Jugadores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PHILOSOPHY SECTION -->
    <section class="philosophy-section py-24 overflow-hidden" ref="valuesSection"
      :class="{ 'is-visible': isValuesVisible }">
      <div class="container">
        <div class="philosophy-grid">
          <div class="philosophy-content reveal-left">
            <span class="text-primary font-bold tracking-widest uppercase text-xs">Formación Integral</span>
            <h2 class="section-title mt-2">Nuestra <span class="text-primary italic">Filosofía</span></h2>
            <p class="mt-6 text-slate-500 leading-relaxed">
              En Unión Jaguera, creemos que el éxito en el campo comienza con la integridad fuera de él. Nuestra
              metodología se centra en el desarrollo de habilidades técnicas, tácticas y, lo más importante, humanas.
            </p>

            <div class="phil-values mt-8">
              <div v-for="(item, index) in homeSettings.philosophy" :key="item.id" class="phil-item"
                :style="{ transitionDelay: `${0.2 + (index * 0.1)}s` }">
                <div>
                  <h4 class="font-bold text-lg">{{ item.title }}</h4>
                  <p class="text-slate-500 text-sm">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="philosophy-image relative reveal-right">
            <div class="image-stack-small logo-bg-philosophy">
              <img src="../assets/img/logosinfondo.png" alt="Logo Unión Jaguera" class="philosophy-logo-img">
              <div class="floating-badge-v2 glass-effect">
                <span class="text-primary text-2xl font-black italic">10+</span>
                <span class="text-[0.6rem] uppercase font-bold tracking-tighter text-slate-400">Años de
                  Excelencia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <SponsorsCarousel v-if="homeSettings.sections.sponsors.enabled" />
  </div>
</template>

<style scoped>
.py-24 {
  padding: 6rem 0;
}

.mb-12 {
  margin-bottom: 3rem;
}

.mb-16 {
  margin-bottom: 4rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mt-8 {
  margin-top: 2rem;
}

.mt-10 {
  margin-top: 2.5rem;
}

.mt-12 {
  margin-top: 3rem;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.gap-4 {
  gap: 1rem;
}

.gap-8 {
  gap: 2rem;
}

.text-center {
  text-align: center;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.max-w-2xl {
  max-width: 42rem;
}

.bg-secondary {
  background-color: var(--bg-secondary);
}

button,
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  font-size: 0.9375rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: #102215;
  box-shadow: 0 4px 14px 0 rgba(17, 212, 66, 0.39);
}

.btn-primary:hover {
  background-color: #0fb839;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(17, 212, 66, 0.23);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Botones de navegación (Sliders) */
.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 0;
  border: 1px solid rgba(17, 212, 66, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  background: var(--card-bg);
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.control-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.control-btn:hover::after {
  width: 100%;
}

.control-btn:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.control-btn span {
  font-size: 1.125rem;
}

/* Match Carousel Modern */
.matches-carousel {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 1rem 0;
  scroll-snap-type: x mandatory;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.match-card-modern {
  flex: 0 0 calc(50% - 0.75rem);
  min-width: 350px;
  scroll-snap-align: start;
}

.match-card-inner {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(17, 212, 66, 0.05);
  transition: var(--transition);
}

.match-card-inner:hover {
  border-color: var(--primary-color);
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.match-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.match-cat {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--primary-color);
  background: rgba(17, 212, 66, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.match-date-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.teams-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.team-v {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.team-logo-box {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 50%;
  background: var(--bg-secondary);
}

.team-logo-box img {
  width: 100%;
  height: auto;
}

.team-n {
  font-weight: 800;
  font-size: 1rem;
  text-align: center;
}

.vs-v {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: #102215;
  border-radius: 50%;
  font-weight: 900;
  font-size: 0.75rem;
}

.match-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(17, 212, 66, 0.1);
  padding-top: 1.5rem;
}

.stadium-txt {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-more {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.news-link {
  font-weight: 800;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Category Showcase New */
.showcase-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 5rem;
}

.cat-tabs {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cat-tab-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid rgba(17, 212, 66, 0.05);
  transition: var(--transition);
}

.cat-tab-item:hover {
  border-color: var(--primary-color);
  transform: translateX(5px);
}

.cat-tab-icon {
  color: var(--primary-color);
}

.main-image-box {
  position: relative;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-showcase-bg {
  background: radial-gradient(circle at center, rgba(17, 212, 66, 0.1) 0%, #0c1a0f 100%);
}

.showcase-logo-img {
  width: 120px;
  height: auto;
  opacity: 0.7;
  filter: drop-shadow(0 0 15px rgba(17, 212, 66, 0.2));
  transition: all 0.5s ease;
}

.main-image-box:hover .showcase-logo-img {
  transform: scale(1.1);
  opacity: 1;
}

.main-image-box img:not(.showcase-logo-img) {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.8s ease;
}

.main-image-box:hover img {
  transform: scale(1.05);
}

.glass-stats-card {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(16, 34, 21, 0.85);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(17, 212, 66, 0.2);
  padding: 1.5rem;
  border-radius: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(17, 212, 66, 0.2);
}

@media (max-width: 992px) {
  .showcase-wrapper {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

/* Philosophy Section */
.philosophy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 5rem;
}

.phil-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.philosophy-section.is-visible .phil-item {
  opacity: 1;
  transform: translateY(0);
}

.phil-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  background: rgba(17, 212, 66, 0.1);
  color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Philosophy Section Animations */
.philosophy-section .reveal-left {
  opacity: 0;
  transform: translateX(-50px);
  transition: all 1s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.philosophy-section .reveal-right {
  opacity: 0;
  transform: translateX(50px);
  transition: all 1s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.philosophy-section.is-visible .reveal-left,
.philosophy-section.is-visible .reveal-right {
  opacity: 1;
  transform: translateX(0);
}

.image-stack-small {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.logo-bg-philosophy {
  background: radial-gradient(circle at center, rgba(17, 212, 66, 0.12) 0%, #f8faf8 100%);
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  transition: background 0.3s ease;
}

:root.dark .logo-bg-philosophy {
  background: radial-gradient(circle at center, rgba(17, 212, 66, 0.15) 0%, #000000 100%);
}

.philosophy-logo-img {
  width: 150px;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(17, 212, 66, 0.3));
  opacity: 0.9;
}

.philosophy-img-rounded {
  width: 100%;
  height: auto;
  border-radius: 0;
  /* Squared as requested */
}

.floating-badge-v2 {
  position: absolute;
  bottom: -15px;
  left: -15px;
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem 1.5rem;
  border-radius: 0;
  /* Squared */
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  border-left: 3px solid var(--primary-color);
  z-index: 5;
}

:root.dark .floating-badge-v2 {
  background: rgba(16, 34, 21, 0.9);
}

/* News Section */
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.news-card-modern {
  background: var(--card-bg);
  border-radius: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: none;
}

.news-card-modern:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.news-img {
  height: 250px;
  position: relative;
  overflow: hidden;
  background-color: #f1f5f9;
}

.news-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.news-card-modern:hover .news-img img {
  transform: scale(1.08);
}

.news-cat-tag {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--primary-color);
  color: #102215;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 800;
}

.news-body {
  padding: 1.25rem;
}

.news-date-txt {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

.news-title-txt {
  font-size: 1.15rem;
  font-weight: 900;
  margin: 0.5rem 0;
  line-height: 1.2;
}

.news-excerpt-txt {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.25rem;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.view-all-link {
  font-weight: 800;
  color: var(--text-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  padding-bottom: 0.25rem;
  position: relative;
}

.view-all-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.view-all-link:hover {
  color: var(--primary-color);
}

.view-all-link:hover::after {
  width: 100%;
}

.view-all-link .material-symbols-outlined {
  font-size: 1.25rem;
  transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.view-all-link:hover .material-symbols-outlined {
  transform: translateX(8px);
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .cat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .philosophy-grid {
    gap: 2rem;
  }
}

@media (max-width: 992px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .philosophy-grid {
    grid-template-columns: 1fr;
  }

  .match-card-modern {
    flex: 0 0 100%;
    min-width: 100%;
  }

  .teams-grid {
    gap: 1rem;
  }

  .cat-grid {
    grid-template-columns: 1fr;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2.25rem;
  }

  .py-24 {
    padding: 4rem 0;
  }
}
</style>
