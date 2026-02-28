<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePlayersStore } from '../../../store/playersStore';
import { usePaymentsStore } from '../../../store/paymentsStore';
import { useCategoryStore } from '../../../store/categoryStore';

const playersStore = usePlayersStore();
const paymentsStore = usePaymentsStore();
const categoryStore = useCategoryStore();
const searchQuery = ref('');
const filterCategory = ref('Todas');

// Feedback states
const successMessage = ref('');
const errorMessage = ref('');
const isProcessing = ref(false);
const isLoading = ref(false);

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

// Automatizar valores por defecto
watch(() => paymentForm.value.tipo, (newTipo) => {
    if (newTipo === 'Mensualidad') {
        paymentForm.value.valor = 50000;
    } else if (newTipo === 'Suscripción Club') {
        paymentForm.value.valor = 20000;
    }
});

onMounted(async () => {
    isLoading.value = true;
    await Promise.all([
        playersStore.initPlayers(),
        categoryStore.fetchCategories(),
        paymentsStore.fetchSubscriptions()
    ]);
    isLoading.value = false;
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
        .map(p => {
            const isComp = isCompetitive(p.category);
            const fee = isComp ? 20000 : 50000;
            return {
                id: p.id,
                player: p.name || p.fullName,
                category: p.category || 'Sin asignar',
                amountValue: fee,
                amount: `$${fee.toLocaleString()}`,
                date: p.registrationDate || 'N/A',
                status: p.paymentStatus || 'Pendiente'
            };
        });
});

// Lógica de Suscripciones unificada
const isCompetitive = (categoryName) => {
    if (!categoryName) return false;
    const n = categoryName.toLowerCase();
    if (n.includes('escuela')) return false;
    if (n.includes('primera')) return true;
    const sub = n.match(/sub[\s-]*(\d+)/);
    if (sub && parseInt(sub[1]) >= 13) return true;
    return false;
};



const stats = computed(() => {
    const paidList = payments.value.filter(p => p.status === 'Al Día');
    const total = payments.value.length;
    // Ingreso previsto: lo que se debería recaudar basándose en las categorías de los jugadores
    const expected = payments.value.reduce((acc, p) => acc + p.amountValue, 0);
    // Recaudado: suma de los montos de los que están "Al Día"
    const collected = paidList.reduce((acc, p) => acc + p.amountValue, 0);

    return {
        paid: paidList.length,
        pending: total - paidList.length,
        totalAmount: expected,
        collected: collected
    };
});

const updateStatus = async (id, newStatus) => {
    // Si marcamos como Al Día, abrimos el formulario de registro detallado
    if (newStatus === 'Al Día') {
        const player = payments.value.find(p => p.id === id);
        selectedPlayer.value = player;

        // Detectar tipo y valor base automáticamente según categoría
        const isComp = isCompetitive(player.category);
        paymentForm.value.tipo = isComp ? 'Suscripción Club' : 'Mensualidad';
        paymentForm.value.valor = isComp ? 20000 : 50000;

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
            // Always update the player's general status to 'Al Día' after a successful payment registration
            await playersStore.updatePaymentStatus(selectedPlayer.value.id, 'Al Día');

            successMessage.value = '✅ Pago registrado con éxito';
            showRegisterModal.value = false;

            // Recargar datos
            await Promise.all([
                playersStore.initPlayers(),
                paymentsStore.fetchSubscriptions()
            ]);
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
        <!-- Encabezado con Tabs -->
        <div class="admin-toolbar" style="margin-bottom: 1.5rem;">
            <div class="toolbar-left">
                <h1 style="font-size: 1.5rem; color: var(--admin-sidebar); font-weight: 800; margin: 0;">Gestión
                    Financiera Unificada</h1>
                <p style="margin: 0; font-size: 0.9rem; color: #666;">Control total de mensualidades y suscripciones</p>
            </div>
            <div class="toolbar-right" style="display: flex; gap: 10px; align-items: center;">
                <input v-model="searchQuery" type="text" placeholder="Buscar jugador..." class="admin-search-input"
                    style="height: 40px; padding: 0 15px; border-radius: 8px; border: 1px solid #ddd; min-width: 250px;">
                <select v-model="filterCategory" class="admin-search-input"
                    style="height: 40px; border-radius: 8px; border:1px solid #ddd; background: white;">
                    <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>
        </div>

        <!-- Alertas de Feedback -->
        <div v-if="successMessage" class="admin-alert success"
            style="background:#e8f5e9; color:#2e7d32; padding:12px; border-radius:8px; margin-bottom:15px; border-left:5px solid #2e7d32; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-circle-check"></i> {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="admin-alert error"
            style="background:#fdeaea; color:#c62828; padding:12px; border-radius:8px; margin-bottom:15px; border-left:5px solid #c62828; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-circle-xmark"></i> {{ errorMessage }}
        </div>

        <div class="admin-stats-grid"
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="stat-card">
                <div class="stat-icon news"><i class="fa-solid fa-money-bills"></i></div>
                <div class="stat-info">
                    <h3>Ingreso Previsto</h3>
                    <div class="stat-value">${{ stats.totalAmount.toLocaleString() }}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon sponsors" style="background: rgba(46, 204, 113, 0.1); color: #27ae60;">
                    <i class="fa-solid fa-hand-holding-dollar"></i>
                </div>
                <div class="stat-info">
                    <h3>Recaudado Real</h3>
                    <div class="stat-value" style="color: #27ae60;">${{ stats.collected.toLocaleString() }}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon sponsors"><i class="fa-solid fa-clock"></i></div>
                <div class="stat-info">
                    <h3>Pendientes</h3>
                    <div class="stat-value">{{ stats.pending }}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon matches"><i class="fa-solid fa-check-double"></i></div>
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
                            <td><span class="badge" style="background:#eee; color:#666;">{{ payment.category
                            }}</span>
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
                            <td colspan="5" style="text-align: center; padding: 2rem; color: #888;">No se
                                encontraron
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
                            <option value="Suscripción Club">Suscripción Club ($20k)</option>
                            <option value="Uniforme">Uniforme</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div class="admin-form-group">
                            <label>Mes Correspondiente</label>
                            <select v-model="paymentForm.mes" class="admin-search-input" style="width: 100%;">
                                <option v-for="m in 12" :key="m" :value="m">{{
                                    ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
                                        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][m - 1]
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
                                        ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul',
                                            'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][h.mes
                                        - 1] }}</td>
                                    <td><span class="badge" style="background:#f0f7f4; color:#1fa774;">{{ h.tipo
                                    }}</span></td>
                                    <td><strong>${{ Number(h.valor).toLocaleString() }}</strong></td>
                                    <td><small>{{ h.metodo }}</small></td>
                                </tr>
                                <tr v-if="playerHistory.length === 0">
                                    <td colspan="5" style="text-align: center; padding: 2rem; color: #888;">No hay
                                        pagos
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

.admin-tabs button {
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: 700;
    color: #888;
    transition: all 0.2s;
}

.tab-active {
    color: var(--admin-accent) !important;
    border-bottom-color: var(--admin-accent) !important;
}

.tab-inactive:hover {
    color: #555;
    background: #f9f9f9;
}

.text-danger {
    color: #e74c3c;
    font-weight: bold;
}

.text-success {
    color: #27ae60;
    font-weight: bold;
}
</style>
