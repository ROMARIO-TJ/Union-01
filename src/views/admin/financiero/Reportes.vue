<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePlayersStore } from '../../../store/playersStore';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'vue-chartjs';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
);

const playersStore = usePlayersStore();

onMounted(async () => {
  if (playersStore.players.length === 0) {
    await playersStore.initPlayers();
  }
});

// Procesar datos para gráficas basados en datos REALES
const barData = computed(() => {
  const categoriesMap = {};
  playersStore.players.forEach(p => {
    const cat = p.category || 'Sin asignar';
    if (!categoriesMap[cat]) categoriesMap[cat] = 0;
    if (p.paymentStatus === 'Al Día') {
      categoriesMap[cat] += 50000;
    }
  });

  return {
    labels: Object.keys(categoriesMap),
    datasets: [{
      label: 'Recaudación por Categoría ($)',
      backgroundColor: '#1fa774',
      data: Object.values(categoriesMap)
    }]
  };
});

const pieData = computed(() => {
  const statusCount = { 'Al Día': 0, 'Pendiente': 0, 'En Mora': 0 };
  playersStore.players.forEach(p => {
    const status = p.paymentStatus || 'Pendiente';
    if (statusCount[status] !== undefined) statusCount[status]++;
    else statusCount['En Mora']++;
  });

  return {
    labels: ['Al Día', 'Pendiente', 'En Mora'],
    datasets: [{
      backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
      data: [statusCount['Al Día'], statusCount['Pendiente'], statusCount['En Mora']]
    }]
  };
});

// Datos de línea (simulados por ahora ya que no hay histórico en BD, pero estructurados)
const lineData = ref({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [{
    label: 'Recaudación Histórica',
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    fill: true,
    data: [1200000, 1500000, 1800000, 1600000, 1900000, 2100000]
  }]
});

const stats = computed(() => {
  const paid = playersStore.players.filter(p => p.paymentStatus === 'Al Día').length;
  const total = playersStore.players.length;
  const totalRecaudado = paid * 50000;

  return {
    totalRecaudado,
    porcentajeCerrado: total > 0 ? Math.round((paid / total) * 100) : 0
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' }
  }
};

const exportPDF = () => {
  window.print();
};

const filterDate = () => {
  alert('Esta función permitirá filtrar las gráficas por periodos de tiempo próximamente.');
};
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-toolbar">
      <h2>Reportes Financieros</h2>
      <div class="action-btns">
        <button @click="exportPDF" class="btn-admin no-print" style="background: #eee;">
          <i class="fa-solid fa-file-pdf"></i> Exportar Reporte (PDF)
        </button>
        <button @click="filterDate" class="btn-admin btn-admin--primary no-print">
          <i class="fa-solid fa-calendar-days"></i> Filtrar Fecha
        </button>
      </div>
    </div>

    <!-- Stats summary at top of reports -->
    <div class="admin-stats-grid">
      <div class="stat-card">
        <div class="stat-icon news">
          <i class="fa-solid fa-money-bill-trend-up"></i>
        </div>
        <div class="stat-info">
          <h3>Ingresos Al Día (Mes)</h3>
          <div class="stat-value">${{ stats.totalRecaudado.toLocaleString() }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon matches">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <div class="stat-info">
          <h3>Efectividad Cobro</h3>
          <div class="stat-value text-success">{{ stats.porcentajeCerrado }}%</div>
        </div>
      </div>
    </div>

    <div class="dashboard-secondary-grid">
      <!-- Ingresos Mensuales (Line Chart) -->
      <div class="admin-table-wrapper" style="padding: 1.5rem; height: 400px;">
        <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 700;">Evolución de Recaudación</h3>
        <div style="height: 300px;">
          <Line :data="lineData" :options="chartOptions" />
        </div>
      </div>

      <!-- Pie Chart (Estado de Pagos) -->
      <div class="admin-table-wrapper" style="padding: 1.5rem; height: 400px;">
        <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 700;">Estado General de Pagos</h3>
        <div style="height: 300px;">
          <Pie :data="pieData" :options="chartOptions" />
        </div>
      </div>

      <!-- Bar Chart (Ingresos por Categoria) -->
      <div class="admin-table-wrapper" style="grid-column: 1 / -1; padding: 1.5rem; height: 450px;">
        <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 700;">Ingresos Detallados por Categoría</h3>
        <div style="height: 350px;">
          <Bar :data="barData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
@import "../../../assets/css/admin/admin.css";

.text-success {
  color: #27ae60;
}

@media print {
  .no-print {
    display: none !important;
  }

  :deep(.admin-sidebar),
  :deep(.admin-header) {
    display: none !important;
  }

  :deep(.admin-main) {
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>
