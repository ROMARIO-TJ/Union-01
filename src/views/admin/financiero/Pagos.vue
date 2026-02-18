<script setup>
import { ref } from 'vue';

const payments = ref([
  { id: 1, player: 'Juan Pérez', amount: '$50.000', date: '2026-02-10', status: 'Pagado' },
  { id: 2, player: 'María González', amount: '$50.000', date: '2026-02-09', status: 'Pagado' },
  { id: 3, player: 'Carlos Rodríguez', amount: '$50.000', date: '2026-02-08', status: 'Pendiente' },
]);

const getStatusClass = (status) => {
  if (status === 'Pagado') return 'stat-icon news'; // Greenish
  if (status === 'Pendiente') return 'stat-icon sponsors'; // Yellowish
  return 'stat-icon club'; // Reddish
};
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-toolbar">
      <h2>Gestión de Pagos</h2>
      <button class="btn-admin btn-admin--primary">
        <i class="fa-solid fa-plus"></i> Registrar Pago
      </button>
    </div>

    <div class="admin-stats-grid">
      <div class="stat-card">
        <div class="stat-icon matches">
          <i class="fa-solid fa-dollar-sign"></i>
        </div>
        <div class="stat-info">
          <h3>Total Mes</h3>
          <div class="stat-value">$2,45M</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sponsors">
          <i class="fa-solid fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>Pendientes</h3>
          <div class="stat-value">12</div>
        </div>
      </div>
    </div>

    <div class="admin-table-wrapper">
      <div class="admin-table-container">
        <div class="admin-modal-header" style="background: rgba(0,0,0,0.02); border-bottom: 2px solid var(--admin-border);">
          <h2 style="font-size: 1.1rem; font-weight: 700;">Historial de Pagos</h2>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td><strong>{{ payment.player }}</strong></td>
              <td>{{ payment.amount }}</td>
              <td>{{ payment.date }}</td>
              <td>
                <span :style="{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  backgroundColor: payment.status === 'Pagado' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(243, 156, 18, 0.1)',
                  color: payment.status === 'Pagado' ? '#27ae60' : '#d35400'
                }">
                  {{ payment.status }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn-action edit" title="Ver Detalles">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button class="btn-action edit" title="Imprimir Recibo">
                    <i class="fa-solid fa-print"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../../assets/css/admin/admin.css";
</style>
