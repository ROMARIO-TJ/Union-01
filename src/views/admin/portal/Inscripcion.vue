<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayersStore } from '../../../store/playersStore';
import { useCategoryStore } from '../../../store/categoryStore';
import { useAuthStore } from '../../../store/authStore';

const playersStore = usePlayersStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();
const router = useRouter();

const formData = ref({
  playerName: '',
  birthDate: '',
  categoryId: '',
  position: '',
  medicalInfo: '',
  parentRelation: 'Padre/Madre'
});

const isSubmitting = ref(false);
const success = ref(false);

const handleSubmit = async () => {
  isSubmitting.value = true;

  const cat = categoryStore.categories.find(c => c.id == formData.value.categoryId);

  const playerData = {
    name: formData.value.playerName,
    category: cat?.name || 'Sin Categoría',
    status: 'Pendiente',
    email: authStore.user.email,
    phone: authStore.user.phone || '',
    added_by: authStore.user.id,
    birth_date: formData.value.birthDate,
    position: formData.value.position,
    notes: formData.value.medicalInfo
  };

  // Guardar en localStorage con la misma clave que usa MiHijo.vue
  const childRecord = {
    playerName: formData.value.playerName,
    birthDate: formData.value.birthDate,
    categoryId: formData.value.categoryId,
    categoryName: cat?.name ?? 'Sin categoría',
    coach: cat?.coach ?? 'Por asignar',
    schedule: cat?.schedule ?? '',
    time: cat?.time ?? '',
    position: formData.value.position,
    notes: formData.value.medicalInfo,
    registrationDate: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
    paymentStatus: 'Pendiente',
    parentName: authStore.user?.name,
    parentEmail: authStore.user?.email
  };
  const key = `child_${authStore.user?.id || authStore.user?.email}`;
  localStorage.setItem(key, JSON.stringify(childRecord));

  // Sincronizar con el backend
  await playersStore.addPlayer(playerData);

  success.value = true;
  setTimeout(() => {
    router.push('/admin/portal/hijo');
  }, 2000);

  isSubmitting.value = false;
};
</script>


<template>
  <div class="admin-dashboard">
    <div class="admin-toolbar">
      <h2>Inscripción de Jugador</h2>
    </div>

    <div class="admin-table-wrapper" style="max-width: 800px; margin: 0 auto; padding: 2.5rem; background: var(--admin-card); border-radius: 16px;">
      <div v-if="!success">
        <p style="margin-bottom: 2rem; color: var(--admin-text-light);">Completa el formulario para registrar a tu hijo en el club. Una vez enviado, el staff administrativo revisará la solicitud.</p>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div class="form-group">
              <label>Nombre del Jugador (Hijo/a)</label>
              <input v-model="formData.playerName" type="text" class="form-control" placeholder="Nombre completo" required>
            </div>
            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <input v-model="formData.birthDate" type="date" class="form-control" required>
            </div>
          </div>

          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div class="form-group">
              <label>Categoría a Inscribir</label>
              <select v-model="formData.categoryId" class="form-control" required>
                <option value="">Selecciona una categoría</option>
                <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Posición Preferida</label>
              <input v-model="formData.position" type="text" class="form-control" placeholder="Portero, Delantero, etc.">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label>Información Médica / Alergias</label>
            <textarea v-model="formData.medicalInfo" class="form-control" rows="3" placeholder="Indica si tiene alguna condición importante..."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
            <button type="button" @click="router.back()" class="btn-admin" style="background: #eee;">Cancelar</button>
            <button type="submit" class="btn-admin btn-admin--primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Enviando...' : 'Completar Inscripción' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else style="text-align: center; padding: 3rem 0;">
        <div style="width: 80px; height: 80px; background: #d4edda; color: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1.5rem;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h2 style="margin-bottom: 1rem;">¡Inscripción Exitosa!</h2>
        <p style="color: var(--admin-text-light);">La solicitud ha sido enviada. Serás redirigido al panel principal.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../../assets/css/admin/admin.css";

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: #f9f9f9;
}

.form-control:focus {
  outline: none;
  border-color: var(--admin-accent);
  background: white;
}
</style>
