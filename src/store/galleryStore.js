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

        // Respaldo local
        const savedPhotos = localStorage.getItem('union_gallery');
        if (savedPhotos) {
            photos.value = JSON.parse(savedPhotos);
        } else {
            photos.value = initialPhotos;
        }

        try {
            const data = await apiService.request('gallery');
            if (data && Array.isArray(data)) {
                photos.value = data;
                saveToLocalStorage();
            }
        } catch (err) {
            console.error('Error loading gallery:', err);
            error.value = 'Error al sincronizar galería.';
        } finally {
            isLoading.value = false;
        }
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('union_gallery', JSON.stringify(photos.value));
    };

    // CRUD Operations
    const addPhoto = async (photo) => {
        try {
            const result = await apiService.request('gallery', 'POST', photo);
            if (result.status === 'success') {
                await initGallery();
                return true;
            }
        } catch (err) {
            console.error('Error adding photo:', err);
        }
        return false;
    };

    const updatePhoto = async (id, updatedPhoto) => {
        // La API actual no tiene un PUT para gallery explícito, pero podríamos añadirlo si fuera necesario.
        // Por ahora lo manejamos localmente o asumiendo que no se editan fotos a menudo.
        const index = photos.value.findIndex(p => p.id === id);
        if (index !== -1) {
            photos.value[index] = { ...photos.value[index], ...updatedPhoto };
            saveToLocalStorage();
            return true;
        }
        return false;
    };

    const deletePhoto = async (id) => {
        try {
            const result = await apiService.request('gallery', 'DELETE', { id });
            if (result.status === 'success') {
                await initGallery();
                return true;
            }
        } catch (err) {
            console.error('Error deleting photo:', err);
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
        addPhoto,
        updatePhoto,
        deletePhoto,
        getPhotoById,
        getPhotosByCategory
    };
});
