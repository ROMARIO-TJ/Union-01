<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePlayersStore } from '../../../store/playersStore';
import { useAuthStore } from '../../../store/authStore';
import { usePaymentsStore } from '../../../store/paymentsStore';

const playersStore = usePlayersStore();
const authStore = useAuthStore();
const paymentsStore = usePaymentsStore();

const showHistoryModal = ref(false);
const selectedChild = ref(null);
const childHistory = ref([]);

const isCompetitive = (categoryName) => {
    if (!categoryName) return false;
    const n = categoryName.toLowerCase();
    if (n.includes('escuela')) return false;
    if (n.includes('primera')) return true;
    const sub = n.match(/sub[\s-]*(\d+)/);
    if (sub && parseInt(sub[1]) >= 13) return true;
    return false;
};

onMounted(async () => {
    if (authStore.parentUser?.email) {
        // Fetch only children belonging to this parent for security and precision
        await playersStore.fetchPlayersByParent(authStore.parentUser.email);
    } else {
        await playersStore.initPlayers();
    }
});

const openHistory = async (child) => {
    selectedChild.value = child;
    childHistory.value = await paymentsStore.fetchPaymentsByPlayer(child.id);
    showHistoryModal.value = true;
};

const myChildren = computed(() => {
    const email = authStore.parentUser?.email?.toLowerCase();
    if (!email) return [];

    return playersStore.players
        .filter(p => (p.parentEmail || '').toLowerCase() === email)
        .map(p => {
            const isComp = isCompetitive(p.category);
            let base = isComp ? 20000 : 50000;
            
            // Calc real fee
            let realFee = base;
            if (p.sponsorship === 'full') realFee = 0;
            else if (p.custom_fee) realFee = parseFloat(p.custom_fee);
            else if (p.sponsorship === 'partial') realFee = 35000; 

            return {
                id: p.id,
                name: p.name || p.fullName,
                category: p.category || 'Sin asignar',
                status: p.paymentStatus || 'Pendiente',
                sponsorship: p.sponsorship,
                amountValue: realFee,
                amount: `$${realFee.toLocaleString()}`,
                date: p.registrationDate || 'N/A'
            };
        });
});

const getStatusColor = (status) => {
    if (status === 'Al Día') return { bg: 'rgba(46, 204, 113, 0.1)', text: '#27ae60' };
    if (status === 'Pendiente') return { bg: 'rgba(243, 156, 18, 0.1)', text: '#d35400' };
    return { bg: 'rgba(231, 76, 60, 0.1)', text: '#c0392b' };
};

const exportReceipt = (payment) => {
    // Reutilizamos la lógica del recibo pero solo si está Al Día
    if (payment.status !== 'Al Día') {
        alert('Solo se pueden generar recibos para pagos con estado "Al Día".');
        return;
    }

    const logoUrl = '/src/assets/img/logosinfondo.png';
    const printWindow = window.open('', '_blank', 'width=800,height=800');

    const receiptHtml = `
        <html>
        <head>
            <title>Recibo de Pago - ${payment.name}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                .receipt-container { border: 2px solid #1fa774; padding: 40px; border-radius: 15px; max-width: 800px; margin: 0 auto; position: relative; background: white; }
                .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; width: 400px; z-index: 0; }
                .content { position: relative; z-index: 1; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1fa774; padding-bottom: 20px; margin-bottom: 30px; }
                .logo-box { display: flex; align-items: center; gap: 15px; }
                .logo-img { height: 80px; }
                .club-name { color: #1fa774; font-size: 28px; font-weight: 900; line-height: 1; }
                .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                .details-table th { text-align: left; padding: 12px; background: #f4fbf8; color: #1fa774; border-bottom: 2px solid #1fa774; font-size: 13px; text-transform: uppercase; }
                .details-table td { padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 16px; }
                .amount-total { background: #1fa774; color: white; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
                .total-value { font-size: 30px; font-weight: 900; }
                .legal { font-size: 11px; color: #888; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <img src="${logoUrl}" class="watermark" onerror="this.style.display='none'">
                <div class="content">
                    <div class="header">
                        <div class="logo-box">
                            <img src="${logoUrl}" class="logo-img" onerror="this.src='https://via.placeholder.com/80?text=U.J.'">
                            <div class="club-name">CLUB UNIÓN<br>JEGUERA</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #e74c3c; font-weight: bold;">CERTIFICADO DIGITAL</div>
                            <div style="font-size: 14px; color: #666;">Fecha: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th>Deportista</th>
                                <th>Categoría</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Mensualidad / Inscripción</td>
                                <td><strong>${payment.name}</strong></td>
                                <td>${payment.category}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="amount-total">
                        <strong>VALOR RECIBIDO</strong>
                        <span class="total-value">${payment.amount}</span>
                    </div>
                    <div style="margin-top: 40px; text-align: center;">
                        <div style="border: 2px solid #1fa774; color: #1fa774; padding: 10px 20px; display: inline-block; border-radius: 5px; font-weight: bold;">
                            VERIFICADO POR EL CLUB
                        </div>
                    </div>
                    <div class="legal">
                        Este documento es un comprobante oficial de pago generado desde el Portal de Padres.
                        No requiere firma física. Generado el: ${new Date().toLocaleString()}
                    </div>
                </div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
        </html>
    `;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
};
</script>

<template>
    <div class="admin-dashboard">
        <div class="admin-toolbar">
            <div class="toolbar-left">
                <h2>Mis Pagos</h2>
                <p style="color: #666; font-size: 0.9rem;">Consulta el estado financiero de tus hijos registrados.</p>
            </div>
        </div>

        <div class="admin-table-wrapper" style="margin-top: 2rem;">
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Hijo(a)</th>
                            <th>Categoría</th>
                            <th>Monto Mensual</th>
                            <th>Estado Actual</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="child in myChildren" :key="child.id">
                            <td><strong>{{ child.name }}</strong></td>
                            <td><span class="badge" style="background:#eee; color:#666;">{{ child.category }}</span>
                            </td>
                            <td>
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <strong>{{ child.amount }}</strong>
                                    <span v-if="child.sponsorship === 'full'" style="font-size: 0.7rem; color: #27ae60; font-weight: bold;">
                                        <i class="fa-solid fa-award"></i> Beca Club 100%
                                    </span>
                                    <span v-else-if="child.sponsorship === 'partial'" style="font-size: 0.7rem; color: #e67e22; font-weight: bold;">
                                        <i class="fa-solid fa-people-group"></i> Descuento Hermanos
                                    </span>
                                </div>
                            </td>
                            <td>
                                <span :style="{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    backgroundColor: getStatusColor(child.status).bg,
                                    color: getStatusColor(child.status).text
                                }">
                                    {{ child.status }}
                                </span>
                            </td>
                            <td>
                                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                                    <button @click="openHistory(child)" class="btn-action view"
                                        title="Historial de Pagos"
                                        style="background: #f0f4f8; color: #2c3e50; border-radius: 6px; width: auto; padding: 0 10px; height: 32px;">
                                        <i class="fa-solid fa-clock-rotate-left"></i> Historial
                                    </button>
                                    <button v-if="child.status === 'Al Día'" @click="exportReceipt(child)"
                                        class="btn-action edit" title="Descargar Recibo"
                                        style="background: #e6f3ef; color: #1fa774; width: auto; padding: 0 15px; height: 32px; font-size: 0.8rem;">
                                        <i class="fa-solid fa-file-pdf"></i> Ver Recibo
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="myChildren.length === 0">
                            <td colspan="5" style="text-align: center; padding: 3rem; color: #888;">
                                <i class="fa-solid fa-user-slash"
                                    style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                                No hay hijos vinculados a este correo electrónico.<br>
                                <small>Contacta al club para vincular tus registros antiguos.</small>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Mobile Cards Grid -->
        <div class="admin-cards-grid" style="margin-top: 1.5rem;">
            <div v-for="child in myChildren" :key="'card-' + child.id" class="admin-card-item">
                <div class="admin-card-item__header">
                    <div class="stat-icon players" style="width: 40px; height: 40px; font-size: 1rem;">
                        <i class="fa-solid fa-child"></i>
                    </div>
                    <div>
                        <h4 style="font-weight: 800; font-size: 1.1rem;">{{ child.name }}</h4>
                        <span class="badge" style="background:#eee; color:#666; font-size: 0.7rem;">{{ child.category
                            }}</span>
                    </div>
                </div>
                <div class="admin-card-item__body">
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Monto Mensual:</span>
                        <span>{{ child.amount }}</span>
                    </div>
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Estado:</span>
                        <span :style="{ color: getStatusColor(child.status).text, fontWeight: '700' }">{{ child.status
                            }}</span>
                    </div>
                </div>
                <div class="admin-card-item__actions">
                    <button @click="openHistory(child)" class="btn-admin secondary"
                        style="flex: 1; padding: 0.6rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-clock-rotate-left"></i> Historial
                    </button>
                    <button v-if="child.status === 'Al Día'" @click="exportReceipt(child)" class="btn-admin primary"
                        style="flex: 1; padding: 0.6rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-file-pdf"></i> Ver Recibo
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de Historial para Padres -->
        <div v-if="showHistoryModal" class="admin-modal-overlay" @click.self="showHistoryModal = false">
            <div class="admin-modal" style="max-width: 600px;">
                <div class="admin-modal-header">
                    <h2>Historial de Pagos: {{ selectedChild?.name }}</h2>
                    <button class="close-modal" @click="showHistoryModal = false">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <div v-if="paymentsStore.isLoading" style="text-align: center; padding: 2rem;">
                        <i class="fa-solid fa-spinner fa-spin"></i> Cargando historial...
                    </div>
                    <div v-else class="admin-table-container">
                        <table class="admin-table" style="font-size: 0.85rem;">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Mes</th>
                                    <th>Concepto</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="h in childHistory" :key="h.id">
                                    <td>{{ h.fecha }}</td>
                                    <td>{{
                                        h.tipo === 'Inscripción' 
                                        ? 'N/A' 
                                        : (['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre','Noviembre','Diciembre'][h.mes - 1] || '---') 
                                        + ' / ' + (h.year || '2025') 
                                    }}</td>
                                    <td>
                                        <span class="badge" :style="{ 
                                            backgroundColor: h.tipo === 'Inscripción' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                                            color: h.tipo === 'Inscripción' ? '#2980b9' : '#27ae60',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }">
                                            {{ h.tipo }}
                                        </span>
                                    </td>
                                    <td><strong>${{ Number(h.valor).toLocaleString() }}</strong></td>
                                </tr>
                                <tr v-if="childHistory.length === 0">
                                    <td colspan="4" style="text-align: center; padding: 2rem; color: #888;">No se
                                        encontraron registros de pago.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <button class="btn-admin primary" @click="showHistoryModal = false">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "../../../assets/css/admin/admin.css";
</style>
