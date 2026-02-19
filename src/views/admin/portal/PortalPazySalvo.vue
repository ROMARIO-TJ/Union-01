<script setup>
import { computed, onMounted } from 'vue';
import { usePlayersStore } from '../../../store/playersStore';
import { useAuthStore } from '../../../store/authStore';

const playersStore = usePlayersStore();
const authStore = useAuthStore();

onMounted(async () => {
    if (authStore.parentUser?.email) {
        await playersStore.initPlayers();
    }
});

const eligibleChildren = computed(() => {
    const email = authStore.parentUser?.email?.toLowerCase();
    if (!email) return [];
    
    return playersStore.players
        .filter(p => (p.parentEmail || '').toLowerCase() === email && p.paymentStatus === 'Al Día')
        .map(p => ({
            id: p.id,
            name: p.name || p.fullName,
            category: p.category || 'Sin asignar'
        }));
});

const downloadCertificate = (child) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    const logoUrl = '/src/assets/img/logosinfondo.png';
    
    const html = `
        <html>
        <head>
            <title>PAZ Y SALVO - ${child.name}</title>
            <style>
                body { font-family: 'Georgia', serif; padding: 60px; line-height: 1.8; color: #1a1a1a; }
                .border-container { border: 10px double #1fa774; padding: 40px; position: relative; height: 100%; box-sizing: border-box; }
                .header { text-align: center; margin-bottom: 50px; }
                .logo { height: 120px; margin-bottom: 20px; }
                .title { font-size: 32px; font-weight: bold; color: #1fa774; text-transform: uppercase; letter-spacing: 4px; border-bottom: 2px solid #1fa774; display: inline-block; padding-bottom: 10px; }
                .content { text-align: justify; margin: 50px 0; font-size: 18px; }
                .highlight { font-weight: bold; text-decoration: underline; }
                .footer { margin-top: 100px; text-align: center; }
                .seal { position: absolute; bottom: 40px; right: 40px; width: 150px; opacity: 0.2; }
                @media print { body { padding: 0; } .border-container { height: 95vh; } }
            </style>
        </head>
        <body>
            <div class="border-container">
                <div class="header">
                    <img src="${logoUrl}" class="logo">
                    <br>
                    <h1 class="title">PAZ Y SALVO</h1>
                </div>
                
                <div class="content">
                    <p>El suscrito Tesorero del <strong>CLUB UNIÓN JEGUERA</strong>, hace constar que el deportista:</p>
                    <p style="text-align: center; font-size: 24px; margin: 30px 0;">
                        <strong class="highlight">${child.name}</strong>
                    </p>
                    <p>Perteneciente a la categoría <strong class="highlight">${child.category}</strong>, se encuentra a la fecha 
                    <strong>PAZ Y SALVO</strong> por todo concepto relacionado con mensualidades, inscripciones 
                    y derechos de formación con nuestra institución deportiva.</p>
                    
                    <p>Se expide a solicitud del interesado en la ciudad de Sincelejo, el día ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                </div>

                <div class="footer">
                    <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px;">
                        <strong>DIRECCIÓN ADMINISTRATIVA</strong><br>
                        Club Unión Jeguera
                    </div>
                </div>
                
                <img src="${logoUrl}" class="seal">
            </div>
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
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
                <p style="color: #666; font-size: 0.9rem;">Descarga los certificados oficiales de tus hijos que están al día con sus pagos.</p>
            </div>
        </div>

        <div class="admin-table-wrapper" style="margin-top: 2rem;">
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Deportista</th>
                            <th>Categoría</th>
                            <th>Estado de Cuenta</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="child in eligibleChildren" :key="child.id">
                            <td><strong>{{ child.name }}</strong></td>
                            <td><span class="badge" style="background:#eee; color:#666;">{{ child.category }}</span></td>
                            <td><span class="badge status-accepted">AL DÍA</span></td>
                            <td>
                                <button 
                                    @click="downloadCertificate(child)" 
                                    class="btn-action view" 
                                    style="background: #1fa774; color: white; width: auto; padding: 0 20px; height: 35px; border-radius: 8px;"
                                >
                                    <i class="fa-solid fa-download"></i> Descargar Paz y Salvo
                                </button>
                            </td>
                        </tr>
                        <tr v-if="eligibleChildren.length === 0">
                            <td colspan="4" style="text-align: center; padding: 4rem; color: #888;">
                                <i class="fa-solid fa-file-circle-xmark" style="font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                                <p>No hay certificados disponibles en este momento.</p>
                                <small>Para obtener un Paz y Salvo, el deportista debe estar "Al Día" en el panel de pagos.</small>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Mobile Cards Grid -->
        <div class="admin-cards-grid" style="margin-top: 1.5rem;">
            <div v-for="child in eligibleChildren" :key="'card-'+child.id" class="admin-card-item">
                <div class="admin-card-item__header">
                    <div class="stat-icon matches" style="width: 40px; height: 40px; font-size: 1rem;">
                        <i class="fa-solid fa-file-circle-check"></i>
                    </div>
                    <div>
                        <h4 style="font-weight: 800; font-size: 1.1rem;">{{ child.name }}</h4>
                        <span class="badge" style="background:#eee; color:#666; font-size: 0.7rem;">{{ child.category }}</span>
                    </div>
                </div>
                <div class="admin-card-item__body">
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Estado:</span>
                        <span class="text-success" style="font-weight: 700; color: #1fa774;">AL DÍA</span>
                    </div>
                </div>
                <div class="admin-card-item__actions">
                    <button @click="downloadCertificate(child)" class="btn-admin primary" style="width: 100%; padding: 0.7rem;">
                        <i class="fa-solid fa-download"></i> Descargar Certificado
                    </button>
                </div>
            </div>
            
            <div v-if="eligibleChildren.length === 0" style="text-align: center; padding: 2rem; background: var(--admin-card); border-radius: 12px; border: 1px dashed #ccc;">
                <p style="color: #888;">No hay certificados disponibles.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "../../../assets/css/admin/admin.css";
</style>
