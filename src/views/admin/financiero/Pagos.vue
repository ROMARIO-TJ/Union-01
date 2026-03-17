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
    year: new Date().getFullYear(), // Añadido campo año
    valor: 50000,
    metodo: 'Efectivo',
    fecha: new Date().toISOString().split('T')[0]
});

// Automatizar valores por defecto con lógica de patrocinio
watch(() => [paymentForm.value.tipo, selectedPlayer.value], ([newTipo, player]) => {
    if (!player) return;

    let base = 50000;
    if (newTipo === 'Suscripción Club' || isCompetitive(player.category)) {
        base = 20000;
    }

    // Aplicar lógica de patrocinio al sugerir valor
    if (player.sponsorship === 'full') {
        paymentForm.value.valor = 0;
    } else if (player.custom_fee) {
        paymentForm.value.valor = parseFloat(player.custom_fee);
    } else if (player.sponsorship === 'partial') {
        // Lógica de hermanos: $35.000 fijos por cada uno
        paymentForm.value.valor = 35000;
    } else {
        paymentForm.value.valor = base;
    }
}, { deep: true });

onMounted(async () => {
    isLoading.value = true;
    try {
        await paymentsStore.syncFinances();
        await Promise.all([
            playersStore.initPlayers(),
            categoryStore.fetchCategories(),
            paymentsStore.fetchSubscriptions(),
            paymentsStore.fetchAllPayments()
        ]);
    } catch (e) {
        console.error("Error sincronizando finanzas:", e);
    } finally {
        isLoading.value = false;
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
        .map(p => {
            const isComp = isCompetitive(p.category);
            let base = isComp ? 20000 : 50000;
            
            // Lógica unificada de cobro
            let realFee = base;
            if (p.sponsorship === 'full') realFee = 0;
            else if (p.custom_fee) realFee = parseFloat(p.custom_fee);
            else if (p.sponsorship === 'partial') realFee = 35000; // Valor fijo hermanos

            return {
                id: p.id,
                player: p.name || p.fullName,
                category: p.category || 'Sin asignar',
                amountValue: realFee,
                amount: `$${realFee.toLocaleString()}`,
                sponsorship: p.sponsorship,
                customFee: p.custom_fee,
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
    const activePlayers = playersStore.players.filter(p => p.status === 'Aceptado' || p.status === 'Pendiente');
    const allHistorical = paymentsStore.historicalPayments;
    
    // 1. Ingreso Mensual Teórico (Solo para comparar con la meta del mes)
    const expectedMonthly = activePlayers.reduce((acc, p) => {
        let base = isCompetitive(p.category) ? 20000 : 50000;
        if (p.sponsorship === 'full') return acc;
        if (p.sponsorship === 'partial') return acc + (base / 2);
        if (p.custom_fee) return acc + parseFloat(p.custom_fee);
        return acc + base;
    }, 0);

    // 2. Recaudado Real (Todo lo que ha entrado a la caja del club históricamente)
    const totalCajaGlobal = allHistorical.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);

    // 3. Desglose para etiquetas
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Cuánto de esa caja corresponde a mensualidades de este mes
    const collectedMonthly = allHistorical.filter(p => 
        (p.tipo === 'Mensualidad' || p.tipo === 'Suscripción Club') && 
        parseInt(p.mes) === currentMonth && 
        parseInt(p.year) === currentYear
    ).reduce((acc, p) => acc + (Number(p.valor) || 0), 0);

    // Cuánto de esa caja corresponde a inscripciones de este año
    const collectedInscriptions = allHistorical.filter(p => 
        p.tipo === 'Inscripción' && parseInt(p.year) === currentYear
    ).reduce((acc, p) => acc + (Number(p.valor) || 0), 0);

    return {
        paid: activePlayers.filter(p => p.paymentStatus === 'Al Día').length,
        pending: activePlayers.filter(p => p.paymentStatus !== 'Al Día').length,
        totalExpected: expectedMonthly,
        collectedMonthly: collectedMonthly,
        collectedInscriptions: collectedInscriptions,
        totalReal: totalCajaGlobal,
        monthlyDebt: Math.max(0, expectedMonthly - collectedMonthly) // Nueva deuda calculada correctamente
    };
});

const showDebtModal = ref(false);
const debtInfo = ref(null);

const viewDebt = async (player) => {
    selectedPlayer.value = player;
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

const getStatusColor = (status) => {
    switch (status) {
        case 'Al Día': return { bg: '#e8f5e9', text: '#2e7d32' };
        case 'Pendiente': return { bg: '#fff3e0', text: '#ef6c00' };
        case 'En Mora': return { bg: '#ffebee', text: '#c62828' };
        default: return { bg: '#f5f5f5', text: '#757575' };
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
            // Ya no forzamos el estado 'Al Día' manualmente aquí.
            // El backend ahora recalcula el estado real basado en TODAS las deudas.
            
            successMessage.value = '✅ Pago registrado con éxito';
            showRegisterModal.value = false;

            // Recargar datos (initPlayers traerá el nuevo estado recalculado por el servidor)
            await Promise.all([
                playersStore.initPlayers(),
                paymentsStore.fetchSubscriptions(),
                paymentsStore.fetchAllPayments()
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

const handleRemovePayment = async (paymentId) => {
    if (!confirm('¿Estás seguro de eliminar este registro de pago? Esto afectará el estado financiero del jugador.')) return;
    
    try {
        isProcessing.value = true;
        const res = await paymentsStore.deletePayment(paymentId);
        if (res) {
            // Actualizar el historial localmente
            playerHistory.value = playerHistory.value.filter(p => p.id !== paymentId);
            // Sincronizar todo para recalcular estados
            await Promise.all([
                playersStore.initPlayers(),
                paymentsStore.fetchSubscriptions(),
                paymentsStore.fetchAllPayments()
            ]);
            successMessage.value = 'Pago eliminado correctamente';
        }
    } catch (e) {
        errorMessage.value = 'Error al eliminar el pago';
    } finally {
        isProcessing.value = false;
        setTimeout(() => successMessage.value = '', 3000);
    }
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
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            
            <div class="stat-card" style="border-left: 4px solid #3498db;">
                <div class="stat-info">
                    <h3 style="font-size: 0.8rem; color: #7f8c8d; text-transform: uppercase;">Mensualidad Mes</h3>
                    <div class="stat-value" style="font-size: 1.4rem; font-weight: 800;">${{ stats.collectedMonthly.toLocaleString() }}</div>
                    <small style="color: #e74c3c; font-weight: 700;">Deuda: ${{ stats.monthlyDebt.toLocaleString() }}</small>
                </div>
            </div>

            <div class="stat-card" style="border-left: 4px solid #1fa774;">
                <div class="stat-info">
                    <h3 style="font-size: 0.8rem; color: #7f8c8d; text-transform: uppercase;">Inscripciones Año</h3>
                    <div class="stat-value" style="font-size: 1.4rem; font-weight: 800; color: #1fa774;">${{ stats.collectedInscriptions.toLocaleString() }}</div>
                    <small style="color: #95a5a6;">Recaudado hoy</small>
                </div>
            </div>

            <div class="stat-card" style="border-left: 4px solid #f1c40f;">
                <div class="stat-info">
                    <h3 style="font-size: 0.8rem; color: #7f8c8d; text-transform: uppercase;">Total en Caja</h3>
                    <div class="stat-value" style="font-size: 1.4rem; font-weight: 800;">${{ stats.totalReal.toLocaleString() }}</div>
                    <small style="color: #95a5a6;">Todo lo recaudado</small>
                </div>
            </div>

            <div class="stat-card" style="border-left: 4px solid #e67e22;">
                <div class="stat-info">
                    <h3 style="font-size: 0.8rem; color: #7f8c8d; text-transform: uppercase;">Estado Jugadores</h3>
                    <div style="display: flex; gap: 10px; margin-top: 5px;">
                        <span style="color: #27ae60; font-weight: bold;">{{ stats.paid }} Al día</span>
                        <span style="color: #e74c3c; font-weight: bold;">{{ stats.pending }} Deben</span>
                    </div>
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
                            <td>
                                <div style="display: flex; flex-direction: column;">
                                    <strong>{{ payment.amount }}</strong>
                                    <small v-if="payment.sponsorship === 'full'" style="color: #1fa774; font-size: 0.7rem; font-weight: bold;">Beca 100%</small>
                                    <small v-else-if="payment.sponsorship === 'partial'" style="color: #e67e22; font-size: 0.7rem; font-weight: bold;">Desc. Hermanos</small>
                                    <small v-else-if="payment.customFee" style="color: #3498db; font-size: 0.7rem; font-weight: bold;">Personalizado</small>
                                </div>
                            </td>
                            <td>
                                <div :style="{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        textAlign: 'center',
                                        display: 'inline-block',
                                        backgroundColor: getStatusColor(payment.status).bg,
                                        color: getStatusColor(payment.status).text,
                                        border: '1px solid ' + getStatusColor(payment.status).text + '22'
                                    }">
                                    <i class="fa-solid" :class="payment.status === 'Al Día' ? 'fa-circle-check' : 'fa-circle-exclamation'"></i>
                                    {{ payment.status }}
                                </div>
                            </td>
                            <td>
                                <div class="action-btns">
                                    <button @click="openHistory(payment)" class="btn-action edit" title="Ver Historial"
                                        style="background: #f0f4f8; color: #2c3e50;">
                                        <i class="fa-solid fa-history"></i>
                                    </button>
                                    <button @click="viewDebt(payment)" class="btn-action edit" title="Ver Deuda Detallada"
                                        style="background: #fff4e5; color: #ff9800;">
                                        <i class="fa-solid fa-file-invoice-dollar"></i>
                                    </button>
                                    <button @click="exportReceipt(payment)" class="btn-action edit"
                                        title="Exportar Recibo" style="background: #e6f3ef; color: #1fa774;">
                                        <i class="fa-solid fa-file-pdf"></i>
                                    </button>
                                    <button @click="() => { 
                                        selectedPlayer = payment; 
                                        const isComp = isCompetitive(payment.category);
                                        paymentForm.tipo = isComp ? 'Suscripción Club' : 'Mensualidad';
                                        
                                        // El watch ya se encarga de poner el valor exacto según patrocinio
                                        showRegisterModal = true; 
                                    }" class="btn-action edit" title="Registrar Nuevo Pago" style="background: var(--admin-accent); color: white;">
                                        <i class="fa-solid fa-plus"></i>
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
                            <label>Año Correspondiente</label>
                            <select v-model="paymentForm.year" class="admin-search-input" style="width: 100%;">
                                <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div class="admin-form-group">
                            <label>Valor ($)</label>
                            <input v-model="paymentForm.valor" type="number" class="admin-search-input"
                                style="width: 100%;">
                        </div>
                        <div class="admin-form-group">
                            <label>Fecha de Recaudo</label>
                            <input v-model="paymentForm.fecha" type="date" class="admin-search-input"
                                style="width: 100%;">
                        </div>
                    </div>
                    <div class="admin-form-group">
                        <label>Método de Pago</label>
                        <select v-model="paymentForm.metodo" class="admin-search-input" style="width: 100%;">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Depósito">Depósito</option>
                        </select>
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <button class="btn-admin secondary" @click="showRegisterModal = false">Cancelar</button>
                    <button class="btn-admin primary" @click="confirmPaymentRegistration" :disabled="isProcessing">
                        {{ isProcessing ? 'Registrando...' : 'Confirmar Pago' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de Deuda Detallada -->
        <div v-if="showDebtModal" class="admin-modal-overlay" @click.self="showDebtModal = false">
            <div class="admin-modal" style="max-width: 500px;">
                <div class="admin-modal-header">
                    <h3>Estado de Cuenta: {{ selectedPlayer?.player }}</h3>
                    <button @click="showDebtModal = false" class="close-modal-btn" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                <div class="admin-modal-body" v-if="debtInfo" style="padding: 20px;">
                    <div class="debt-breakdown" style="background: #f9f9f9; padding: 1.5rem; border-radius: 12px; border: 1px solid #efefef;">
                        <div class="debt-item" style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                            <span>Mensualidades Pendientes:</span>
                            <strong :style="{ color: debtInfo.monthly_debt > 0 ? '#e74c3c' : '#27ae60' }">${{ debtInfo.monthly_debt.toLocaleString() }}</strong>
                        </div>
                        <div class="debt-item" style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                            <span>Inscripciones Pendientes:</span>
                            <strong :style="{ color: debtInfo.inscription_debt > 0 ? '#e74c3c' : '#27ae60' }">${{ (debtInfo.inscription_debt || 0).toLocaleString() }}</strong>
                        </div>
                        <div class="debt-item" style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                            <span>Suscripción Club ($20k):</span>
                            <strong :style="{ color: debtInfo.subscription_debt > 0 ? '#e74c3c' : '#27ae60' }">${{ debtInfo.subscription_debt.toLocaleString() }}</strong>
                        </div>
                        
                        <div v-if="debtInfo.base_value > 0" class="debt-item" style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                            <span>Derechos Administrativos:</span>
                            <strong>${{ debtInfo.base_value.toLocaleString() }}</strong>
                        </div>

                        <div v-if="debtInfo.convention_discount > 0" class="debt-item" style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                            <span style="color: #27ae60;">Descuento Conv./Beca:</span>
                            <strong style="color: #27ae60;">- ${{ debtInfo.convention_discount.toLocaleString() }}</strong>
                        </div>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                        <div class="debt-item total" style="display: flex; justify-content: space-between; font-size: 1.2rem; color: #e74c3c; font-weight: 800;">
                            <span>TOTAL DEUDA:</span>
                            <strong>${{ debtInfo.total_to_pay.toLocaleString() }}</strong>
                        </div>
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <button @click="showDebtModal = false" class="btn-admin primary" style="width: 100%;">Cerrar</button>
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
                                    <th>Fecha Pago</th>
                                    <th>Periodo</th>
                                    <th>Concepto</th>
                                    <th>Monto</th>
                                    <th>Método</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="h in playerHistory" :key="h.id">
                                    <td>{{ h.fecha }}</td>
                                    <td>{{
                                        ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul',
                                            'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][parseInt(h.mes)
                                        - 1] }} / {{ h.year || '2025' }}</td>
                                    <td><span class="badge" style="background:#f0f7f4; color:#1fa774;">{{ h.tipo
                                    }}</span></td>
                                    <td><strong>${{ Number(h.valor).toLocaleString() }}</strong></td>
                                    <td><small>{{ h.metodo }}</small></td>
                                    <td>
                                        <button @click="handleRemovePayment(h.id)" class="btn-action" 
                                            style="background: #fff1f0; color: #ff4d4f; border: 1px solid #ffccc7; border-radius: 4px; padding: 2px 8px;">
                                            <i class="fa-solid fa-trash-can"></i>
                                        </button>
                                    </td>
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
