<script setup>
import { computed, onMounted } from 'vue';
import { usePlayersStore } from '../../../store/playersStore';

const playersStore = usePlayersStore();

onMounted(async () => {
  if (playersStore.players.length === 0) {
    await playersStore.initPlayers();
  }
});

const eligiblePlayers = computed(() => {
  return playersStore.players
    .filter(p => p.paymentStatus === 'Al Día')
    .map(p => ({
      id: p.id,
      name: p.name || p.fullName,
      category: p.category || 'N/A',
      lastPayment: p.registrationDate || 'N/A', // O fecha de último pago si existiera
      dni: p.documentNumber || 'Ver ficha'
    }));
});
const downloadCertificate = (player) => {
  const printWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `
    <html>
    <head>
        <title>Paz y Salvo - ${player.name}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 50px; }
            .header { text-align: center; margin-bottom: 50px; }
            .logo { width: 120px; margin-bottom: 10px; }
            .club-name { font-size: 24px; font-weight: bold; color: #1fa774; margin: 0; }
            .title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 40px; text-decoration: underline; }
            .content { font-size: 16px; text-align: justify; margin-bottom: 50px; }
            .date-place { margin-bottom: 30px; }
            .footer { margin-top: 100px; }
            .sign-area { border-top: 1px solid #333; width: 250px; text-align: center; font-size: 0.9rem; }
            @media print { .no-print { display: none; } }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="/src/assets/img/logosinfondo.png" class="logo" alt="Logo Club">
            <h1 class="club-name">CLUB DEPORTIVO UNIÓN JEGUERA</h1>
            <p>NIT: 900.000.000-0</p>
        </div>

        <h2 class="title">CONSTANCIA DE PAZ Y SALVO</h2>

        <div class="date-place">
            <strong>Lugar y Fecha:</strong> Jeguera, ${today}
        </div>

        <div class="content">
            <p>EL CLUB DEPORTIVO UNIÓN JEGUERA hace constar que el jugador(a) <strong>${player.name.toUpperCase()}</strong>, 
            identificado(a) con documento <strong>${player.dni}</strong> y perteneciente a la categoría <strong>${player.category}</strong>, 
            se encuentra a la fecha <strong>AL DÍA</strong> por todo concepto relacionado con mensualidades y derechos deportivos.</p>
            
            <p>Se expide la presente a solicitud del interesado para los fines que estime convenientes.</p>
        </div>

        <div class="footer">
            <p>Atentamente,</p>
            <br><br><br>
            <div class="sign-area">
                <br>
                <strong>DIRECCIÓN FINANCIERA</strong><br>
                Club Deportivo Unión Jeguera
            </div>
        </div>
        
        <script>
            window.onload = function() { window.print(); }
        <\/script>
</body>

</html>
`;

  printWindow.document.write(html);
  printWindow.document.close();
};

const downloadGlobalReport = () => {
  const csvContent = "data:text/csv;charset=utf-8,"
    + "ID,Jugador,Categoria,Identificacion,Estado\n"
    + eligiblePlayers.value.map(p => `${p.id},${p.name},${p.category},${p.dni},Al Dia`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "reporte_paz_y_salvos_global.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-toolbar">
      <div class="toolbar-left">
        <h2>Paz y Salvos</h2>
        <span class="badge"
          style="background:#27ae60; color:white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">
          {{ eligiblePlayers.length }} Jugadores Aptos
        </span>
      </div>
      <button @click="downloadGlobalReport" class="btn-admin btn-admin--primary">
        <i class="fa-solid fa-file-export"></i> Descargar Reporte Global
      </button>
    </div>

    <div class="dashboard-secondary-grid" style="grid-template-columns: 1fr;">
      <div class="admin-table-wrapper">
        <div class="admin-table-container">
          <div class="admin-modal-header"
            style="background: rgba(0,0,0,0.02); border-bottom: 2px solid var(--admin-border);">
            <h2 style="font-size: 1.1rem; font-weight: 700;">Jugadores con Mensualidades al Día</h2>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Categoría</th>
                <th>Identificación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in eligiblePlayers" :key="player.id">
                <td><strong>{{ player.name }}</strong></td>
                <td>{{ player.category }}</td>
                <td>{{ player.dni }}</td>
                <td>
                  <span
                    style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; background-color: rgba(46, 204, 113, 0.1); color: #27ae60;">
                    PAZ Y SALVO
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button @click="downloadCertificate(player)" class="btn-action edit" title="Descargar Certificado"
                      style="background: #e6f3ef; color: #1fa774;">
                      <i class="fa-solid fa-download"></i>
                    </button>
                    <button class="btn-action edit" title="Ver Ficha" style="background: #f0f4f8; color: #2c3e50;">
                      <i class="fa-solid fa-user"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="eligiblePlayers.length === 0">
                <td colspan="5" class="empty-row" style="text-align: center; padding: 2rem; color: #888;">
                  No hay jugadores con pagos al día actualmente para generar Paz y Salvos.
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
