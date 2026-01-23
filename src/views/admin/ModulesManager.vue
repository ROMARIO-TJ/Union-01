<script setup>
import { ref } from 'vue';
import { useGlobalSettingsStore } from '../../store/globalSettingsStore';

const globalSettings = useGlobalSettingsStore();
const showSuccessMessage = ref(false);

const handleToggle = (moduleKey) => {
  globalSettings.toggleModule(moduleKey);
  showSuccessMessage.value = true;
  setTimeout(() => {
    showSuccessMessage.value = false;
  }, 2000);
};

const handleReset = () => {
  if (confirm('¿Estás seguro de que deseas restaurar todos los módulos a su estado por defecto (habilitados)?')) {
    globalSettings.resetToDefaults();
    showSuccessMessage.value = true;
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 2000);
  }
};
</script>

<template>
  <div class="modules-manager">
    <div class="manager-header">
      <div>
        <h1 class="manager-title">
          <i class="fa-solid fa-puzzle-piece"></i>
          Módulos del Sitio
        </h1>
        <p class="manager-subtitle">
          Controla qué módulos están activos en todo el sitio (menú, páginas y secciones)
        </p>
      </div>
      <button @click="handleReset" class="btn-reset">
        <i class="fa-solid fa-rotate-right"></i>
        Restaurar por Defecto
      </button>
    </div>

    <!-- Success Message -->
    <transition name="fade">
      <div v-if="showSuccessMessage" class="success-message">
        <i class="fa-solid fa-check-circle"></i>
        Configuración guardada correctamente
      </div>
    </transition>

    <!-- Info Box -->
    <div class="info-box">
      <i class="fa-solid fa-info-circle"></i>
      <div>
        <strong>Nota:</strong> Los módulos <strong>Inicio</strong>, <strong>El Club</strong> y <strong>Contacto</strong> 
        siempre están activos y no pueden deshabilitarse. Solo puedes controlar los módulos opcionales listados abajo.
      </div>
    </div>

    <!-- Modules Grid -->
    <div class="modules-grid">
      <div 
        v-for="(module, key) in globalSettings.modules" 
        :key="key" 
        class="module-card"
        :class="{ 'module-disabled': !module.enabled, 'module-locked': module.alwaysActive }"
      >
        <div class="module-icon">
          <i :class="module.icon"></i>
        </div>
        
        <div class="module-info">
          <h3 class="module-title">{{ module.label }}</h3>
          <p class="module-description">{{ module.description }}</p>
          
          <div class="module-affects">
            <strong>Afecta:</strong>
            <ul>
              <li v-for="(affect, index) in module.affects" :key="index">{{ affect }}</li>
            </ul>
          </div>
        </div>

        <div class="module-toggle">
          <label v-if="!module.alwaysActive" class="toggle-switch">
            <input 
              type="checkbox" 
              :checked="module.enabled"
              @change="handleToggle(key)"
            >
            <span class="toggle-slider"></span>
          </label>
          <div v-else class="always-active-badge">
            <i class="fa-solid fa-lock"></i>
            Siempre Activo
          </div>
          <span class="toggle-label" :class="{ 'active': module.enabled }">
            {{ module.enabled ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modules-manager {
  padding: 2rem;
  max-width: 1200px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
  flex-wrap: wrap;
}

.manager-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.manager-title i {
  color: var(--accent-color);
}

.manager-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.btn-reset {
  background-color: var(--card-bg);
  color: var(--text-primary);
  border: 2px solid var(--accent-color);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-reset:hover {
  background-color: var(--accent-color);
  color: #fff;
  transform: translateY(-2px);
}

/* Success Message */
.success-message {
  background-color: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Info Box */
.info-box {
  background-color: rgba(59, 130, 246, 0.1);
  border-left: 4px solid #3b82f6;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.info-box i {
  color: #3b82f6;
  font-size: 1.25rem;
  margin-top: 0.2rem;
}

/* Modules Grid */
.modules-grid {
  display: grid;
  gap: 1.5rem;
}

.module-card {
  background-color: var(--card-bg);
  border: 2px solid rgba(0, 0, 0, 0.05);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

:root.dark .module-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.module-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.module-card.module-disabled {
  opacity: 0.6;
}

.module-card.module-locked {
  background-color: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.1);
}

:root.dark .module-card.module-locked {
  background-color: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.module-icon {
  width: 60px;
  height: 60px;
  background: rgba(31, 167, 116, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--accent-color);
  flex-shrink: 0;
}

.module-info {
  flex: 1;
}

.module-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.module-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.module-affects {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.module-affects strong {
  color: var(--text-primary);
}

.module-affects ul {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.module-affects li {
  margin-bottom: 0.25rem;
}

.module-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--accent-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.toggle-label.active {
  color: var(--accent-color);
}

/* Always Active Badge */
.always-active-badge {
  background-color: rgba(156, 163, 175, 0.2);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .modules-manager {
    padding: 1rem;
  }

  .manager-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-reset {
    width: 100%;
    justify-content: center;
  }

  .module-card {
    flex-direction: column;
    text-align: center;
  }

  .module-icon {
    margin: 0 auto;
  }

  .module-toggle {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .manager-title {
    font-size: 1.5rem;
  }
}
</style>
