<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/authStore';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isLogin = ref(true);

const loginForm = ref({ email: '', password: '' });
const registerForm = ref({
  name: '',
  email: '',
  phone: '',
  idNumber: '',
  password: '',
  confirmPassword: ''
});

const error = ref('');
const loading = ref(false);

const handleLogin = () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = 'Por favor, completa todos los campos';
    return;
  }
  loading.value = true;
  error.value = '';

  const result = authStore.login(loginForm.value.email, loginForm.value.password, 'parent');

  if (result.success) {
    if (route.query.redirect) {
      router.push({
        name: route.query.redirect,
        query: { categoria: route.query.categoria }
      });
    } else {
      router.push('/admin/portal/hijo');
    }
  } else {
    error.value = result.error;
  }
  loading.value = false;
};

const handleRegister = async () => {
  if (!registerForm.value.name || !registerForm.value.email || !registerForm.value.password) {
    error.value = 'Por favor, completa todos los campos obligatorios';
    return;
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  if (registerForm.value.password.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }

  loading.value = true;
  error.value = '';

  const result = await authStore.register({
    name: registerForm.value.name,
    email: registerForm.value.email,
    phone: registerForm.value.phone,
    idNumber: registerForm.value.idNumber,
    password: registerForm.value.password,
    role: 'padre_familia'
  });

  if (result.success) {
    if (route.query.redirect) {
      router.push({
        name: route.query.redirect,
        query: { categoria: route.query.categoria }
      });
    } else {
      router.push('/admin/portal/hijo');
    }
  } else {
    error.value = result.error || 'Error al registrar usuario';
  }
  loading.value = false;
};

const switchTab = (tab) => {
  isLogin.value = tab === 'login';
  error.value = '';
};
</script>

<template>
  <div class="portal-page">
    <!-- Background decorative elements -->
    <div class="portal-bg">
      <div class="bg-circle bg-circle--1"></div>
      <div class="bg-circle bg-circle--2"></div>
      <div class="bg-circle bg-circle--3"></div>
    </div>

    <div class="portal-wrapper">
      <!-- Left: Branding Panel -->
      <div class="portal-brand">
        <div class="brand-inner">
          <router-link to="/" class="back-home">
            <i class="fa-solid fa-arrow-left"></i> Volver al sitio
          </router-link>

          <div class="brand-logo-wrap">
            <img src="../assets/img/logosinfondo.png" alt="Club Logo" class="brand-logo">
          </div>

          <h1 class="brand-title">Portal de<br><span>Padres</span></h1>
          <p class="brand-subtitle">Accede a toda la información deportiva y financiera de tu hijo en un solo lugar.</p>

          <div class="brand-features">
            <div class="brand-feature">
              <div class="feature-icon">
                <i class="fa-solid fa-child-reaching"></i>
              </div>
              <div>
                <strong>Ficha de tu Hijo</strong>
                <p>Categoría, entrenador y próximos partidos</p>
              </div>
            </div>
            <div class="brand-feature">
              <div class="feature-icon">
                <i class="fa-solid fa-receipt"></i>
              </div>
              <div>
                <strong>Estado de Pagos</strong>
                <p>Consulta mensualidades y pagos pendientes</p>
              </div>
            </div>
            <div class="brand-feature">
              <div class="feature-icon">
                <i class="fa-solid fa-certificate"></i>
              </div>
              <div>
                <strong>Paz y Salvo</strong>
                <p>Solicita certificados al instante</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Auth Forms -->
      <div class="portal-form-side">
        <div class="form-card">
          <!-- Tabs -->
          <div class="form-tabs">
            <button :class="['form-tab', { active: isLogin }]" @click="switchTab('login')">
              <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
            </button>
            <button :class="['form-tab', { active: !isLogin }]" @click="switchTab('register')">
              <i class="fa-solid fa-user-plus"></i> Registrarse
            </button>
          </div>

          <!-- LOGIN -->
          <div v-if="isLogin" class="form-body">
            <div class="form-intro">
              <h2>¡Bienvenido de vuelta!</h2>
              <p>Ingresa con tu correo y contraseña</p>
            </div>

            <form @submit.prevent="handleLogin">
              <div class="field">
                <label>Correo Electrónico</label>
                <div class="field-input">
                  <i class="fa-solid fa-envelope"></i>
                  <input v-model="loginForm.email" type="email" placeholder="correo@ejemplo.com" required>
                </div>
              </div>

              <div class="field">
                <label>Contraseña</label>
                <div class="field-input">
                  <i class="fa-solid fa-lock"></i>
                  <input v-model="loginForm.password" type="password" placeholder="••••••••" required>
                </div>
              </div>

              <div v-if="error" class="form-error">
                <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
              </div>

              <button type="submit" class="form-submit" :disabled="loading">
                <span v-if="!loading"><i class="fa-solid fa-right-to-bracket"></i> Ingresar</span>
                <span v-else><i class="fa-solid fa-circle-notch fa-spin"></i> Verificando...</span>
              </button>
            </form>

            <p class="form-switch">
              ¿No tienes cuenta?
              <button @click="switchTab('register')" class="link-btn">Regístrate aquí</button>
            </p>
          </div>

          <!-- REGISTER -->
          <div v-else class="form-body">
            <div class="form-intro">
              <h2>Crear tu cuenta</h2>
              <p>Regístrate para inscribir a tu hijo en el club</p>
            </div>

            <form @submit.prevent="handleRegister">
              <div class="field-row">
                <div class="field">
                  <label>Nombre Completo <span class="required">*</span></label>
                  <input v-model="registerForm.name" type="text" placeholder="Juan Pérez" required>
                </div>
                <div class="field">
                  <label>Cédula / ID <span class="required">*</span></label>
                  <input v-model="registerForm.idNumber" type="text" placeholder="Número de documento">
                </div>
              </div>

              <div class="field">
                <label>Correo Electrónico <span class="required">*</span></label>
                <div class="field-input">
                  <i class="fa-solid fa-envelope"></i>
                  <input v-model="registerForm.email" type="email" placeholder="correo@ejemplo.com" required>
                </div>
              </div>

              <div class="field">
                <label>Teléfono Celular</label>
                <div class="field-input">
                  <i class="fa-solid fa-phone"></i>
                  <input v-model="registerForm.phone" type="tel" placeholder="300 000 0000">
                </div>
              </div>

              <div class="field-row">
                <div class="field">
                  <label>Contraseña <span class="required">*</span></label>
                  <input v-model="registerForm.password" type="password" placeholder="Mín. 6 caracteres" required>
                </div>
                <div class="field">
                  <label>Confirmar <span class="required">*</span></label>
                  <input v-model="registerForm.confirmPassword" type="password" placeholder="Repite la contraseña" required>
                </div>
              </div>

              <div v-if="error" class="form-error">
                <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
              </div>

              <button type="submit" class="form-submit register" :disabled="loading">
                <span v-if="!loading"><i class="fa-solid fa-user-plus"></i> Crear Cuenta</span>
                <span v-else><i class="fa-solid fa-circle-notch fa-spin"></i> Creando cuenta...</span>
              </button>
            </form>

            <p class="form-switch">
              ¿Ya tienes cuenta?
              <button @click="switchTab('login')" class="link-btn">Inicia sesión</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');

.portal-page {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  font-family: 'Poppins', sans-serif;
  position: relative;
  background: #0a1628;
}

/* Animated background */
.portal-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 8s ease-in-out infinite;
}

.bg-circle--1 {
  width: 600px;
  height: 600px;
  background: #1fa774;
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.bg-circle--2 {
  width: 400px;
  height: 400px;
  background: #3498db;
  bottom: -100px;
  right: 10%;
  animation-delay: 3s;
}

.bg-circle--3 {
  width: 300px;
  height: 300px;
  background: #9b59b6;
  top: 40%;
  left: 40%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

/* Layout */
.portal-wrapper {
  display: flex;
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* Brand Side */
.portal-brand {
  flex: 1.1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 3rem 4rem; /* top padding para el header fijo */
  color: white;
}

.brand-inner {
  max-width: 420px;
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  font-size: 0.85rem;
  margin-bottom: 3rem;
  transition: color 0.2s;
}

.back-home:hover {
  color: white;
}

.brand-logo-wrap {
  margin-bottom: 2rem;
}

.brand-logo {
  width: 90px;
  filter: drop-shadow(0 0 30px rgba(31, 167, 116, 0.5));
}

.brand-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.brand-title span {
  background: linear-gradient(135deg, #1fa774, #27ae60);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.7;
  margin-bottom: 3rem;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.brand-feature {
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
}

.feature-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  background: rgba(31, 167, 116, 0.15);
  border: 1px solid rgba(31, 167, 116, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1fa774;
  font-size: 1.1rem;
}

.brand-feature strong {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}

.brand-feature p {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.5);
  margin: 0;
}

/* Form Side */
.portal-form-side {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 6rem 2rem 3rem; /* 6rem top = espacio para el header fijo */
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255,255,255,0.07);
  overflow-y: auto;
  min-height: 100vh;
}

.form-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

/* Tabs */
.form-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.form-tab {
  flex: 1;
  padding: 1.2rem;
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Poppins', sans-serif;
}

.form-tab.active {
  color: #1fa774;
  background: rgba(31, 167, 116, 0.08);
  border-bottom: 2px solid #1fa774;
}

/* Form Body */
.form-body {
  padding: 2rem;
}

.form-intro {
  margin-bottom: 2rem;
}

.form-intro h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.4rem;
}

.form-intro p {
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
}

/* Fields */
.field {
  margin-bottom: 1.2rem;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.required {
  color: #e74c3c;
}

.field-input {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input i {
  position: absolute;
  left: 1rem;
  color: rgba(255,255,255,0.3);
  font-size: 0.9rem;
}

.field-input input,
.field input {
  width: 100%;
  padding: 0.85rem 1rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.field-input input {
  padding-left: 2.8rem;
}

.field-input input:focus,
.field input:focus {
  outline: none;
  border-color: #1fa774;
  background: rgba(31, 167, 116, 0.08);
  box-shadow: 0 0 0 3px rgba(31, 167, 116, 0.1);
}

.field-input input::placeholder,
.field input::placeholder {
  color: rgba(255,255,255,0.2);
}

/* Error */
.form-error {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #ff6b6b;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

/* Submit */
.form-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #1fa774, #27ae60);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.form-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(31, 167, 116, 0.35);
}

.form-submit.register {
  background: linear-gradient(135deg, #2c3e50, #3d5166);
}

.form-submit.register:hover:not(:disabled) {
  box-shadow: 0 12px 30px rgba(44, 62, 80, 0.4);
}

.form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Switch link */
.form-switch {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
}

.link-btn {
  background: none;
  border: none;
  color: #1fa774;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  padding: 0;
  margin-left: 0.3rem;
  transition: color 0.2s;
}

.link-btn:hover {
  color: #27ae60;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 900px) {
  .portal-brand {
    display: none;
  }

  .portal-form-side {
    border-left: none;
    background: #0a1628;
    padding-top: 6rem;
  }
}

@media (max-width: 480px) {
  .portal-form-side {
    padding: 5rem 1rem 2rem; /* top padding para el header */
    align-items: flex-start;
  }

  .form-card {
    border-radius: 16px;
  }

  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
