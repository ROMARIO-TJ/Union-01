<template>
  <!-- LOADER GLOBAL -->
  <div v-if="loading" class="loader-wrapper">
    <div class="loader-card">
      <div class="loader-ring"></div>
      <p class="loader-text">Cargando sistema...</p>
    </div>
  </div>

  <!-- APP -->
  <div v-else>
    <Header v-if="!isAdminRoute" />

    <main class="main-content">
      <router-view />
    </main>

    <BackToTop v-if="!isAdminRoute" />
    <Footer v-if="!isAdminRoute" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import Header from "./components/Header.vue"
import Footer from "./components/Footer.vue"
import BackToTop from "./components/BackToTop.vue"

const route = useRoute()
const loading = ref(true)

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// Loader inicial al entrar a la web
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 600) // ajusta: 400–800ms recomendado
})

// Loader en cada cambio de ruta
watch(
  () => route.fullPath,
  () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 500)
  }
)
</script>

<style scoped>
/* ===== LOADER ===== */
.loader-wrapper {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top, #0f2a18, #021705);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loader-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
  border-radius: 18px;
  padding: 32px 40px;
  text-align: center;
  box-shadow: 0 0 40px rgba(34, 197, 94, 0.25);
}

.loader-ring {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 5px solid rgba(255, 255, 255, 0.2);
  border-top-color: #22c55e;
  animation: spin 1s linear infinite;
  margin: 0 auto 14px;
}

.loader-text {
  color: #e5e7eb;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
