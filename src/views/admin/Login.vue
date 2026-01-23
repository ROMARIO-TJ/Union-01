<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/authStore';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Por favor, completa todos los campos';
    return;
  }

  loading.value = true;
  error.value = '';

  const result = authStore.login(username.value, password.value);

  if (result.success) {
    router.push('/admin');
  } else {
    error.value = result.error;
  }

  loading.value = false;
};
</script>

<template>
  <div class="admin-login-page">
    <div class="login-card">
      <div class="login-logo-container">
        <img src="../../assets/img/logosinfondo.png" alt="Logo" class="login-logo">
      </div>
      <h2>Acceso Admin</h2>
      <p>Ingresa tus credenciales para continuar</p>

      <form class="form-padre" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input type="text" id="username" v-model="username" class="form-control" placeholder="admin" required>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="password" class="form-control" placeholder="••••••••" required>
        </div>

        <div v-if="error" class="error-msg">
          <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div style="margin-top: 2rem; font-size: 0.8rem; color: #888;">
        <router-link to="/" style="color: #121212; text-decoration: none;">
          <i class="fa-solid fa-house"></i> Volver al sitio principal
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../assets/css/admin/admin.css";
</style>
