<template>
  <Header v-if="!isAdminRoute" />
  <main class="main-content">
    <router-view />
  </main>
  <BackToTop v-if="!isAdminRoute" />
  <Footer v-if="!isAdminRoute" />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import BackToTop from "./components/BackToTop.vue";

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/admin'));
</script>
