<script setup>
import { ref } from 'vue';
import { useTheme } from '../composables/useTheme';
import { useGlobalSettingsStore } from '../store/globalSettingsStore';

const isMenuOpen = ref(false);
const { isDarkMode, toggleDarkMode } = useTheme();
const globalSettings = useGlobalSettingsStore();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <header :class="{ 'dark': isDarkMode }">
    <!--LOGO-->
    <router-link to="/" class="logo-link">
      <img src="../assets/img/logosinfondo.png" alt="Logo" class="logo-img" />
    </router-link>

    <!--MENU-->
    <nav class="navbar" :class="{ 'active': isMenuOpen }">
      <ul class="navbar__menu">
        <li><router-link to="/" @click="closeMenu">Inicio</router-link></li>
        <li><router-link to="/club" @click="closeMenu">El Club</router-link></li>
        <li v-if="globalSettings.modules.categories.enabled"><router-link to="/categoria"
            @click="closeMenu">Categorias</router-link></li>
        <li v-if="globalSettings.modules.gallery.enabled"><router-link to="/galeria"
            @click="closeMenu">Galeria</router-link></li>
        <li v-if="globalSettings.modules.news.enabled"><router-link to="/noticias"
            @click="closeMenu">Noticias</router-link></li>
        <li><router-link to="/contacto" @click="closeMenu">Contacto</router-link></li>
        <!-- MOBILE THEME TOGGLE (Visible only on mobile) -->
        <li class="mobile-toggle-li">
          <button class="theme-toggle mobile-toggle" @click="toggleDarkMode"
            :title="isDarkMode ? 'Modo Claro' : 'Modo Oscuro'">
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="#ecf0f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="feather feather-sun">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#0f3d2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="feather feather-moon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </li>
      </ul>
    </nav>

    <div class="header-controls">
      <!-- THEME TOGGLE (Desktop only) -->
      <button class="theme-toggle desktop-toggle" @click="toggleDarkMode"
        :title="isDarkMode ? 'Modo Claro' : 'Modo Oscuro'">
        <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="#ecf0f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="#0f3d2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <!-- HAMBURGER ICON -->
      <div class="navbar__toggle" :class="{ 'is-active': isMenuOpen }" @click="toggleMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
    </div>
  </header>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--header-bg);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  /* Subtle shadow for depth */
}

/* Header Controls container */
.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Theme Toggle Button */
.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.3s ease;
}

.theme-toggle:hover {
  transform: rotate(20deg) scale(1.1);
}

.theme-toggle:focus,
.theme-toggle:focus-visible,
.theme-toggle:active {
  outline: none;
  box-shadow: none;
}

.navbar__logo {
  display: flex;
  align-items: center;
}

.logo-link {
  display: inline-block;
  outline: none;
  /* Removes default browser outline */
}

/* Remove Firefox dotted outline */
.logo-link::-moz-focus-inner {
  border: 0;
}

.logo-link:focus,
.logo-link:active,
.logo-link:focus-visible {
  outline: none;
  box-shadow: none;
}

.logo-img {
  height: 60px;
  width: auto;
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 15px rgba(31, 167, 116, 0.8));
}

.navbar__menu {
  list-style: none;
  display: flex;
  gap: 1.5rem;
}

.navbar__menu a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  transition: text-shadow 0.3s ease, color 0.3s ease;
}

.navbar__menu a:hover {
  text-shadow: 0 0 10px rgba(31, 167, 116, 0.8);
}

.navbar__menu a.router-link-active {
  border-bottom: 2px solid var(--accent-color);
}

/* HAMBURGER MENU STYLES */
.navbar__toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.bar {
  display: block;
  width: 25px;
  height: 3px;
  background-color: var(--text-secondary);
  transition: all 0.3s ease, background-color 0.3s ease;
}

/* Hamburger Animation */
.navbar__toggle.is-active .bar:nth-child(2) {
  opacity: 0;
}

.navbar__toggle.is-active .bar:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.navbar__toggle.is-active .bar:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Toggle Button Visibility */
.mobile-toggle-li {
  display: none;
}

.desktop-toggle {
  display: block;
}

/* MOBILE STYLES */
@media (max-width: 768px) {

  /* Show mobile toggle, hide desktop toggle */
  .mobile-toggle-li {
    display: block;
  }

  .desktop-toggle {
    display: none;
  }

  .navbar__toggle {
    display: flex;
  }

  .navbar {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: var(--header-bg);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    /* Hidden by default */
    transform: translateY(-20px);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
  }

  header.dark .navbar {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  }

  .navbar.active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .navbar__menu {
    flex-direction: column;
    align-items: center;
    padding: 2rem 0;
    gap: 2rem;
  }
}
</style>
