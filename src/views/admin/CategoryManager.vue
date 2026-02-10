<script setup>
import { ref, computed } from 'vue';
import { useCategoryStore } from '../../store/categoryStore';
import { useFileUpload } from '../../composables/useFileUpload';
import HeroEditor from '../../components/admin/HeroEditor.vue';

const categoryStore = useCategoryStore();
const { uploadFile, isUploading } = useFileUpload();

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const fileInput = ref(null);

// =======================
// ORDEN AUTOMÁTICO CATEGORÍAS
// =======================
const orderedCategories = computed(() => {
    if (!categoryStore.categories) return [];

    const orderValue = (name) => {
        const n = name.toLowerCase();

        // 1️⃣ Escuela de formación
        if (n.includes('escuela')) return 0;

        // 2️⃣ Sub categorías
        const sub = n.match(/sub[\s-]*(\d+)/);
        if (sub) return 100 + parseInt(sub[1]);

        // 3️⃣ Primera
        if (n.includes('primera')) return 300;

        // 4️⃣ Otras
        return 999;
    };

    return [...categoryStore.categories].sort(
        (a, b) => orderValue(a.name) - orderValue(b.name)
    );
});

// =======================
// FORMULARIO
// =======================
const formData = ref({
    name: '',
    age: '',
    schedule: '',
    time: '',
    coach: '',
    icon: 'fa-solid fa-users',
    teamImage: ''
});

const openCreateModal = () => {
    isEditing.value = false;
    formData.value = {
        name: '',
        age: '',
        schedule: '',
        time: '',
        coach: '',
        icon: 'fa-solid fa-users',
        teamImage: ''
    };
    isModalOpen.value = true;
};

const openEditModal = (item) => {
    isEditing.value = true;
    currentId.value = item.id;
    formData.value = { ...item };
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const url = await uploadFile(file);
        formData.value.teamImage = url;
    } catch {
        alert('Error al subir la imagen');
    }
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleSubmit = async () => {
    if (isEditing.value) {
        await categoryStore.updateCategory(currentId.value, formData.value);
    } else {
        await categoryStore.addCategory(formData.value);
    }
    closeModal();
};

const deleteItem = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
        await categoryStore.deleteCategory(id);
    }
};
</script>


<template>
    <div class="category-manager">
        <HeroEditor pageKey="categoria" />
        <div class="admin-toolbar">
            <h2>Gestionar Categorías</h2>
            <button @click="openCreateModal" class="btn-admin btn-admin--primary">
                <i class="fa-solid fa-plus"></i> Nueva Categoría
            </button>
        </div>

        <div class="admin-table-wrapper">
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Icono</th>
                            <th>Nombre</th>
                            <th>Edad</th>
                            <th>Entrenador</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in orderedCategories" :key="item.id">
                            <td>
                                <div class="category-icon-preview">
                                    <i :class="item.icon"></i>
                                </div>
                            </td>
                            <td><strong>{{ item.name }}</strong></td>
                            <td>{{ item.age }}</td>
                            <td>{{ item.coach }}</td>
                            <td>
                                <div class="action-btns">
                                    <button @click="openEditModal(item)" class="btn-action edit" title="Editar">
                                        <i class="fa-solid fa-pen"></i>
                                    </button>
                                    <button @click="deleteItem(item.id)" class="btn-action delete" title="Eliminar">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MOBILE VIEW -->
        <div class="admin-cards-grid">
            <div v-for="item in orderedCategories" :key="item.id" class="admin-card-item">
                <div class="admin-card-item__header">
                    <div class="category-icon-preview">
                        <i :class="item.icon"></i>
                    </div>
                    <div>
                        <strong>{{ item.name }}</strong>
                        <div style="font-size: 0.8rem; color: var(--admin-text-light);">{{ item.age }}</div>
                    </div>
                </div>
                <div class="admin-card-item__body">
                    <div class="admin-card-item__row">
                        <span class="admin-card-item__label">Entrenador:</span>
                        <span>{{ item.coach }}</span>
                    </div>
                </div>
                <div class="admin-card-item__actions">
                    <button @click="openEditModal(item)" class="btn-action edit">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button @click="deleteItem(item.id)" class="btn-action delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="isModalOpen" class="admin-modal-overlay">
            <div class="admin-modal">
                <div class="admin-modal-header">
                    <h3>{{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
                    <button @click="closeModal" class="close-modal-btn">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nombre de la Categoría</label>
                                <input v-model="formData.name" type="text" class="form-control" placeholder="Ej: Sub-15"
                                    required>
                            </div>
                            <div class="form-group">
                                <label>Rango de Edad</label>
                                <input v-model="formData.age" type="text" class="form-control"
                                    placeholder="Ej: 13 a 15 años" required>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label>Días / Horario</label>
                                <input v-model="formData.schedule" type="text" class="form-control"
                                    placeholder="Ej: Lunes, Miércoles y Viernes" required>
                            </div>
                            <div class="form-group">
                                <label>Hora</label>
                                <input v-model="formData.time" type="text" class="form-control"
                                    placeholder="Ej: 18:00 - 19:30" required>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label>Entrenador</label>
                                <input v-model="formData.coach" type="text" class="form-control"
                                    placeholder="Nombre del Prof." required>
                            </div>
                            <div class="form-group">
                                <label>Icono FontAwesome</label>
                                <input v-model="formData.icon" type="text" class="form-control"
                                    placeholder="Ej: fa-solid fa-futbol" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Imagen del Equipo</label>
                            <div class="image-upload-wrapper">
                                <div v-if="formData.teamImage" class="image-preview-box">
                                    <img :src="formData.teamImage" alt="Preview">
                                </div>
                                <div v-else class="image-placeholder-box">
                                    <i class="fa-solid fa-camera"></i>
                                    <span>Sin imagen</span>
                                </div>
                                <div class="upload-controls">
                                    <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*"
                                        style="display: none;">
                                    <button type="button" @click="triggerFileInput" class="btn-admin"
                                        style="width: 100%; background: #eee;">
                                        <i class="fa-solid fa-upload"></i> {{ isUploading ? `Subiendo...` : `Subir
                                        Imagen Local` }}
                                    </button>
                                    <input v-model="formData.teamImage" type="text" class="form-control"
                                        placeholder="O pega URL de la imagen" style="margin-top: 0.5rem;">
                                </div>
                            </div>
                        </div>

                        <div class="admin-modal-footer">
                            <button type="button" @click="closeModal" class="btn-admin"
                                style="background: #eee;">Cancelar</button>
                            <button type="submit" class="btn-admin btn-admin--primary">
                                {{ isEditing ? 'Guardar Cambios' : 'Crear Categoría' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- SECCIÓN POR QUÉ ELEGIRNOS -->
        <div class="admin-toolbar"
            style="margin-top: 4rem; border-top: 1px solid var(--admin-border); padding-top: 2rem;">
            <h2>Gestionar "¿Por qué elegirnos?"</h2>
            <button @click="openBenefitCreateModal" class="btn-admin btn-admin--primary">
                <i class="fa-solid fa-plus"></i> Nuevo Beneficio
            </button>
        </div>

        <div class="admin-table-wrapper">
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Icono</th>
                            <th>Título</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="benefit in categoryStore.benefits" :key="benefit.id">
                            <td>
                                <div class="category-icon-preview">
                                    <i :class="benefit.icon"></i>
                                </div>
                            </td>
                            <td><strong>{{ benefit.title }}</strong></td>
                            <td>{{ benefit.description }}</td>
                            <td>
                                <div class="action-btns">
                                    <button @click="openBenefitEditModal(benefit)" class="btn-action edit"
                                        title="Editar">
                                        <i class="fa-solid fa-pen"></i>
                                    </button>
                                    <button @click="deleteBenefit(benefit.id)" class="btn-action delete"
                                        title="Eliminar">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Benefits Mobile View -->
        <div class="admin-cards-grid">
            <div v-for="benefit in categoryStore.benefits" :key="benefit.id" class="admin-card-item">
                <div class="admin-card-item__header">
                    <div class="category-icon-preview">
                        <i :class="benefit.icon"></i>
                    </div>
                    <strong>{{ benefit.title }}</strong>
                </div>
                <div class="admin-card-item__body">
                    <p>{{ benefit.description }}</p>
                </div>
                <div class="admin-card-item__actions">
                    <button @click="openBenefitEditModal(benefit)" class="btn-action edit">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button @click="deleteBenefit(benefit.id)" class="btn-action delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Benefit Modal -->
        <div v-if="isBenefitModalOpen" class="admin-modal-overlay">
            <div class="admin-modal">
                <div class="admin-modal-header">
                    <h3>{{ isEditingBenefit ? 'Editar Beneficio' : 'Nuevo Beneficio' }}</h3>
                    <button @click="isBenefitModalOpen = false" class="close-modal-btn">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <form @submit.prevent="handleBenefitSubmit">
                        <div class="form-group">
                            <label>Título del Beneficio</label>
                            <input v-model="benefitFormData.title" type="text" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea v-model="benefitFormData.description" class="form-control" rows="3"
                                required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Icono FontAwesome</label>
                            <input v-model="benefitFormData.icon" type="text" class="form-control"
                                placeholder="Ej: fa-solid fa-check" required>
                        </div>

                        <div class="admin-modal-footer">
                            <button type="button" @click="isBenefitModalOpen = false" class="btn-admin"
                                style="background: #eee;">Cancelar</button>
                            <button type="submit" class="btn-admin btn-admin--primary">
                                {{ isEditingBenefit ? 'Guardar Cambios' : 'Crear Beneficio' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.category-icon-preview {
    width: 40px;
    height: 40px;
    background: rgba(31, 167, 116, 0.1);
    color: var(--admin-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 1.2rem;
}

.image-upload-wrapper {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    margin-top: 0.5rem;
}

.image-preview-box {
    width: 120px;
    height: 80px;
    border: 1px solid var(--admin-border);
    border-radius: 8px;
    overflow: hidden;
    background: #eee;
}

.image-preview-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-placeholder-box {
    width: 120px;
    height: 80px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 0.8rem;
}

.upload-controls {
    flex: 1;
}

.close-modal-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--admin-text);
}

@media (max-width: 640px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
