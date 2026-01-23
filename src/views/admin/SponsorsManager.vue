<script setup>
import { ref } from 'vue';
import { useSponsorsStore } from '../../store/sponsorsStore';
import { useFileUpload } from '../../composables/useFileUpload';

const sponsorsStore = useSponsorsStore();
const { uploadFile, isUploading } = useFileUpload();

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const fileInput = ref(null);

const formData = ref({
  name: '',
  icon: 'fa-solid fa-building',
  image: ''
});

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = { name: '', icon: 'fa-solid fa-building', image: '' };
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
  } catch (error) {
    alert('Error al subir el logo');
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleSubmit = () => {
  if (isEditing.value) {
    sponsorsStore.updateSponsor(currentId.value, formData.value);
  } else {
    sponsorsStore.addSponsor(formData.value);
  }
  closeModal();
};

const deleteItem = (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este patrocinador?')) {
    sponsorsStore.deleteSponsor(id);
  }
};
</script>

<template>
  <div class="sponsors-manager">
    <div class="admin-toolbar">
      <h2>Gestionar Patrocinadores</h2>
      <button @click="openCreateModal" class="btn-admin btn-admin--primary">
        <i class="fa-solid fa-plus"></i> Nuevo Patrocinador
      </button>
    </div>

    <div class="admin-table-wrapper">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Vista</th>
              <th>Nombre</th>
              <th>Icono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sponsorsStore.sponsors" :key="item.id">
              <td>
                <div
                  style="width: 50px; height: 50px; background: #eee; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                  <i :class="item.icon" style="color: var(--admin-accent); font-size: 1.2rem;"></i>
                </div>
              </td>
              <td>{{ item.name }}</td>
              <td><code>{{ item.icon }}</code></td>
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
      <div v-for="item in sponsorsStore.sponsors" :key="item.id" class="admin-card-item">
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
            <strong>{{ item.name }}</strong>
            <div style="font-size: 0.8rem; color: var(--admin-text-light);">{{ item.icon }}</div>
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
          <h3>{{ isEditing ? 'Editar Patrocinador' : 'Nuevo Patrocinador' }}</h3>
          <button @click="closeModal"
            style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <div class="admin-modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Nombre del Patrocinador</label>
              <input v-model="formData.name" type="text" class="form-control" required>
            </div>

            <div class="form-group">
              <label>Logo del Patrocinador</label>
              <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 0.5rem;">
                <div v-if="formData.image"
                  style="width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #eee; display: flex; align-items: center; justify-content: center;">
                  <img :src="formData.image" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div v-else
                  style="width: 80px; height: 80px; border: 2px dashed #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 0.8rem; text-align: center; padding: 0.5rem;">
                  Sin logo
                </div>
                <div style="flex: 1;">
                  <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;">
                  <button type="button" @click="triggerFileInput" class="btn-admin"
                    style="width: 100%; margin-bottom: 0.5rem; background: #eee;">
                    <i class="fa-solid fa-upload"></i> {{ isUploading ? 'Subiendo...' : 'Subir Logo Local' }}
                  </button>
                  <input v-model="formData.image" type="text" class="form-control"
                    placeholder="URL del logo (opcional)">
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Icono FontAwesome (Si no subes logo)</label>
              <input v-model="formData.icon" type="text" class="form-control" required>
            </div>

            <div class="admin-modal-footer">
              <button type="button" @click="closeModal" class="btn-admin" style="background: #eee;">Cancelar</button>
              <button type="submit" class="btn-admin btn-admin--primary">
                {{ isEditing ? 'Guardar Cambios' : 'Crear Patrocinador' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
