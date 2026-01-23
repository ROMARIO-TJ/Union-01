import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSponsorsStore = defineStore('sponsors', () => {
    const sponsors = ref([]);

    // Datos iniciales
    const initialSponsors = [
        { id: 1, name: 'Sponsor 1', icon: 'fa-solid fa-building' },
        { id: 2, name: 'Sponsor 2', icon: 'fa-solid fa-store' },
        { id: 3, name: 'Sponsor 3', icon: 'fa-solid fa-shop' },
        { id: 4, name: 'Sponsor 4', icon: 'fa-solid fa-industry' },
        { id: 5, name: 'Sponsor 5', icon: 'fa-solid fa-briefcase' },
        { id: 6, name: 'Sponsor 6', icon: 'fa-solid fa-handshake' }
    ];

    // Inicializar desde localStorage o usar datos iniciales
    const initSponsors = () => {
        const savedSponsors = localStorage.getItem('union_sponsors');
        if (savedSponsors) {
            sponsors.value = JSON.parse(savedSponsors);
        } else {
            sponsors.value = initialSponsors;
            saveToLocalStorage();
        }
    };

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('union_sponsors', JSON.stringify(sponsors.value));
    };

    // CRUD Operations
    const addSponsor = (sponsor) => {
        const newId = sponsors.value.length > 0 ? Math.max(...sponsors.value.map(s => s.id)) + 1 : 1;
        const newSponsor = {
            ...sponsor,
            id: newId
        };
        sponsors.value.push(newSponsor);
        saveToLocalStorage();
        return newSponsor;
    };

    const updateSponsor = (id, updatedSponsor) => {
        const index = sponsors.value.findIndex(s => s.id === id);
        if (index !== -1) {
            sponsors.value[index] = { ...sponsors.value[index], ...updatedSponsor };
            saveToLocalStorage();
            return true;
        }
        return false;
    };

    const deleteSponsor = (id) => {
        const index = sponsors.value.findIndex(s => s.id === id);
        if (index !== -1) {
            sponsors.value.splice(index, 1);
            saveToLocalStorage();
            return true;
        }
        return false;
    };

    const getSponsorById = (id) => {
        return sponsors.value.find(s => s.id === parseInt(id));
    };

    // Inicializar al cargar
    initSponsors();

    return {
        sponsors,
        addSponsor,
        updateSponsor,
        deleteSponsor,
        getSponsorById
    };
});
