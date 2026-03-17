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
  date_str: '',
  image: '',
  content: '',
  gallery: [],
  show_social: 1
});

const openCreateModal = () => {
  isEditing.value = false;
  submitError.value = '';
  formData.value = {
    title: '',
    excerpt: '',
    date_str: '',
    image: '',
    content: '',
    gallery: [],
    show_social: 1
  };
  isModalOpen.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  submitError.value = '';
  currentId.value = item.id;
  formData.value = {
    ...item,
    date_str: item.date_str || item.date || '',
    gallery: typeof item.gallery === 'string' ? JSON.parse(item.gallery) : (item.gallery || []),
    show_social: item.show_social !== undefined ? parseInt(item.show_social) : 1
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleFileUpload = async (event, target = 'main') => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  try {
    if (target === 'main') {
      const url = await uploadFile(files[0]);
      formData.value.image = url;
    } else {
      // Carga múltiple para la galería
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        formData.value.gallery.push(url);
      }
    }
    // Limpiar el input para permitir subir los mismos archivos si se desea
    event.target.value = '';
  } catch (error) {
    alert('Error al subir la imagen');
  }
};

const setCurrentDate = () => {
  const now = new Date();
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const day = now.getDate();
  const month = months[now.getMonth()];
  formData.value.date_str = `${day} ${month}`;
};

const addGalleryUrl = () => {
  const url = prompt('Ingresa la URL de la imagen:');
  if (url) {
    formData.value.gallery.push(url);
  }
};

const removeGalleryImg = (index) => {
  formData.value.gallery.splice(index, 1);
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const submitError = ref('');
const isSubmitting = ref(false);

const handleSubmit = async () => {
  submitError.value = '';
  isSubmitting.value = true;
  const dataToSubmit = {
    title: formData.value.title,
    excerpt: formData.value.excerpt,
    date_str: formData.value.date_str,
    image: formData.value.image,
    content: formData.value.content,
    gallery: JSON.stringify(formData.value.gallery),
    show_social: formData.value.show_social
  };

  try {
    if (isEditing.value) {
      await newsStore.updateNews(currentId.value, dataToSubmit);
    } else {
      await newsStore.addNews(dataToSubmit);
    }
    closeModal();
  } catch (err) {
    submitError.value = err.message || 'Ocurrió un error al guardar la noticia. Intenta de nuevo.';
  } finally {
    isSubmitting.value = false;
  }
};

const deleteItem = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
    await newsStore.deleteNews(id);
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
              <td>{{ item.date_str || item.date }}</td>
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
            <div style="font-size: 0.8rem; color: var(--admin-text-light);">{{ item.date_str || item.date }}</div>
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
              <div class="date-input-group">
                <input v-model="formData.date_str" type="text" class="form-control" placeholder="15 ENE" required>
                <button type="button" @click="setCurrentDate" class="btn-today">
                  <i class="fa-solid fa-calendar-day"></i> Hoy
                </button>
              </div>
            </div>
            <!-- Imagen Principal -->
            <div class="form-group">
              <label class="form-label-premium">Imagen de Portada</label>
              <div class="main-image-uploader">
                <div v-if="formData.image" class="image-preview-main">
                  <img :src="formData.image">
                  <button type="button" @click="formData.image = ''" class="remove-badge">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div v-else class="empty-preview-main" @click="triggerFileInput">
                  <i class="fa-solid fa-image"></i>
                  <span>Sin imagen de portada</span>
                </div>

                <div class="uploader-controls">
                  <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;">
                  <button type="button" @click="triggerFileInput" class="btn-upload">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    {{ isUploading ? 'Subiendo...' : 'Subir Imagen' }}
                  </button>
                  <div class="url-input-wrapper">
                    <i class="fa-solid fa-link"></i>
                    <input v-model="formData.image" type="text" placeholder="O pega el enlace aquí...">
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label-premium">Contenido de la Noticia</label>
              <textarea v-model="formData.content" class="form-control-premium" rows="6"
                placeholder="Escribe aquí toda la noticia..." required></textarea>
            </div>

            <!-- GALERIA ADICIONAL -->
            <div class="form-group">
              <label class="form-label-premium">Galería de Fotos Adicionales</label>
              <div class="gallery-container-premium">
                <div class="gallery-grid-admin">
                  <div v-for="(img, idx) in formData.gallery" :key="idx" class="gallery-item-admin">
                    <img :src="img">
                    <button type="button" @click="removeGalleryImg(idx)" class="remove-img-mini">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>

                  <div class="add-img-options">
                    <input type="file" @change="e => handleFileUpload(e, 'gallery')" accept="image/*"
                      style="display: none;" :id="'gal-up-' + currentId" multiple>
                    <label :for="'gal-up-' + currentId" class="add-btn-premium" title="Subir Fotos">
                      <i class="fa-solid fa-images"></i>
                      <span>Subir Fotos</span>
                    </label>
                    <button type="button" @click="addGalleryUrl" class="add-btn-premium secondary" title="Pegar Enlace">
                      <i class="fa-solid fa-link"></i>
                      <span>Link</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- CONTROLES SOCIALES -->
            <div class="form-group social-toggle-group">
              <div class="toggle-wrapper">
                <label class="switch">
                  <input type="checkbox" v-model="formData.show_social" :true-value="1" :false-value="0">
                  <span class="slider round"></span>
                </label>
                <span class="toggle-text">Permitir compartir en redes sociales</span>
              </div>
            </div>

            <div class="admin-modal-footer">
              <p v-if="submitError" style="color: #e53e3e; font-size: 0.88rem; margin: 0 0 0.75rem; padding: 0.6rem 1rem; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; width: 100%; text-align: left;">
                <i class="fa-solid fa-circle-exclamation" style="margin-right: 0.4rem;"></i>{{ submitError }}
              </p>
              <div style="display: flex; gap: 0.75rem;">
                <button type="button" @click="closeModal" class="btn-admin" style="background: #eee;">Cancelar</button>
                <button type="submit" class="btn-admin btn-admin--primary" :disabled="isSubmitting" :style="{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }">
                  <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin" style="margin-right: 0.4rem;"></i>
                  {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Noticia') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
