<script setup>
import { ref } from 'vue';
import { useHomeSettingsStore } from '../../store/homeSettingsStore';
import { useFileUpload } from '../../composables/useFileUpload';

const homeSettings = useHomeSettingsStore();
const { uploadFile, isUploading } = useFileUpload();

const activeTab = ref('general');
const successMessage = ref('');

// Slide Modal State
const isSlideModalOpen = ref(false);
const isEditingSlide = ref(false);
const currentSlideId = ref(null);
const slideForm = ref({
  title: '',
  subtitle: '',
  image: '',
  primaryBtnText: 'Conoce el Club',
  primaryBtnLink: '/club',
  secondaryBtnText: 'Inscripciones',
  secondaryBtnLink: '/categoria',
  isIdentity: false
});

// Philosophy Modal State
const isPhilModalOpen = ref(false);
const isEditingPhil = ref(false);
const currentPhilId = ref(null);
const philForm = ref({
  title: '',
  description: '',
  icon: 'fa-solid fa-star'
});

const showSuccess = (msg) => {
  successMessage.value = msg;
  setTimeout(() => successMessage.value = '', 3000);
};

// --- SLIDE METHODS ---
const openAddSlide = () => {
  isEditingSlide.value = false;
  slideForm.value = {
    title: '',
    subtitle: '',
    image: '',
    primaryBtnText: 'Conoce el Club',
    primaryBtnLink: '/club',
    secondaryBtnText: 'Inscripciones',
    secondaryBtnLink: '/categoria',
    isIdentity: false
  };
  isSlideModalOpen.value = true;
};

const openEditSlide = (slide) => {
  isEditingSlide.value = true;
  currentSlideId.value = slide.id;
  slideForm.value = { ...slide };
  isSlideModalOpen.value = true;
};

const handleSlideSubmit = () => {
  if (isEditingSlide.value) {
    homeSettings.updateHeroSlide(currentSlideId.value, slideForm.value);
  } else {
    homeSettings.addHeroSlide(slideForm.value);
  }
  isSlideModalOpen.value = false;
  showSuccess('Slide guardado');
};

const deleteSlide = (id) => {
  if (confirm('¿Eliminar este slide?')) {
    homeSettings.deleteHeroSlide(id);
    showSuccess('Slide eliminado');
  }
};

// --- PHILOSOPHY METHODS ---
const openAddPhil = () => {
  isEditingPhil.value = false;
  philForm.value = { title: '', description: '', icon: 'fa-solid fa-star' };
  isPhilModalOpen.value = true;
};

const openEditPhil = (item) => {
  isEditingPhil.value = true;
  currentPhilId.value = item.id;
  philForm.value = { ...item };
  isPhilModalOpen.value = true;
};

const handlePhilSubmit = () => {
  if (isEditingPhil.value) {
    homeSettings.updatePhilosophyItem(currentPhilId.value, philForm.value);
  } else {
    homeSettings.addPhilosophyItem(philForm.value);
  }
  isPhilModalOpen.value = false;
  showSuccess('Ítem guardado');
};

const deletePhil = (id) => {
  if (confirm('¿Eliminar este ítem?')) {
    homeSettings.deletePhilosophyItem(id);
    showSuccess('Ítem eliminado');
  }
};

// --- GENERAL METHODS ---

const handleFileUpload = async (event, target) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const url = await uploadFile(file);
    if (target === 'slide') slideForm.value.image = url;
    else if (target.startsWith('hero_')) {
      const pageKey = target.replace('hero_', '');
      homeSettings.pageHeroes[pageKey].image = url;
      homeSettings.updatePageHero(pageKey, { image: url });
    }
  } catch (e) { alert('Error subiendo imagen'); }
};
</script>

<template>
  <div class="home-manager">
    <div class="admin-toolbar">
      <h2>Gestionar Inicio y Cabeceras</h2>
      <div class="manager-tabs">
        <button @click="activeTab = 'general'" :class="{ active: activeTab === 'general' }">General</button>
        <button @click="activeTab = 'carousel'" :class="{ active: activeTab === 'carousel' }">Carrusel</button>
        <button @click="activeTab = 'philosophy'" :class="{ active: activeTab === 'philosophy' }">Filosofía</button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="successMessage" class="success-banner">
        <i class="fa-solid fa-check-circle"></i> {{ successMessage }}
      </div>
    </transition>

    <!-- TAB: GENERAL -->
    <div v-if="activeTab === 'general'" class="tab-content">
      <div class="manager-card">
        <div class="card-header"><i class="fa-solid fa-toggle-on"></i>
          <h3>Visibilidad de Secciones</h3>
        </div>
        <div class="card-body">
          <div class="sections-grid">
            <div v-for="(section, key) in homeSettings.sections" :key="key" class="section-toggle-card">
              <div class="section-info">
                <i :class="section.icon"></i>
                <div>
                  <strong>{{ section.label }}</strong>
                  <p>{{ section.description }}</p>
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" :checked="section.enabled" @change="homeSettings.toggleSection(key)">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: CAROUSEL -->
    <div v-if="activeTab === 'carousel'" class="tab-content">
      <div class="manager-card">
        <div class="card-header social-header">
          <div class="title-with-icon"><i class="fa-solid fa-images"></i>
            <h3>Slides del Carrusel</h3>
          </div>
          <button @click="openAddSlide" class="btn-admin btn-admin--primary"><i class="fa-solid fa-plus"></i> Añadir
            Slide</button>
        </div>
        <div class="card-body">
          <div class="slides-list-admin">
            <div v-for="slide in homeSettings.heroSlides" :key="slide.id" class="slide-item-admin">
              <div class="slide-preview" :style="slide.image ? { backgroundImage: `url(${slide.image})` } : {}">
                <img v-if="!slide.image" src="../../assets/img/logosinfondo.png" class="tiny-logo">
              </div>
              <div class="slide-text">
                <strong>{{ slide.title }}</strong>
                <span>{{ slide.subtitle }}</span>
                <div class="slide-badges">
                  <span v-if="slide.isIdentity" class="badge-identity">Identidad</span>
                  <span class="badge-link">{{ slide.primaryBtnText }}</span>
                </div>
              </div>
              <div class="action-btns">
                <button @click="openEditSlide(slide)" class="btn-action edit"><i class="fa-solid fa-pen"></i></button>
                <button @click="deleteSlide(slide.id)" class="btn-action delete"><i
                    class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: PHILOSOPHY -->
    <div v-if="activeTab === 'philosophy'" class="tab-content">
      <div class="manager-card">
        <div class="card-header social-header">
          <div class="title-with-icon"><i class="fa-solid fa-fire"></i>
            <h3>Nuestra Filosofía</h3>
          </div>
          <button @click="openAddPhil" class="btn-admin btn-admin--primary"><i class="fa-solid fa-plus"></i> Añadir
            Punto</button>
        </div>
        <div class="card-body">
          <div class="phil-list-admin">
            <div v-for="item in homeSettings.philosophy" :key="item.id" class="phil-item-admin">
              <i :class="item.icon" class="phil-icon"></i>
              <div class="phil-text">
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
              </div>
              <div class="action-btns">
                <button @click="openEditPhil(item)" class="btn-action edit"><i class="fa-solid fa-pen"></i></button>
                <button @click="deletePhil(item.id)" class="btn-action delete"><i
                    class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Slide Modal -->
  <div v-if="isSlideModalOpen" class="admin-modal-overlay">
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h3>{{ isEditingSlide ? 'Editar Slide' : 'Nuevo Slide' }}</h3>
        <button @click="isSlideModalOpen = false" class="close-btn">&times;</button>
      </div>
      <div class="admin-modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Título</label>
            <input v-model="slideForm.title" type="text" class="form-control">
          </div>
          <div class="form-group">
            <label>Subtítulo</label>
            <input v-model="slideForm.subtitle" type="text" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label>Imagen de Fondo (Opcional - Logo si vacío)</label>
          <div style="display: flex; gap: 0.5rem;">
            <input v-model="slideForm.image" type="text" class="form-control" placeholder="Subir o pegar URL">
            <label class="btn-admin btn-icon-only">
              <i class="fa-solid fa-upload"></i>
              <input type="file" @change="e => handleFileUpload(e, 'slide')" style="display:none">
            </label>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Texto Botón 1</label>
            <input v-model="slideForm.primaryBtnText" type="text" class="form-control">
          </div>
          <div class="form-group">
            <label>Link Botón 1</label>
            <input v-model="slideForm.primaryBtnLink" type="text" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="slideForm.isIdentity">
            Estilo Identidad (Logo central + sin overlay oscuro)
          </label>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button @click="isSlideModalOpen = false" class="btn-admin">Cancelar</button>
        <button @click="handleSlideSubmit" class="btn-admin btn-admin--primary">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Philosophy Modal -->
  <div v-if="isPhilModalOpen" class="admin-modal-overlay">
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h3>{{ isEditingPhil ? 'Editar Punto' : 'Nuevo Punto' }}</h3>
        <button @click="isPhilModalOpen = false" class="close-btn">&times;</button>
      </div>
      <div class="admin-modal-body">
        <div class="form-group">
          <label>Título</label>
          <input v-model="philForm.title" type="text" class="form-control">
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="philForm.description" class="form-control" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Icono FontAwesome</label>
          <input v-model="philForm.icon" type="text" class="form-control">
        </div>
      </div>
      <div class="admin-modal-footer">
        <button @click="isPhilModalOpen = false" class="btn-admin">Cancelar</button>
        <button @click="handlePhilSubmit" class="btn-admin btn-admin--primary">Guardar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manager-tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.manager-tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.manager-tabs button.active {
  background: var(--admin-accent);
  color: #fff;
}

.tab-content {
  margin-top: 1.5rem;
}

.manager-card {
  background: var(--admin-card);
  border-radius: 12px;
  border: 1px solid var(--admin-border);
  margin-bottom: 1.5rem;
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--admin-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.social-header {
  justify-content: space-between;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.section-toggle-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid var(--admin-border);
}

.section-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.section-info i {
  color: var(--admin-accent);
  font-size: 1.2rem;
}

.section-info p {
  font-size: 0.8rem;
  color: var(--admin-text-light);
  margin: 0;
}

.slides-list-admin {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slide-item-admin {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  align-items: center;
}

.slide-preview {
  width: 120px;
  height: 70px;
  background-color: #333;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tiny-logo {
  height: 40px;
}

.slide-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.slide-text span {
  font-size: 0.85rem;
  color: var(--admin-text-light);
}

.slide-badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.badge-identity {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}

.badge-link {
  background: #dcfce7;
  color: #166534;
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}

.phil-list-admin {
  display: grid;
  gap: 1rem;
}

.phil-item-admin {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid var(--admin-border);
}

.phil-icon {
  font-size: 1.5rem;
  color: var(--admin-accent);
  width: 30px;
}

.phil-text {
  flex: 1;
}

.phil-text p {
  font-size: 0.85rem;
  color: var(--admin-text-light);
  margin: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Switch & Modals same as before */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked+.slider {
  background-color: var(--admin-accent);
}

input:checked+.slider:before {
  transform: translateX(22px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.success-banner {
  background: #10b981;
  color: #fff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.btn-icon-only {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
}
</style>
