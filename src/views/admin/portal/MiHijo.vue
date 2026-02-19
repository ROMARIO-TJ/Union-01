<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../../store/authStore';
import { useCategoryStore } from '../../../store/categoryStore';
import { useMatchesStore } from '../../../store/matchesStore';
import { usePlayersStore } from '../../../store/playersStore';
import { useFileUpload } from '../../../composables/useFileUpload';

const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const matchesStore = useMatchesStore();
const playersStore = usePlayersStore();
const { uploadFile } = useFileUpload();
const route = useRoute();
const router = useRouter();

// =============================================
// ESTADO DEL PANEL
// =============================================
// Fases: 'loading' | 'inscripcion' | 'panel'
const fase = ref('loading');
const currentStep = ref(1);

const children = ref([]);
const selectedChildIndex = ref(0);
const childData = computed(() => children.value[selectedChildIndex.value] || null);

const calculatedAge = ref('');
const formData = ref({
  playerName: '',
  fullName: '',
  birthDate: '',
  age: '',
  categoryId: '',
  category: '',
  position: '',
  notes: '',
  parentName: '',
  phone: '',
  email: '',
  address: '',
  photo: '',
  dniImage: '',
  documentType: '',
  medicalCertificate: ''
});

const isSubmitting = ref(false);
const formError = ref('');

// File Refs
const fileProfile = ref(null);
const fileDni = ref(null);
const fileMedical = ref(null);
const documentLabel = ref('Documento de Identidad');
const documentLabelShort = ref('Documento');

// =============================================
// COMPUTED
// =============================================
const selectedCategory = computed(() =>
  categoryStore.categories.find(c => c.id == formData.value.categoryId || c.name === formData.value.category)
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
// INITIALIZATION
// =============================================
onMounted(async () => {
  // Pre-fill parent data
  if (authStore.parentUser) {
    formData.value.parentName = authStore.parentUser.name || '';
    formData.value.email = authStore.parentUser.email || '';
    formData.value.phone = authStore.parentUser.phone || '';
  }

  // Load categories
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories?.();
  }

  // Handle category from query
  if (route.query.categoria) {
    const catName = route.query.categoria;
    const cat = categoryStore.categories.find(c => c.name === catName);
    if (cat) {
      formData.value.categoryId = cat.id;
    }
  }

  // Check for saved children
  const key = `children_${authStore.parentUser?.id || authStore.parentUser?.email}`;
  const savedChildren = localStorage.getItem(key);
  if (savedChildren) {
    children.value = JSON.parse(savedChildren);
  }

  // SYNC WITH SERVER: Fetch official data
  if (authStore.parentUser?.email) {
    const serverChildren = await playersStore.fetchPlayersByParent(authStore.parentUser.email);
    if (serverChildren && serverChildren.length > 0) {
      // Map server data to match our portal structure
      children.value = serverChildren.map(p => {
        const cat = categoryStore.categories.find(c => c.name === p.category || c.id == p.categoryId);
        return {
          id: p.id,
          playerName: p.name || p.fullName,
          birthDate: p.birthDate,
          categoryId: p.categoryId,
          categoryName: p.category || cat?.name || 'Sin categoría',
          coach: cat?.coach || 'Por asignar',
          schedule: cat?.schedule || '',
          time: cat?.time || '',
          position: p.position || '',
          notes: p.notes || '',
          registrationDate: p.registrationDate || 'Reciente',
          paymentStatus: p.paymentStatus || 'Pendiente',
          parentName: p.parentName || '',
          parentEmail: p.parentEmail || authStore.parentUser.email,
          photo: p.photo || ''
        };
      });
      // Update local cache
      localStorage.setItem(key, JSON.stringify(children.value));
    }
  }

  // Determine initial phase
  if (route.query.categoria) {
    fase.value = 'inscripcion';
  } else {
    fase.value = children.value.length > 0 ? 'panel' : 'inscripcion';
  }
});

// =============================================
// FORM HELPERS
// =============================================
const calculateAge = () => {
  if (!formData.value.birthDate) return;
  const birth = new Date(formData.value.birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  calculatedAge.value = age + ' años';
  formData.value.age = age;

  if (age < 7) {
    documentLabel.value = 'Registro Civil de Nacimiento';
    documentLabelShort.value = 'Registro';
    formData.value.documentType = 'Registro Civil';
  } else if (age < 18) {
    documentLabel.value = 'Tarjeta de Identidad';
    documentLabelShort.value = 'T.I.';
    formData.value.documentType = 'Tarjeta Identidad';
  } else {
    documentLabel.value = 'Cédula de Ciudadanía';
    documentLabelShort.value = 'Cédula';
    formData.value.documentType = 'Cédula';
  }
};

const triggerFile = (type) => {
  if (type === 'profile') fileProfile.value.click();
  else if (type === 'dni') fileDni.value.click();
  else if (type === 'medical') fileMedical.value.click();
};

const handleFile = async (event, field) => {
  const file = event.target.files[0];
  if (!file) return;

  const fileExt = file.name.split('.').pop().toLowerCase();
  if (field === 'photo') {
    if (!['jpg', 'jpeg'].includes(fileExt)) {
      alert('Por favor, selecciona solo archivos JPG para la foto.');
      event.target.value = '';
      return;
    }
  } else {
    if (fileExt !== 'pdf') {
      alert('Por favor, selecciona solo archivos PDF para los documentos.');
      event.target.value = '';
      return;
    }
  }

  try {
    const url = await uploadFile(file);
    formData.value[field] = url;
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Error al cargar el archivo');
  }
};

const removeFile = (field) => {
  formData.value[field] = '';
  if (field === 'photo') fileProfile.value.value = '';
  else if (field === 'dniImage') fileDni.value.value = '';
  else if (field === 'medicalCertificate') fileMedical.value.value = '';
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const isEditing = ref(false);

// =============================================
// RESET FORM
// =============================================
const resetForm = () => {
  isEditing.value = false;
  currentStep.value = 1;
  formData.value.fullName = '';
  formData.value.playerName = '';
  formData.value.birthDate = '';
  formData.value.categoryId = '';
  formData.value.position = '';
  formData.value.notes = '';
  formData.value.photo = '';
  formData.value.dniImage = '';
  formData.value.medicalCertificate = '';
  calculatedAge.value = '';

  if (authStore.parentUser) {
    formData.value.parentName = authStore.parentUser.name || '';
    formData.value.email = authStore.parentUser.email || '';
    formData.value.phone = authStore.parentUser.phone || '';
  }
};

// =============================================
// INSCRIPCIÓN FINAL
// =============================================
const handleInscripcion = async () => {
  formError.value = '';

  // Final Validation
  if (!formData.value.fullName || !formData.value.birthDate || !formData.value.categoryId) {
    formError.value = 'Faltan datos obligatorios. Revisa los pasos anteriores.';
    currentStep.value = 1;
    return;
  }

  if (!formData.value.photo || !formData.value.dniImage || !formData.value.medicalCertificate) {
    formError.value = 'Debes subir todos los documentos obligatorios en el Paso 3.';
    currentStep.value = 3;
    return;
  }

  isSubmitting.value = true;

  const cat = selectedCategory.value;
  formData.value.category = cat?.name || '';

  const childRegistry = {
    playerName: formData.value.fullName,
    birthDate: formData.value.birthDate,
    categoryId: formData.value.categoryId,
    categoryName: cat?.name ?? 'Sin categoría',
    coach: cat?.coach ?? 'Por asignar',
    schedule: cat?.schedule ?? '',
    time: cat?.time ?? '',
    position: formData.value.position,
    notes: formData.value.notes,
    registrationDate: isEditing.value ? (childData.value.registrationDate) : new Date().toISOString().split('T')[0],
    paymentStatus: isEditing.value ? (childData.value.paymentStatus) : 'Pendiente',
    parentName: formData.value.parentName,
    parentEmail: formData.value.email,
    photo: formData.value.photo
  };

  try {
    const success = await playersStore.addPlayer({
      ...formData.value,
      name: formData.value.fullName,
      parentEmail: authStore.parentUser?.email,
      parentName: formData.value.parentName,
      status: isEditing.value ? childData.value.paymentStatus : 'Pendiente',
      registrationDate: childRegistry.registrationDate
    });

    if (success) {
      const key = `children_${authStore.parentUser?.id || authStore.parentUser?.email}`;

      if (isEditing.value) {
        children.value[selectedChildIndex.value] = childRegistry;
      } else {
        children.value.push(childRegistry);
        selectedChildIndex.value = children.value.length - 1;
      }

      localStorage.setItem(key, JSON.stringify(children.value));
      fase.value = 'panel';
      isEditing.value = false;
    } else {
      formError.value = 'Error al procesar la solicitud en el servidor.';
    }
  } catch (e) {
    console.error('Error saving player:', e);
    formError.value = 'Error crítico al guardar.';
  } finally {
    isSubmitting.value = false;
  }
};

// =============================================
// ACTUALIZAR DATOS
// =============================================
const handleActualizar = () => {
  if (childData.value) {
    isEditing.value = true;
    formData.value.fullName = childData.value.playerName;
    formData.value.playerName = childData.value.playerName;
    formData.value.birthDate = childData.value.birthDate;
    formData.value.categoryId = childData.value.categoryId;
    formData.value.position = childData.value.position;
    formData.value.notes = childData.value.notes;
    formData.value.photo = childData.value.photo || '';
    // Nota: en un sistema real cargaríamos los PDFs de nuevo aquí si fuera necesario
    calculateAge();
  }
  currentStep.value = 1;
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
          <h1>¡Hola, {{ authStore.parentUser?.name ? authStore.parentUser.name.split(' ')[0] : 'Acudiente' }}!</h1>
          <p>Tu cuenta está activa. Inscribe a tu hijo para comenzar.</p>
        </div>
      </div>

      <div class="registration-card">
        <!-- Stepper -->
        <div class="stepper">
          <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
            <span class="step-number">1</span>
            <span class="step-label">Personales</span>
          </div>
          <div class="step-divider"></div>
          <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
            <span class="step-number">2</span>
            <span class="step-label">Contacto</span>
          </div>
          <div class="step-divider"></div>
          <div :class="['step', { active: currentStep >= 3, completed: currentStep > 3 }]">
            <span class="step-number">3</span>
            <span class="step-label">Documentos</span>
          </div>
        </div>

        <form @submit.prevent="nextStep">
          <!-- STEP 1: PERSONAL DATA -->
          <div v-if="currentStep === 1" class="form-step">
            <h2 class="step-title">Información del Jugador</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre Completo <span class="req">*</span></label>
                <input v-model="formData.fullName" type="text" class="form-control" required
                  placeholder="Nombre del hijo">
              </div>
              <div class="form-group">
                <label>Fecha de Nacimiento <span class="req">*</span></label>
                <input v-model="formData.birthDate" type="date" class="form-control" required @change="calculateAge">
              </div>
              <div class="form-group">
                <label>Edad</label>
                <input :value="calculatedAge" type="text" class="form-control" readonly placeholder="Auto-calculado">
              </div>
              <div class="form-group">
                <label>Categoría <span class="req">*</span></label>
                <select v-model="formData.categoryId" class="form-control" required>
                  <option value="">Selecciona...</option>
                  <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }} ({{ cat.age }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Posición Preferida</label>
                <select v-model="formData.position" class="form-control">
                  <option value="">Opcional...</option>
                  <option>Portero</option>
                  <option>Defensa</option>
                  <option>Mediocampista</option>
                  <option>Delantero</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <div class="spacer"></div>
              <button type="submit" class="btn-primary">Siguiente <i class="fa-solid fa-arrow-right"></i></button>
            </div>
          </div>

          <!-- STEP 2: CONTACT DATA -->
          <div v-if="currentStep === 2" class="form-step">
            <h2 class="step-title">Datos de Contacto</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre del Acudiente</label>
                <input v-model="formData.parentName" type="text" class="form-control" required readonly>
              </div>
              <div class="form-group">
                <label>Teléfono <span class="req">*</span></label>
                <input v-model="formData.phone" type="tel" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="formData.email" type="email" class="form-control" readonly>
              </div>
              <div class="form-group">
                <label>Dirección <span class="req">*</span></label>
                <input v-model="formData.address" type="text" class="form-control" required>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="currentStep = 1" class="btn-secondary"><i
                  class="fa-solid fa-arrow-left"></i> Anterior</button>
              <button type="submit" class="btn-primary">Siguiente <i class="fa-solid fa-arrow-right"></i></button>
            </div>
          </div>

          <!-- STEP 3: DOCUMENTATION -->
          <div v-if="currentStep === 3" class="form-step">
            <h2 class="step-title">Fotos y Documentos</h2>
            <div class="file-uploads-grid">
              <!-- Profile Photo -->
              <div class="file-upload-item">
                <label>Foto de Perfil <span class="req">*</span> (JPG)</label>
                <div class="compact-upload" :class="{ 'has-file': formData.photo }" @click="triggerFile('profile')">
                  <div v-if="!formData.photo" class="upload-trigger">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span>Subir Foto</span>
                  </div>
                  <div v-else class="file-status">
                    <i class="fa-solid fa-image"></i>
                    <span class="file-name">Foto cargada</span>
                  </div>
                </div>
                <input type="file" ref="fileProfile" @change="e => handleFile(e, 'photo')" style="display:none"
                  accept=".jpg,.jpeg">
              </div>

              <!-- DNI -->
              <div class="file-upload-item">
                <label>{{ documentLabel }} <span class="req">*</span> (PDF)</label>
                <div class="compact-upload" :class="{ 'has-file': formData.dniImage }" @click="triggerFile('dni')">
                  <div v-if="!formData.dniImage" class="upload-trigger">
                    <i class="fa-solid fa-file-pdf"></i>
                    <span>Subir Identidad</span>
                  </div>
                  <div v-else class="file-status">
                    <i class="fa-solid fa-check-circle"></i>
                    <span class="file-name">Cargado</span>
                  </div>
                </div>
                <input type="file" ref="fileDni" @change="e => handleFile(e, 'dniImage')" style="display:none"
                  accept=".pdf">
              </div>

              <!-- Medical -->
              <div class="file-upload-item">
                <label>Seguro Médico <span class="req">*</span> (EPS - PDF)</label>
                <div class="compact-upload" :class="{ 'has-file': formData.medicalCertificate }"
                  @click="triggerFile('medical')">
                  <div v-if="!formData.medicalCertificate" class="upload-trigger">
                    <i class="fa-solid fa-file-shield"></i>
                    <span>Subir Certificado</span>
                  </div>
                  <div v-else class="file-status">
                    <i class="fa-solid fa-check-circle"></i>
                    <span class="file-name">Cargado</span>
                  </div>
                </div>
                <input type="file" ref="fileMedical" @change="e => handleFile(e, 'medicalCertificate')"
                  style="display:none" accept=".pdf">
              </div>
            </div>

            <div v-if="formError" class="form-error-msg" style="margin-top:1.5rem">
              <i class="fa-solid fa-triangle-exclamation"></i> {{ formError }}
            </div>

            <div class="form-actions" style="margin-top:2rem">
              <button type="button" @click="currentStep = 2" class="btn-secondary"><i
                  class="fa-solid fa-arrow-left"></i> Anterior</button>
              <button type="button" @click="handleInscripcion" class="btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Procesando...' : 'Finalizar Registro' }} <i class="fa-solid fa-check"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ============ PANEL PADRE ============ -->
    <div v-else-if="fase === 'panel'" class="panel-view">

      <!-- Selector de Hijos -->
      <div class="children-tabs">
        <button v-for="(child, index) in children" :key="index"
          :class="['child-tab', { active: selectedChildIndex === index }]" @click="selectedChildIndex = index">
          <div class="child-tab__avatar">
            <img v-if="child.photo" :src="child.photo" alt="Foto">
            <i v-else class="fa-solid fa-user"></i>
          </div>
          <span class="child-tab__name">{{ child.playerName ? child.playerName.split(' ')[0] : 'Jugador' }}</span>
        </button>

        <button @click="resetForm(); fase = 'inscripcion'" class="btn-add-child-tab">
          <i class="fa-solid fa-plus"></i>
          <span>Nuevo</span>
        </button>
      </div>

      <!-- Bienvenida -->
      <div class="panel-welcome">
        <div class="panel-welcome__text">
          <h1>¡Hola, <span>{{ authStore.parentUser?.name ? authStore.parentUser.name.split(' ')[0] : 'Acudiente'
              }}</span>!</h1>
          <p>Gestionando la información de <strong>{{ childData.playerName }}</strong></p>
        </div>
        <div class="panel-welcome__badge">
          <i class="fa-solid fa-users"></i>
          <span>{{ children.length }} {{ children.length === 1 ? 'Hijo' : 'Hijos' }}</span>
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
            <p v-else style="color: #aaa; font-size: 0.85rem; margin-top: 0.5rem;">No hay partidos programados
              próximamente.</p>
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

/* ===================== CHILDREN TABS ===================== */
.children-tabs {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.child-tab {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 1.2rem;
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  color: var(--admin-text-light);
}

.child-tab.active {
  background: var(--admin-accent);
  color: white;
  border-color: var(--admin-accent);
  box-shadow: 0 4px 12px rgba(31, 167, 116, 0.2);
}

.child-tab__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--admin-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--admin-accent);
}

.child-tab__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.child-tab.active .child-tab__avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-add-child-tab {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: 1px dashed var(--admin-accent);
  color: var(--admin-accent);
  border-radius: 50px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-add-child-tab:hover {
  background: rgba(31, 167, 116, 0.05);
}

/* ===================== INSCRIPCIÓN FULL ===================== */
.registration-card {
  background: var(--admin-card);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: var(--admin-card-shadow);
  border: 1px solid var(--admin-border);
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 1;
}

.step-number {
  width: 36px;
  height: 36px;
  background: var(--admin-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--admin-text-light);
}

.step.active .step-number {
  background: var(--admin-accent);
  color: #fff;
}

.step.completed .step-number {
  background: #1fa774;
  color: #fff;
}

.step-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--admin-text-light);
}

.step-divider {
  flex: 1;
  height: 2px;
  background: var(--admin-border);
  margin: 0 1rem;
  margin-top: -1.2rem;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--admin-text);
  border-left: 4px solid var(--admin-accent);
  padding-left: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--admin-text-light);
}

.form-control {
  padding: 0.8rem 1rem;
  border: 1.5px solid var(--admin-border);
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: var(--admin-bg);
  color: var(--admin-text);
  width: 100%;
}

.form-control:focus {
  border-color: var(--admin-accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(31, 167, 116, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--admin-border);
  padding-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.8rem 1.8rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--admin-accent);
  color: #fff;
}

.btn-secondary {
  background: var(--admin-border);
  color: var(--admin-text-light);
}

.spacer {
  flex: 1;
}

/* FILE UPLOADS */
.file-uploads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.2rem;
}

.compact-upload {
  margin-top: 0.5rem;
  border: 2px dashed var(--admin-border);
  border-radius: 12px;
  background: var(--admin-bg);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.compact-upload.has-file {
  border-style: solid;
  border-color: #1fa774;
  background: rgba(31, 167, 116, 0.05);
}

.upload-trigger {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--admin-text-light);
}

.upload-trigger i {
  font-size: 1.5rem;
  color: var(--admin-accent);
}

.file-status {
  padding: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #1fa774;
  font-weight: 700;
  font-size: 0.85rem;
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
  background: rgba(255, 255, 255, 0.15);
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

.badge-cat,
.badge-pos {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-cat {
  background: rgba(31, 167, 116, 0.1);
  color: var(--admin-accent);
}

.badge-pos {
  background: rgba(52, 152, 219, 0.1);
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
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
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

.panel-card__icon--finance {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.panel-card__icon--cert {
  background: rgba(241, 196, 15, 0.1);
  color: #f1c40f;
}

.panel-card__icon--match {
  background: rgba(31, 167, 116, 0.1);
  color: var(--admin-accent);
}

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

.status--ok {
  color: #27ae60;
}

.status--warn {
  color: #f39c12;
}

.status--danger {
  color: #e74c3c;
}

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

.match-teams {
  font-weight: 600;
}

.match-date {
  color: var(--admin-text-light);
  font-size: 0.8rem;
}

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
  .form-row-2 {
    grid-template-columns: 1fr;
  }

  .panel-cards {
    grid-template-columns: 1fr;
  }

  .panel-card--wide {
    grid-column: 1;
  }

  .ficha-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .ficha-badges {
    justify-content: center;
  }

  .panel-welcome {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .inscripcion-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
