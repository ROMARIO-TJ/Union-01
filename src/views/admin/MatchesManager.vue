<script setup>
import { ref } from 'vue';
import { useMatchesStore } from '../../store/matchesStore';
import HeroEditor from '../../components/admin/HeroEditor.vue';

const matchesStore = useMatchesStore();
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

const formData = ref({
  category: '',
  homeTeam: 'Unión Jeguera',
  awayTeam: '',
  date: '',
  time: '',
  stadium: '',
  homeScore: null,
  awayScore: null,
  status: 'scheduled'
});

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    category: '', homeTeam: 'Unión Jeguera', awayTeam: '',
    date: '', time: '', stadium: '',
    homeScore: null, awayScore: null, status: 'scheduled'
  };
  isModalOpen.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  currentId.value = item.id;
  formData.value = { ...item };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = () => {
  if (isEditing.value) {
    matchesStore.updateMatch(currentId.value, formData.value);
  } else {
    matchesStore.addMatch(formData.value);
  }
  closeModal();
};

const deleteItem = (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este partido?')) {
    matchesStore.deleteMatch(id);
  }
};
</script>

<template>
  <div class="matches-manager">
    <HeroEditor pageKey="partidos" />
    <div class="admin-toolbar">
      <h2>Gestionar Partidos</h2>
      <button @click="openCreateModal" class="btn-admin btn-admin--primary">
        <i class="fa-solid fa-plus"></i> Nuevo Partido
      </button>
    </div>

    <div class="admin-table-wrapper">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Local</th>
              <th>Goles</th>
              <th>Visitante</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in matchesStore.matches" :key="item.id">
              <td>{{ item.category }}</td>
              <td><strong>{{ item.homeTeam }}</strong></td>
              <td>
                <span v-if="item.status === 'finished'">{{ item.homeScore }} - {{ item.awayScore }}</span>
                <span v-else>vs</span>
              </td>
              <td><strong>{{ item.awayTeam }}</strong></td>
              <td>{{ item.date }} - {{ item.time }}</td>
              <td>
                <span :style="{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  backgroundColor: item.status === 'finished' ? '#e2f9e1' : '#fff4e5',
                  color: item.status === 'finished' ? '#1e7d1a' : '#b25e09'
                }">
                  {{ item.status === 'finished' ? 'Finalizado' : 'Programado' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button @click="openEditModal(item)" class="btn-action edit" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button @click="deleteItem(item.id)" class="btn-action delete" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MOBILE CARDS VIEW -->
    <div class="admin-cards-grid">
      <div v-for="item in matchesStore.matches" :key="item.id" class="admin-card-item">
        <div class="admin-card-item__header"
          style="justify-content: center; text-align: center; flex-direction: column;">
          <div style="font-size: 0.8rem; color: var(--admin-text-light); margin-bottom: 0.5rem;">{{ item.category }}
          </div>
          <div style="display: flex; align-items: center; gap: 1rem; width: 100%; justify-content: center;">
            <div style="flex: 1; text-align: right;"><strong>{{ item.homeTeam }}</strong></div>
            <div style="background: var(--admin-bg); padding: 0.3rem 0.8rem; border-radius: 4px; font-weight: 800;">
              <span v-if="item.status === 'finished'">{{ item.homeScore }} - {{ item.awayScore }}</span>
              <span v-else>vs</span>
            </div>
            <div style="flex: 1; text-align: left;"><strong>{{ item.awayTeam }}</strong></div>
          </div>
        </div>
        <div class="admin-card-item__body">
          <div class="admin-card-item__row">
            <span class="admin-card-item__label">Fecha:</span>
            <span>{{ item.date }} - {{ item.time }}</span>
          </div>
          <div class="admin-card-item__row">
            <span class="admin-card-item__label">Estado:</span>
            <span :style="{
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              backgroundColor: item.status === 'finished' ? '#e2f9e1' : '#fff4e5',
              color: item.status === 'finished' ? '#1e7d1a' : '#b25e09'
            }">
              {{ item.status === 'finished' ? 'Finalizado' : 'Programado' }}
            </span>
          </div>
        </div>
        <div class="admin-card-item__actions">
          <button @click="openEditModal(item)" class="btn-action edit" title="Editar">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
          <button @click="deleteItem(item.id)" class="btn-action delete" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="admin-modal-overlay">
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h3>{{ isEditing ? 'Editar Partido' : 'Nuevo Partido' }}</h3>
          <button @click="closeModal"
            style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <div class="admin-modal-body">
          <form @submit.prevent="handleSubmit">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Categoría</label>
                <input v-model="formData.category" type="text" class="form-control" placeholder="Ej: Sub-20" required>
              </div>
              <div class="form-group">
                <label>Estado</label>
                <select v-model="formData.status" class="form-control">
                  <option value="scheduled">Programado</option>
                  <option value="finished">Finalizado</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Equipo Local</label>
                <input v-model="formData.homeTeam" type="text" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Equipo Visitante</label>
                <input v-model="formData.awayTeam" type="text" class="form-control" required>
              </div>
            </div>

            <div v-if="formData.status === 'finished'"
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Goles Local</label>
                <input v-model.number="formData.homeScore" type="number" class="form-control">
              </div>
              <div class="form-group">
                <label>Goles Visitante</label>
                <input v-model.number="formData.awayScore" type="number" class="form-control">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Fecha (Ej: 15 Ago)</label>
                <input v-model="formData.date" type="text" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Hora (Ej: 16:00)</label>
                <input v-model="formData.time" type="text" class="form-control" required>
              </div>
            </div>

            <div class="form-group">
              <label>Estadio</label>
              <input v-model="formData.stadium" type="text" class="form-control" required>
            </div>

            <div class="admin-modal-footer">
              <button type="button" @click="closeModal" class="btn-admin" style="background: #eee;">Cancelar</button>
              <button type="submit" class="btn-admin btn-admin--primary">
                {{ isEditing ? 'Guardar Cambios' : 'Crear Partido' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
