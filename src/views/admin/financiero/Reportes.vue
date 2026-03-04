<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePlayersStore } from '../../../store/playersStore';
import { usePaymentsStore } from '../../../store/paymentsStore';
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
const paymentsStore = usePaymentsStore();

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const showFilterModal = ref(false);

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

onMounted(async () => {
  await Promise.all([
    playersStore.initPlayers(),
    paymentsStore.fetchAllPayments()
  ]);
});

const isCompetitive = (categoryName) => {
  if (!categoryName) return false;
  const n = categoryName.toLowerCase();
  if (n.includes('escuela')) return false;
  if (n.includes('primera')) return true;
  const sub = n.match(/sub[\s-]*(\d+)/);
  if (sub && parseInt(sub[1]) >= 13) return true;
  return false;
};

// Procesar datos para gráficas filtrados por MES y AÑO
const filteredPayments = computed(() => {
  return paymentsStore.historicalPayments.filter(p => 
    parseInt(p.mes) === selectedMonth.value && 
    parseInt(p.year) === selectedYear.value
  );
});

const barData = computed(() => {
  const categoriesMap = {};
  
  // Para los ingresos previstos, tomamos a los jugadores activos en ese periodo
  // (Simplificado: usamos los jugadores actuales que pertenecen a la escuela/competitivo)
  playersStore.players.forEach(p => {
    const cat = p.category || 'Sin asignar';
    if (!categoriesMap[cat]) categoriesMap[cat] = { paid: 0, expected: 0 };
    
    let base = isCompetitive(cat) ? 20000 : 50000;
    if (p.sponsorship === 'full') base = 0;
    else if (p.sponsorship === 'partial') base = base / 2;
    else if (p.custom_fee) base = parseFloat(p.custom_fee);
    
    categoriesMap[cat].expected += base;
  });

  // Sumar los pagos reales filtrados
  filteredPayments.value.forEach(p => {
    // Buscamos el jugador para saber su categoría
    const player = playersStore.players.find(pl => pl.id == p.jugadorId);
    const cat = player ? player.category : 'Otros';
    if (!categoriesMap[cat]) categoriesMap[cat] = { paid: 0, expected: 0 };
    categoriesMap[cat].paid += Number(p.valor) || 0;
  });

  return {
    labels: Object.keys(categoriesMap),
    datasets: [
      {
        label: 'Recaudado ($)',
        backgroundColor: '#1fa774',
        borderRadius: 5,
        data: Object.values(categoriesMap).map(v => v.paid)
      },
      {
        label: 'Previsto ($)',
        backgroundColor: '#ecf0f1',
        borderRadius: 5,
        data: Object.values(categoriesMap).map(v => v.expected)
      }
    ]
  };
});

const pieData = computed(() => {
  const paidCount = new Set(filteredPayments.value.map(p => p.jugadorId)).size;
  const activeCount = playersStore.players.filter(p => p.status === 'Aceptado').length;
  const pendingCount = Math.max(0, activeCount - paidCount);

  return {
    labels: ['Al Día (Este Mes)', 'Pendientes / No Pagado'],
    datasets: [{
      backgroundColor: ['#2ecc71', '#e74c3c'],
      hoverOffset: 15,
      data: [paidCount, pendingCount]
    }]
  };
});

// Datos de línea (simulados por ahora ya que no hay histórico en BD, pero estructurados)
const lineData = ref({
  labels: ['Oct 24', 'Nov 24', 'Dic 24', 'Ene 25', 'Feb 25', 'Mar 25'],
  datasets: [{
    label: 'Recaudación Histórica ($)',
    borderColor: '#1fa774',
    backgroundColor: 'rgba(31, 167, 116, 0.1)',
    pointBackgroundColor: '#1fa774',
    tension: 0.4,
    fill: true,
    data: [750000, 820000, 0, 0, 1200000, 1450000] // Simulado: Dic/Ene = 0 por vacaciones
  }]
});

const stats = computed(() => {
  // 1. Lo que REALMENTE entró en el mes filtrado
  const monthlyRecaudado = filteredPayments.value
    .filter(p => p.tipo === 'Mensualidad' || p.tipo === 'Suscripción Club')
    .reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
    
  const totalRecaudadoPeriodo = filteredPayments.value.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
  
  // 2. Lo que DEBERÍA haber entrado (Solo jugadores registrados en o antes de ese mes)
  const playersActiveInPeriod = playersStore.players.filter(p => {
    if (p.status !== 'Aceptado') return false;
    // Si no hay fecha de registro, asumimos que es antiguo y debe estar en el reporte
    if (!p.registrationDate) return true;
    
    const regDate = new Date(p.registrationDate);
    const regMonth = regDate.getMonth() + 1;
    const regYear = regDate.getFullYear();
    
    // El jugador cuenta si se registró en un año anterior,
    // o si se registró este año pero en este mes o antes.
    if (regYear < selectedYear.value) return true;
    if (regYear === selectedYear.value && regMonth <= selectedMonth.value) return true;
    return false;
  });

  const totalPrevistoMensual = playersActiveInPeriod.reduce((acc, p) => {
    let base = isCompetitive(p.category) ? 20000 : 50000;
    if (p.sponsorship === 'full') return acc;
    if (p.sponsorship === 'partial') return acc + (base / 2);
    if (p.custom_fee) return acc + parseFloat(p.custom_fee);
    return acc + base;
  }, 0);

  const totalDeudores = playersActiveInPeriod.length;
  
  // 3. Efectividad (Cuántos de esos jugadores activos pagaron su mensualidad)
  const pagados = new Set(
    filteredPayments.value
      .filter(p => p.tipo === 'Mensualidad' || p.tipo === 'Suscripción Club')
      .map(p => p.jugadorId)
  ).size;

  return {
    totalRecaudado: totalRecaudadoPeriodo,
    totalPendiente: Math.max(0, totalPrevistoMensual - monthlyRecaudado),
    porcentajeCerrado: totalDeudores > 0 ? Math.round((pagados / totalDeudores) * 100) : 0
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
  showFilterModal.value = true;
};
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-toolbar" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; border-bottom: 1px solid #eef2f3; padding-bottom: 1rem;">
      <div class="toolbar-left">
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #1e293b; margin: 0;">Finanzas</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 0.95rem; font-weight: 500;">
          <i class="fa-solid fa-calendar-day" style="color: #1fa774; margin-right: 6px;"></i>
          Reporte de {{ months[selectedMonth-1] }} {{ selectedYear }}
        </p>
      </div>

      <div class="action-btns" style="display: flex; gap: 12px;">
        <button @click="exportPDF" 
          style="height: 44px; padding: 0 20px; background: #ffffff; color: #475569; border: 1.5px solid #e2e8f0; border-radius: 10px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <i class="fa-solid fa-print" style="color: #1fa774;"></i> Imprimir
        </button>
        <button @click="filterDate" 
          style="height: 44px; padding: 0 24px; background: #1e293b; color: #ffffff; border: none; border-radius: 10px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(30, 41, 59, 0.15);">
          <i class="fa-solid fa-sliders" style="color: #38bdf8;"></i> Filtrar Periodo
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
        <div class="stat-icon sponsors" style="background: rgba(231, 76, 60, 0.1); color: #e74c3c;">
          <i class="fa-solid fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>Por Recaudar (Deuda)</h3>
          <div class="stat-value" style="color: #e74c3c;">${{ stats.totalPendiente.toLocaleString() }}</div>
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

    <!-- Modal de Filtro de Fecha -->
    <div v-if="showFilterModal" class="admin-modal-overlay" @click.self="showFilterModal = false">
      <div class="admin-modal" style="max-width: 400px;">
        <div class="admin-modal-header">
          <h3>Seleccionar Periodo</h3>
          <button @click="showFilterModal = false" class="close-modal">&times;</button>
        </div>
        <div class="admin-modal-body">
          <div class="admin-form-group" style="margin-bottom: 1.5rem;">
            <label>Mes</label>
            <select v-model="selectedMonth" class="admin-search-input" style="width: 100%;">
              <option v-for="(m, i) in months" :key="i" :value="i+1">{{ m }}</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>Año</label>
            <select v-model="selectedYear" class="admin-search-input" style="width: 100%;">
              <option :value="2024">2024</option>
              <option :value="2025">2025</option>
              <option :value="2026">2026</option>
            </select>
          </div>
        </div>
        <div class="admin-modal-footer">
          <button @click="showFilterModal = false" class="btn-admin primary" style="width: 100%;">Ver Reporte</button>
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
