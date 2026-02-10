<template>
    <div class="players-manager">
        <div class="admin-toolbar">
            <div class="toolbar-left">
                <h2>Gestión de Jugadores</h2>
                <span class="badge">{{ playersStore.players.length }} Registrados</span>
            </div>

            <div class="toolbar-right">
                <div class="admin-search-wrapper">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input v-model="searchQuery" type="text" placeholder="Buscar por nombre..."
                        class="admin-search-input">
                </div>
                <div class="admin-filter-wrapper" ref="filterWrapper">
                    <div class="custom-select" @click="toggleFilter" :class="{ 'is-open': isFilterOpen }">
                        <span class="selected-value">{{ filterCategory === 'Todas' ? 'Todas las Categorías' :
                            filterCategory }}</span>
                        <i class="fa-solid fa-chevron-down filter-arrow"></i>
                    </div>

                    <transition name="fade-slide">
                        <div v-if="isFilterOpen" class="custom-select-menu">
                            <div class="custom-option" :class="{ active: filterCategory === 'Todas' }"
                                @click="selectCategory('Todas')">
                                Todas las Categorías
                            </div>
                            <div v-for="cat in categories" :key="cat" class="custom-option"
                                :class="{ active: filterCategory === cat }" @click="selectCategory(cat)">
                                {{ cat }}
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>

        <div class="admin-table-wrapper">
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Nombre</th>
                            <th>Edad</th>
                            <th>Categoría</th>
                            <th>Fecha Registro</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="player in filteredPlayers" :key="player.id">
                            <td>
                                <div class="player-thumb">
                                    <img v-if="player.photo" :src="player.photo">
                                    <i v-else class="fa-solid fa-user"></i>
                                </div>
                            </td>
                            <td><strong>{{ player.fullName }}</strong></td>
                            <td>{{ player.age }} años</td>
                            <td><span class="cat-pill">{{ player.category }}</span></td>
                            <td>{{ player.registrationDate }}</td>
                            <td>
                                <span :class="['status-badge', player.status.toLowerCase()]">
                                    {{ player.status }}
                                </span>
                            </td>
                            <td>
                                <div class="action-btns">
                                    <button @click="viewDetails(player)" class="btn-action view" title="Ver Detalles">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                    <button @click="deletePlayer(player.id)" class="btn-action delete" title="Eliminar">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredPlayers.length === 0">
                            <td colspan="7" class="empty-row">No hay jugadores registrados en esta
                                categoría</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MOBILE CARDS VIEW -->
        <div class="admin-cards-grid">
            <div v-for="player in filteredPlayers" :key="player.id" class="admin-card-item">
                <div class="admin-card-item__header">
                    <div class="player-thumb">
                        <img v-if="player.photo" :src="player.photo">
                        <i v-else class="fa-solid fa-user"></i>
                    </div>
                    <div>
                        <strong>{{ player.fullName }}</strong>
                        <div style="font-size: 0.8rem; color: var(--admin-text-light);">{{ player.category }}</div>
                    </div>
                </div>
                <div class="admin-card-item__body">
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Edad:</span>
                        <span>{{ player.age }} años</span>
                    </div>
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Registro:</span>
                        <span>{{ player.registrationDate }}</span>
                    </div>
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Estado:</span>
                        <span :class="['status-badge', player.status.toLowerCase()]">{{ player.status }}</span>
                    </div>
                </div>
                <div class="admin-card-item__actions">
                    <button @click="viewDetails(player)" class="btn-action view" title="Ver Detalles">
                        <i class="fa-solid fa-eye"></i> Ver Ficha
                    </button>
                    <button @click="deletePlayer(player.id)" class="btn-action delete" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <div v-if="filteredPlayers.length === 0" class="empty-state">
                No hay jugadores registrados en esta categoría
            </div>
        </div>
    </div>

    <!-- DETAILS MODAL -->
    <div v-if="isModalOpen" class="admin-modal-overlay">
        <div class="admin-modal admin-modal--lg">
            <div class="admin-modal-header">
                <h3>Ficha del Jugador</h3>
                <button @click="closeModal" class="close-modal">&times;</button>
            </div>
            <div class="admin-modal-body">
                <div class="player-profile-grid">
                    <!-- Left: Photos -->
                    <div class="profile-section">
                        <div class="details-group">
                            <label>Foto de Perfil</label>
                            <div class="profile-photo-big">
                                <img v-if="selectedPlayer.photo" :src="selectedPlayer.photo">
                                <div v-else class="photo-placeholder"><i class="fa-solid fa-user"></i></div>
                            </div>
                        </div>
                        <div class="details-group">
                            <label>Documento de Identidad</label>
                            <div class="dni-preview">
                                <!-- IMAGEN -->
                                <img v-if="selectedPlayer.dniImage && !selectedPlayer.dniImage.endsWith('.pdf')"
                                    :src="selectedPlayer.dniImage">

                                <!-- PDF -->
                                <iframe v-else-if="selectedPlayer.dniImage && selectedPlayer.dniImage.endsWith('.pdf')"
                                    :src="selectedPlayer.dniImage" class="pdf-preview"></iframe>

                                <div v-else class="photo-placeholder">No disponible</div>
                            </div>

                        </div>
                    </div>

                    <!-- Right: Info -->
                    <div class="profile-info">
                        <div class="info-grid">
                            <div class="info-box">
                                <span class="label">Nombre</span>
                                <span class="value">{{ selectedPlayer.fullName }}</span>
                            </div>
                            <div class="info-box">
                                <span class="label">Documento ({{ selectedPlayer.documentType || 'ID' }})</span>
                                <div class="doc-preview-small" v-if="selectedPlayer.dniImage">
                                    <a :href="selectedPlayer.dniImage" target="_blank" class="view-doc-link">
                                        <i class="fa-solid fa-file-invoice"></i> Ver Identificación
                                    </a>
                                </div>
                                <span v-else class="value">No cargado</span>
                            </div>
                            <div class="info-box">
                                <span class="label">Fecha Nac.</span>
                                <span class="value">{{ selectedPlayer.birthDate }} ({{ selectedPlayer.age }}
                                    años)</span>
                            </div>
                            <div class="info-box">
                                <span class="label">Seguro Médico</span>
                                <div class="doc-preview-small" v-if="selectedPlayer.medicalCertificate">
                                    <a :href="selectedPlayer.medicalCertificate" target="_blank"
                                        class="view-doc-link view-doc-link--medical">
                                        <i class="fa-solid fa-file-medical"></i> Ver Certificado
                                    </a>
                                </div>
                                <span v-else class="value">No cargado</span>
                            </div>
                            <div class="info-box">
                                <span class="label">Categoría</span>
                                <span class="value">{{ selectedPlayer.category }}</span>
                            </div>
                            <div class="info-box">
                                <span class="label">Responsable</span>
                                <span class="value">{{ selectedPlayer.parentName }}</span>
                            </div>
                            <div class="info-box">
                                <span class="label">Teléfono</span>
                                <span class="value">{{ selectedPlayer.phone }}</span>
                            </div>
                            <div class="info-box">
                                <span class="label">Email</span>
                                <span class="value">{{ selectedPlayer.email }}</span>
                            </div>
                            <div class="info-box full">
                                <span class="label">Dirección</span>
                                <span class="value">{{ selectedPlayer.address || 'No proporcionada' }}</span>
                            </div>
                        </div>

                        <div class="status-actions">
                            <label>Estado de la Solicitud</label>
                            <div class="action-buttons">
                                <button @click="updateStatus('Aceptado')" class="btn-status accept"
                                    :class="{ active: selectedPlayer.status === 'Aceptado' }">
                                    Aceptar
                                </button>
                                <button @click="updateStatus('Pendiente')" class="btn-status pending"
                                    :class="{ active: selectedPlayer.status === 'Pendiente' }">
                                    Pendiente
                                </button>
                                <button @click="updateStatus('Rechazado')" class="btn-status reject"
                                    :class="{ active: selectedPlayer.status === 'Rechazado' }">
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePlayersStore } from '../../store/playersStore';

const playersStore = usePlayersStore();
const filterCategory = ref('Todas');
const searchQuery = ref('');
const isModalOpen = ref(false);
const isFilterOpen = ref(false);
const filterWrapper = ref(null);
const selectedPlayer = ref(null);

const categories = computed(() => {
    const normalize = (cat) =>
        cat
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace('sub-', 'sub ')
            .replace('sub ', 'sub ');

    const map = new Map();

    playersStore.players.forEach(p => {
        if (!p.category) return;
        const key = normalize(p.category);
        if (!map.has(key)) {
            map.set(key, p.category.trim());
        }
    });

    const uniqueCategories = Array.from(map.values());

    return uniqueCategories.sort((a, b) => {
        const getPriority = (cat) => {
            const lower = cat.toLowerCase();

            if (lower.includes('escuela')) {
                return { type: 0, value: 0 };
            }

            const subMatch = lower.match(/sub[\s-]*(\d+)/);
            if (subMatch) {
                return { type: 1, value: parseInt(subMatch[1]) };
            }

            if (lower.includes('primera')) {
                return { type: 2, value: 0 };
            }

            return { type: 3, value: 0 };
        };

        const pa = getPriority(a);
        const pb = getPriority(b);

        if (pa.type !== pb.type) {
            return pa.type - pb.type;
        }

        return pa.value - pb.value;
    });
});




const toggleFilter = () => {
    isFilterOpen.value = !isFilterOpen.value;
};

const selectCategory = (cat) => {
    filterCategory.value = cat;
    isFilterOpen.value = false;
};

const handleClickOutside = (event) => {
    if (filterWrapper.value && !filterWrapper.value.contains(event.target)) {
        isFilterOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

const normalize = (cat) =>
    cat
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace('sub-', 'sub ');

const filteredPlayers = computed(() => {
    return playersStore.players.filter(p => {
        const matchesCategory =
            filterCategory.value === 'Todas' ||
            normalize(p.category) === normalize(filterCategory.value);

        const matchesSearch =
            p.fullName.toLowerCase().includes(searchQuery.value.toLowerCase());

        return matchesCategory && matchesSearch;
    });
});


const viewDetails = (player) => {
    selectedPlayer.value = { ...player };
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    selectedPlayer.value = null;
};

const updateStatus = async (status) => {
    await playersStore.updatePlayerStatus(selectedPlayer.value.id, status);
    selectedPlayer.value.status = status;
};

const deletePlayer = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        await playersStore.deletePlayer(id);
    }
};
</script>

<style scoped>
.players-manager {
    padding: 1rem;
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.badge {
    background: var(--admin-accent);
    color: #fff;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

/* FILTERS & SEARCH */
.toolbar-right {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

@media (max-width: 1024px) {
    .admin-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .toolbar-right {
        width: 100%;
    }

    .admin-search-wrapper,
    .admin-filter-wrapper,
    .admin-search-input,
    .custom-select {
        flex: 1;
        min-width: 0;
        /* Prevents overflow */
    }
}

@media (max-width: 600px) {
    .toolbar-right {
        flex-direction: column;
    }

    .admin-search-wrapper,
    .admin-filter-wrapper {
        width: 100%;
    }
}

.admin-table-wrapper {
    width: 100%;
    overflow-x: auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
}

.admin-table-container {
    min-width: 800px;
    /* Forces scroll on small screens */
}

.admin-search-wrapper,
.admin-filter-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.admin-search-input,
.custom-select {
    padding: 0.6rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.9rem;
    background: #fff;
    color: #2d3748;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    min-width: 200px;
    outline: none;
}

.admin-search-input {
    padding-left: 2.5rem;
}

.custom-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
    padding-right: 1rem;
}

.custom-select:hover,
.admin-search-input:hover {
    border-color: var(--admin-accent);
}

.custom-select.is-open,
.admin-search-input:focus {
    border-color: var(--admin-accent);
    box-shadow: 0 0 0 3px rgba(31, 167, 116, 0.1);
}

.filter-arrow {
    color: #a0aec0;
    font-size: 0.8rem;
    transition: transform 0.3s ease;
}

.is-open .filter-arrow {
    transform: rotate(180deg);
}

.custom-select-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 100%;
    min-width: 220px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 100;
    overflow-y: auto;
    max-height: 280px;
    padding: 0.5rem;
    font-size: 0.8rem;
}

.custom-option {
    padding: 0.7rem 1rem;
    font-size: 0.8rem;
    color: #4a5568;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.custom-option:hover {
    background: #f7fafc;
    color: var(--admin-accent);
}

.custom-option.active {
    background: rgba(31, 167, 116, 0.1);
    color: var(--admin-accent);
    font-weight: 600;
}

/* SEARCH ICON */
.search-icon {
    position: absolute;
    left: 1rem;
    color: #a0aec0;
    pointer-events: none;
}

/* TRANSITIONS */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.player-thumb {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #eee;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.player-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cat-pill {
    background: rgba(31, 167, 116, 0.1);
    color: var(--admin-accent);
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-badge {
    padding: 0.3rem 0.7rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}

.status-badge.pendiente {
    background: #fff3cd;
    color: #856404;
}

.status-badge.aceptado {
    background: #d4edda;
    color: #155724;
}

.status-badge.rechazado {
    background: #f8d7da;
    color: #721c24;
}

/* MODAL DETAILS */
.admin-modal--lg {
    max-width: 900px;
}

.player-profile-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
}

.profile-photo-big {
    width: 100%;
    aspect-ratio: 1;
    background: #f5f5f5;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.5rem;
}

.profile-photo-big img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.dni-preview {
    width: 100%;
    height: 150px;
    background: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.5rem;
}

.dni-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.pdf-preview {
    width: 100%;
    height: 350px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.info-box {
    display: flex;
    flex-direction: column;
}

.info-box.full {
    grid-column: span 2;
}

.info-box .label {
    font-size: 0.8rem;
    color: #888;
    font-weight: 600;
    margin-bottom: 0.2rem;
}

.info-box .value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.status-actions {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
}

.status-actions label {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.action-buttons {
    display: flex;
    gap: 1rem;
}

.btn-status {
    padding: 1rem;
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s ease;
}

.btn-status.accept:hover,
.btn-status.accept.active {
    background: #1fa774;
    color: #fff;
    border-color: #1fa774;
}

.btn-status.pending:hover,
.btn-status.pending.active {
    background: #ffc107;
    color: #000;
    border-color: #ffc107;
}

.btn-status.reject:hover,
.btn-status.reject.active {
    background: #dc3545;
    color: #fff;
    border-color: #dc3545;
}

.view-doc-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f0f4f8;
    color: #2c3e50;
    text-decoration: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 0.3rem;
    transition: all 0.3s ease;
}

.view-doc-link:hover {
    background: #e1e7ee;
    transform: translateY(-1px);
}

.view-doc-link--medical {
    background: #e6f3ef;
    color: #1fa774;
}

.view-doc-link--medical:hover {
    background: #ddeadf;
}

@media (max-width: 768px) {
    .player-profile-grid {
        grid-template-columns: 1fr;
    }
}
</style>
