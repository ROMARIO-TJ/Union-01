import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const useClubStore = defineStore('club', () => {
    const boardMembers = ref([]);
    const facilities = ref([]);
    const timeline = ref([]);
    const isLoading = ref(false);

    const initialBoard = [
        { id: 1, name: 'Juan Pérez', position: 'Presidente' },
        { id: 2, name: 'María González', position: 'Vicepresidenta' }
    ];

    const initialFacilities = [
        { id: 1, name: 'Estadio Municipal', description: 'Cancha principal.', icon: 'fa-solid fa-futbol' }
    ];

    const initialTimeline = [
        { id: 1, year: '1985', title: 'Fundación del Club', description: 'Nace Unión Jeguera.' },
        { id: 2, year: '2024', title: 'Renovación Integral', description: 'Modernización del club.' }
    ];

    // Inicializar desde API con respaldo local
    const initStore = async () => {
        isLoading.value = true;

        // Cargar respaldo local inmediatamente
        const localBoard = localStorage.getItem('union_board_v1');
        const localFacilities = localStorage.getItem('union_facilities_v1');
        const localTimeline = localStorage.getItem('union_timeline_v1');

        boardMembers.value = localBoard ? JSON.parse(localBoard) : initialBoard;
        facilities.value = localFacilities ? JSON.parse(localFacilities) : initialFacilities;
        timeline.value = localTimeline ? JSON.parse(localTimeline) : initialTimeline;

        try {
            const [boardData, facilitiesData, timelineData] = await Promise.all([
                apiService.request('settings', 'GET', { key: 'club_board' }).catch(() => null),
                apiService.request('settings', 'GET', { key: 'club_facilities' }).catch(() => null),
                apiService.request('settings', 'GET', { key: 'club_timeline' }).catch(() => null)
            ]);

            if (boardData && Object.keys(boardData).length > 0) {
                boardMembers.value = typeof boardData === 'string' ? JSON.parse(boardData) : boardData;
                localStorage.setItem('union_board_v1', JSON.stringify(boardMembers.value));
            }

            if (facilitiesData && Object.keys(facilitiesData).length > 0) {
                facilities.value = typeof facilitiesData === 'string' ? JSON.parse(facilitiesData) : facilitiesData;
                localStorage.setItem('union_facilities_v1', JSON.stringify(facilities.value));
            }

            if (timelineData && Object.keys(timelineData).length > 0) {
                timeline.value = typeof timelineData === 'string' ? JSON.parse(timelineData) : timelineData;
                localStorage.setItem('union_timeline_v1', JSON.stringify(timeline.value));
            }
        } catch (error) {
            console.warn('Conexión con el servidor fallida. Usando datos locales del Club.');
        } finally {
            isLoading.value = false;
        }
    };

    const saveToLocalStorage = () => {
        localStorage.setItem('union_board_v1', JSON.stringify(boardMembers.value));
        localStorage.setItem('union_facilities_v1', JSON.stringify(facilities.value));
        localStorage.setItem('union_timeline_v1', JSON.stringify(timeline.value));
    };

    // Guardar en API y localStorage
    const saveBoard = async () => {
        saveToLocalStorage();
        try {
            await apiService.request('settings', 'POST', { key: 'club_board', value: boardMembers.value });
        } catch (error) {
            console.error('Error saving board to server');
        }
    };

    const saveFacilities = async () => {
        saveToLocalStorage();
        try {
            await apiService.request('settings', 'POST', { key: 'club_facilities', value: facilities.value });
        } catch (error) {
            console.error('Error saving facilities to server');
        }
    };

    const saveTimeline = async () => {
        saveToLocalStorage();
        try {
            await apiService.request('settings', 'POST', { key: 'club_timeline', value: timeline.value });
        } catch (error) {
            console.error('Error saving timeline to server');
        }
    };

    // --- BOARD OPERATIONS ---
    const addBoardMember = async (member) => {
        const newId = boardMembers.value.length > 0 ? Math.max(...boardMembers.value.map(m => m.id)) + 1 : 1;
        boardMembers.value.push({ ...member, id: newId });
        await saveBoard();
    };

    const updateBoardMember = async (id, updated) => {
        const index = boardMembers.value.findIndex(m => m.id === id);
        if (index !== -1) {
            boardMembers.value[index] = { ...boardMembers.value[index], ...updated };
            await saveBoard();
        }
    };

    const deleteBoardMember = async (id) => {
        boardMembers.value = boardMembers.value.filter(m => m.id !== id);
        await saveBoard();
    };

    // --- FACILITY OPERATIONS ---
    const addFacility = async (facility) => {
        const newId = facilities.value.length > 0 ? Math.max(...facilities.value.map(f => f.id)) + 1 : 1;
        facilities.value.push({ ...facility, id: newId });
        await saveFacilities();
    };

    const updateFacility = async (id, updated) => {
        const index = facilities.value.findIndex(f => f.id === id);
        if (index !== -1) {
            facilities.value[index] = { ...facilities.value[index], ...updated };
            await saveFacilities();
        }
    };

    const deleteFacility = async (id) => {
        facilities.value = facilities.value.filter(f => f.id !== id);
        await saveFacilities();
    };

    // --- TIMELINE OPERATIONS ---
    const addTimelineItem = async (item) => {
        const newId = timeline.value.length > 0 ? Math.max(...timeline.value.map(t => t.id || 0)) + 1 : 1;
        timeline.value.push({ ...item, id: newId });
        await saveTimeline();
    };

    const updateTimelineItem = async (id, updated) => {
        const index = timeline.value.findIndex(t => (t.id || t.year) === id);
        if (index !== -1) {
            timeline.value[index] = { ...timeline.value[index], ...updated, id };
            await saveTimeline();
        }
    };

    const deleteTimelineItem = async (id) => {
        timeline.value = timeline.value.filter(t => (t.id || t.year) !== id);
        await saveTimeline();
    };

    initStore();

    return {
        boardMembers,
        facilities,
        timeline,
        isLoading,
        addBoardMember,
        updateBoardMember,
        deleteBoardMember,
        addFacility,
        updateFacility,
        deleteFacility,
        addTimelineItem,
        updateTimelineItem,
        deleteTimelineItem
    };
});
