<script setup>
import { ref, onMounted } from 'vue';
import { usePaymentsStore } from '../../../store/paymentsStore';

const paymentsStore = usePaymentsStore();
const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];
const selectedYear = ref(currentYear);

const months = [
  { id: 1, name: 'Enero' }, { id: 2, name: 'Febrero' }, { id: 3, name: 'Marzo' },
  { id: 4, name: 'Abril' }, { id: 5, name: 'Mayo' }, { id: 6, name: 'Junio' },
  { id: 7, name: 'Julio' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Septiembre' },
  { id: 10, name: 'Octubre' }, { id: 11, name: 'Noviembre' }, { id: 12, name: 'Diciembre' }
];

onMounted(async () => {
  await paymentsStore.fetchBillingCalendar();
});

const getMonthStatus = (monthId) => {
  const record = paymentsStore.billingCalendar.find(b => b.month == monthId && b.year == selectedYear.value);
  return record ? record.is_active == 1 : true; // Por defecto activo
};

const toggleMonth = async (monthId) => {
  const record = paymentsStore.billingCalendar.find(b => b.month == monthId && b.year == selectedYear.value);
  const newStatus = record ? (record.is_active == 1 ? 0 : 1) : 0;
  
  const data = {
    id: record ? record.id : null,
    month: monthId,
    year: selectedYear.value,
    is_active: newStatus,
    description: newStatus ? 'Mes Activo' : 'Pausa de Cobros (Vacaciones)'
  };

  try {
    await paymentsStore.updateBillingMonth(data);
    await paymentsStore.fetchBillingCalendar();
  } catch (error) {
    alert('Error al actualizar: ' + error.message);
  }
};
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-toolbar">
      <h2>Calendario de Cobros (Vacaciones)</h2>
      <div class="year-selector">
        <label>Año:</label>
        <select v-model="selectedYear" class="form-control" style="width: auto; display: inline-block; margin-left: 10px;">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div class="info-alert" style="background: #e8f4fd; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border-left: 4px solid #3498db;">
      <i class="fa-solid fa-circle-info"></i>
      Administre los meses en los que el club genera cobros de mensualidad y suscripción. Los meses marcados como <strong>Inactivos</strong> no generarán deuda ni afectarán el Paz y Salvo.
    </div>

    <div class="months-grid">
      <div v-for="month in months" :key="month.id" class="month-card" :class="{ 'inactive': !getMonthStatus(month.id) }">
        <div class="month-header">
          <h3>{{ month.name }}</h3>
          <i :class="getMonthStatus(month.id) ? 'fa-solid fa-calendar-check' : 'fa-solid fa-calendar-minus'"></i>
        </div>
        <div class="month-body">
          <span class="status-badge" :class="getMonthStatus(month.id) ? 'active' : 'inactive'">
            {{ getMonthStatus(month.id) ? 'Cobro Activo' : 'Pausa (Vacaciones)' }}
          </span>
          <p class="month-desc">
            {{ getMonthStatus(month.id) ? 'Se generan cobros automáticos.' : 'No se generan cobros este mes.' }}
          </p>
        </div>
        <div class="month-footer">
          <button @click="toggleMonth(month.id)" class="btn-toggle" :class="{ 'btn-activate': !getMonthStatus(month.id) }">
            {{ getMonthStatus(month.id) ? 'Pausar Cobros' : 'Activar Cobros' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.month-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid var(--admin-border);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.month-card.inactive {
  border-color: #f8d7da;
  opacity: 0.9;
}

.month-header {
  padding: 1.25rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--admin-border);
}

.month-card.inactive .month-header {
  background: #fff5f5;
  color: #c0392b;
}

.month-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--admin-text);
}

.month-body {
  padding: 1.25rem;
  flex: 1;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.status-badge.active {
  background: #e1f7ec;
  color: #1fa774;
}

.status-badge.inactive {
  background: #ffeaea;
  color: #e74c3c;
}

.month-desc {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.month-footer {
  padding: 1rem;
  border-top: 1px solid var(--admin-border);
  background: #fdfdfd;
}

.btn-toggle {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e74c3c;
  background: white;
  color: #e74c3c;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: #e74c3c;
  color: white;
}

.btn-toggle.btn-activate {
  border-color: #1fa774;
  color: #1fa774;
}

.btn-toggle.btn-activate:hover {
  background: #1fa774;
  color: white;
}
</style>
