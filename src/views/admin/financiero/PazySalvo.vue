<script setup>
import { ref } from 'vue';

const requests = ref([
  { id: 1, date: '2026-02-10', motivo: 'Retiro Temporal', status: 'Pendiente' },
  { id: 2, date: '2025-11-15', motivo: 'Fin de Año', status: 'Aprobado' },
]);
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-toolbar">
      <h2>Paz y Salvos</h2>
      <button class="btn-admin btn-admin--primary">
        <i class="fa-solid fa-file-export"></i> Generar Lote
      </button>
    </div>

    <div class="dashboard-secondary-grid">
      <div class="admin-table-wrapper" style="grid-column: 1 / -1;">
        <div class="admin-table-container">
          <div class="admin-modal-header" style="background: rgba(0,0,0,0.02); border-bottom: 2px solid var(--admin-border);">
            <h2 style="font-size: 1.1rem; font-weight: 700;">Solicitudes de Paz y Salvo</h2>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in requests" :key="req.id">
                <td>#{{ req.id }}</td>
                <td>{{ req.date }}</td>
                <td>{{ req.motivo }}</td>
                <td>
                  <span :style="{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    backgroundColor: req.status === 'Aprobado' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                    color: req.status === 'Aprobado' ? '#27ae60' : '#f39c12'
                  }">
                    {{ req.status }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn-action edit" title="Aprobar">
                      <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="btn-action delete" title="Rechazar">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../../assets/css/admin/admin.css";
</style>
