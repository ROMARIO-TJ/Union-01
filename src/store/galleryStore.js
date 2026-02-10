import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

/* ===============================
   Helper: Normalizar URLs YouTube
================================ */
function normalizeYouTubeUrl(url) {
    if (!url) return '';

    // youtu.be/XXXX
    if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
    }

    // youtube.com/watch?v=XXXX
    if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${id}`;
    }

    // ya es embed
    if (url.includes('/embed/')) {
        return url;
    }

    return '';
}

export const useGalleryStore = defineStore('gallery', () => {
    const photos = ref([]);
    const categories = ref([
        'Todas',
        'Partidos',
        'Entrenamientos',
        'Eventos',
        'Instalaciones',
        'Videos'
    ]);

    const isLoading = ref(false);
    const error = ref(null);

    /* ===============================
       Inicializar Galería
    ================================ */
    const initGallery = async () => {
        isLoading.value = true;
        error.value = null;

        // Cache local
        const savedPhotos = localStorage.getItem('union_gallery');
        if (savedPhotos) {
            photos.value = JSON.parse(savedPhotos);
        }

        try {
            const data = await apiService.request('gallery');
            if (Array.isArray(data)) {
                photos.value = data.map(item => ({
                    ...item,
                    image: item.url || '',
                    title: item.caption || item.title || '',
                    videoUrl: normalizeYouTubeUrl(item.videoUrl || '')
                }));

                localStorage.setItem(
                    'union_gallery',
                    JSON.stringify(photos.value)
                );
            }
        } catch (err) {
            console.error('Error loading gallery:', err);
            error.value = 'Error al sincronizar con el servidor.';
        } finally {
            isLoading.value = false;
        }
    };

    /* ===============================
       CRUD
    ================================ */
    const addPhoto = async (photo) => {
        isLoading.value = true;
        try {
            const photoData = {
                title: photo.title || '',
                category: photo.category || '',
                type: photo.type || 'photo',
                url: photo.url || photo.image || '',
                videoUrl: normalizeYouTubeUrl(photo.videoUrl || ''),
                icon: photo.icon || 'fa-solid fa-image'
            };

            await apiService.request('gallery', 'POST', photoData);
            await initGallery();
            return true;
        } catch (err) {
            console.error('Error adding photo:', err);
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const updatePhoto = async (id, updatedPhoto) => {
        isLoading.value = true;
        try {
            const photoData = {
                id,
                title: updatedPhoto.title || '',
                category: updatedPhoto.category || '',
                type: updatedPhoto.type || 'photo',
                url: updatedPhoto.url || updatedPhoto.image || '',
                videoUrl: normalizeYouTubeUrl(updatedPhoto.videoUrl || ''),
                icon: updatedPhoto.icon || 'fa-solid fa-image'
            };

            const result = await apiService.request('gallery', 'PUT', photoData);
            if (result?.status === 'success') {
                await initGallery();
                return true;
            }
        } catch (err) {
            console.error('Error updating photo:', err);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const deletePhoto = async (id) => {
        isLoading.value = true;
        try {
            const result = await apiService.request('gallery', 'DELETE', { id });
            if (result?.status === 'success') {
                await initGallery();
                return true;
            }
        } catch (err) {
            console.error('Error deleting photo:', err);
        } finally {
            isLoading.value = false;
        }
        return false;
    };

    const getPhotoById = (id) =>
        photos.value.find(p => p.id === parseInt(id));

    const getPhotosByCategory = (category) =>
        category === 'Todas'
            ? photos.value
            : photos.value.filter(p => p.category === category);

    // Auto init
    initGallery();

    return {
        photos,
        categories,
        isLoading,
        error,
        initGallery,
        addPhoto,
        updatePhoto,
        deletePhoto,
        getPhotoById,
        getPhotosByCategory
    };
});
