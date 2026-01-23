<script setup>
import { computed } from 'vue';
import { useNewsStore } from '../../store/newsStore';
import { useMatchesStore } from '../../store/matchesStore';
import { useGalleryStore } from '../../store/galleryStore';
import { useSponsorsStore } from '../../store/sponsorsStore';
import { usePlayersStore } from '../../store/playersStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useContactStore } from '../../store/contactStore';

const newsStore = useNewsStore();
const matchesStore = useMatchesStore();
const galleryStore = useGalleryStore();
const sponsorsStore = useSponsorsStore();
const playersStore = usePlayersStore();
const categoryStore = useCategoryStore();
const contactStore = useContactStore();

const stats = computed(() => [
  {
    name: 'Noticias',
    value: newsStore.news.length,
    icon: 'fa-solid fa-newspaper',
    class: 'news',
    link: '/admin/news'
  },
  {
    name: 'Partidos',
    value: matchesStore.matches.length,
    icon: 'fa-solid fa-futbol',
    class: 'matches',
    link: '/admin/matches'
  },
  {
    name: 'Tabla Posiciones',
    value: 'Gestión',
    icon: 'fa-solid fa-list-ol',
    class: 'matches', /* Reusing matches class for color consistency or add custom one */
    link: '/admin/standings'
  },
  {
    name: 'Jugadores',
    value: playersStore.players.length,
    icon: 'fa-solid fa-users',
    class: 'players',
    link: '/admin/players'
  },
  {
    name: 'Galería',
    value: galleryStore.photos.length,
    icon: 'fa-solid fa-images',
    class: 'gallery',
    link: '/admin/gallery'
  },
  {
    name: 'Patrocinadores',
    value: sponsorsStore.sponsors.length,
    icon: 'fa-solid fa-handshake',
    class: 'sponsors',
    link: '/admin/sponsors'
  },
  {
    name: 'Categorías',
    value: categoryStore.categories.length,
    icon: 'fa-solid fa-tags',
    class: 'categories',
    link: '/admin/categories'
  },
  {
    name: 'Club',
    value: 'Gestión',
    icon: 'fa-solid fa-shield-halved',
    class: 'club',
    link: '/admin/club'
  },
  {
    name: 'Contacto',
    value: 'Gestión',
    icon: 'fa-solid fa-address-book',
    class: 'contact',
    link: '/admin/contact'
  },
  {
    name: 'Footer',
    value: 'Gestión',
    icon: 'fa-solid fa-window-maximize',
    class: 'footer',
    link: '/admin/footer'
  },
]);

const latestNews = computed(() => newsStore.getLatestNews(5));
const upcomingMatches = computed(() => matchesStore.getUpcomingMatches().slice(0, 5));
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-stats-grid">
      <router-link v-for="stat in stats" :key="stat.name" :to="stat.link" class="stat-card"
        style="text-decoration: none; color: inherit;">
        <div class="stat-icon" :class="stat.class">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stat.name }}</h3>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </router-link>
    </div>

    <div class="dashboard-secondary-grid">
      <!-- Ultimas Noticias -->
      <div class="admin-table-wrapper">
        <div class="admin-modal-header"
          style="background: rgba(0,0,0,0.02); border-bottom: 2px solid var(--admin-border);">
          <h2 style="font-size: 1.1rem; font-weight: 700;">Últimas Noticias</h2>
          <router-link to="/admin/news" class="btn-admin"
            style="font-size: 0.8rem; padding: 0.4rem 0.8rem; background: var(--admin-accent); color: white; text-decoration: none; border-radius: 4px;">Ver
            todas</router-link>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in latestNews" :key="item.id">
              <td>{{ item.title }}</td>
              <td>{{ item.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Próximos Partidos -->
      <div class="admin-table-wrapper">
        <div class="admin-table-container">
          <div class="admin-modal-header"
            style="background: rgba(0,0,0,0.02); border-bottom: 2px solid var(--admin-border);">
            <h2 style="font-size: 1.1rem; font-weight: 700;">Próximos Encuentros</h2>
            <router-link to="/admin/matches" class="btn-admin"
              style="font-size: 0.8rem; padding: 0.4rem 0.8rem; background: #3498db; color: white; text-decoration: none; border-radius: 4px;">Ver
              todos</router-link>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Partido</th>
                <th>Fecha/Hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="match in upcomingMatches" :key="match.id">
                <td>{{ match.homeTeam }} vs {{ match.awayTeam }}</td>
                <td>{{ match.date }} - {{ match.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
