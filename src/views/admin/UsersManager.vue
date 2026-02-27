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
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Tipo</th>
                        <th>Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>#{{ user.id }}</td>
                        <td>
                            <div class="user-info">
                                <img v-if="user.photo" :src="user.photo" class="user-avatar-mini">
                                <span v-else class="user-placeholder-mini">{{ user.name.charAt(0) }}</span>
                                <strong>{{ user.name }}</strong>
                            </div>
                        </td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.phone || 'N/A' }}</td>
                        <td>
                            <span v-if="user.google_id" class="badge-google">
                                <i class="fa-brands fa-google"></i> Google
                            </span>
                            <span v-else class="badge-direct">Directo</span>
                        </td>
                        <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
                        <td>
                            <button @click="deleteUser(user.id)" class="btn-action delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
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

.user-avatar-mini {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.user-placeholder-mini {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1fa774;
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
