import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '../services/api';

export const useGalleryStore = defineStore('gallery', () => {
    const photos = ref([]);
    const categories = ref(['Todas', 'Partidos', 'Entrenamientos', 'Eventos', 'Instalaciones', 'Videos']);

    // Datos iniciales
    const initialPhotos = [
        { id: 1, title: 'Partido vs Rival FC', category: 'Partidos', icon: 'fa-solid fa-futbol', type: 'photo' },
        { id: 2, title: 'Entrenamiento Sub-20', category: 'Entrenamientos', icon: 'fa-solid fa-person-running', type: 'photo' },
        { id: 3, title: 'Celebración Campeonato', category: 'Eventos', icon: 'fa-solid fa-trophy', type: 'photo' },
        { id: 4, title: 'Estadio Municipal', category: 'Instalaciones', icon: 'fa-solid fa-building', type: 'photo' },
        { id: 5, title: 'Final Local 2024', category: 'Partidos', icon: 'fa-solid fa-futbol', type: 'photo' },
        { id: 6, title: 'Práctica Táctica', category: 'Entrenamientos', icon: 'fa-solid fa-clipboard', type: 'photo' },
        { id: 7, title: 'Día del Hincha', category: 'Eventos', icon: 'fa-solid fa-users', type: 'photo' },
        { id: 8, title: 'Vestuarios', category: 'Instalaciones', icon: 'fa-solid fa-door-open', type: 'photo' },
        { id: 9, title: 'Highlights Partido', category: 'Videos', icon: 'fa-solid fa-video', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 10, title: 'Goles de la Semana', category: 'Videos', icon: 'fa-solid fa-video', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 11, title: 'Entrenamiento Táctico', category: 'Videos', icon: 'fa-solid fa-video', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: 12, title: 'Resumen Campeonato', category: 'Videos', icon: 'fa-solid fa-video', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ];

    const isLoading = ref(false);
    const error = ref(null);

    // Inicializar sincronizando con el servidor
    const initGallery = async () => {
        isLoading.value = true;
        error.value = null;

        // 1. Cargar caché local para feedback instantáneo
        const savedPhotos = localStorage.getItem('union_gallery');
        if (savedPhotos) {
            photos.value = JSON.parse(savedPhotos);
        } else if (photos.value.length === 0) {
            photos.value = initialPhotos;
        }

        try {
            // 2. Traer datos reales del servidor
            const data = await apiService.request('gallery');
            if (data && Array.isArray(data)) {
                photos.value = data.map(item => ({
                    ...item,
                    image: item.url || item.image || '',
                    title: item.caption || item.title || ''
                }));
                localStorage.setItem('union_gallery', JSON.stringify(photos.value));
            }
        } catch (err) {
            console.error('Error loading gallery:', err);
            error.value = 'Error al sincronizar con el servidor.';
        } finally {
            isLoading.value = false;
        }
    };

    // CRUD Operations - Backend First
    const addPhoto = async (photo) => {
        isLoading.value = true;
        try {
            // Limpiar objeto para la BD
            const photoData = {
                title: photo.title || '',
                category: photo.category || '',
                type: photo.type || 'photo',
                url: photo.url || photo.image || '', // Mapear image a url
                videoUrl: photo.videoUrl || '',
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
                title: updatedPhoto.title,
                category: updatedPhoto.category,
                type: updatedPhoto.type,
                url: updatedPhoto.url || updatedPhoto.image || '',
                videoUrl: updatedPhoto.videoUrl || '',
                icon: updatedPhoto.icon
            };
            const result = await apiService.request('gallery', 'PUT', photoData);
            if (result.status === 'success') {
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
            if (result.status === 'success') {
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

    const getPhotoById = (id) => {
        return photos.value.find(p => p.id === parseInt(id));
    };

    const getPhotosByCategory = (category) => {
        if (category === 'Todas') {
            return photos.value;
        }
        return photos.value.filter(p => p.category === category);
    };

    // Inicializar al cargar
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
