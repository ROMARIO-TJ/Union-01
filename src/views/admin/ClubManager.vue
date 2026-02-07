<template>
    <div class="club-manager">
        <HeroEditor pageKey="club" />
        <div class="manager-header">
            <h1 class="manager-title">Gestión del Club</h1>
            <p class="manager-subtitle">Administra la Comisión Directiva, las Instalaciones y la Historia del club</p>
        </div>

        <!-- TABS -->
        <div class="manager-tabs">
            <button class="tab-btn" :class="{ active: activeTab === 'board' }" @click="activeTab = 'board'">
                <i class="fa-solid fa-users-gear"></i> Comisión Directiva
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'facilities' }" @click="activeTab = 'facilities'">
                <i class="fa-solid fa-building-circle-check"></i> Instalaciones
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
                <i class="fa-solid fa-clock-rotate-left"></i> Nuestra Historia
            </button>
        </div>

        <div class="manager-content">
            <!-- BOARD MANAGEMENT -->
            <transition name="fade" mode="out-in">
                <div v-if="activeTab === 'board'" key="board" class="tab-pane">
                    <div class="action-bar">
                        <button class="btn btn-primary" @click="openModal('member')">
                            <i class="fa-solid fa-plus"></i> Agregar Miembro
                        </button>
                    </div>

                    <div class="items-grid">
                        <div v-for="member in clubStore.boardMembers" :key="member.id" class="item-card">
                            <div class="item-icon member-photo">
                                <img v-if="member.image" :src="member.image" alt="Member">
                                <i v-else class="fa-solid fa-user"></i>
                            </div>
                            <div class="item-info">
                                <h3 class="item-name">{{ member.name }}</h3>
                                <p class="item-detail">{{ member.position }}</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn-icon edit" @click="editMember(member)" title="Editar">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn-icon delete" @click="clubStore.deleteBoardMember(member.id)"
                                    title="Eliminar">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FACILITIES MANAGEMENT -->
                <div v-else-if="activeTab === 'facilities'" key="facilities" class="tab-pane">
                    <div class="action-bar">
                        <button class="btn btn-primary" @click="openModal('facility')">
                            <i class="fa-solid fa-plus"></i> Agregar Instalación
                        </button>
                    </div>

                    <div class="items-grid">
                        <div v-for="facility in clubStore.facilities" :key="facility.id" class="item-card">
                            <div class="item-icon facility-preview">
                                <img v-if="facility.image" :src="facility.image" alt="Facility">
                                <i v-else :class="facility.icon"></i>
                            </div>
                            <div class="item-info">
                                <h3 class="item-name">{{ facility.name }}</h3>
                                <p class="item-detail">{{ facility.description }}</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn-icon edit" @click="editFacility(facility)" title="Editar">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn-icon delete" @click="clubStore.deleteFacility(facility.id)"
                                    title="Eliminar">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- HISTORY MANAGEMENT -->
                <div v-else key="history" class="tab-pane">
                    <div class="action-bar">
                        <button class="btn btn-primary" @click="openModal('history')">
                            <i class="fa-solid fa-plus"></i> Agregar Hito Histórico
                        </button>
                    </div>

                    <div class="items-grid">
                        <div v-for="item in clubStore.timeline" :key="item.id || item.year" class="item-card">
                            <div class="item-icon history-year">
                                <span>{{ item.year }}</span>
                            </div>
                            <div class="item-info">
                                <h3 class="item-name">{{ item.title }}</h3>
                                <p class="item-detail">{{ item.description }}</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn-icon edit" @click="editTimelineItem(item)" title="Editar">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn-icon delete"
                                    @click="clubStore.deleteTimelineItem(item.id || item.year)" title="Eliminar">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <!-- MODAL FOR ADD/EDIT -->
        <transition name="fade">
            <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
                <div class="modal-content">
                    <h2 class="modal-title">
                        {{ isEditing ? 'Editar' : 'Agregar' }}
                        {{ modalType === 'member' ? 'Miembro' : modalType === 'history' ? 'Hito' : 'Instalación' }}
                    </h2>

                    <form @submit.prevent="saveItem" class="modal-form">
                        <!-- MEMBER FORM -->
                        <template v-if="modalType === 'member'">
                            <div class="form-group">
                                <label>Foto del Miembro</label>
                                <div class="image-upload-wrapper">
                                    <div class="image-preview" v-if="formData.image">
                                        <img :src="formData.image" alt="Preview">
                                        <button type="button" class="remove-img" @click="formData.image = null">
                                            <i class="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                    <div class="upload-placeholder" v-else @click="$refs.fileInput.click()">
                                        <i class="fa-solid fa-cloud-arrow-up"></i>
                                        <span>Subir Foto</span>
                                    </div>
                                    <input type="file" ref="fileInput" hidden accept="image/*"
                                        @change="handleFileUpload">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Nombre Completo</label>
                                <input v-model="formData.name" type="text" placeholder="Ej: Juan Pérez" required>
                            </div>
                            <div class="form-group">
                                <label>Cargo / Posición</label>
                                <input v-model="formData.position" type="text" placeholder="Ej: Presidente" required>
                            </div>
                        </template>

                        <!-- HISTORY FORM -->
                        <template v-else-if="modalType === 'history'">
                            <div class="form-group">
                                <label>Año</label>
                                <input v-model="formData.year" type="text" placeholder="Ej: 1985" required>
                            </div>
                            <div class="form-group">
                                <label>Título del Hito</label>
                                <input v-model="formData.title" type="text" placeholder="Ej: Fundación del Club"
                                    required>
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea v-model="formData.description"
                                    placeholder="Describa este momento histórico..." required></textarea>
                            </div>
                        </template>

                        <!-- FACILITY FORM -->
                        <template v-else>
                            <div class="form-group">
                                <label>Imagen / Icono de la Instalación</label>
                                <div class="image-upload-wrapper">
                                    <div class="image-preview" v-if="formData.image">
                                        <img :src="formData.image" alt="Preview">
                                        <button type="button" class="remove-img" @click="formData.image = null">
                                            <i class="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                    <div class="upload-placeholder" v-else @click="$refs.fileInput.click()">
                                        <i class="fa-solid fa-cloud-arrow-up"></i>
                                        <span>Subir Foto</span>
                                    </div>
                                    <input type="file" ref="fileInput" hidden accept="image/*"
                                        @change="handleFileUpload">
                                </div>
                                <p class="form-hint" v-if="!formData.image">Opcional: Si no sube una foto, se usará el
                                    icono de abajo.</p>
                            </div>
                            <div class="form-group" v-if="!formData.image">
                                <label>Icono (Clase de FontAwesome)</label>
                                <input v-model="formData.icon" type="text" placeholder="Ej: fa-solid fa-futbol">
                            </div>
                            <div class="form-group">
                                <label>Nombre de la Instalación</label>
                                <input v-model="formData.name" type="text" placeholder="Ej: Estadio Municipal" required>
                            </div>
                            <div class="form-group">
                                <label>Descripción Corta</label>
                                <textarea v-model="formData.description" placeholder="Describa brevemente..."
                                    required></textarea>
                            </div>
                        </template>

                        <div class="modal-actions">
                            <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useClubStore } from '../../store/clubStore';
import HeroEditor from '../../components/admin/HeroEditor.vue';

const clubStore = useClubStore();
const activeTab = ref('board');
const showModal = ref(false);
const modalType = ref('member');
const isEditing = ref(false);
const editingId = ref(null);
const fileInput = ref(null);

const formData = reactive({
    name: '',
    position: '',
    description: '',
    icon: 'fa-solid fa-check',
    image: null,
    year: '',
    title: ''
});

const openModal = (type) => {
    modalType.value = type;
    isEditing.value = false;
    editingId.value = null;
    resetForm();
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const resetForm = () => {
    formData.name = '';
    formData.position = '';
    formData.description = '';
    formData.icon = modalType.value === 'member' ? 'fa-solid fa-user' : 'fa-solid fa-building';
    formData.image = null;
    formData.year = '';
    formData.title = '';
};

const editMember = (member) => {
    modalType.value = 'member';
    isEditing.value = true;
    editingId.value = member.id;
    formData.name = member.name;
    formData.position = member.position;
    formData.image = member.image || null;
    showModal.value = true;
};

const editFacility = (facility) => {
    modalType.value = 'facility';
    isEditing.value = true;
    editingId.value = facility.id;
    formData.name = facility.name;
    formData.description = facility.description;
    formData.icon = facility.icon;
    formData.image = facility.image || null;
    showModal.value = true;
};

const editTimelineItem = (item) => {
    modalType.value = 'history';
    isEditing.value = true;
    editingId.value = item.id || item.year;
    formData.year = item.year;
    formData.title = item.title;
    formData.description = item.description;
    showModal.value = true;
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            formData.image = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const saveItem = async () => {
    if (modalType.value === 'member') {
        const memberData = { name: formData.name, position: formData.position, image: formData.image };
        if (isEditing.value) await clubStore.updateBoardMember(editingId.value, memberData);
        else await clubStore.addBoardMember(memberData);
    } else if (modalType.value === 'facility') {
        const facilityData = { name: formData.name, description: formData.description, icon: formData.icon || 'fa-solid fa-check', image: formData.image };
        if (isEditing.value) await clubStore.updateFacility(editingId.value, facilityData);
        else await clubStore.addFacility(facilityData);
    } else if (modalType.value === 'history') {
        const timelineData = { year: formData.year, title: formData.title, description: formData.description };
        if (isEditing.value) await clubStore.updateTimelineItem(editingId.value, timelineData);
        else await clubStore.addTimelineItem(timelineData);
    }
    closeModal();
};
</script>

<style scoped>
.club-manager {
    padding: 1rem;
}

.manager-header {
    margin-bottom: 2rem;
}

.manager-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.manager-subtitle {
    color: var(--text-secondary);
}

.manager-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 1rem;
}

.tab-btn {
    border: none;
    padding: 0.8rem 1.5rem;
    color: var(--text-secondary);
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
}

.tab-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
}

.tab-btn.active {
    background: var(--accent-color);
    color: white;
}

.action-bar {
    margin-bottom: 2rem;
}

.items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.item-card {
    background: var(--card-bg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    transition: transform 0.3s ease;
}

.item-card:hover {
    transform: translateY(-5px);
    border-color: var(--accent-color);
}

.item-icon {
    width: 50px;
    height: 50px;
    background: rgba(31, 167, 116, 0.1);
    color: var(--accent-color);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
    overflow: hidden;
}

.item-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-icon.history-year {
    background: var(--accent-color);
    color: white;
    font-weight: 800;
    font-size: 0.9rem;
}

.item-info {
    flex-grow: 1;
}

.item-name {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.2rem;
}

.item-detail {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

.item-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    width: 35px;
    height: 35px;
    border-radius: 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
}

.btn-icon.edit:hover {
    background: #3498db;
    color: white;
}

.btn-icon.delete:hover {
    background: #e74c3c;
    color: white;
}

.btn {
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
}

.btn-primary {
    background: var(--accent-color);
    color: white;
}

.btn-outline {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
}

.modal-content {
    background: var(--bg-primary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
    width: 100%;
    max-width: 450px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-title {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
}

.form-group {
    margin-bottom: 1.2rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-secondary);
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
}

.image-upload-wrapper {
    margin-top: 0.5rem;
}

.upload-placeholder {
    width: 100%;
    height: 150px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    cursor: pointer;
}

.image-preview {
    position: relative;
    width: 100%;
    height: 150px;
    border-radius: 12px;
    overflow: hidden;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.remove-img {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    cursor: pointer;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}
</style>
