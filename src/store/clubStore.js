import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useClubStore = defineStore('club', () => {
    const boardMembers = ref([]);
    const facilities = ref([]);

    // Datos iniciales para la Comisión Directiva
    const initialBoard = [
        { id: 1, name: 'Juan Pérez', position: 'Presidente' },
        { id: 2, name: 'María González', position: 'Vicepresidenta' },
        { id: 3, name: 'Carlos Rodríguez', position: 'Secretario' },
        { id: 4, name: 'Ana Martínez', position: 'Tesorera' },
        { id: 5, name: 'Luis Fernández', position: 'Vocal Deportivo' },
        { id: 6, name: 'Carmen López', position: 'Vocal de Prensa' }
    ];

    // Datos iniciales para las Instalaciones
    const initialFacilities = [
        {
            id: 1,
            name: 'Estadio Municipal',
            description: 'Cancha principal con capacidad para 2,000 espectadores.',
            icon: 'fa-solid fa-futbol'
        },
        {
            id: 2,
            name: 'Cancha de Entrenamiento',
            description: 'Espacio dedicado para prácticas y desarrollo técnico.',
            icon: 'fa-solid fa-person-running'
        },
        {
            id: 3,
            name: 'Vestuarios',
            description: 'Instalaciones modernas y equipadas para jugadores.',
            icon: 'fa-solid fa-shirt'
        },
        {
            id: 4,
            name: 'Sede Social',
            description: 'Espacio de encuentro para socios y actividades del club.',
            icon: 'fa-solid fa-house'
        }
    ];

    // Inicializar desde localStorage o usar datos iniciales
    const initStore = () => {
        const savedBoard = localStorage.getItem('union_board');
        const savedFacilities = localStorage.getItem('union_facilities');

        if (savedBoard) {
            boardMembers.value = JSON.parse(savedBoard);
        } else {
            boardMembers.value = initialBoard;
            saveBoard();
        }

        if (savedFacilities) {
            facilities.value = JSON.parse(savedFacilities);
        } else {
            facilities.value = initialFacilities;
            saveFacilities();
        }
    };

    // Guardar en localStorage
    const saveBoard = () => {
        localStorage.setItem('union_board', JSON.stringify(boardMembers.value));
    };

    const saveFacilities = () => {
        localStorage.setItem('union_facilities', JSON.stringify(facilities.value));
    };

    // Operaciones para Comisión Directiva
    const addBoardMember = (member) => {
        const newId = boardMembers.value.length > 0 ? Math.max(...boardMembers.value.map(m => m.id)) + 1 : 1;
        boardMembers.value.push({ ...member, id: newId, image: member.image || null });
        saveBoard();
    };

    const updateBoardMember = (id, updatedMember) => {
        const index = boardMembers.value.findIndex(m => m.id === id);
        if (index !== -1) {
            boardMembers.value[index] = { ...boardMembers.value[index], ...updatedMember };
            saveBoard();
        }
    };

    const deleteBoardMember = (id) => {
        boardMembers.value = boardMembers.value.filter(m => m.id !== id);
        saveBoard();
    };

    // Operaciones para Instalaciones
    const addFacility = (facility) => {
        const newId = facilities.value.length > 0 ? Math.max(...facilities.value.map(f => f.id)) + 1 : 1;
        facilities.value.push({ ...facility, id: newId, image: facility.image || null });
        saveFacilities();
    };

    const updateFacility = (id, updatedFacility) => {
        const index = facilities.value.findIndex(f => f.id === id);
        if (index !== -1) {
            facilities.value[index] = { ...facilities.value[index], ...updatedFacility };
            saveFacilities();
        }
    };

    const deleteFacility = (id) => {
        facilities.value = facilities.value.filter(f => f.id !== id);
        saveFacilities();
    };

    // Inicializar al cargar
    initStore();

    return {
        boardMembers,
        facilities,
        addBoardMember,
        updateBoardMember,
        deleteBoardMember,
        addFacility,
        updateFacility,
        deleteFacility
    };
});
