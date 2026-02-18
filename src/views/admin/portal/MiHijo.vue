<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../store/authStore';
import { useCategoryStore } from '../../../store/categoryStore';
import { useMatchesStore } from '../../../store/matchesStore';
import { usePlayersStore } from '../../../store/playersStore';

const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const matchesStore = useMatchesStore();
const playersStore = usePlayersStore();
const router = useRouter();

// =============================================
// ESTADO DEL PANEL
// =============================================
// Fases: 'loading' | 'inscripcion' | 'panel'
const fase = ref('loading');

const childData = ref(null);
const formData = ref({
  playerName: '',
  birthDate: '',
  categoryId: '',
  position: '',
  notes: ''
});

const isSubmitting = ref(false);
const formError = ref('');

// =============================================
// COMPUTED
// =============================================
const selectedCategory = computed(() =>
  categoryStore.categories.find(c => c.id == formData.value.categoryId)
);

const upcomingMatches = computed(() =>
  matchesStore.getUpcomingMatches?.()?.slice(0, 3) ?? []
);

const paymentStatus = computed(() => {
  return childData.value?.paymentStatus ?? 'Pendiente';
});

const paymentStatusClass = computed(() => {
  const s = paymentStatus.value;
  if (s === 'Al Día') return 'status--ok';
  if (s === 'Pendiente') return 'status--warn';
  return 'status--danger';
});

// =============================================
// INICIALIZACIÓN
// =============================================
onMounted(async () => {
  // Cargar categorías si no están cargadas
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories?.();
  }

  // Cargar hijo registrado desde localStorage
  const key = `child_${authStore.user?.id || authStore.user?.email}`;
  const savedChild = localStorage.getItem(key);
  if (savedChild) {
    childData.value = JSON.parse(savedChild);
    fase.value = 'panel';
  } else {
    fase.value = 'inscripcion';
  }
});

// =============================================
// INSCRIPCIÓN
// =============================================
const handleInscripcion = async () => {
  formError.value = '';

  if (!formData.value.playerName || !formData.value.birthDate || !formData.value.categoryId) {
    formError.value = 'Por favor completa los campos obligatorios (*)';
    return;
  }

  isSubmitting.value = true;

  const cat = selectedCategory.value;
  const newChild = {
    playerName: formData.value.playerName,
    birthDate: formData.value.birthDate,
    categoryId: formData.value.categoryId,
    categoryName: cat?.name ?? 'Sin categoría',
    coach: cat?.coach ?? 'Por asignar',
    schedule: cat?.schedule ?? '',
    time: cat?.time ?? '',
    position: formData.value.position,
    notes: formData.value.notes,
    registrationDate: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
    paymentStatus: 'Pendiente',
    parentName: authStore.user?.name,
    parentEmail: authStore.user?.email
  };

  // 1. Guardar en localStorage vinculado al padre (para el portal)
  const key = `child_${authStore.user?.id || authStore.user?.email}`;
  localStorage.setItem(key, JSON.stringify(newChild));

  // 2. Sincronizar con el backend (para que el admin financiero lo vea)
  try {
    await playersStore.addPlayer({
      name: formData.value.playerName,
      category: cat?.name ?? 'Sin categoría',
      status: 'Pendiente',
      email: authStore.user?.email,
      phone: authStore.user?.phone || '',
      added_by: authStore.user?.id,
      birth_date: formData.value.birthDate,
      position: formData.value.position,
      notes: formData.value.notes
    });
  } catch (e) {
    // Si el backend falla, igual continuamos (ya está en localStorage)
    console.warn('No se pudo sincronizar con el servidor, guardado localmente.');
  }

  childData.value = newChild;
  isSubmitting.value = false;
  fase.value = 'panel';
};

// =============================================
// ACTUALIZAR DATOS
// =============================================
const handleActualizar = () => {
  // Pre-cargar datos actuales en el formulario
  if (childData.value) {
    formData.value.playerName = childData.value.playerName;
    formData.value.birthDate = childData.value.birthDate;
    formData.value.categoryId = childData.value.categoryId;
    formData.value.position = childData.value.position;
    formData.value.notes = childData.value.notes;
  }
  fase.value = 'inscripcion';
};
</script>

<template>
  <div class="portal-padre">

    <!-- ============ LOADING ============ -->
    <div v-if="fase === 'loading'" class="portal-loading">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      <p>Cargando tu portal...</p>
    </div>

    <!-- ============ INSCRIPCIÓN ============ -->
    <div v-else-if="fase === 'inscripcion'" class="inscripcion-view">
      <div class="inscripcion-header">
        <div class="inscripcion-icon">
          <i class="fa-solid fa-futbol"></i>
        </div>
        <div>
          <h1>¡Hola, {{ authStore.user?.name?.split(' ')[0] }}!</h1>
          <p>Tu cuenta está activa. Inscribe a tu hijo para comenzar.</p>
        </div>
      </div>

      <div class="inscripcion-card">
        <h2><i class="fa-solid fa-user-plus"></i> Inscripción del Jugador</h2>
        <p class="inscripcion-subtitle">Completa los datos de tu hijo para inscribirlo en una de nuestras categorías.</p>

        <form @submit.prevent="handleInscripcion" class="inscripcion-form">
          <!-- Nombre y Fecha -->
          <div class="form-row-2">
            <div class="form-field">
              <label>Nombre del Jugador <span class="req">*</span></label>
              <input v-model="formData.playerName" type="text" placeholder="Nombre completo del hijo" required>
            </div>
            <div class="form-field">
              <label>Fecha de Nacimiento <span class="req">*</span></label>
              <input v-model="formData.birthDate" type="date" required>
            </div>
          </div>

          <!-- Categoría -->
          <div class="form-field">
            <label>Categoría <span class="req">*</span></label>
            <div class="category-grid">
              <label
                v-for="cat in categoryStore.categories"
                :key="cat.id"
                :class="['category-option', { selected: formData.categoryId == cat.id }]"
              >
                <input type="radio" :value="cat.id" v-model="formData.categoryId" style="display:none">
                <div class="category-option__icon">
                  <i :class="cat.icon || 'fa-solid fa-users'"></i>
                </div>
                <div class="category-option__info">
                  <strong>{{ cat.name }}</strong>
                  <span>{{ cat.age }}</span>
                  <span class="cat-coach">{{ cat.coach }}</span>
                </div>
                <div v-if="formData.categoryId == cat.id" class="category-option__check">
                  <i class="fa-solid fa-circle-check"></i>
                </div>
              </label>
            </div>
          </div>

          <!-- Detalle de categoría seleccionada -->
          <div v-if="selectedCategory" class="category-detail">
            <i class="fa-solid fa-circle-info"></i>
            <span>
              <strong>{{ selectedCategory.name }}</strong> — Horario: {{ selectedCategory.schedule }}, {{ selectedCategory.time }}
            </span>
          </div>

          <!-- Posición y Notas -->
          <div class="form-row-2">
            <div class="form-field">
              <label>Posición Preferida</label>
              <select v-model="formData.position">
                <option value="">Seleccionar (opcional)</option>
                <option>Portero</option>
                <option>Defensa Central</option>
                <option>Lateral Derecho</option>
                <option>Lateral Izquierdo</option>
                <option>Mediocampista</option>
                <option>Extremo</option>
                <option>Delantero</option>
              </select>
            </div>
            <div class="form-field">
              <label>Información Médica</label>
              <input v-model="formData.notes" type="text" placeholder="Alergias, condiciones, etc.">
            </div>
          </div>

          <!-- Error -->
          <div v-if="formError" class="form-error-msg">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ formError }}
          </div>

          <!-- Submit -->
          <button type="submit" class="btn-inscribir" :disabled="isSubmitting">
            <span v-if="!isSubmitting">
              <i class="fa-solid fa-check-circle"></i> Completar Inscripción
            </span>
            <span v-else>
              <i class="fa-solid fa-circle-notch fa-spin"></i> Procesando...
            </span>
          </button>
        </form>
      </div>
    </div>

    <!-- ============ PANEL PADRE ============ -->
    <div v-else-if="fase === 'panel'" class="panel-view">

      <!-- Bienvenida -->
      <div class="panel-welcome">
        <div class="panel-welcome__text">
          <h1>Bienvenido, <span>{{ authStore.user?.name?.split(' ')[0] }}</span></h1>
          <p>Aquí puedes ver toda la información de <strong>{{ childData.playerName }}</strong></p>
        </div>
        <div class="panel-welcome__badge">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Portal Activo</span>
        </div>
      </div>

      <!-- Ficha del Jugador -->
      <div class="ficha-card">
        <div class="ficha-card__avatar">
          <i class="fa-solid fa-person-running"></i>
        </div>
        <div class="ficha-card__info">
          <h2>{{ childData.playerName }}</h2>
          <div class="ficha-badges">
            <span class="badge-cat">
              <i class="fa-solid fa-tag"></i> {{ childData.categoryName }}
            </span>
            <span v-if="childData.position" class="badge-pos">
              <i class="fa-solid fa-futbol"></i> {{ childData.position }}
            </span>
          </div>
        </div>
        <div class="ficha-card__details">
          <div class="ficha-detail">
            <label>Entrenador</label>
            <strong>{{ childData.coach }}</strong>
          </div>
          <div class="ficha-detail">
            <label>Horario</label>
            <strong>{{ childData.schedule }}</strong>
          </div>
          <div class="ficha-detail">
            <label>Hora</label>
            <strong>{{ childData.time }}</strong>
          </div>
          <div class="ficha-detail">
            <label>Inscripción</label>
            <strong>{{ childData.registrationDate }}</strong>
          </div>
        </div>
      </div>

      <!-- Tarjetas de Estado -->
      <div class="panel-cards">
        <!-- Estado de Pago -->
        <div class="panel-card">
          <div class="panel-card__icon panel-card__icon--finance">
            <i class="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div class="panel-card__content">
            <h3>Estado Financiero</h3>
            <div :class="['panel-card__status', paymentStatusClass]">
              {{ paymentStatus }}
            </div>
            <p>Mensualidad actual</p>
          </div>
          <router-link to="/admin/portal/pagos" class="panel-card__arrow">
            <i class="fa-solid fa-chevron-right"></i>
          </router-link>
        </div>

        <!-- Paz y Salvo -->
        <div class="panel-card">
          <div class="panel-card__icon panel-card__icon--cert">
            <i class="fa-solid fa-certificate"></i>
          </div>
          <div class="panel-card__content">
            <h3>Paz y Salvo</h3>
            <div class="panel-card__status status--ok">Disponible</div>
            <p>Solicitar certificado</p>
          </div>
          <router-link to="/admin/portal/paz-y-salvo" class="panel-card__arrow">
            <i class="fa-solid fa-chevron-right"></i>
          </router-link>
        </div>

        <!-- Próximos Partidos -->
        <div class="panel-card panel-card--wide">
          <div class="panel-card__icon panel-card__icon--match">
            <i class="fa-solid fa-futbol"></i>
          </div>
          <div class="panel-card__content" style="flex:1">
            <h3>Próximos Partidos de {{ childData.categoryName }}</h3>
            <div v-if="upcomingMatches.length" class="matches-mini">
              <div v-for="match in upcomingMatches" :key="match.id" class="match-mini-item">
                <span class="match-teams">{{ match.homeTeam }} vs {{ match.awayTeam }}</span>
                <span class="match-date">{{ match.date }} — {{ match.time }}</span>
              </div>
            </div>
            <p v-else style="color: #aaa; font-size: 0.85rem; margin-top: 0.5rem;">No hay partidos programados próximamente.</p>
          </div>
        </div>
      </div>

      <!-- Botón cambiar inscripción -->
      <div style="text-align: center; margin-top: 2rem;">
        <button @click="handleActualizar" class="btn-reinscribir">
          <i class="fa-solid fa-pen"></i> Actualizar datos del jugador
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import "../../../assets/css/admin/admin.css";

.portal-padre {
  padding: 0;
}

/* Loading */
.portal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  color: var(--admin-text-light);
  font-size: 1.1rem;
}

/* ===================== INSCRIPCIÓN ===================== */
.inscripcion-view {
  max-width: 860px;
  margin: 0 auto;
}

.inscripcion-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--admin-sidebar), #1fa774);
  border-radius: 16px;
  color: white;
}

.inscripcion-icon {
  width: 64px;
  height: 64px;
  min-width: 64px;
  background: rgba(255,255,255,0.15);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.inscripcion-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.inscripcion-header p {
  opacity: 0.85;
  font-size: 0.95rem;
}

.inscripcion-card {
  background: var(--admin-card);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--admin-border);
  box-shadow: var(--admin-card-shadow);
}

.inscripcion-card h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--admin-accent);
}

.inscripcion-subtitle {
  color: var(--admin-text-light);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.inscripcion-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.form-field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--admin-text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.5rem;
}

.req { color: #e74c3c; }

.form-field input,
.form-field select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid var(--admin-border);
  border-radius: 10px;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family: inherit;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: var(--admin-accent);
  box-shadow: 0 0 0 3px rgba(31,167,116,0.1);
}

/* Category grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.8rem;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--admin-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--admin-bg);
  position: relative;
}

.category-option:hover {
  border-color: var(--admin-accent);
  background: rgba(31,167,116,0.04);
}

.category-option.selected {
  border-color: var(--admin-accent);
  background: rgba(31,167,116,0.08);
}

.category-option__icon {
  width: 42px;
  height: 42px;
  min-width: 42px;
  background: rgba(31,167,116,0.1);
  color: var(--admin-accent);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.category-option__info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.category-option__info strong {
  font-size: 0.9rem;
}

.category-option__info span {
  font-size: 0.78rem;
  color: var(--admin-text-light);
}

.cat-coach {
  font-style: italic;
}

.category-option__check {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: var(--admin-accent);
  font-size: 1rem;
}

.category-detail {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(31,167,116,0.08);
  border: 1px solid rgba(31,167,116,0.2);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  font-size: 0.88rem;
  color: var(--admin-accent);
}

.form-error-msg {
  background: #fff5f5;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-inscribir {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #0f3d2e, #1fa774);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.btn-inscribir:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(31,167,116,0.3);
}

.btn-inscribir:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===================== PANEL ===================== */
.panel-view {
  max-width: 900px;
  margin: 0 auto;
}

.panel-welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--admin-sidebar), #1fa774);
  border-radius: 16px;
  color: white;
}

.panel-welcome h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.panel-welcome h1 span {
  color: #a8f0d0;
}

.panel-welcome p {
  opacity: 0.85;
  font-size: 0.9rem;
}

.panel-welcome__badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.15);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  white-space: nowrap;
}

/* Ficha */
.ficha-card {
  background: var(--admin-card);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--admin-border);
  box-shadow: var(--admin-card-shadow);
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.ficha-card__avatar {
  width: 90px;
  height: 90px;
  min-width: 90px;
  background: linear-gradient(135deg, #0f3d2e, #1fa774);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  color: white;
}

.ficha-card__info {
  flex: 1;
}

.ficha-card__info h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
}

.ficha-badges {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.badge-cat, .badge-pos {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-cat {
  background: rgba(31,167,116,0.1);
  color: var(--admin-accent);
}

.badge-pos {
  background: rgba(52,152,219,0.1);
  color: #3498db;
}

.ficha-card__details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
  width: 100%;
  padding-top: 1.5rem;
  border-top: 1px solid var(--admin-border);
}

.ficha-detail label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--admin-text-light);
  margin-bottom: 0.3rem;
}

.ficha-detail strong {
  font-size: 0.95rem;
}

/* Panel Cards */
.panel-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.panel-card {
  background: var(--admin-card);
  border-radius: 14px;
  padding: 1.5rem;
  border: 1px solid var(--admin-border);
  box-shadow: var(--admin-card-shadow);
  display: flex;
  align-items: center;
  gap: 1.2rem;
  transition: box-shadow 0.2s;
}

.panel-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

.panel-card--wide {
  grid-column: 1 / -1;
  align-items: flex-start;
}

.panel-card__icon {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.panel-card__icon--finance { background: rgba(52,152,219,0.1); color: #3498db; }
.panel-card__icon--cert { background: rgba(241,196,15,0.1); color: #f1c40f; }
.panel-card__icon--match { background: rgba(31,167,116,0.1); color: var(--admin-accent); }

.panel-card__content h3 {
  font-size: 0.85rem;
  color: var(--admin-text-light);
  margin-bottom: 0.3rem;
}

.panel-card__status {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.status--ok { color: #27ae60; }
.status--warn { color: #f39c12; }
.status--danger { color: #e74c3c; }

.panel-card__content p {
  font-size: 0.78rem;
  color: var(--admin-text-light);
}

.panel-card__arrow {
  margin-left: auto;
  width: 34px;
  height: 34px;
  background: var(--admin-bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--admin-text-light);
  text-decoration: none;
  transition: all 0.2s;
}

.panel-card__arrow:hover {
  background: var(--admin-accent);
  color: white;
}

/* Matches mini */
.matches-mini {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.7rem;
}

.match-mini-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.8rem;
  background: var(--admin-bg);
  border-radius: 8px;
  font-size: 0.85rem;
}

.match-teams { font-weight: 600; }
.match-date { color: var(--admin-text-light); font-size: 0.8rem; }

/* Reinscribir */
.btn-reinscribir {
  background: none;
  border: 1px solid var(--admin-border);
  color: var(--admin-text-light);
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-reinscribir:hover {
  border-color: var(--admin-accent);
  color: var(--admin-accent);
}

/* Responsive */
@media (max-width: 640px) {
  .form-row-2 { grid-template-columns: 1fr; }
  .panel-cards { grid-template-columns: 1fr; }
  .panel-card--wide { grid-column: 1; }
  .ficha-card { flex-direction: column; align-items: center; text-align: center; }
  .ficha-badges { justify-content: center; }
  .panel-welcome { flex-direction: column; gap: 1rem; text-align: center; }
  .inscripcion-header { flex-direction: column; text-align: center; }
}
</style>
