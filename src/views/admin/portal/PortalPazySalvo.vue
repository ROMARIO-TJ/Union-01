<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePlayersStore } from '../../../store/playersStore';
import { useAuthStore } from '../../../store/authStore';
import { usePaymentsStore } from '../../../store/paymentsStore';
import logoUrl from '../../../assets/img/logosinfondo.png';
import firmaUrl from '../../../assets/img/firma.png';

const playersStore = usePlayersStore();
const authStore = useAuthStore();
const paymentsStore = usePaymentsStore();

const isLoading = ref(false);
const showRequestModal = ref(false);
const selectedChild = ref(null);
const calculation = ref(null);

onMounted(async () => {
    isLoading.value = true;
    if (authStore.parentUser?.email) {
        await Promise.all([
            playersStore.initPlayers(),
            paymentsStore.fetchPazSalvoRequests()
        ]);
    }
    isLoading.value = false;
});

const allChildren = computed(() => {
    const email = authStore.parentUser?.email?.toLowerCase();
    if (!email) return [];

    return playersStore.players
        .filter(p => (p.parentEmail || p.email || '').toLowerCase() === email)
        .map(p => {
            const isEscuela = (p.category || '').toLowerCase().includes('escuela');
            const request = paymentsStore.pazSalvoRequests.find(r => r.player_id === p.id);
            return {
                id: p.id,
                name: p.name || p.fullName,
                category: p.category || 'Sin asignar',
                paymentStatus: p.paymentStatus,
                dni: p.dni || p.documentNumber || '_________________',
                isEscuela,
                currentRequest: request
            };
        });
});

const openRequestModal = async (child) => {
    selectedChild.value = child;
    calculation.value = await paymentsStore.calculatePazSalvoDebt(child.id);
    showRequestModal.value = true;
};

const submitRequest = async () => {
    if (!selectedChild.value) return;
    try {
        await paymentsStore.submitPazSalvoRequest({
            player_id: selectedChild.value.id,
            monthly_debt: calculation.value.monthly_debt
        });
        await paymentsStore.fetchPazSalvoRequests();
        showRequestModal.value = false;
        alert('Solicitud enviada correctamente');
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

const downloadCertificate = (child) => {
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `
        <html>
        <head>
            <title>PAZ Y SALVO - ${child.name}</title>
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

                <h2 class="doc-title">PAZ Y SALVO</h2>

                <div class="content">
                    <p>El suscrito Representante Legal del <span class="highlight">CLUB DEPORTIVO UNIÓN JAGÜERA</span>, hace constar que el deportista 
                    <span class="highlight">${child.name.toUpperCase()}</span>, identificado con el documento de identidad No. 
                    <span class="highlight">${child.dni}</span> y perteneciente a la categoría 
                    <span class="highlight">${child.category}</span>, se encuentra a la fecha 
                    <span class="highlight">DEBIDAMENTE PAZ Y SALVO</span> 
                    por todo concepto relacionado con mensualidades, cuotas de administración, inscripción y derechos de formación con nuestra institución.</p>
                    
                    <p>Se certifica que, tras revisar los registros contables a la fecha, el deportista no presenta deudas pendientes de ninguna índole con el club.</p>

                    <p>Para constancia de lo anterior, se firma el presente documento en el municipio de La Jagua de Ibirico, el día ${today}.</p>
                </div>

                <div class="signature-section">
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

                    ${child.isEscuela ? `
                        <div style="text-align: center; border: 1.5px solid #1fa774; padding: 12px; border-radius: 8px; background: #f9fffb; max-width: 500px; margin-top: 25px;">
                            <p style="margin: 0; font-size: 9pt; color: #1a1a1a; text-transform: none; line-height: 1.4;">
                                <strong style="color: #1fa774; font-size: 10pt;">DOCUMENTO AUTORIZADO DIGITALMENTE</strong><br>
                                Este certificado ha sido generado automáticamente por el sistema de control financiero del club. 
                                La validez de este Paz y Salvo está sujeta a la verificación del estado de cuenta "Al Día" en nuestra plataforma oficial.
                            </p>
                            <div style="margin-top: 10px; font-family: monospace; font-size: 8pt; color: #666; border-top: 1px dashed #ccc; padding-top: 5px;">
                                CÓDIGO DE VALIDACIÓN: ${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
                                EXPEDICIÓN: ${today}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }<\/script>
        </body>
        </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
};
</script>

<template>
    <div class="admin-dashboard">
        <div class="admin-toolbar">
            <div class="toolbar-left">
                <h2>Certificados Paz y Salvo</h2>
                <p style="color: #666; font-size: 0.9rem;">Gestione y descargue los paz y salvos de sus hijos.</p>
            </div>
        </div>

        <div class="admin-table-wrapper" style="margin-top: 2rem;">
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Deportista</th>
                            <th>Categoría</th>
                            <th>Tipo</th>
                            <th>Estado / Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="child in allChildren" :key="child.id">
                            <td><strong>{{ child.name }}</strong></td>
                            <td>{{ child.category }}</td>
                            <td>{{ child.isEscuela ? 'Escuela' : 'Competitivo' }}</td>
                            <td>
                                <!-- Lógica para Escuela -->
                                <template v-if="child.isEscuela">
                                    <button v-if="child.paymentStatus === 'Al Día'" @click="downloadCertificate(child)"
                                        class="btn-action view"
                                        style="background:#1fa774; color:white; width:auto; padding:0 15px;">
                                        <i class="fa-solid fa-download"></i> Descargar
                                    </button>
                                    <span v-else class="badge badge-pending">Pendiente de Pago</span>
                                </template>

                                <!-- Lógica para Competitivo -->
                                <template v-else>
                                    <template v-if="child.currentRequest">
                                        <span class="status-badge" :class="child.currentRequest.status.toLowerCase()">
                                            {{ child.currentRequest.status }}
                                        </span>
                                        <button
                                            v-if="child.currentRequest.status === 'Aprobado' || child.currentRequest.status === 'Generado'"
                                            @click="downloadCertificate(child)" class="btn-action view"
                                            style="margin-left: 10px;">
                                            <i class="fa-solid fa-download"></i>
                                        </button>
                                    </template>
                                    <button v-else @click="openRequestModal(child)" class="btn-admin primary"
                                        style="font-size: 0.8rem; padding: 5px 15px;">
                                        Solicitar Paz y Salvo
                                    </button>
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal de Solicitud -->
        <div v-if="showRequestModal" class="admin-modal-overlay">
            <div class="admin-modal" style="max-width: 500px;">
                <div class="admin-modal-header">
                    <h3>Solicitar Paz y Salvo - {{ selectedChild.name }}</h3>
                    <button @click="showRequestModal = false" class="close-modal-btn">&times;</button>
                </div>
                <div class="admin-modal-body" v-if="calculation">
                    <div class="debt-breakdown">
                        <div class="debt-item"><span>Mensualidades Pendientes:</span> <strong>${{
                            calculation.monthly_debt.toLocaleString() }}</strong></div>
                        <div class="debt-item" v-if="!selectedChild?.isEscuela || calculation.subscription_debt > 0">
                            <span>Suscripción Club:</span> <strong>${{ calculation.subscription_debt.toLocaleString()
                                }}</strong>
                        </div>
                        <div class="debt-item">
                            <span>Valor Base Paz y Salvo:</span>
                            <strong v-if="!selectedChild?.isEscuela">$200.000</strong>
                            <strong v-else style="color: #27ae60;">¡SIN COSTO! (Escuela)</strong>
                        </div>
                        <div class="debt-item" v-if="calculation.convention_discount > 0"><span>Descuento
                                Convenio:</span>
                            <strong style="color: #27ae60;">- ${{ calculation.convention_discount.toLocaleString()
                            }}</strong>
                        </div>
                        <hr>
                        <div class="debt-item total"><span>TOTAL A CANCELAR:</span> <strong>${{
                            calculation.total_to_pay.toLocaleString() }}</strong></div>
                    </div>
                    <p style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
                        * Al solicitar el paz y salvo, el administrador revisará su estado y podrá aprobar la descarga
                        una vez
                        confirmado el pago.
                    </p>
                </div>
                <div class="admin-modal-footer">
                    <button @click="submitRequest" class="btn-admin primary" style="width: 100%;">
                        Confirmar Solicitud
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "../../../assets/css/admin/admin.css";

.debt-breakdown {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 8px;
}

.debt-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.debt-item.total {
    font-size: 1.1rem;
    color: #e74c3c;
    border-top: 1px solid #ddd;
    padding-top: 0.5rem;
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

.badge-pending {
    background: #feeaea;
    color: #e74c3c;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
}

.close-modal-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}
</style>
