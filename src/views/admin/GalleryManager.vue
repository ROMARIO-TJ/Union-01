<script setup>
import { ref } from 'vue';
import { useGalleryStore } from '../../store/galleryStore';
import { useFileUpload } from '../../composables/useFileUpload';
import HeroEditor from '../../components/admin/HeroEditor.vue';

const galleryStore = useGalleryStore();
const { uploadFile, isUploading } = useFileUpload();

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const fileInput = ref(null);

const formData = ref({
  title: '',
  category: 'Partidos',
  type: 'photo',
  icon: 'fa-solid fa-futbol',
  image: '', // Añadido soporte para imagen real si es foto
  videoUrl: ''
});

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    title: '', category: 'Partidos', type: 'photo', icon: 'fa-solid fa-futbol', image: '', videoUrl: ''
  };
  isModalOpen.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  currentId.value = item.id;
  formData.value = { ...item };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const url = await uploadFile(file);
    formData.value.image = url;
    // Si se sube una foto, el tipo debe ser photo
    formData.value.type = 'photo';
  } catch (error) {
    alert('Error al subir la imagen');
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleSubmit = async () => {
  if (isEditing.value) {
    await galleryStore.updatePhoto(currentId.value, formData.value);
  } else {
    await galleryStore.addPhoto(formData.value);
  }
  closeModal();
};

const deleteItem = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este item de la galería?')) {
    await galleryStore.deletePhoto(id);
  }
};
</script>

<template>
  <div class="gallery-manager">
    <HeroEditor pageKey="galeria" />
    <div class="admin-toolbar">
      <h2>Gestionar Galería</h2>

      <button @click="openCreateModal" class="btn-admin btn-admin--primary">
        <i class="fa-solid fa-plus"></i> Nuevo Item
      </button>
    </div>

    <div class="admin-table-wrapper">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Vista</th>
              <th>Título</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in galleryStore.photos" :key="item.id">
              <td>
                <div v-if="item.image"
                  style="width: 50px; height: 50px; border: 1px solid var(--admin-border); border-radius: 4px; overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center;">
                  <img :src="item.image" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div v-else
                  style="width: 50px; height: 50px; background: #eee; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                  <i :class="item.icon" style="color: var(--admin-accent); font-size: 1.2rem;"></i>
                </div>
              </td>
              <td>{{ item.title }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.type === 'video' ? 'Video' : 'Foto' }}</td>
              <td>
                <div class="action-btns">
                  <button @click="openEditModal(item)" class="btn-action edit" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button @click="deleteItem(item.id)" class="btn-action delete" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MOBILE CARDS VIEW -->
    <div class="admin-cards-grid">
      <div v-for="item in galleryStore.photos" :key="item.id" class="admin-card-item">
        <div class="admin-card-item__header">
          <div v-if="item.image"
            style="width: 50px; height: 50px; border: 1px solid var(--admin-border); border-radius: 8px; overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center;">
            <img :src="item.image" style="max-width: 100%; max-height: 100%; object-fit: contain;">
          </div>
          <div v-else
            style="width: 50px; height: 50px; background: var(--admin-bg); display: flex; align-items: center; justify-content: center; border-radius: 8px;">
            <i :class="item.icon" style="color: var(--admin-accent); font-size: 1.5rem;"></i>
          </div>
          <div>
            <strong>{{ item.title }}</strong>
            <div style="font-size: 0.8rem; color: var(--admin-text-light);">{{ item.category }}</div>
          </div>
        </div>
        <div class="admin-card-item__body">
          <div class="admin-card-item__row">
            <span class="admin-card-item__label">Tipo:</span>
            <span>{{ item.type === 'video' ? 'Video' : 'Foto' }}</span>
          </div>
        </div>
        <div class="admin-card-item__actions">
          <button @click="openEditModal(item)" class="btn-action edit" title="Editar">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
          <button @click="deleteItem(item.id)" class="btn-action delete" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="admin-modal-overlay">
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h3>{{ isEditing ? 'Editar Item de Galería' : 'Nuevo Item de Galería' }}</h3>
          <button @click="closeModal"
            style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <div class="admin-modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Título</label>
              <input v-model="formData.title" type="text" class="form-control" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Categoría</label>
                <select v-model="formData.category" class="form-control">
                  <option v-for="cat in galleryStore.categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tipo</label>
                <select v-model="formData.type" class="form-control">
                  <option value="photo">Foto</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Icono FontAwesome (Opcional, Ej: fa-solid fa-futbol)</label>
              <input v-model="formData.icon" type="text" class="form-control">
            </div>

            <div v-if="formData.type === 'video'" class="form-group">
              <label>URL de Video (YouTube Embed)</label>
              <input v-model="formData.videoUrl" type="text" class="form-control"
                placeholder="https://www.youtube.com/embed/..." required>
            </div>

            <div v-else class="form-group">
              <label>Imagen de la Galería</label>
              <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 0.5rem;">
                <div v-if="formData.image"
                  style="width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #eee; display: flex; align-items: center; justify-content: center;">
                  <img :src="formData.image" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div v-else
                  style="width: 80px; height: 80px; border: 2px dashed #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 0.8rem; text-align: center; padding: 0.5rem;">
                  Sin imagen
                </div>
                <div style="flex: 1;">
                  <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;">
                  <button type="button" @click="triggerFileInput" class="btn-admin"
                    style="width: 100%; margin-bottom: 0.5rem; background: #eee;">
                    <i class="fa-solid fa-upload"></i> {{ isUploading ? 'Subiendo...' : 'Subir Imagen Local' }}
                  </button>
                  <input v-model="formData.image" type="text" class="form-control"
                    placeholder="URL de la imagen (opcional)">
                </div>
              </div>
            </div>

            <div class="admin-modal-footer">
              <button type="button" @click="closeModal" class="btn-admin" style="background: #eee;">Cancelar</button>
              <button type="submit" class="btn-admin btn-admin--primary">
                {{ isEditing ? 'Guardar Cambios' : 'Crear Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
