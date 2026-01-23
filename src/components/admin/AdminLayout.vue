<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/authStore';

const router = useRouter();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const logout = () => {
  authStore.logout();
  router.push('/admin/login');
};

const closeMenuOnMobile = () => {
  if (window.innerWidth <= 768) {
    isMobileMenuOpen.value = false;
  }
};
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
        <router-link to="/admin" class="admin-nav-item" exact @click="closeMenuOnMobile">
          <i class="fa-solid fa-chart-line"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/admin/news" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-newspaper"></i>
          <span>Noticias</span>
        </router-link>

        <router-link to="/admin/matches" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-futbol"></i>
          <span>Partidos</span>
        </router-link>

        <router-link to="/admin/standings" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-list-ol"></i>
          <span>Tabla Posiciones</span>
        </router-link>

        <router-link to="/admin/players" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-users"></i>
          <span>Jugadores</span>
        </router-link>

        <router-link to="/admin/categories" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-tags"></i>
          <span>Categorías</span>
        </router-link>

        <router-link to="/admin/gallery" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-images"></i>
          <span>Galería</span>
        </router-link>

        <router-link to="/admin/sponsors" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-handshake"></i>
          <span>Patrocinadores</span>
        </router-link>

        <router-link to="/admin/club" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Club</span>
        </router-link>

        <router-link to="/admin/home-settings" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-home"></i>
          <span>Configuración Home</span>
        </router-link>

        <router-link to="/admin/modules" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-puzzle-piece"></i>
          <span>Módulos del Sitio</span>
        </router-link>

        <router-link to="/admin/contact" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-address-book"></i>
          <span>Contacto</span>
        </router-link>

        <router-link to="/admin/footer" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-window-maximize"></i>
          <span>Footer</span>
        </router-link>

        <router-link to="/" class="admin-nav-item" @click="closeMenuOnMobile">
          <i class="fa-solid fa-globe"></i>
          <span>Ver Sitio Web</span>
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
            <h1>Panel de Administración</h1>
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
