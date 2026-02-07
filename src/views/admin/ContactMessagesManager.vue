<template>
    <div class="messages-manager">
        <div class="admin-toolbar">
            <h2>Mensajes Recibidos</h2>
            <div class="toolbar-actions">
                <button @click="loadMessages" class="btn-admin" :disabled="isLoading">
                    <i class="fa-solid fa-refresh" :class="{ 'fa-spin': isLoading }"></i> Actualizar
                </button>
                <span class="unread-badge" v-if="unreadCount > 0">
                    {{ unreadCount }} sin leer
                </span>
            </div>
        </div>

        <transition name="fade">
            <div v-if="successMessage" class="success-banner">
                <i class="fa-solid fa-check-circle"></i>
                {{ successMessage }}
            </div>
        </transition>

        <div v-if="isLoading" class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i> Cargando mensajes...
        </div>

        <div v-else-if="messages.length === 0" class="empty-state">
            <i class="fa-solid fa-inbox"></i>
            <h3>No hay mensajes</h3>
            <p>Cuando los usuarios envíen mensajes desde el formulario de contacto, aparecerán aquí.</p>
        </div>

        <div v-else class="messages-list">
            <div v-for="message in messages" :key="message.id" class="message-card"
                :class="{ 'unread': message.read_status == 0 }" @click="openMessage(message)">
                <div class="message-header">
                    <div class="sender-info">
                        <div class="avatar">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div class="sender-details">
                            <h4>{{ message.name }}</h4>
                            <span class="email">{{ message.email }}</span>
                        </div>
                    </div>
                    <div class="message-meta">
                        <span class="date">{{ formatDate(message.created_at) }}</span>
                        <span class="unread-dot" v-if="message.read_status == 0"></span>
                    </div>
                </div>
                <div class="message-subject">
                    <i class="fa-solid fa-tag"></i>
                    <strong>{{ getSubjectLabel(message.subject) }}</strong>
                </div>
                <div class="message-preview">
                    {{ message.message.substring(0, 150) }}{{ message.message.length > 150 ? '...' : '' }}
                </div>
            </div>
        </div>

        <!-- Modal para ver mensaje completo -->
        <div v-if="selectedMessage" class="admin-modal-overlay" @click="closeMessage">
            <div class="admin-modal message-modal" @click.stop>
                <div class="admin-modal-header">
                    <h3>Mensaje de {{ selectedMessage.name }}</h3>
                    <button @click="closeMessage" class="close-btn">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <div class="message-full">
                        <div class="info-row">
                            <span class="label">De:</span>
                            <span class="value">{{ selectedMessage.name }} ({{ selectedMessage.email }})</span>
                        </div>
                        <div class="info-row" v-if="selectedMessage.phone">
                            <span class="label">Teléfono:</span>
                            <span class="value">{{ selectedMessage.phone }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Asunto:</span>
                            <span class="value">{{ getSubjectLabel(selectedMessage.subject) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Fecha:</span>
                            <span class="value">{{ formatDate(selectedMessage.created_at) }}</span>
                        </div>
                        <div class="message-content">
                            <span class="label">Mensaje:</span>
                            <p>{{ selectedMessage.message }}</p>
                        </div>
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <a :href="'mailto:' + selectedMessage.email" class="btn-admin btn-admin--primary">
                        <i class="fa-solid fa-reply"></i> Responder por Email
                    </a>
                    <button @click="markAsRead(selectedMessage.id)" class="btn-admin"
                        v-if="selectedMessage.read_status == 0">
                        <i class="fa-solid fa-check"></i> Marcar como leído
                    </button>
                    <button @click="deleteMessage(selectedMessage.id)" class="btn-admin btn-danger">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { apiService } from '../../services/api';

const messages = ref([]);
const selectedMessage = ref(null);
const isLoading = ref(false);
const successMessage = ref('');

const unreadCount = computed(() => {
    return messages.value.filter(m => m.read_status == 0).length;
});

const loadMessages = async () => {
    isLoading.value = true;
    try {
        const result = await apiService.request('contact-messages', 'GET');
        messages.value = result || [];
    } catch (error) {
        console.error('Error loading messages:', error);
    } finally {
        isLoading.value = false;
    }
};

const openMessage = async (message) => {
    selectedMessage.value = message;

    // Marcar como leído automáticamente al abrir
    if (message.read_status == 0) {
        await markAsRead(message.id, false);
    }
};

const closeMessage = () => {
    selectedMessage.value = null;
};

const markAsRead = async (id, showMsg = true) => {
    try {
        await apiService.request('contact-messages', 'PATCH', { id, read_status: 1 });
        const msg = messages.value.find(m => m.id === id);
        if (msg) msg.read_status = 1;
        if (selectedMessage.value && selectedMessage.value.id === id) {
            selectedMessage.value.read_status = 1;
        }
        if (showMsg) {
            showSuccess('Mensaje marcado como leído');
        }
    } catch (error) {
        console.error('Error marking as read:', error);
    }
};

const deleteMessage = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) return;

    try {
        await apiService.request('contact-messages', 'DELETE', { id });
        messages.value = messages.value.filter(m => m.id !== id);
        closeMessage();
        showSuccess('Mensaje eliminado');
    } catch (error) {
        console.error('Error deleting message:', error);
    }
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getSubjectLabel = (subject) => {
    const labels = {
        'inscripcion': 'Inscripción',
        'consulta': 'Consulta general',
        'patrocinio': 'Patrocinio',
        'prensa': 'Prensa',
        'otro': 'Otro'
    };
    return labels[subject] || subject;
};

const showSuccess = (msg) => {
    successMessage.value = msg;
    setTimeout(() => successMessage.value = '', 3000);
};

onMounted(() => {
    loadMessages();
});
</script>

<style scoped>
.toolbar-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.unread-badge {
    background: #e74c3c;
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--admin-text-light);
}

.empty-state i {
    font-size: 4rem;
    opacity: 0.3;
    margin-bottom: 1rem;
}

.messages-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
}

.message-card {
    background: var(--admin-card);
    border: 2px solid var(--admin-border);
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.message-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--admin-accent);
}

.message-card.unread {
    border-left: 4px solid var(--admin-accent);
    background: rgba(31, 167, 116, 0.05);
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.sender-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar {
    width: 45px;
    height: 45px;
    background: var(--admin-accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.sender-details h4 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--admin-text);
}

.sender-details .email {
    font-size: 0.85rem;
    color: var(--admin-text-light);
}

.message-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.date {
    font-size: 0.85rem;
    color: var(--admin-text-light);
}

.unread-dot {
    width: 10px;
    height: 10px;
    background: #1fa774;
    border-radius: 50%;
}

.message-subject {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: var(--admin-accent);
    font-size: 0.9rem;
}

.message-preview {
    color: var(--admin-text-light);
    line-height: 1.6;
}

.message-modal {
    max-width: 700px;
}

.message-full {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.info-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-row .label {
    font-weight: 600;
    color: var(--admin-text);
    font-size: 0.9rem;
}

.info-row .value {
    color: var(--admin-text-light);
}

.message-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.message-content p {
    background: rgba(0, 0, 0, 0.02);
    padding: 1rem;
    border-radius: 8px;
    line-height: 1.8;
    white-space: pre-wrap;
    color: var(--admin-text);
}

.btn-danger {
    background: #e74c3c !important;
}

.btn-danger:hover {
    background: #c0392b !important;
}
</style>
