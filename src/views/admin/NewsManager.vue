<script setup>
import { ref } from 'vue';
import { useNewsStore } from '../../store/newsStore';
import { useFileUpload } from '../../composables/useFileUpload';
import HeroEditor from '../../components/admin/HeroEditor.vue';

const newsStore = useNewsStore();
const { uploadFile, isUploading } = useFileUpload();

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const fileInput = ref(null);

const formData = ref({
  title: '',
  excerpt: '',
  date: '',
  image: '',
  content: ''
});

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = { title: '', excerpt: '', date: '', image: '', content: '' };
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
    alert('Error al subir la imagen');
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleSubmit = () => {
  if (isEditing.value) {
    newsStore.updateNews(currentId.value, formData.value);
  } else {
    newsStore.addNews(formData.value);
  }
  closeModal();
};

const deleteItem = (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
    newsStore.deleteNews(id);
  }
};
</script>

<template>
  <div class="news-manager">
    <HeroEditor pageKey="noticias" />
    <div class="admin-toolbar">
      <h2>Gestionar Noticias</h2>
      <button @click="openCreateModal" class="btn-admin btn-admin--primary">
        <i class="fa-solid fa-plus"></i> Nueva Noticia
      </button>
    </div>

    <div class="admin-table-wrapper">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Título</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in newsStore.news" :key="item.id">
              <td>{{ item.id }}</td>
              <td>
                <img :src="item.image" :alt="item.title"
                  style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
              </td>
              <td>{{ item.title }}</td>
              <td>{{ item.date }}</td>
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
      <div v-for="item in newsStore.news" :key="item.id" class="admin-card-item">
        <div class="admin-card-item__header">
          <img :src="item.image" :alt="item.title"
            style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
          <div>
            <strong>{{ item.title }}</strong>
            <div style="font-size: 0.8rem; color: var(--admin-text-light);">{{ item.date }}</div>
          </div>
        </div>
        <div class="admin-card-item__body">
          <p
            style="margin: 0; color: var(--admin-text-light); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-clamp: 2;">
            {{ item.excerpt }}
          </p>
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
          <h3>{{ isEditing ? 'Editar Noticia' : 'Nueva Noticia' }}</h3>
          <button @click="closeModal"
            style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <div class="admin-modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Título</label>
              <input v-model="formData.title" type="text" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Extracto (Resumen corto)</label>
              <textarea v-model="formData.excerpt" class="form-control" rows="2" required></textarea>
            </div>
            <div class="form-group">
              <label>Fecha (Ej: 15 ENE)</label>
              <input v-model="formData.date" type="text" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Imagen de la Noticia</label>
              <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 0.5rem;">
                <div v-if="formData.image"
                  style="width: 100px; height: 100px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #eee;">
                  <img :src="formData.image" style="width: 100px; height: 100px; object-fit: cover;">
                </div>
                <div v-else
                  style="width: 100px; height: 100px; border: 2px dashed #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 0.8rem; text-align: center; padding: 0.5rem;">
                  Sin imagen
                </div>
                <div style="flex: 1;">
                  <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;">
                  <button type="button" @click="triggerFileInput" class="btn-admin"
                    style="width: 100%; margin-bottom: 0.5rem; background: #eee;">
                    <i class="fa-solid fa-upload"></i> {{ isUploading ? 'Subiendo...' : 'Subir Imagen Local' }}
                  </button>
                  <input v-model="formData.image" type="text" class="form-control"
                    placeholder="O pega la URL de la imagen aquí">
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Contenido Completo</label>
              <textarea v-model="formData.content" class="form-control" rows="5" required></textarea>
            </div>

            <div class="admin-modal-footer">
              <button type="button" @click="closeModal" class="btn-admin" style="background: #eee;">Cancelar</button>
              <button type="submit" class="btn-admin btn-admin--primary">
                {{ isEditing ? 'Guardar Cambios' : 'Crear Noticia' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
