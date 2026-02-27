<script setup>
import { ref, watch, computed } from 'vue';
import { useMatchesStore } from '../../store/matchesStore';
import { useTournamentStore } from '../../store/tournamentStore';
import { apiService } from '../../services/api';
import HeroEditor from '../../components/admin/HeroEditor.vue';

const matchesStore = useMatchesStore();
const tournamentStore = useTournamentStore();
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const selectedFilterCategory = ref('Todos');

const filteredMatches = computed(() => {
  if (selectedFilterCategory.value === 'Todos') return matchesStore.matches;
  return matchesStore.matches.filter(m => m.category === selectedFilterCategory.value);
});

const formData = ref({
  category: '',
  homeTeam: 'Unión Jeguera',
  homeLogo: '',
  awayTeam: '',
  awayLogo: '',
  date: '',
  time: '',
  stadium: '',
  homeScore: null,
  awayScore: null,
  status: 'scheduled'
});

const getTeamLogo = (teamName) => {
  const name = teamName.toUpperCase();
  if (name.includes('UNION JAGUERA')) return '/img/Sub-15/UNION_JAGUERA.png';
  if (name.includes('ALIANZA FC')) return '/img/Sub-15/ALIANZA_FC.png';
  if (name.includes('INTER JUNIOR')) return '/img/Sub-15/ITER_JUNIOR_CODAZZI.png';
  if (name.includes('EMBAJADORES')) return '/img/Sub-15/EMBAJADORES_BANCO_MAGDALENA.png';
  if (name.includes('ATLETICO CESAR')) return '/img/Sub-15/ATLETICO_CESAR.png';
  if (name.includes('ATLETAS DEL')) return '/img/Sub-15/ATLETAS_BOSCONIA.png';
  if (name.includes('LA GLORIA')) return '/img/Sub-15/CLUB_ATLETICO_LA_GLORIA.png';
  if (name.includes('FUTURAS ESTRELLAS')) return '/img/Sub-15/FUTURAS_ESTRELLAS_VALLEDUPAR.png';
  if (name.includes('MANCHESTER')) return '/img/Sub-15/MANCHESTER_VALLEDUPAR.png';
  if (name.includes('ACADEMIA VALLENATA')) return '/img/Sub-15/ACADEMIA_VALLENATA.png';
  if (name.includes('DESCANSA')) return '/img/Sub-15/DESCANSO.png';
  if (name.includes('VACAD VALLEDUPAR') || name.includes('ACAD VALLEDUPAR')) return '/img/Sub-15/ACADEMIA_VALLEDUPAR.png';
  return '';
};

// Auto-assign logo when team name changes
watch(() => formData.value.homeTeam, (newVal) => {
  if (!formData.value.homeLogo || formData.value.homeLogo.includes('/img/Sub-15/')) {
    formData.value.homeLogo = getTeamLogo(newVal);
  }
});

watch(() => formData.value.awayTeam, (newVal) => {
  if (!formData.value.awayLogo || formData.value.awayLogo.includes('/img/Sub-15/')) {
    formData.value.awayLogo = getTeamLogo(newVal);
  }
});

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    category: '', homeTeam: 'Unión Jeguera', homeLogo: getTeamLogo('Unión Jeguera'),
    awayTeam: '', awayLogo: '',
    date: '', time: '', stadium: '',
    homeScore: null, awayScore: null, status: 'scheduled'
  };
  isModalOpen.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  currentId.value = item.id;
  formData.value = {
    ...item,
    homeLogo: item.homeLogo || getTeamLogo(item.homeTeam),
    awayLogo: item.awayLogo || getTeamLogo(item.awayTeam)
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  if (isEditing.value) {
    await matchesStore.updateMatch(currentId.value, formData.value);
  } else {
    await matchesStore.addMatch(formData.value);
  }
  closeModal();
};

const deleteItem = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este partido?')) {
    await matchesStore.deleteMatch(id);
  }
};

const isUploadingHome = ref(false);
const isUploadingAway = ref(false);

const handleFileUpload = async (event, side) => {
  const file = event.target.files[0];
  if (!file) return;

  if (side === 'home') isUploadingHome.value = true;
  else isUploadingAway.value = true;

  try {
    const url = await apiService.upload(file);
    if (side === 'home') {
      formData.value.homeLogo = url;
    } else {
      formData.value.awayLogo = url;
    }
  } catch (error) {
    console.error('Error al subir el logo:', error);
    alert('Error al subir el archivo: ' + error.message);
  } finally {
    if (side === 'home') isUploadingHome.value = false;
    else isUploadingAway.value = false;
  }
};

const importSub15 = async () => {
  if (!confirm('¿Deseas importar el calendario Sub-15? Esto agregará los partidos a la lista.')) return;

  const schedule = [
    // Fecha 1 (RESULTADOS CARGADOS)
    { cat: 'Sub 15', home: 'ALIANZA FC "B"', away: 'INTER JUNIOR', date: '21 Feb', time: '10:00', stadium: 'Cancha Galo Celedon', homeScore: 0, awayScore: 2, status: 'finished' },
    { cat: 'Sub 15', home: 'LOS EMBAJADORES DE EL BANCO', away: '"B"ACAD VALLEDUPAR FC', date: '21 Feb', time: '15:00', stadium: 'Cancha El Salto', homeScore: 5, awayScore: 1, status: 'finished' },
    { cat: 'Sub 15', home: 'UNION JAGUERA', away: 'FUTURAS ESTRELLAS', date: '21 Feb', time: '15:15', stadium: 'Estadio Ascanio Viña', homeScore: 3, awayScore: 0, status: 'finished' },
    { cat: 'Sub 15', home: 'ATLETICO CESAR FC', away: 'ATLETAS DEL MAÑANA', date: '22 Feb', time: '16:30', stadium: 'Gustavo Calderon', homeScore: 0, awayScore: 3, status: 'finished' },
    { cat: 'Sub 15', home: 'ACADEMIA VALLENATA', away: 'C.A LA GLORIA', date: '22 Feb', time: '13:45', stadium: 'Estadio Edinson Mejia', homeScore: 1, awayScore: 5, status: 'finished' },
    { cat: 'Sub 15', home: 'DESCANSA', away: 'MANCHESTER VALLEDUPAR', date: '21 Feb', time: '00:00', stadium: '12 de Octubre', homeScore: 0, awayScore: 0, status: 'finished' },

    // Fecha 2 (PRÓXIMOS)
    { cat: 'Sub 15', home: 'INTER JUNIOR', away: 'DESCANSA', date: '28 Feb', time: '16:00', stadium: 'Estadio Agustin' },
    { cat: 'Sub 15', home: '"B"ACAD VALLEDUPAR FC', away: 'ALIANZA FC "B"', date: '28 Feb', time: '10:00', stadium: 'Cancha 12 de Octubre' },
    { cat: 'Sub 15', home: 'ATLETAS DEL MAÑANA', away: 'LOS EMBAJADORES DE EL BANCO', date: '28 Feb', time: '16:00', stadium: 'Bosconia' },
    { cat: 'Sub 15', home: 'C.A LA GLORIA', away: 'ATLETICO CESAR FC', date: '28 Feb', time: '16:00', stadium: 'La Gloria, Juan Bandera' },
    { cat: 'Sub 15', home: 'FUTURAS ESTRELLAS', away: 'ACADEMIA VALLENATA', date: '28 Feb', time: '16:00', stadium: 'Valledupar, Villamirian' },
    { cat: 'Sub 15', home: 'MANCHESTER VALLEDUPAR', away: 'UNION JAGUERA', date: '01 Mar', time: '16:00', stadium: 'Los Patios, 12 de Octubre' },
    // ... rest of the dates
  ];

  // Eliminar el mensaje genérico y poner un texto de progreso
  let addedCount = 0;
  let skippedCount = 0;

  for (const m of schedule) {
    // Verificar si el partido ya existe en esta categoría con los mismos equipos
    const matchExists = matchesStore.matches.some(
      existing => existing.category === m.cat &&
        existing.homeTeam === m.home &&
        existing.awayTeam === m.away
    );

    if (!matchExists) {
      const success = await matchesStore.addMatch({
        category: m.cat,
        homeTeam: m.home,
        homeLogo: getTeamLogo(m.home),
        awayTeam: m.away,
        awayLogo: getTeamLogo(m.away),
        date: m.date,
        time: m.time,
        stadium: m.stadium,
        homeScore: m.homeScore ?? null,
        awayScore: m.awayScore ?? null,
        status: m.status || 'scheduled'
      });
      if (success) addedCount++;
    } else {
      skippedCount++;
    }
  }

  alert(`Importación completada:\n✅ ${addedCount} partidos nuevos agregados.\n⚠️ ${skippedCount} partidos omitidos porque ya existían.`);
};
</script>

<template>
  <div class="matches-manager">
    <HeroEditor pageKey="partidos" />
    <div class="admin-toolbar">
      <div>
        <h2>Gestionar Partidos</h2>
        <button @click="importSub15" class="btn-admin"
          style="background: #3b82f6; color: white; margin-top: 0.5rem; font-size: 0.8rem;">
          <i class="fa-solid fa-file-import"></i> Cargar Calendario Sub-15
        </button>
      </div>
      <button @click="openCreateModal" class="btn-admin btn-admin--primary">
        <i class="fa-solid fa-plus"></i> Nuevo Partido
      </button>
    </div>

    <div class="category-tabs-container">
      <div class="category-tabs">
        <button class="tab-btn" :class="{ active: selectedFilterCategory === 'Todos' }"
          @click="selectedFilterCategory = 'Todos'">
          Todos
        </button>
        <button v-for="cat in tournamentStore.categories" :key="cat" class="tab-btn"
          :class="{ active: selectedFilterCategory === cat }" @click="selectedFilterCategory = cat">
          {{ cat }}
        </button>
      </div>
    </div>

    <div class="admin-table-wrapper">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Local</th>
              <th>Visitante</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredMatches" :key="item.id">
              <td>{{ item.category }}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <img v-if="item.homeLogo" :src="item.homeLogo"
                    style="width: 24px; height: 24px; object-fit: contain;">
                  <strong>{{ item.homeTeam }}</strong>
                  <span v-if="item.status === 'finished'" style="margin-left: auto; font-weight: 800;">{{ item.homeScore
                    }}</span>
                </div>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span v-if="item.status === 'finished'" style="margin-right: auto; font-weight: 800;">{{
                    item.awayScore }}</span>
                  <strong>{{ item.awayTeam }}</strong>
                  <img v-if="item.awayLogo" :src="item.awayLogo"
                    style="width: 24px; height: 24px; object-fit: contain;">
                </div>
              </td>
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
      <div v-for="item in filteredMatches" :key="item.id" class="admin-card-item">
        <div class="admin-card-item__header"
          style="justify-content: center; text-align: center; flex-direction: column;">
          <div style="font-size: 0.8rem; color: var(--admin-text-light); margin-bottom: 0.5rem;">{{ item.category }}
          </div>
          <div style="display: flex; align-items: center; gap: 1rem; width: 100%; justify-content: center;">
            <div
              style="flex: 1; text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem;">
              <strong>{{ item.homeTeam }}</strong>
              <img v-if="item.homeLogo" :src="item.homeLogo" style="width: 20px; height: 20px; object-fit: contain;">
            </div>
            <div style="background: var(--admin-bg); padding: 0.3rem 0.8rem; border-radius: 4px; font-weight: 800;">
              <span v-if="item.status === 'finished'">{{ item.homeScore }} - {{ item.awayScore }}</span>
              <span v-else>vs</span>
            </div>
            <div
              style="flex: 1; text-align: left; display: flex; align-items: center; justify-content: flex-start; gap: 0.5rem;">
              <img v-if="item.awayLogo" :src="item.awayLogo" style="width: 20px; height: 20px; object-fit: contain;">
              <strong>{{ item.awayTeam }}</strong>
            </div>
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
                <input v-model="formData.homeTeam" @input="formData.homeLogo = getTeamLogo(formData.homeTeam)"
                  type="text" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Logo Local</label>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <div @click="$refs.homeLogoInput.click()"
                      style="flex: 1; border: 2px dashed #ddd; border-radius: 8px; padding: 0.5rem; text-align: center; cursor: pointer; background: #fafafa; transition: all 0.3s; position: relative;"
                      :style="{ borderColor: isUploadingHome ? 'var(--primary-color)' : '#ddd' }">
                      <div v-if="isUploadingHome" class="upload-loader"></div>
                      <span v-else style="font-size: 0.8rem; color: #666;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> {{ formData.homeLogo ? 'Cambiar Logo' : 'Subir Logo'
                        }}
                      </span>
                    </div>
                    <img v-if="formData.homeLogo" :src="formData.homeLogo"
                      style="width: 42px; height: 42px; object-fit: contain; border: 1px solid #eee; border-radius: 4px; background: white; padding: 2px;">
                    <input type="file" ref="homeLogoInput" @change="e => handleFileUpload(e, 'home')" accept="image/*"
                      style="display: none;">
                  </div>
                  <input v-model="formData.homeLogo" type="text" class="form-control"
                    style="font-size: 0.7rem; height: auto; padding: 2px 5px;" placeholder="O pega la URL aquí...">
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Equipo Visitante</label>
                <input v-model="formData.awayTeam" @input="formData.awayLogo = getTeamLogo(formData.awayTeam)"
                  type="text" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Logo Visitante</label>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <div @click="$refs.awayLogoInput.click()"
                      style="flex: 1; border: 2px dashed #ddd; border-radius: 8px; padding: 0.5rem; text-align: center; cursor: pointer; background: #fafafa; transition: all 0.3s; position: relative;"
                      :style="{ borderColor: isUploadingAway ? 'var(--primary-color)' : '#ddd' }">
                      <div v-if="isUploadingAway" class="upload-loader"></div>
                      <span v-else style="font-size: 0.8rem; color: #666;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> {{ formData.awayLogo ? 'Cambiar Logo' : 'Subir Logo'
                        }}
                      </span>
                    </div>
                    <img v-if="formData.awayLogo" :src="formData.awayLogo"
                      style="width: 42px; height: 42px; object-fit: contain; border: 1px solid #eee; border-radius: 4px; background: white; padding: 2px;">
                    <input type="file" ref="awayLogoInput" @change="e => handleFileUpload(e, 'away')" accept="image/*"
                      style="display: none;">
                  </div>
                  <input v-model="formData.awayLogo" type="text" class="form-control"
                    style="font-size: 0.7rem; height: auto; padding: 2px 5px;" placeholder="O pega la URL aquí...">
                </div>
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

<style scoped>
.upload-loader {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: var(--admin-bg-input, #fff);
  color: var(--admin-text, #333);
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--admin-text-light, #666);
}

.category-tabs-container {
  margin: 0 0 2rem 0;
  padding: 0 1rem;
}

.category-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1.2rem;
  border: none;
  background: var(--admin-bg, #f1f5f9);
  color: var(--admin-text-light, #64748b);
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn.active {
  background: var(--primary-color, #11d442);
  color: #fff;
}
</style>
