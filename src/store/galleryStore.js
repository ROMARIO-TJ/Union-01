import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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

    // Inicializar desde localStorage o usar datos iniciales
    const initGallery = () => {
        const savedPhotos = localStorage.getItem('union_gallery');
        if (savedPhotos) {
            photos.value = JSON.parse(savedPhotos);
        } else {
            photos.value = initialPhotos;
            saveToLocalStorage();
        }
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('union_gallery', JSON.stringify(photos.value));
    };

    // CRUD Operations
    const addPhoto = (photo) => {
        const newId = photos.value.length > 0 ? Math.max(...photos.value.map(p => p.id)) + 1 : 1;
        const newPhoto = {
            ...photo,
            id: newId
        };
        photos.value.push(newPhoto);
        saveToLocalStorage();
        return newPhoto;
    };

    const updatePhoto = (id, updatedPhoto) => {
        const index = photos.value.findIndex(p => p.id === id);
        if (index !== -1) {
            photos.value[index] = { ...photos.value[index], ...updatedPhoto };
            saveToLocalStorage();
            return true;
        }
        return false;
    };

    const deletePhoto = (id) => {
        const index = photos.value.findIndex(p => p.id === id);
        if (index !== -1) {
            photos.value.splice(index, 1);
            saveToLocalStorage();
            return true;
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
        addPhoto,
        updatePhoto,
        deletePhoto,
        getPhotoById,
        getPhotosByCategory
    };
});
