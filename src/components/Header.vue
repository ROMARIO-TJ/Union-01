<script setup>
import { ref, computed } from 'vue';
import { useTheme } from '../composables/useTheme';
import { useGlobalSettingsStore } from '../store/globalSettingsStore';
import { useAuthStore } from '../store/authStore';

const isMenuOpen = ref(false);
const { isDarkMode, toggleDarkMode } = useTheme();
const globalSettings = useGlobalSettingsStore();
const authStore = useAuthStore();

const isParentLoggedIn = computed(() => authStore.isAuthenticated && authStore.user?.role === 'padre_familia');
const parentName = computed(() => authStore.user?.name?.split(' ')[0] || 'Mi Portal');

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <header class="glass-nav" :class="{ 'dark': isDarkMode }">
    <div class="header-container">
      <!-- BRANDING -->
      <router-link to="/" class="brand-link">
        <div class="brand-logo-container">
          <img src="../assets/img/logosinfondo.png" alt="Unión Jaguera Logo" class="header-logo-img" />
        </div>
        <span class="brand-text">Unión Jaguera</span>
      </router-link>

      <!-- MENU -->
      <nav class="navbar" :class="{ 'active': isMenuOpen }">
        <ul class="navbar__menu">
          <li><router-link to="/" @click="closeMenu">Inicio</router-link></li>
          <li v-if="globalSettings.modules.club?.enabled !== false"><router-link to="/club" @click="closeMenu">El
              Club</router-link></li>
          <li v-if="globalSettings.modules.categories.enabled">
            <router-link to="/categoria" @click="closeMenu">Categorías</router-link>
          </li>
          <li v-if="globalSettings.modules.news.enabled"><router-link to="/noticias"
              @click="closeMenu">Noticias</router-link></li>
          <li><router-link to="/contacto" @click="closeMenu">Contacto</router-link></li>
        </ul>
      </nav>

      <div class="header-actions">
        <!-- THEME TOGGLE -->
        <button class="action-btn theme-toggle" @click="toggleDarkMode"
          :title="isDarkMode ? 'Modo Claro' : 'Modo Oscuro'">
          <span class="material-symbols-outlined">
            {{ isDarkMode ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>

        <!-- Portal Padres CTA -->
        <router-link v-if="!isParentLoggedIn" to="/portal-padres" class="btn btn-primary btn-inscribe">
          <i class="fa-solid fa-user-shield" style="margin-right: 0.4rem;"></i> Portal Padres
        </router-link>
        <router-link v-else to="/admin/portal/hijo" class="btn btn-primary btn-inscribe">
          <i class="fa-solid fa-child" style="margin-right: 0.4rem;"></i> {{ parentName }}
        </router-link>

        <!-- HAMBURGER ICON -->
        <div class="navbar__toggle" :class="{ 'is-active': isMenuOpen }" @click="toggleMenu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.glass-nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  border-bottom: 1px solid rgba(17, 212, 66, 0.1);
  background: var(--header-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  height: 80px;
  display: flex;
  align-items: center;
  transition: var(--transition);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* BRANDING */
.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
}

.brand-logo-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.header-logo-img {
  height: 100%;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(17, 212, 66, 0.3));
}

.brand-link:hover .header-logo-img {
  transform: scale(1.1) rotate(-5deg);
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  font-style: italic;
}

/* NAVBAR */
.navbar__menu {
  display: flex;
  list-style: none;
  gap: 2.5rem;
  align-items: center;
}

.navbar__menu a {
  text-decoration: none;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  transition: var(--transition);
}

.navbar__menu a:hover {
  color: var(--primary-color);
}

.navbar__menu a.router-link-active {
  color: var(--primary-color);
}

/* ACTIONS */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.action-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
  border-radius: 9999px;
  transition: var(--transition);
}

.action-btn:hover {
  background: rgba(17, 212, 66, 0.1);
  color: var(--primary-color);
}

.btn-inscribe {
  display: inline-block;
  padding: 0.625rem 1.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 700 !important;
  border-radius: 0.25rem !important;
  text-decoration: none;
  transition: all 0.3s;
}

/* HAMBURGER */
.navbar__toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
}

.bar {
  width: 25px;
  height: 2px;
  background-color: var(--text-primary);
  transition: var(--transition);
}

.navbar__toggle.is-active .bar:nth-child(2) {
  opacity: 0;
}

.navbar__toggle.is-active .bar:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.navbar__toggle.is-active .bar:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 992px) {
  .navbar__menu {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .navbar__toggle {
    display: flex;
  }

  .navbar {
    position: absolute;
    top: 80px;
    left: 0;
    width: 100%;
    background: var(--bg-primary);
    padding: 2rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-10px);
    opacity: 0;
    pointer-events: none;
    transition: var(--transition);
  }

  .navbar.active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .navbar__menu {
    flex-direction: column;
    gap: 1.5rem;
  }

  .btn-inscribe {
    display: none;
  }
}
</style>
