<script setup>
import { ref, onMounted } from 'vue';
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

// Datos de ejemplo para las gráficas
const barData = ref({
  labels: ['Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18'],
  datasets: [
    {
      label: 'Ingresos por Categoría ($)',
      backgroundColor: '#1fa774',
      data: [450000, 680000, 520000, 410000, 310000, 250000]
    }
  ]
});

const lineData = ref({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Recaudación Mensual',
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      fill: true,
      data: [1800000, 2200000, 2500000, 2100000, 2800000, 3100000]
    }
  ]
});

const pieData = ref({
  labels: ['Pagado', 'Pendiente', 'Atrasado'],
  datasets: [
    {
      backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
      data: [75, 15, 10]
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-toolbar">
      <h2>Reportes Financieros</h2>
      <div class="action-btns">
        <button class="btn-admin" style="background: #eee;">
          <i class="fa-solid fa-file-pdf"></i> Exportar PDF
        </button>
        <button class="btn-admin btn-admin--primary">
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
          <h3>Total Recaudado (Semestre)</h3>
          <div class="stat-value">$14.5M</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon matches">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <div class="stat-info">
          <h3>Crecimiento vs Mes Anterior</h3>
          <div class="stat-value text-success">+12%</div>
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
</style>
