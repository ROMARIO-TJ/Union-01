<script setup>
import { ref, onMounted } from 'vue';
import { apiService } from '../../services/api';

const users = ref([]);
const loading = ref(true);
const error = ref('');

const fetchUsers = async () => {
    loading.value = true;
    try {
        const data = await apiService.request('users');
        if (Array.isArray(data)) {
            // Filtrar solo padres de familia para el control financiero/usuarios
            users.value = data.filter(u => u.role === 'padre_familia');
        }
    } catch (err) {
        error.value = 'No se pudieron cargar los usuarios.';
    } finally {
        loading.value = false;
    }
};

const deleteUser = async (id) => {
    if (!confirm('⚠️ ATENCIÓN: ¿Estás seguro de eliminar este usuario?\n\nAl hacerlo, también ELIMINARÁS AUTOMÁTICAMENTE a los jugadores (niños) asociados a este padre y todo su historial de pagos.\n\nEsta acción NO se puede deshacer.')) return;

    try {
        const res = await apiService.request('users', 'DELETE', { id });
        if (res.status === 'success') {
            users.value = users.value.filter(u => u.id !== id);
        }
    } catch (err) {
        alert('Error al eliminar usuario');
    }
};

onMounted(fetchUsers);
</script>

<template>
    <div class="users-manager admin-page">
        <div class="admin-toolbar">
            <div class="toolbar-left">
                <h2>Gestión de Usuarios (Padres)</h2>
                <p>Aquí puedes ver quién se ha registrado en el portal de padres.</p>
            </div>
            <button @click="fetchUsers" class="btn-admin">
                <i class="fa-solid fa-sync" :class="{ 'fa-spin': loading }"></i> Refrescar
            </button>
        </div>

        <div v-if="loading" class="admin-loading">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Cargando usuarios...
        </div>

        <div v-else-if="users.length === 0" class="admin-empty">
            <i class="fa-solid fa-user-slash"></i>
            <p>Aún no hay padres de familia registrados.</p>
        </div>

        <div v-else class="admin-table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">ID</th>
                        <th>Usuario / Padre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Origen</th>
                        <th>Vinculado</th>
                        <th style="text-align: right; padding-right: 2rem;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td style="color: #888;">#{{ user.id }}</td>
                        <td>
                            <div class="user-info">
                                <div v-if="user.photo" class="user-avatar-mini-box">
                                    <img :src="user.photo" class="user-avatar-mini-img">
                                </div>
                                <span v-else class="user-placeholder-mini">{{ user.name.charAt(0) }}</span>
                                <div class="user-name-box">
                                    <strong style="display: block; font-size: 0.95rem;">{{ user.name }}</strong>
                                    <small v-if="user.role === 'padre_familia'" style="color: var(--admin-accent);">Padre de Familia</small>
                                </div>
                            </div>
                        </td>
                        <td><span style="font-size: 0.9rem;">{{ user.email }}</span></td>
                        <td>{{ user.phone || 'N/A' }}</td>
                        <td>
                            <span v-if="user.google_id" class="badge-google">
                                <i class="fa-brands fa-google"></i> Google
                            </span>
                            <span v-else class="badge-direct">Directo</span>
                        </td>
                        <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
                        <td>
                            <div style="display: flex; justify-content: flex-end; padding-right: 1.5rem;">
                                <button @click="deleteUser(user.id)" class="btn-action delete" title="Eliminar Usuario y Datos Relacionados">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- MOBILE CARDS VIEW -->
        <div class="admin-cards-grid">
            <div v-for="user in users" :key="'card-' + user.id" class="admin-card-item">
                <div class="admin-card-item__header">
                    <div v-if="user.photo" class="user-avatar-mini-box">
                        <img :src="user.photo" class="user-avatar-mini-img">
                    </div>
                    <span v-else class="user-placeholder-mini" style="width: 40px; height: 40px;">{{ user.name.charAt(0) }}</span>
                    <div>
                        <strong style="display: block; font-size: 1.1rem;">{{ user.name }}</strong>
                        <small style="color: var(--admin-accent);">{{ user.email }}</small>
                    </div>
                </div>
                <div class="admin-card-item__body">
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">ID:</span>
                        <span>#{{ user.id }}</span>
                    </div>
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Teléfono:</span>
                        <span>{{ user.phone || 'N/A' }}</span>
                    </div>
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Vinculado:</span>
                        <span>{{ new Date(user.created_at).toLocaleDateString() }}</span>
                    </div>
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Origen:</span>
                        <span v-if="user.google_id">Cuenta Google</span>
                        <span v-else>Registro Directo</span>
                    </div>
                </div>
                <div class="admin-card-item__actions">
                    <button @click="deleteUser(user.id)" class="btn-admin-danger" style="width: 100%;">
                        <i class="fa-solid fa-trash"></i> Eliminar Usuario Permanentemente
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-page {
    padding: 2rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.user-avatar-mini-box {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid var(--admin-border);
    background: #f0f0f0;
}

.user-avatar-mini-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-placeholder-mini {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--admin-accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
}

.badge-google {
    background: rgba(66, 133, 244, 0.1);
    color: #4285f4;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-direct {
    background: rgba(155, 155, 155, 0.1);
    color: #888;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.btn-admin {
    background: #1fa774;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.btn-admin:hover {
    background: #167d56;
}

.btn-admin-danger {
    background: #fff5f5;
    color: #e74c3c;
    border: 1px solid #feb2b2;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-admin-danger:hover {
    background: #e74c3c;
    color: white;
}

.admin-empty {
    text-align: center;
    padding: 5rem;
    color: #aaa;
}

.admin-empty i {
    font-size: 4rem;
    margin-bottom: 1rem;
}
</style>
