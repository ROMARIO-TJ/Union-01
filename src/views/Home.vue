<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useNewsStore } from '../store/newsStore';
import { useMatchesStore } from '../store/matchesStore';
import { useSponsorsStore } from '../store/sponsorsStore';
import { useCategoryStore } from '../store/categoryStore';
import { useGlobalSettingsStore } from '../store/globalSettingsStore';
import { useHomeSettingsStore } from '../store/homeSettingsStore';
import HomeHero from '../components/HomeHero.vue';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';

const newsStore = useNewsStore();
const matchesStore = useMatchesStore();
const sponsorsStore = useSponsorsStore();
const categoryStore = useCategoryStore();
const globalSettings = useGlobalSettingsStore();
const homeSettings = useHomeSettingsStore();

const latestNews = newsStore.getLatestNews(3);
const upcomingMatches = matchesStore.getUpcomingMatches();

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
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      isValuesVisible.value = true;
      observer.unobserve(entry.target); // Only animate once
    }
  }, {
    threshold: 0.2
  });

  if (valuesSection.value) {
    observer.observe(valuesSection.value);
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <div class="home-view">
    <!-- HERO SECTION -->
    <HomeHero />

    <!-- MATCH CENTER SECTION -->
    <section v-if="globalSettings.modules.matches.enabled && homeSettings.sections.matchCenter.enabled"
      class="match-center">
      <div class="container">
        <div class="match-center__header">
          <h2 class="section-title">Próximos <span class="text-accent">Encuentros</span></h2>
          <div class="carousel-controls">
            <router-link to="/partidos" class="view-all-link" style="margin-right: 1.5rem">Ver Calendario <i
                class="fa-solid fa-arrow-right"></i></router-link>
            <button @click="scrollLeft" class="nav-btn prev-btn"><i class="fa-solid fa-chevron-left"></i></button>
            <button @click="scrollRight" class="nav-btn next-btn"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>

        <div class="matches-carousel" ref="carousel">
          <div v-for="match in upcomingMatches" :key="match.id" class="match-card">
            <span class="match-category">{{ match.category }}</span>

            <div class="match-content">
              <!-- HOME TEAM -->
              <div class="team team--home">
                <img src="../assets/img/logosinfondo.png" alt="Unión Jeguera" class="team__logo" />
                <span class="team__name">{{ match.homeTeam }}</span>
              </div>

              <!-- VS INFO -->
              <div class="match-info">
                <div class="vs-badge">VS
                </div>
                <div class="match-details">
                  <span class="match-date">{{ match.date }}</span>
                  <span class="match-time">{{ match.time }}</span>
                  <span class="match-stadium">{{ match.stadium }}</span>
                </div>
              </div>

              <!-- AWAY TEAM -->
              <div class="team team--away">
                <!-- Placeholder logo for rival -->
                <div class="team__logo placeholder-logo">
                  <i class="fa-solid fa-shield-halved"></i>
                </div>
                <span class="team__name">{{ match.awayTeam }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- LATEST NEWS SECTION -->
    <section v-if="globalSettings.modules.news.enabled && homeSettings.sections.latestNews.enabled" class="latest-news">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Actualidad del <span class="text-accent">Club</span></h2>
          <router-link to="/noticias" class="view-all-link">Ver todas <i
              class="fa-solid fa-arrow-right"></i></router-link>
        </div>

        <div class="news-grid">
          <article v-for="article in latestNews" :key="article.id" class="news-card">
            <div class="news-card__image">
              <img :src="article.image" :alt="article.title">
              <div class="news-date">{{ article.date }}</div>
            </div>
            <div class="news-card__content">
              <h3 class="news-title">{{ article.title }}</h3>
              <p class="news-excerpt">{{ article.excerpt }}</p>
              <router-link :to="`/noticias/${article.id}`" class="read-more">Leer más</router-link>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- CATEGORIES PREVIEW SECTION -->
    <section v-if="globalSettings.modules.categories.enabled && homeSettings.sections.categories.enabled"
      class="categories-preview">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Nuestras <span class="text-accent">Categorías</span></h2>
          <router-link to="/categoria" class="view-all-link">Ver todas <i
              class="fa-solid fa-arrow-right"></i></router-link>
        </div>

        <div class="categories-preview-grid">
          <div v-for="categoria in categoryStore.categories.slice(0, 4)" :key="categoria.id"
            class="category-preview-card">
            <div class="category-preview-icon">
              <i :class="categoria.icon"></i>
            </div>
            <h3>{{ categoria.name }}</h3>
            <p>{{ categoria.age }}</p>
            <router-link :to="{ name: 'Inscripcion', query: { categoria: categoria.name } }" class="btn-preview">
              Inscribirme
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- VALUES SECTION -->
    <section class="values-section" ref="valuesSection" :class="{ 'is-visible': isValuesVisible }">
      <div class="container">
        <h2 class="section-title text-center">Nuestra <span class="text-accent">Filosofía</span></h2>

        <div class="values-grid">
          <div v-for="item in homeSettings.philosophy" :key="item.id" class="value-card">
            <div class="icon-box">
              <i :class="item.icon"></i>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <SponsorsCarousel v-if="homeSettings.sections.sponsors.enabled" />
  </div>
</template>


<style scoped>
/* CONTAINER - Shared alignment */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* HERO SECTION */
.hero {
  /* Min height and padding to ensure full impact */
  min-height: 85vh;
  padding: 4rem 0;
  display: flex;
  align-items: center;
}

/* Flex container for hero content */
.hero__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
}

/* LEFT COLUMN - TEXT */
.hero__content {
  flex: 1;
  max-width: 600px;
  animation: fadeInDown 1s ease-out;
}

.hero__title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
  /* Ensure premium font */
}

.highlight {
  color: var(--accent-color);

  .hero__container {
    flex-direction: column-reverse;
    /* Image on top for visual impact on mobile */
    gap: 2rem;
  }

  .hero {
    text-align: center;
    padding-top: 6rem;
    padding-bottom: 4rem;
    min-height: auto;
    display: block;
    /* Disable flex on parent to allow natural flow */
  }

  .hero__title {
    font-size: 3rem;
  }

  .hero__content {
    margin: 0 auto;
  }

  .hero__actions {
    justify-content: center;
  }

  .image-wrapper {
    max-width: 350px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .hero__title {
    font-size: 2.5rem;
  }

  .btn {
    width: auto;
    min-width: 160px;
    padding: 0.6rem 1.0rem;
    font-size: 0.95rem;
  }

  .hero__actions {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
}

/* MATCH CENTER */
.match-center {
  padding: 4rem 0;
  text-align: center;
  animation: fadeInDown 1s ease-out;
}

/* MATCH CENTER HEADER */
.match-center__header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  /* Max width handled by container now */
}

.carousel-controls {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  background-color: var(--card-bg);
  border: 2px solid var(--accent-color);
  color: var(--text-primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.nav-btn:hover {
  background-color: var(--accent-color);
  color: #fff;
  transform: scale(1.1);
}

.nav-btn:focus {
  outline: none;
}

/* MATCH CAROUSEL */
.matches-carousel {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem 0 3rem 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.matches-carousel::-webkit-scrollbar {
  height: 8px;
}

.matches-carousel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.matches-carousel::-webkit-scrollbar-thumb {
  background: var(--accent-color);
  border-radius: 4px;
}

/* MATCH CARD */
.match-card {
  flex: 0 0 100%;
  /* Show ONLY ONE match at a time */
  min-width: 100%;
  /* Force full width */
  scroll-snap-align: center;
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 800px;
  /* Limit width on desktop */
  margin: 0 auto;
  /* Center the card itself if needed, though flex container handles it */
}

@media (min-width: 1024px) {
  .matches-carousel {
    justify-content: flex-start;
    /* Maintain scroll flow */
  }
}

.match-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
}

/* Dark mode adjustments for card */
:root.dark .match-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.team__logo {
  height: 80px;
  width: auto;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.placeholder-logo {
  height: 80px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #ccc;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}

.team__name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

/* VS AREA */
.match-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
}

.vs-badge {
  font-size: 2rem;
  font-weight: 900;
  color: var(--bg-primary);
  /* Text checks contrast against ball/circle */
  background-color: var(--text-primary);
  /* Inverted */
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.match-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.match-date {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent-color);
}

/* RESPONSIVE MATCH CENTER */
@media (max-width: 768px) {
  .match-card {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }

  .team {
    width: 100%;
    flex-direction: column;
    /* Ensure teams stack vertically */
  }

  /* Check responsiveness for match content inside card */
  .match-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .match-center__header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .carousel-controls {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .match-info {
    order: 0;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* LATEST NEWS SECTION */
.latest-news {
  padding: 4rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
}

.view-all-link {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
}

.view-all-link:hover {
  transform: translateX(5px);
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.news-card {
  background-color: var(--card-bg);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

:root.dark .news-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.news-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.news-card__image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.news-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.news-card:hover .news-card__image img {
  transform: scale(1.1);
}

.news-date {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--accent-color);
  color: #fff;
  padding: 0.25rem 0.8rem;
  border-radius: 5px;
  font-weight: 700;
  font-size: 0.8rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.news-card__content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.news-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.news-excerpt {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  display: -webkit-box;
  /* Ellipsis for multi-line */
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more {
  color: var(--accent-color);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: auto;
  /* Push to bottom if height fixed, though flexible here */
  display: inline-block;
}

.read-more:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
    /* Stack on mobile */
    max-width: 400px;
    margin: 0 auto;
  }
}



/* VALUES SECTION */
.values-section {
  padding: 5rem 0;
  background-color: var(--bg-secondary);
  /* Slight contrast background */
  position: relative;
}

.text-center {
  text-align: center;
}

.text-center {
  text-align: center;
}

/* .container handles width now */

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-top: 3rem;
}

.value-card {
  text-align: center;
  padding: 2rem;
  background: var(--bg-primary);
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.5s ease-out;
  /* Default transition */
  border: 1px solid rgba(0, 0, 0, 0.03);

  /* Start hidden state */
  opacity: 0;
  transform: translateY(40px);
}

/* Visible state triggered by JS */
.values-section.is-visible .value-card {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered transition delays */
.values-section.is-visible .value-card:nth-child(1) {
  transition-delay: 0.1s;
}

.values-section.is-visible .value-card:nth-child(2) {
  transition-delay: 0.3s;
}

.values-section.is-visible .value-card:nth-child(3) {
  transition-delay: 0.5s;
}

:root.dark .value-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--card-bg);
}

/* Hover effect - override transform but keep it smooth */
.value-card:hover {
  transform: translateY(-10px) !important;
  /* Force hover lift even if transition is active */
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* Fast response for hover */
  transition-delay: 0s !important;
  /* No delay on hover */
}

/* Keyframes removed as we use transitions now */

.icon-box {
  width: 80px;
  height: 80px;
  background-color: rgba(31, 167, 116, 0.1);
  /* Light accent color */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  color: var(--accent-color);
  font-size: 2rem;
  transition: all 0.3s ease;
}

.value-card:hover .icon-box {
  background-color: var(--accent-color);
  color: #fff;
  transform: scale(1.1) rotate(5deg);
}

.value-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.value-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* CATEGORIES PREVIEW */
.categories-preview {
  padding: 5rem 0;
  background-color: var(--bg-primary);
}

.categories-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.category-preview-card {
  background: var(--card-bg);
  padding: 2.5rem 2rem;
  border-radius: 20px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.category-preview-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  border-color: var(--accent-color);
}

:root.dark .category-preview-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-preview-icon {
  width: 70px;
  height: 70px;
  background: rgba(31, 167, 116, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--accent-color);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.category-preview-card:hover .category-preview-icon {
  background: var(--accent-color);
  color: #fff;
  transform: scale(1.1);
}

.category-preview-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.category-preview-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-preview {
  margin-top: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-color);
  text-decoration: none;
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--accent-color);
  border-radius: 50px;
  transition: all 0.3s ease;
}

.btn-preview:hover {
  background: var(--accent-color);
  color: #fff;
}

@media (max-width: 768px) {
  .categories-preview-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .categories-preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
