<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../store/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const logout = () => {
  const isParent = authStore.user?.role === 'padre_familia';
  authStore.logout();

  if (isParent) {
    router.push('/portal-padres');
  } else {
    router.push('/admin/login');
  }
};

const closeMenuOnMobile = () => {
  if (window.innerWidth <= 768) {
    isMobileMenuOpen.value = false;
  }
};

const navigation = computed(() => {
  const role = authStore.user?.role;
  const items = [];

  // Dashboard central
  items.push({ name: 'Dashboard', to: '/admin', icon: 'fa-solid fa-chart-line' });

  // Gestión de Contenido (Admin General o Especializado)
  if (role === 'admin_contenido' || !role) {
    items.push(
      { name: 'Noticias', to: '/admin/news', icon: 'fa-solid fa-newspaper' },
      { name: 'Partidos', to: '/admin/matches', icon: 'fa-solid fa-futbol' },
      { name: 'Tabla Posiciones', to: '/admin/standings', icon: 'fa-solid fa-list-ol' },
      { name: 'Categorías', to: '/admin/categories', icon: 'fa-solid fa-tags' },
      { name: 'Galería', to: '/admin/gallery', icon: 'fa-solid fa-images' },
      { name: 'Patrocinadores', to: '/admin/sponsors', icon: 'fa-solid fa-handshake' },
      { name: 'Club', to: '/admin/club', icon: 'fa-solid fa-shield-halved' },
      { name: 'Configuración Home', to: '/admin/home-settings', icon: 'fa-solid fa-home' },
      { name: 'Módulos del Sitio', to: '/admin/modules', icon: 'fa-solid fa-puzzle-piece' },
      { name: 'Contacto', to: '/admin/contact', icon: 'fa-solid fa-address-book' },
      { name: 'Footer', to: '/admin/footer', icon: 'fa-solid fa-window-maximize' }
    );
  }

  // Administración Financiera
  if (role === 'admin_financiero') {
    items.push(
      { name: 'Pagos', to: '/admin/financiero/pagos', icon: 'fa-solid fa-credit-card' },
      { name: 'Paz y Salvo', to: '/admin/financiero/paz-y-salvo', icon: 'fa-solid fa-file-invoice' },
      { name: 'Reportes', to: '/admin/financiero/reportes', icon: 'fa-solid fa-chart-pie' },
      { name: 'Gestión Jugadores', to: '/admin/players', icon: 'fa-solid fa-users-gear' },
      { name: 'Categorías', to: '/admin/categories', icon: 'fa-solid fa-tags' }
    );
  }

  // Portal de Padres
  if (role === 'padre_familia') {
    items.push(
      { name: 'Mi Hijo', to: '/admin/portal/hijo', icon: 'fa-solid fa-child' },
      { name: 'Mis Pagos', to: '/admin/portal/pagos', icon: 'fa-solid fa-wallet' },
      { name: 'Paz y Salvo', to: '/admin/portal/paz-y-salvo', icon: 'fa-solid fa-file-circle-check' }
    );
  }

  items.push({ name: 'Ver Sitio Web', to: '/', icon: 'fa-solid fa-globe' });

  return items;
});
</script>

<template>
  <div class="admin-layout">
    <!-- Overlay backdrop for mobile -->
    <div v-if="isMobileMenuOpen" class="admin-overlay" @click="toggleMobileMenu"></div>

    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'is-active': isMobileMenuOpen }">
      <div class="admin-sidebar__logo">
        <img src="../../assets/img/logosinfondo.png" alt="Unión Jeguera">
        <button class="menu-close-btn" @click="toggleMobileMenu">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <nav class="admin-sidebar__menu">
        <router-link v-for="item in navigation" :key="item.name" :to="item.to" class="admin-nav-item"
          :exact="item.to === '/admin'" @click="closeMenuOnMobile">
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="admin-sidebar__footer">
        <button @click="logout" class="btn-logout">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="admin-main">
      <header class="admin-header">
        <div class="admin-header__left">
          <button class="mobile-toggle" @click="toggleMobileMenu">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class="admin-header__title">
            <h1>Panel de {{ authStore.user?.name || 'Administración' }}</h1>
          </div>
        </div>
        <div class="admin-header__user">
          <span class="welcome-text">Bienvenido, <strong>{{ authStore.user?.username }}</strong></span>
          <div class="user-avatar-mini">
            <i class="fa-solid fa-user-shield"></i>
          </div>
        </div>
      </header>

      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style>
@import "../../assets/css/admin/admin.css";
</style>
