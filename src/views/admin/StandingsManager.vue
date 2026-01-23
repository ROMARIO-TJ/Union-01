<script setup>
import { ref, watch, computed } from 'vue';
import { useTournamentStore } from '../../store/tournamentStore';

const tournamentStore = useTournamentStore();
const selectedCategory = ref(tournamentStore.standings[0]?.id || '');

const currentStandings = computed(() => {
    return tournamentStore.standings.find(s => s.id === selectedCategory.value);
});

// Editable copy of teams
const editableTeams = ref([]);

watch(selectedCategory, (newVal) => {
    const data = tournamentStore.standings.find(s => s.id === newVal);
    if (data) {
        // Clone to avoid direct mutation until save
        editableTeams.value = JSON.parse(JSON.stringify(data.teams));
    }
}, { immediate: true });

const addTeam = () => {
    editableTeams.value.push({
        name: 'Nuevo Equipo',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0
    });
};

const removeTeam = (index) => {
    if (confirm('¿Eliminar equipo?')) {
        editableTeams.value.splice(index, 1);
    }
};

const saveChanges = () => {
    tournamentStore.updateStandings(selectedCategory.value, editableTeams.value);
    // Re-fetch to get sorted data
    const data = tournamentStore.standings.find(s => s.id === selectedCategory.value);
    editableTeams.value = JSON.parse(JSON.stringify(data.teams));
    alert('Tabla guardada y actualizada exitosamente.');
};
</script>

<template>
    <div class="standings-manager">
        <div class="admin-toolbar">
            <h2>Gestionar Tabla de Posiciones</h2>
            <button @click="saveChanges" class="btn-admin btn-admin--primary">
                <i class="fa-solid fa-save"></i> Guardar Cambios
            </button>
        </div>

        <!-- Category Selector -->
        <div class="category-tabs">
            <button v-for="cat in tournamentStore.categories" :key="cat" class="tab-btn"
                :class="{ active: currentStandings?.category === cat }"
                @click="selectedCategory = tournamentStore.standings.find(s => s.category === cat).id">
                {{ cat }}
            </button>
        </div>

        <div class="table-editor" v-if="currentStandings">
            <div class="table-responsive">
                <table class="editor-table">
                    <thead>
                        <tr>
                            <th>Equipo</th>
                            <th title="Partidos Jugados">PJ</th>
                            <th title="Partidos Ganados">PG</th>
                            <th title="Partidos Empatados">PE</th>
                            <th title="Partidos Perdidos">PP</th>
                            <th title="Goles a Favor">GF</th>
                            <th title="Goles en Contra">GC</th>
                            <th title="Diferencia de Goles">DG</th>
                            <th title="Puntos">Pts</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(team, index) in editableTeams" :key="index">
                            <td class="team-input-cell">
                                <input v-model="team.name" type="text" placeholder="Nombre del Equipo">
                            </td>
                            <td class="num-input-cell"><input v-model.number="team.played" type="number"></td>
                            <td class="num-input-cell"><input v-model.number="team.won" type="number"></td>
                            <td class="num-input-cell"><input v-model.number="team.drawn" type="number"></td>
                            <td class="num-input-cell"><input v-model.number="team.lost" type="number"></td>
                            <td class="num-input-cell"><input v-model.number="team.gf" type="number"></td>
                            <td class="num-input-cell"><input v-model.number="team.ga" type="number"></td>
                            <td class="calc-cell">{{ team.gf - team.ga }}</td>
                            <td class="num-input-cell points-cell"><input v-model.number="team.points" type="number">
                            </td>
                            <td>
                                <button @click="removeTeam(index)" class="btn-icon delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button @click="addTeam" class="btn-add-row">
                <i class="fa-solid fa-plus"></i> Agregar Equipo
            </button>
        </div>
    </div>
</template>

<style scoped>
.standings-manager {
    padding: 1rem;
}

.category-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
}

.tab-btn {
    padding: 0.5rem 1.2rem;
    border: none;
    background: var(--admin-bg);
    color: var(--text-secondary);
    border-radius: 50px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.tab-btn.active {
    background: var(--accent-color);
    color: #fff;
}

.table-editor {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.table-responsive {
    overflow-x: auto;
}

.editor-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.editor-table th {
    text-align: center;
    padding: 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.editor-table td {
    padding: 0.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.editor-table input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-primary);
    text-align: center;
}

.team-input-cell input {
    text-align: left;
    font-weight: 600;
}

.num-input-cell input {
    width: 60px;
}

.points-cell input {
    font-weight: 800;
    color: var(--accent-color);
    background: rgba(31, 167, 116, 0.1);
}

.calc-cell {
    text-align: center;
    font-weight: 600;
    color: var(--text-secondary);
}

.btn-icon.delete {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.5rem;
}

.btn-icon.delete:hover {
    background: rgba(239, 68, 68, 0.1);
    border-radius: 4px;
}

.btn-add-row {
    margin-top: 1rem;
    width: 100%;
    padding: 0.8rem;
    border: 2px dashed rgba(0, 0, 0, 0.1);
    background: none;
    color: var(--text-secondary);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-add-row:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(31, 167, 116, 0.05);
}
</style>
