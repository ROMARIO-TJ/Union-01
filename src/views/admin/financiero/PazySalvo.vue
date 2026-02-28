<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePlayersStore } from '../../../store/playersStore';
import { usePaymentsStore } from '../../../store/paymentsStore';
import { useAuthStore } from '../../../store/authStore';

const playersStore = usePlayersStore();
const paymentsStore = usePaymentsStore();
const authStore = useAuthStore();

const activeTab = ref('requests'); // 'requests' | 'all'
const isLoading = ref(false);
const showDebtModal = ref(false);
const selectedPlayerForDebt = ref(null);
const debtInfo = ref(null);

onMounted(async () => {
  isLoading.value = true;
  await Promise.all([
    playersStore.initPlayers(),
    paymentsStore.fetchPazSalvoRequests()
  ]);
  isLoading.value = false;
});

const viewDebt = async (player) => {
  selectedPlayerForDebt.value = player;
  isLoading.value = true;
  try {
    const result = await paymentsStore.calculatePazSalvoDebt(player.id);
    debtInfo.value = result;
    showDebtModal.value = true;
  } catch (error) {
    alert('Error al calcular la deuda detallada: ' + error.message);
  } finally {
    isLoading.value = false;
  }
};

const requests = computed(() => paymentsStore.pazSalvoRequests);

const eligiblePlayers = computed(() => {
  return playersStore.players
    .filter(p => p.status === 'Aceptado')
    .map(p => ({
      ...p,
      id: p.id,
      name: p.name || p.fullName,
      category: p.category || 'N/A',
      isEscuela: (p.category || '').toLowerCase().includes('escuela'),
      dni: p.dni || p.documentNumber || ''
    }));
});

const handleStatusChange = async (request, newStatus) => {
  let reason = '';
  if (newStatus === 'Rechazado') {
    reason = prompt('Motivo del rechazo:');
    if (!reason) return;
  }

  try {
    await paymentsStore.updatePazSalvoStatus(request.id, {
      status: newStatus,
      rejection_reason: reason,
      approved_by: authStore.adminUser?.id
    });
    await paymentsStore.fetchPazSalvoRequests();
    alert('Estado actualizado correctamente');
  } catch (error) {
    alert('Error al actualizar: ' + error.message);
  }
};

import logoUrl from '../../../assets/img/logosinfondo.png';
import firmaUrl from '../../../assets/img/firma.png';

const downloadCertificate = (player) => {
  const printWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // Determinamos si es Escuela de Formación
  const isEscuela = (player.category || '').toLowerCase().includes('escuela');

  // Títulos dinámicos según plantilla
  const mainTitle = isEscuela ? 'PAZ Y SALVO - ESCUELA DE FORMACIÓN' : 'PAZ Y SALVO - CATEGORÍAS COMPETITIVAS';
  const processType = isEscuela ? 'proceso de formación deportiva' : 'participación y derechos de competición';

  const html = `
    <html>
    <head>
        <title>Paz y Salvo - ${player.fullName || player.name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
            
            @page { size: letter; margin: 1.5cm 2cm; }
            body { 
                font-family: 'Montserrat', sans-serif; 
                line-height: 1.35; 
                color: #000; 
                margin: 0;
                padding: 0;
                background-color: #fff;
                font-size: 10.5pt;
            }
            .certificate-container {
                width: 100%;
                max-width: 800px;
                margin: auto;
                position: relative;
            }
            .header { 
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 25px; 
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            .logo { width: 90px; height: auto; object-fit: contain; }
            .header-info {
                flex: 1;
                text-align: left;
            }
            .club-name { 
                font-size: 18pt; 
                font-weight: 800; 
                color: #1a1a1a; 
                margin: 0; 
                text-transform: uppercase;
            }
            .legal-info { 
                font-size: 8.5pt; 
                color: #333; 
                text-transform: uppercase; 
                font-weight: 600;
                line-height: 1.3;
            }
            .doc-title { 
                text-align: center; 
                font-size: 14pt; 
                font-weight: 800; 
                margin: 25px 0; 
                color: #000;
                text-decoration: underline;
                text-transform: uppercase;
            }
            .content { 
                text-align: justify; 
                margin: 25px 0;
                font-size: 11pt;
            }
            .content p { margin-bottom: 15px; text-indent: 0; }
            .highlight { font-weight: 700; }
            
            .signature-section { 
                margin-top: 50px; 
            }
            .signature-line { 
                border-top: 1.5px solid #000; 
                width: 250px; 
                margin-bottom: 8px; 
            }
            .signer-info { 
                font-size: 10.5pt; 
                font-weight: 700;
                color: #1a1a1a;
                text-transform: uppercase;
            }
            .contact-info { 
                font-size: 9pt; 
                color: #444; 
                font-weight: 400; 
                margin-top: 3px;
                text-transform: none;
            }
            .signature-wrapper {
                position: relative;
                height: 0;
            }
            .signature-img {
                position: absolute;
                bottom: -15px;
                left: 20px;
                width: 200px;
                z-index: 10;
            }
            @media print { 
                body { -webkit-print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <div class="certificate-container">
            <div class="header">
                <img src="${window.location.origin}${logoUrl}" class="logo" alt="Escudo">
                <div class="header-info">
                    <div class="club-name">CLUB DEPORTIVO UNIÓN JAGÜERA</div>
                    <div class="legal-info">
                        PERSONERÍA JURÍDICA N° 003023 | NIT. 824.006.372<br>
                        RECONOCIMIENTO DEPORTIVO N° 467<br>
                        Antonio Rafael Torres Manjarrez - Representante Legal
                    </div>
                </div>
            </div>

            <h2 class="doc-title">${mainTitle}</h2>

            <div class="content">
                <p>El suscrito Representante Legal del <span class="highlight">CLUB DEPORTIVO UNIÓN JAGÜERA</span>, hace constar que el deportista 
                <span class="highlight">${(player.fullName || player.name).toUpperCase()}</span>, identificado con el documento de identidad No. 
                <span class="highlight">${player.dni || player.documentNumber || '_________________'}</span> y perteneciente a la categoría 
                <span class="highlight">${player.category}</span>, se encuentra a la fecha 
                <span class="highlight">DEBIDAMENTE PAZ Y SALVO</span> por todo concepto relacionado con mensualidades, cuotas de administración, inscripción 
                y derechos deportivos derivados de su ${processType} en nuestra institución.</p>
                
                <p>Se certifica que, tras revisar los registros contables a la fecha, el deportista no presenta deudas pendientes de ninguna índole con el club.</p>

                <p>Para constancia de lo anterior, se firma el presente documento en el municipio de La Jagua de Ibirico, el día ${new Date().getDate()} del mes de ${new Date().toLocaleString('es-CO', { month: 'long' })} de ${new Date().getFullYear()}.</p>
            </div>

                <p>Atentamente,</p>
                <div style="margin-top: 30px;">
                    <div class="signature-wrapper">
                        <img src="${window.location.origin}${firmaUrl}" class="signature-img" onerror="this.style.display='none'">
                    </div>
                    <div class="signature-line"></div>
                    <div class="signer-info">
                        ANTONIO RAFAEL TORRES M<br>
                        Representante Legal<br>
                        <div class="contact-info">
                           Cel: 3044517408 | Email: union_user@unionjaguera.com
                        </div>
                    </div>
                </div>

                ${isEscuela ? `
                    <div style="text-align: center; border: 1.5px solid #1fa774; padding: 12px; border-radius: 8px; background: #f9fffb; max-width: 500px; margin-top: 25px;">
                        <p style="margin: 0; font-size: 9pt; color: #1a1a1a; text-transform: none; line-height: 1.4;">
                            <strong style="color: #1fa774; font-size: 10pt;">DOCUMENTO AUTORIZADO DIGITALMENTE</strong><br>
                            Este certificado ha sido generado automáticamente por el sistema de control financiero del club. 
                            La validez de este Paz y Salvo está sujeta a la verificación del estado de cuenta "Al Día" en nuestra plataforma oficial.
                        </p>
                        <div style="margin-top: 10px; font-family: monospace; font-size: 8pt; color: #666; border-top: 1px dashed #ccc; padding-top: 5px;">
                            CÓDIGO DE VALIDACIÓN: ${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
                            EXPEDICIÓN: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
        
        <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }<\/script>
    </body>
    </html>`;

  printWindow.document.write(html);
  printWindow.document.close();
};

</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-toolbar">
      <div class="toolbar-left">
        <h2>Gestión de Paz y Salvos</h2>
        <div class="tabs">
          <button @click="activeTab = 'requests'" :class="{ active: activeTab === 'requests' }" class="tab-btn">
            Solicitudes ({{ requests.length }})
          </button>
          <button @click="activeTab = 'all'" :class="{ active: activeTab === 'all' }" class="tab-btn">
            Listado de Jugadores
          </button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'requests'" class="admin-table-wrapper">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Jugador</th>
              <th>Categoría</th>
              <th>Total Deuda</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req.id">
              <td>{{ new Date(req.request_date).toLocaleDateString() }}</td>
              <td><strong>{{ req.fullName }}</strong></td>
              <td>{{ req.category }}</td>
              <td>${{ parseFloat(req.total_to_pay).toLocaleString() }}</td>
              <td>
                <span class="status-badge" :class="req.status.toLowerCase().replace(' ', '-')">
                  {{ req.status }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <template v-if="req.status === 'Pendiente' || req.status === 'En revisión'">
                    <button @click="handleStatusChange(req, 'Aprobado')" class="btn-action edit" title="Aprobar"
                      style="background: #e1f7ec; color: #27ae60;">
                      <i class="fa-solid fa-check"></i>
                    </button>
                    <button @click="handleStatusChange(req, 'Rechazado')" class="btn-action delete" title="Rechazar">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </template>
                  <button v-if="req.status === 'Aprobado' || req.status === 'Generado'"
                    @click="downloadCertificate(req)" class="btn-action edit" title="Descargar">
                    <i class="fa-solid fa-download"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td colspan="6" class="empty-row">No hay solicitudes pendientes.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'all'" class="admin-table-wrapper">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in eligiblePlayers" :key="player.id">
              <td><strong>{{ player.name }}</strong></td>
              <td>{{ player.category }}</td>
              <td>{{ player.isEscuela ? 'Escuela' : 'Competitivo' }}</td>
              <td>
                <div class="action-btns">
                  <button v-if="player.isEscuela" @click="downloadCertificate(player)" class="btn-action edit"
                    title="Generar Automático">
                    <i class="fa-solid fa-bolt"></i>
                  </button>
                  <button class="btn-action edit" @click="viewDebt(player)" title="Ver Deuda">
                    <i class="fa-solid fa-dollar-sign"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Deuda Detallada -->
    <div v-if="showDebtModal" class="admin-modal-overlay" @click.self="showDebtModal = false">
      <div class="admin-modal" style="max-width: 500px;">
        <div class="admin-modal-header">
          <h3>Estado de Cuenta: {{ selectedPlayerForDebt?.name }}</h3>
          <button @click="showDebtModal = false" class="close-modal-btn">&times;</button>
        </div>
        <div class="admin-modal-body" v-if="debtInfo">
          <div class="debt-breakdown">
            <div class="debt-item">
              <span>Mensualidades Pendientes:</span>
              <strong>${{ debtInfo.monthly_debt.toLocaleString() }}</strong>
            </div>
            <div class="debt-item" v-if="!selectedPlayerForDebt?.isEscuela">
              <span>Derechos de Paz y Salvo:</span>
              <strong>$200.000</strong>
            </div>
            <div class="debt-item" v-else>
              <span>Derechos de Paz y Salvo:</span>
              <strong style="color: #27ae60;">¡SIN COSTO! (Escuela)</strong>
            </div>
            <div class="debt-item" v-if="debtInfo.subscription_debt > 0 || !selectedPlayerForDebt?.isEscuela">
              <span>Suscripción Club ($20k):</span>
              <strong>${{ debtInfo.subscription_debt.toLocaleString() }}</strong>
            </div>
            <div class="debt-item" v-if="debtInfo.convention_discount > 0">
              <span style="color: #27ae60;">Descuento Conv./Beca:</span>
              <strong style="color: #27ae60;">- ${{ debtInfo.convention_discount.toLocaleString() }}</strong>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
            <div class="debt-item total" style="font-size: 1.2rem; color: #e74c3c;">
              <span>TOTAL PENDIENTE:</span>
              <strong>${{ debtInfo.total_to_pay.toLocaleString() }}</strong>
            </div>
          </div>
          <p style="margin-top: 1.5rem; font-size: 0.85rem; color: #666; font-style: italic;">
            * Este es un desglose automático basado en los registros actuales de pagos y suscripciones.
          </p>
        </div>
        <div class="admin-modal-footer">
          <button @click="showDebtModal = false" class="btn-admin primary" style="width: 100%;">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../../assets/css/admin/admin.css";

.tabs {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--admin-accent);
  color: white;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge.pendiente {
  background: #fff4e5;
  color: #ff9800;
}

.status-badge.aprobado {
  background: #e1f7ec;
  color: #27ae60;
}

.status-badge.generado {
  background: #e1f7f7;
  color: #008080;
}

.status-badge.rechazado {
  background: #ffeaea;
  color: #e74c3c;
}

.empty-row {
  text-align: center;
  padding: 3rem;
  color: #999;
}

/* Estilos de Modal de Deuda */
.debt-breakdown {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #efefef;
}

.debt-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
}

.debt-item strong {
  color: #333;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: #888;
}

.close-modal-btn:hover {
  color: #c0392b;
}
</style>

<style scoped>
@import "../../../assets/css/admin/admin.css";
</style>
