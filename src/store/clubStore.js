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

            if (boardData) {
                boardMembers.value = typeof boardData === 'string' ? JSON.parse(boardData) : boardData;
                localStorage.setItem('union_board_v1', JSON.stringify(boardMembers.value));
            }

            if (facilitiesData) {
                facilities.value = typeof facilitiesData === 'string' ? JSON.parse(facilitiesData) : facilitiesData;
                localStorage.setItem('union_facilities_v1', JSON.stringify(facilities.value));
            }

            if (timelineData) {
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
        isLoading.value = true;
        const newId = boardMembers.value.length > 0 ? Math.max(...boardMembers.value.map(m => m.id)) + 1 : 1;
        const newList = [...boardMembers.value, { ...member, id: newId }];
        try {
            await apiService.request('settings', 'POST', { key: 'club_board', value: newList });
            await initStore();
        } finally {
            isLoading.value = false;
        }
    };

    const updateBoardMember = async (id, updated) => {
        isLoading.value = true;
        const newList = boardMembers.value.map(m => m.id === id ? { ...updated, id } : m);
        try {
            await apiService.request('settings', 'POST', { key: 'club_board', value: newList });
            await initStore();
        } finally {
            isLoading.value = false;
        }
    };

    const deleteBoardMember = async (id) => {
        isLoading.value = true;
        const newList = boardMembers.value.filter(m => m.id !== id);
        try {
            await apiService.request('settings', 'POST', { key: 'club_board', value: newList });
            await initStore();
        } finally {
            isLoading.value = false;
        }
    };

    // --- FACILITY OPERATIONS ---
    const addFacility = async (facility) => {
        isLoading.value = true;
        const newId = facilities.value.length > 0 ? Math.max(...facilities.value.map(f => f.id)) + 1 : 1;
        const newList = [...facilities.value, { ...facility, id: newId }];
        try {
            await apiService.request('settings', 'POST', { key: 'club_facilities', value: newList });
            await initStore();
        } finally {
            isLoading.value = false;
        }
    };

    const updateFacility = async (id, updated) => {
        isLoading.value = true;
        const newList = facilities.value.map(f => f.id === id ? { ...updated, id } : f);
        try {
            await apiService.request('settings', 'POST', { key: 'club_facilities', value: newList });
            await initStore();
        } finally {
            isLoading.value = false;
        }
    };

    const deleteFacility = async (id) => {
        isLoading.value = true;
        const newList = facilities.value.filter(f => f.id !== id);
        try {
            await apiService.request('settings', 'POST', { key: 'club_facilities', value: newList });
            await initStore();
        } finally {
            isLoading.value = false;
        }
    };

    // --- TIMELINE OPERATIONS ---
    const addTimelineItem = async (item) => {
        isLoading.value = true;
        const newId = timeline.value.length > 0 ? Math.max(...timeline.value.map(t => t.id || 0)) + 1 : 1;
        const newList = [...timeline.value, { ...item, id: newId }];
        try {
            await apiService.request('settings', 'POST', { key: 'club_timeline', value: newList });
            await initStore();
        } finally {
            isLoading.value = false;
        }
    };

    const updateTimelineItem = async (id, updated) => {
        isLoading.value = true;
        const newList = timeline.value.map(t => (t.id || t.year) === id ? { ...updated, id } : t);
        try {
            await apiService.request('settings', 'POST', { key: 'club_timeline', value: newList });
            await initStore();
        } finally {
            isLoading.value = false;
        }
    };

    const deleteTimelineItem = async (id) => {
        isLoading.value = true;
        const newList = timeline.value.filter(t => (t.id || t.year) !== id);
        try {
            await apiService.request('settings', 'POST', { key: 'club_timeline', value: newList });
            await initStore();
        } finally {
            isLoading.value = false;
        }
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
