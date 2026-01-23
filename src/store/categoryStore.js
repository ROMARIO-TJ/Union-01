import { defineStore } from 'pinia';
import { ref } from 'vue';

import escuelaImg from '../assets/img/teams/escuela.png';

export const useCategoryStore = defineStore('categories', () => {
    const categories = ref([]);

    const initialCategories = [
        {
            id: 1,
            name: 'Escuela de Formación',
            age: '6 a 12 años',
            schedule: 'Lunes, Miércoles y Viernes',
            time: '16:00 - 17:30',
            coach: 'Prof. Juan Martínez',
            icon: 'fa-solid fa-child-reaching',
            teamImage: escuelaImg
        },
        {
            id: 2,
            name: 'Sub-13',
            age: '11 a 13 años',
            schedule: 'Martes y Jueves',
            time: '17:00 - 18:30',
            coach: 'Prof. Carlos Gómez',
            icon: 'fa-solid fa-person-running',
            teamImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 3,
            name: 'Sub-15',
            age: '13 a 15 años',
            schedule: 'Lunes, Miércoles y Viernes',
            time: '18:00 - 19:30',
            coach: 'Prof. Miguel Rodríguez',
            icon: 'fa-solid fa-person-kicking',
            teamImage: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 4,
            name: 'Sub-17',
            age: '15 a 17 años',
            schedule: 'Martes, Jueves y Sábado',
            time: '18:30 - 20:00',
            coach: 'Prof. Luis Fernández',
            icon: 'fa-solid fa-people-group',
            teamImage: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 5,
            name: 'Sub-20',
            age: '17 a 20 años',
            schedule: 'Lunes a Viernes',
            time: '19:00 - 21:00',
            coach: 'Prof. Roberto Silva',
            icon: 'fa-solid fa-medal',
            teamImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=600&auto=format&fit=crop'
        }
    ];

    const benefits = ref([]);

    const initialBenefits = [
        {
            id: 1,
            title: 'Formación Integral',
            description: 'Desarrollo técnico, táctico y humano',
            icon: 'fa-solid fa-trophy'
        },
        {
            id: 2,
            title: 'Entrenadores Certificados',
            description: 'Profesionales con experiencia comprobada',
            icon: 'fa-solid fa-users'
        },
        {
            id: 3,
            title: 'Instalaciones de Calidad',
            description: 'Canchas y equipamiento adecuado',
            icon: 'fa-solid fa-futbol'
        },
        {
            id: 4,
            title: 'Ambiente Familiar',
            description: 'Valores de respeto y compañerismo',
            icon: 'fa-solid fa-heart'
        }
    ];

    const initCategories = () => {
        const savedCats = localStorage.getItem('union_categories_v2');
        const savedBenefits = localStorage.getItem('union_benefits_v1');

        if (savedCats) {
            categories.value = JSON.parse(savedCats);
        } else {
            categories.value = initialCategories;
        }

        if (savedBenefits) {
            benefits.value = JSON.parse(savedBenefits);
        } else {
            benefits.value = initialBenefits;
        }

        if (!savedCats || !savedBenefits) {
            saveToLocalStorage();
        }
    };

    const saveToLocalStorage = () => {
        localStorage.setItem('union_categories_v2', JSON.stringify(categories.value));
        localStorage.setItem('union_benefits_v1', JSON.stringify(benefits.value));
    };

    // Category Methods ... (keep existing)
    const addCategory = (category) => {
        const newId = categories.value.length > 0 ? Math.max(...categories.value.map(c => c.id)) + 1 : 1;
        categories.value.push({ ...category, id: newId });
        saveToLocalStorage();
    };

    const updateCategory = (id, updated) => {
        const index = categories.value.findIndex(c => c.id === id);
        if (index !== -1) {
            categories.value[index] = { ...categories.value[index], ...updated };
            saveToLocalStorage();
        }
    };

    const deleteCategory = (id) => {
        categories.value = categories.value.filter(c => c.id !== id);
        saveToLocalStorage();
    };

    // Benefit Methods
    const addBenefit = (benefit) => {
        const newId = benefits.value.length > 0 ? Math.max(...benefits.value.map(b => b.id)) + 1 : 1;
        benefits.value.push({ ...benefit, id: newId });
        saveToLocalStorage();
    };

    const updateBenefit = (id, updated) => {
        const index = benefits.value.findIndex(b => b.id === id);
        if (index !== -1) {
            benefits.value[index] = { ...benefits.value[index], ...updated, id };
            saveToLocalStorage();
        }
    };

    const deleteBenefit = (id) => {
        benefits.value = benefits.value.filter(b => b.id !== id);
        saveToLocalStorage();
    };

    initCategories();

    return {
        categories,
        benefits,
        addCategory,
        updateCategory,
        deleteCategory,
        addBenefit,
        updateBenefit,
        deleteBenefit
    };
});
