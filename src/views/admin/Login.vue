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

  const result = await authStore.login(username.value, password.value, 'admin');
  if (!result.success) {
    error.value = result.error;
  } else {
    router.push('/admin');
  }

  loading.value = false;
};
</script>

<template>
  <div class="admin-login-page">
    <!-- Background -->
    <div class="login-bg">
      <div class="login-bg__shape login-bg__shape--1"></div>
      <div class="login-bg__shape login-bg__shape--2"></div>
    </div>

    <div class="login-container">
      <!-- Left: Branding -->
      <div class="login-brand">
        <div class="login-brand__inner">
          <img src="../../assets/img/logosinfondo.png" alt="Logo" class="login-brand__logo">
          <h1 class="login-brand__title">Panel<br>Administrativo</h1>
          <p class="login-brand__subtitle">Sistema de gestión interno del Club Unión Jeguera. Acceso restringido a
            personal autorizado.</p>

          <div class="login-brand__badges">
            <div class="badge">
              <i class="fa-solid fa-newspaper"></i>
              <span>Gestión de Contenido</span>
            </div>
            <div class="badge">
              <i class="fa-solid fa-dollar-sign"></i>
              <span>Control Financiero</span>
            </div>
            <div class="badge">
              <i class="fa-solid fa-users"></i>
              <span>Administración de Jugadores</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Login Form -->
      <div class="login-form-side">
        <div class="login-card">
          <div class="login-card__header">
            <div class="login-card__icon">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h2>Acceso Seguro</h2>
            <p>Ingresa tus credenciales de administrador</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="login-field">
              <label for="username">Usuario</label>
              <div class="login-field__input">
                <i class="fa-solid fa-user"></i>
                <input id="username" v-model="username" type="text" placeholder="Nombre de usuario"
                  autocomplete="username" required>
              </div>
            </div>

            <div class="login-field">
              <label for="password">Contraseña</label>
              <div class="login-field__input">
                <i class="fa-solid fa-lock"></i>
                <input id="password" v-model="password" type="password" placeholder="••••••••"
                  autocomplete="current-password" required>
              </div>
            </div>

            <div v-if="error" class="login-error">
              <i class="fa-solid fa-circle-exclamation"></i>
              {{ error }}
            </div>

            <button type="submit" class="login-btn" :disabled="loading">
              <span v-if="!loading">
                <i class="fa-solid fa-right-to-bracket"></i> Ingresar al Sistema
              </span>
              <span v-else>
                <i class="fa-solid fa-circle-notch fa-spin"></i> Verificando...
              </span>
            </button>
          </form>

          <div class="login-card__footer">
            <router-link to="/" class="login-back-link">
              <i class="fa-solid fa-arrow-left"></i> Volver al sitio principal
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;
  background: #f4f7f6;
}

/* Background decorative shapes */
.login-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.login-bg__shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

.login-bg__shape--1 {
  width: 500px;
  height: 500px;
  background: rgba(31, 167, 116, 0.12);
  top: -150px;
  left: -100px;
}

.login-bg__shape--2 {
  width: 400px;
  height: 400px;
  background: rgba(15, 61, 46, 0.08);
  bottom: -100px;
  right: 5%;
}

/* Layout */
.login-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* Brand Side */
.login-brand {
  flex: 1.2;
  background: linear-gradient(145deg, #0f3d2e 0%, #1a6644 60%, #1fa774 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 3rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.login-brand::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
}

.login-brand::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
}

.login-brand__inner {
  position: relative;
  z-index: 2;
  max-width: 380px;
}

.login-brand__logo {
  width: 90px;
  margin-bottom: 2.5rem;
  filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.2));
}

.login-brand__title {
  font-size: 3.2rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.login-brand__subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.7;
  margin-bottom: 3rem;
}

.login-brand__badges {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.9rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.badge i {
  color: rgba(255, 255, 255, 0.7);
  width: 18px;
  text-align: center;
}

/* Form Side */
.login-form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.login-card__header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-card__icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #0f3d2e, #1fa774);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: white;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 20px rgba(31, 167, 116, 0.3);
}

.login-card__header h2 {
  font-size: 1.7rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.4rem;
}

.login-card__header p {
  color: #888;
  font-size: 0.9rem;
}

/* Form Fields */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.login-field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #555;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.login-field__input {
  position: relative;
  display: flex;
  align-items: center;
}

.login-field__input i {
  position: absolute;
  left: 1rem;
  color: #bbb;
  font-size: 0.9rem;
}

.login-field__input input {
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 2.8rem;
  border: 1.5px solid #eee;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #333;
  background: #fafafa;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.login-field__input input:focus {
  outline: none;
  border-color: #1fa774;
  background: white;
  box-shadow: 0 0 0 4px rgba(31, 167, 116, 0.08);
}

.login-field__input input::placeholder {
  color: #ccc;
}

/* Error */
.login-error {
  background: #fff5f5;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

/* Submit Button */
.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #0f3d2e, #1fa774);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(31, 167, 116, 0.3);
}

.login-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* Footer */
.login-card__footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.login-back-link {
  text-decoration: none;
  color: #aaa;
  font-size: 0.85rem;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.login-back-link:hover {
  color: #1fa774;
}

/* Responsive */
@media (max-width: 900px) {
  .login-brand {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-form-side {
    padding: 1.5rem;
    align-items: flex-start;
    padding-top: 4rem;
  }

  .login-card {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }
}
</style>
