<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNewsStore } from '../../store/newsStore';
import { useMatchesStore } from '../../store/matchesStore';
import { useGalleryStore } from '../../store/galleryStore';
import { useSponsorsStore } from '../../store/sponsorsStore';
import { usePlayersStore } from '../../store/playersStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useAuthStore } from '../../store/authStore';

const router = useRouter();
const newsStore = useNewsStore();
const matchesStore = useMatchesStore();
const galleryStore = useGalleryStore();
const sponsorsStore = useSponsorsStore();
const playersStore = usePlayersStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();

const role = computed(() => authStore.user?.role);

const isCompetitive = (categoryName) => {
  if (!categoryName) return false;
  const n = categoryName.toLowerCase();
  if (n.includes('escuela')) return false;
  if (n.includes('primera')) return true;
  const sub = n.match(/sub[\s-]*(\d+)/);
  if (sub && parseInt(sub[1]) >= 13) return true;
  return false;
};

const stats = computed(() => {
  const items = [];

  // Stats para Admin Contenido
  if (role.value === 'admin_contenido' || !role.value) {
    items.push(
      { name: 'Noticias', value: newsStore.news.length, icon: 'fa-solid fa-newspaper', class: 'news', link: '/admin/news' },
      { name: 'Partidos', value: matchesStore.matches.length, icon: 'fa-solid fa-futbol', class: 'matches', link: '/admin/matches' },
      { name: 'Categorías', value: categoryStore.categories.length, icon: 'fa-solid fa-tags', class: 'categories', link: '/admin/categories' }
    );
  }

  // Stats para Admin Financiero o Admin General
  if (role.value === 'admin_financiero' || role.value === 'admin') {
    const paidPlayers = playersStore.players.filter(p => p.paymentStatus === 'Al Día');
    const pendingPlayers = playersStore.players.filter(p => p.paymentStatus === 'Pendiente' || !p.paymentStatus);

    // Cálculo dinámico según categoría
    const totalCollected = paidPlayers.reduce((acc, p) => {
      const amount = isCompetitive(p.category) ? 20000 : 50000;
      return acc + amount;
    }, 0);

    items.push(
      { name: 'Pagos Mes', value: `$${totalCollected.toLocaleString()}`, icon: 'fa-solid fa-dollar-sign', class: 'news', link: '/admin/financiero/pagos' },
      { name: 'Pendientes', value: pendingPlayers.length, icon: 'fa-solid fa-clock', class: 'club', link: '/admin/financiero/pagos' },
      { name: 'Paz y Salvos', value: paidPlayers.length, icon: 'fa-solid fa-file-circle-check', class: 'matches', link: '/admin/financiero/paz-y-salvo' },
      { name: 'Jugadores', value: playersStore.players.length, icon: 'fa-solid fa-users', class: 'players', link: '/admin/players' },
      { name: 'Categorías', value: categoryStore.categories.length, icon: 'fa-solid fa-tags', class: 'categories', link: '/admin/categories' }
    );
  }

  return items;
});

const latestNews = computed(() => newsStore.getLatestNews(5));
const upcomingMatches = computed(() => matchesStore.getUpcomingMatches().slice(0, 5));

// Redirigir padres directamente a su portal
onMounted(() => {
  if (role.value === 'padre_familia') {
    router.replace('/admin/portal/hijo');
  } else {
    // Cargar datos iniciales para admin
    playersStore.initPlayers?.();
  }
});
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


    <div v-if="role === 'admin_contenido'" class="dashboard-secondary-grid">
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
