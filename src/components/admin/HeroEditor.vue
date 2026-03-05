<template>
    <div class="manager-card hero-editor-card" :class="{ 'is-open': !isCollapsed }">
        <div class="card-header" @click="isCollapsed = !isCollapsed">
            <div class="header-left">
                <i class="fa-solid fa-image-portrait hero-icon"></i>
                <h3>Personalizar Cabecera (Hero)</h3>
            </div>
            <div class="header-right">
                <span v-if="hasChanges" class="changes-dot"></span>
                <i class="fa-solid" :class="isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
            </div>
        </div>

        <transition name="slide">
            <div v-show="!isCollapsed" class="card-body">
                <p class="helper-text">Personaliza la imagen de impacto, el título y el mensaje de bienvenida para esta sección.</p>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Título Principal</label>
                        <input v-model="heroData.title" type="text" class="form-control"
                            placeholder="Ej: Noticias Actuales">
                    </div>
                    <div class="form-group">
                        <label>Subtítulo / Frase</label>
                        <input v-model="heroData.tagline" type="text" class="form-control"
                            placeholder="Ej: Mantente al día con el club">
                    </div>
                </div>

                <div class="form-group">
                    <label>Imagen de Fondo</label>
                    <div class="upload-wrapper">
                        <input v-model="heroData.image" type="text" class="form-control"
                            placeholder="URL de la imagen o sube una...">
                        <label class="btn-admin btn-icon-only" :class="{ 'is-uploading': isUploading }">
                            <i v-if="!isUploading" class="fa-solid fa-upload"></i>
                            <i v-else class="fa-solid fa-spinner fa-spin"></i>
                            <input type="file" @change="handleFile" style="display:none" :disabled="isUploading">
                        </label>
                    </div>
                </div>

                <div class="editor-actions">
                    <transition name="fade">
                        <span v-if="saveStatus" class="save-status">
                            <i class="fa-solid fa-check"></i> {{ saveStatus }}
                        </span>
                    </transition>
                    <button @click="saveChanges" class="btn-admin btn-admin--primary" :disabled="!hasChanges">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useHomeSettingsStore } from '../../store/homeSettingsStore';
import { useFileUpload } from '../../composables/useFileUpload';

const props = defineProps({
    pageKey: {
        type: String,
        required: true
    }
});

const homeSettings = useHomeSettingsStore();
const { uploadFile, isUploading } = useFileUpload();

const isCollapsed = ref(true);
const saveStatus = ref('');
const heroData = ref({ title: '', tagline: '', image: '' });
const hasChanges = ref(false);

// Initialize data from store
const loadData = () => {
    const data = homeSettings.pageHeroes[props.pageKey];
    if (data) {
        heroData.value = { ...data };
    }
};

loadData();

// Watch for store changes (if any)
watch(() => homeSettings.pageHeroes[props.pageKey], (newVal) => {
    if (newVal && !hasChanges.value) {
        heroData.value = { ...newVal };
    }
}, { deep: true });

// Track changes
watch(heroData, (newVal, oldVal) => {
    // Only set hasChanges if this isn't the first time loadData set it
    // or if the values actually changed from what's in the store
    const storeData = homeSettings.pageHeroes[props.pageKey];
    if (storeData) {
        const isDifferent = JSON.stringify(newVal) !== JSON.stringify(storeData);
        hasChanges.value = isDifferent;
    }
}, { deep: true });

const handleFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const url = await uploadFile(file);
        heroData.value.image = url;
    } catch (e) {
        alert('Error al subir la imagen');
    }
};

const saveChanges = async () => {
    await homeSettings.updatePageHero(props.pageKey, heroData.value);
    hasChanges.value = false;
    saveStatus.value = 'Cambios guardados';
    setTimeout(() => saveStatus.value = '', 3000);
};
</script>

<style scoped>
.hero-editor-card {
    margin-bottom: 2rem;
    border: 1px solid var(--admin-border);
    border-left: 4px solid var(--admin-accent);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.hero-editor-card.is-open {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.card-header {
    cursor: pointer;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    transition: background 0.2s;
}

.card-header:hover {
    background: #fafafa;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--admin-text-light);
}

.hero-icon {
    font-size: 1.2rem;
    color: var(--admin-accent);
}

.changes-dot {
    width: 8px;
    height: 8px;
    background: var(--admin-warning);
    border-radius: 50%;
}

.helper-text {
    font-size: 0.85rem;
    color: var(--admin-text-light);
    margin-bottom: 1.5rem;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 6px;
    border-left: 2px solid #ddd;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.upload-wrapper {
    display: flex;
    gap: 0.5rem;
}

.editor-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--admin-border);
}

.save-status {
    color: #10b981;
    font-weight: 600;
    font-size: 0.9rem;
}

.btn-icon-only {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    background: #f3f4f6;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.btn-icon-only:hover {
    background: #e5e7eb;
}

.is-uploading {
    opacity: 0.7;
    cursor: not-allowed;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    max-height: 1000px;
}

.slide-enter-from,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
}

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
