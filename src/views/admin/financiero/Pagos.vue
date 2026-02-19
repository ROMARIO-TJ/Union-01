<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePlayersStore } from '../../../store/playersStore';
import { usePaymentsStore } from '../../../store/paymentsStore';

const playersStore = usePlayersStore();
const paymentsStore = usePaymentsStore();
const searchQuery = ref('');
const filterCategory = ref('Todas');

// Feedback states
const successMessage = ref('');
const errorMessage = ref('');
const isProcessing = ref(false);

// Modal states
const showHistoryModal = ref(false);
const showRegisterModal = ref(false);
const selectedPlayer = ref(null);
const playerHistory = ref([]);

// Formulario de registro de pago
const paymentForm = ref({
    tipo: 'Mensualidad',
    mes: new Date().getMonth() + 1,
    valor: 50000,
    metodo: 'Efectivo',
    fecha: new Date().toISOString().split('T')[0]
});

onMounted(async () => {
    if (playersStore.players.length === 0) {
        await playersStore.initPlayers();
    }
});

// Obtener categorías únicas presentes en la lista de jugadores
const availableCategories = computed(() => {
    const cats = playersStore.players
        .map(p => p.category)
        .filter(c => c && c !== '')
        .map(c => c.trim());
    return ['Todas', ...new Set(cats)].sort();
});

const payments = computed(() => {
    return playersStore.players
        .filter(p => p.status === 'Aceptado' || p.status === 'Pendiente')
        .filter(p => {
            const nameMatch = (p.name || p.fullName || '').toLowerCase().includes(searchQuery.value.toLowerCase());
            const categoryMatch = filterCategory.value === 'Todas' || p.category === filterCategory.value;
            return nameMatch && categoryMatch;
        })
        .map(p => ({
            id: p.id,
            player: p.name || p.fullName,
            category: p.category || 'Sin asignar',
            amount: '$50.000',
            date: p.registrationDate || 'N/A',
            status: p.paymentStatus || 'Pendiente'
        }));
});

const stats = computed(() => {
    const paid = payments.value.filter(p => p.status === 'Al Día').length;
    const total = payments.value.length;
    return {
        paid,
        pending: total - paid,
        totalAmount: paid * 50000
    };
});

const updateStatus = async (id, newStatus) => {
    // Si marcamos como Al Día, abrimos el formulario de registro detallado
    if (newStatus === 'Al Día') {
        selectedPlayer.value = payments.value.find(p => p.id === id);
        showRegisterModal.value = true;
        return;
    }

    successMessage.value = '';
    errorMessage.value = '';
    isProcessing.value = true;

    try {
        await playersStore.updatePaymentStatus(id, newStatus);
        successMessage.value = '¡Estado de pago actualizado!';
        await playersStore.initPlayers();
        setTimeout(() => successMessage.value = '', 3000);
    } catch (e) {
        errorMessage.value = 'Error: ' + (e.message || 'Error al actualizar');
    } finally {
        isProcessing.value = false;
    }
};

const confirmPaymentRegistration = async () => {
    isProcessing.value = true;
    successMessage.value = 'Registrando pago...';

    try {
        const payload = {
            jugadorId: selectedPlayer.value.id,
            ...paymentForm.value
        };

        const ok = await paymentsStore.registerPayment(payload);
        if (ok) {
            // Actualizar también el estado general del jugador
            await playersStore.updatePaymentStatus(selectedPlayer.value.id, 'Al Día');
            successMessage.value = '✅ Pago registrado y estado actualizado';
            showRegisterModal.value = false;
            await playersStore.initPlayers();
        }
    } catch (e) {
        errorMessage.value = 'Error al registrar el pago';
    } finally {
        isProcessing.value = false;
        setTimeout(() => successMessage.value = '', 3000);
    }
};

const openHistory = async (payment) => {
    selectedPlayer.value = payment;
    playerHistory.value = await paymentsStore.fetchPaymentsByPlayer(payment.id);
    showHistoryModal.value = true;
};

const exportReceipt = (payment) => {
    // Crear una ventana temporal para la impresión
    const printWindow = window.open('', '_blank', 'width=800,height=800');

    // Intentamos usar la imagen del logo basada en la estructura del proyecto
    const logoUrl = '/src/assets/img/logosinfondo.png';

    const receiptHtml = `
        <html>
        <head>
            <title>Recibo de Pago - ${payment.player}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                .receipt-container { 
                    border: 2px solid #1fa774; 
                    padding: 40px; 
                    border-radius: 15px; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    position: relative;
                    background: white;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.05;
                    width: 400px;
                    z-index: 0;
                }
                .content { position: relative; z-index: 1; }
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    border-bottom: 3px solid #1fa774; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px; 
                }
                .logo-box { display: flex; align-items: center; gap: 15px; }
                .logo-img { height: 80px; }
                .club-name { color: #1fa774; font-size: 28px; font-weight: 900; line-height: 1; }
                .receipt-meta { text-align: right; }
                .receipt-no { font-size: 18px; color: #e74c3c; font-weight: bold; margin-bottom: 5px; }
                .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                .details-table th { text-align: left; padding: 12px; background: #f4fbf8; color: #1fa774; border-bottom: 2px solid #1fa774; font-size: 13px; text-transform: uppercase; }
                .details-table td { padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 16px; }
                .amount-total { 
                    background: #1fa774; 
                    color: white; 
                    padding: 20px; 
                    border-radius: 8px; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    margin-top: 20px;
                }
                .total-label { font-size: 18px; font-weight: bold; }
                .total-value { font-size: 30px; font-weight: 900; }
                .signatures { display: flex; justify-content: space-around; margin-top: 80px; }
                .sig-box { text-align: center; width: 250px; }
                .sig-line { border-top: 2px solid #333; margin-bottom: 10px; }
                .sig-name { font-size: 14px; font-weight: bold; color: #555; }
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
                        <div class="receipt-meta">
                            <div class="receipt-no">RECIBO No. ${Math.floor(1000 + Math.random() * 9000)}</div>
                            <div style="font-size: 14px; color: #666;">Fecha: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>Descripción de Concepto</th>
                                <th>Jugador / Deportista</th>
                                <th>Categoría</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Mensualidad / Derecho de Participación</td>
                                <td><strong>${payment.player}</strong></td>
                                <td>${payment.category}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="amount-total">
                        <span class="total-label">VALOR TOTAL RECIBIDO</span>
                        <span class="total-value">${payment.amount}</span>
                    </div>

                    <div style="margin-top: 40px; display: flex; justify-content: center;">
                        <div style="border: 2px solid #1fa774; color: #1fa774; padding: 10px 20px; border-radius: 5px; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
                            Comprobante Digital Autorizado
                        </div>
                    </div>

                    <div class="legal">
                        Este documento es un soporte oficial generado por el sistema administrativo del Club Unión Jeguera. 
                        No requiere firma física para su validez legal interna. 
                        Generado el: ${new Date().toLocaleString()}
                    </div>
                </div>
            </div>
            <script>
                window.onload = function() { 
                    setTimeout(() => {
                        window.print(); 
                        window.close();
                    }, 500);
                }
            <\/script>
        </body>
        </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
};

const getStatusColor = (status) => {
    if (status === 'Al Día') return { bg: 'rgba(46, 204, 113, 0.1)', text: '#27ae60' };
    if (status === 'Pendiente') return { bg: 'rgba(243, 156, 18, 0.1)', text: '#d35400' };
    return { bg: 'rgba(231, 76, 60, 0.1)', text: '#c0392b' };
};
</script>

<template>
    <div class="admin-dashboard">
        <div class="admin-toolbar" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <div class="toolbar-left" style="flex: 1; min-width: 200px;">
                <h2>Gestión de Pagos</h2>
                <span class="badge"
                    style="background:var(--admin-accent); color:white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">
                    {{ payments.length }} Futbolistas
                </span>
            </div>

            <div class="toolbar-right"
                style="display: flex; gap: 1rem; flex: 2; justify-content: flex-end; align-items: center; min-width: 300px;">
                <!-- Filtro de Categoría -->
                <div class="admin-filter-wrapper" style="position: relative; min-width: 180px;">
                    <select v-model="filterCategory" class="admin-search-input"
                        style="width: 100%; height: 40px; padding: 0 1rem; border-radius: 8px; background: white;">
                        <option v-for="cat in availableCategories" :key="cat" :value="cat">
                            {{ cat === 'Todas' ? 'Todas las Categorías' : cat }}
                        </option>
                    </select>
                </div>

                <!-- Buscador -->
                <div class="admin-search-wrapper" style="position: relative; min-width: 250px;">
                    <i class="fa-solid fa-magnifying-glass search-icon"
                        style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #aaa;"></i>
                    <input v-model="searchQuery" type="text" placeholder="Buscar jugador..." class="admin-search-input"
                        style="width:100%; padding-left: 2.5rem; border-radius: 8px; border: 1px solid #ddd; height: 40px;">
                </div>
            </div>
        </div>

        <!-- Barras de Notificación -->
        <div v-if="successMessage" class="admin-alert success"
            style="margin-bottom: 1rem; padding: 1rem; border-radius: 8px; background: #e6f3ef; color: #1fa774; border-left: 5px solid #1fa774; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-circle-check"></i> {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="admin-alert error"
            style="margin-bottom: 1rem; padding: 1rem; border-radius: 8px; background: #fdf2f2; color: #e74c3c; border-left: 5px solid #e74c3c; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-circle-xmark"></i> {{ errorMessage }}
        </div>

        <div class="admin-stats-grid">
            <div class="stat-card">
                <div class="stat-icon news">
                    <i class="fa-solid fa-dollar-sign"></i>
                </div>
                <div class="stat-info">
                    <h3>Ingresos Previstos</h3>
                    <div class="stat-value">${{ stats.totalAmount.toLocaleString() }}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon sponsors">
                    <i class="fa-solid fa-clock"></i>
                </div>
                <div class="stat-info">
                    <h3>Pendientes</h3>
                    <div class="stat-value">{{ stats.pending }}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon matches">
                    <i class="fa-solid fa-check-double"></i>
                </div>
                <div class="stat-info">
                    <h3>Al Día</h3>
                    <div class="stat-value">{{ stats.paid }}</div>
                </div>
            </div>
        </div>

        <div class="admin-table-wrapper">
            <div class="admin-table-container">
                <div class="admin-modal-header"
                    style="background: rgba(0,0,0,0.02); border-bottom: 2px solid var(--admin-border);">
                    <h2 style="font-size: 1.1rem; font-weight: 700;">Control de Mensualidades</h2>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Jugador</th>
                            <th>Categoría</th>
                            <th>Monto</th>
                            <th>Estado Financiero</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="payment in payments" :key="payment.id">
                            <td><strong>{{ payment.player }}</strong></td>
                            <td><span class="badge" style="background:#eee; color:#666;">{{ payment.category }}</span>
                            </td>
                            <td>{{ payment.amount }}</td>
                            <td>
                                <select :value="payment.status" :disabled="isProcessing"
                                    @change="e => updateStatus(payment.id, e.target.value)" :style="{
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        border: 'none',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        backgroundColor: getStatusColor(payment.status).bg,
                                        color: getStatusColor(payment.status).text,
                                        opacity: isProcessing ? 0.6 : 1
                                    }">
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Al Día">Al Día</option>
                                    <option value="En Mora">En Mora</option>
                                </select>
                            </td>
                            <td>
                                <div class="action-btns">
                                    <button @click="openHistory(payment)" class="btn-action edit" title="Ver Historial"
                                        style="background: #f0f4f8; color: #2c3e50;">
                                        <i class="fa-solid fa-history"></i>
                                    </button>
                                    <button @click="exportReceipt(payment)" class="btn-action edit"
                                        title="Exportar Recibo" style="background: #e6f3ef; color: #1fa774;">
                                        <i class="fa-solid fa-file-pdf"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="payments.length === 0">
                            <td colspan="5" style="text-align: center; padding: 2rem; color: #888;">No se encontraron
                                registros activos.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal de Registro de Pago (NUEVO) -->
        <div v-if="showRegisterModal" class="admin-modal-overlay" @click.self="showRegisterModal = false">
            <div class="admin-modal" style="max-width: 500px;">
                <div class="admin-modal-header">
                    <h2>Registrar Pago: {{ selectedPlayer?.player }}</h2>
                    <button class="close-modal" @click="showRegisterModal = false">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <div class="admin-form-group" style="margin-bottom: 1rem;">
                        <label>Concepto</label>
                        <select v-model="paymentForm.tipo" class="admin-search-input" style="width: 100%;">
                            <option value="Mensualidad">Mensualidad</option>
                            <option value="Inscripción">Inscripción</option>
                            <option value="Uniforme">Uniforme</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div class="admin-form-group">
                            <label>Mes Correspondiente</label>
                            <select v-model="paymentForm.mes" class="admin-search-input" style="width: 100%;">
                                <option v-for="m in 12" :key="m" :value="m">{{
                                    ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre','Diciembre'][m-1]
                                    }}</option>
                            </select>
                        </div>
                        <div class="admin-form-group">
                            <label>Valor ($)</label>
                            <input v-model="paymentForm.valor" type="number" class="admin-search-input"
                                style="width: 100%;">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div class="admin-form-group">
                            <label>Fecha de Recaudo</label>
                            <input v-model="paymentForm.fecha" type="date" class="admin-search-input"
                                style="width: 100%;">
                        </div>
                        <div class="admin-form-group">
                            <label>Método</label>
                            <select v-model="paymentForm.metodo" class="admin-search-input" style="width: 100%;">
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Depósito">Depósito</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <button class="btn-admin secondary" @click="showRegisterModal = false">Cancelar</button>
                    <button class="btn-admin primary" @click="confirmPaymentRegistration" :disabled="isProcessing">
                        {{ isProcessing ? 'Registrando...' : 'Confirmar y Marcar Al Día' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de Historial (REAL) -->
        <div v-if="showHistoryModal" class="admin-modal-overlay" @click.self="showHistoryModal = false">
            <div class="admin-modal" style="max-width: 700px;">
                <div class="admin-modal-header">
                    <h2>Historial Financiero: {{ selectedPlayer?.player }}</h2>
                    <button class="close-modal" @click="showHistoryModal = false">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <div v-if="paymentsStore.isLoading" style="text-align: center; padding: 2rem;">
                        <i class="fa-solid fa-spinner fa-spin"></i> Cargando historial...
                    </div>
                    <div v-else class="admin-table-container">
                        <table class="admin-table" style="font-size: 0.9rem;">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Mes</th>
                                    <th>Concepto</th>
                                    <th>Monto</th>
                                    <th>Método</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="h in playerHistory" :key="h.id">
                                    <td>{{ h.fecha }}</td>
                                    <td>{{
                                        ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago','Sep','Oct','Nov','Dic'][h.mes
                                        - 1] }}</td>
                                    <td><span class="badge" style="background:#f0f7f4; color:#1fa774;">{{ h.tipo
                                            }}</span></td>
                                    <td><strong>${{ Number(h.valor).toLocaleString() }}</strong></td>
                                    <td><small>{{ h.metodo }}</small></td>
                                </tr>
                                <tr v-if="playerHistory.length === 0">
                                    <td colspan="5" style="text-align: center; padding: 2rem; color: #888;">No hay pagos
                                        registrados anteriormente.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <button class="btn-admin" @click="showHistoryModal = false">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "../../../assets/css/admin/admin.css";
</style>
