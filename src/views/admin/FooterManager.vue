<script setup>
import { ref, onMounted, watch } from 'vue';
import { useContactStore } from '../../store/contactStore';

const contactStore = useContactStore();
const successMessage = ref('');
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

const footerData = ref({
    description: '',
    showMenu: true,
    showContact: true
});

const socialForm = ref({
    platform: '',
    url: '',
    icon: 'fa-brands fa-link'
});

const platforms = [
    { name: 'Facebook', icon: 'fa-brands fa-facebook-f' },
    { name: 'Instagram', icon: 'fa-brands fa-instagram' },
    { name: 'Twitter / X', icon: 'fa-brands fa-x-twitter' },
    { name: 'YouTube', icon: 'fa-brands fa-youtube' },
    { name: 'TikTok', icon: 'fa-brands fa-tiktok' },
    { name: 'WhatsApp', icon: 'fa-brands fa-whatsapp' },
    { name: 'LinkedIn', icon: 'fa-brands fa-linkedin-in' },
    { name: 'Otro', icon: 'fa-solid fa-link' }
];

onMounted(() => {
    footerData.value = {
        description: contactStore.footerInfo.description || '',
        showMenu: contactStore.footerInfo.showMenu !== false,
        showContact: contactStore.footerInfo.showContact !== false
    };
});

// Watch for toggle changes to save immediately
watch([() => footerData.value.showMenu, () => footerData.value.showContact], ([newMenu, newContact]) => {
    if (newMenu !== contactStore.footerInfo.showMenu || newContact !== contactStore.footerInfo.showContact) {
        contactStore.updateFooterInfo({
            showMenu: newMenu,
            showContact: newContact
        });
        showSuccess('Visibilidad de columnas actualizada');
    }
});

const handleSave = () => {
    contactStore.updateFooterInfo(footerData.value);
    showSuccess('Configuración del Footer guardada');
};

const showSuccess = (msg) => {
    successMessage.value = msg;
    setTimeout(() => successMessage.value = '', 3000);
};

const openAddSocial = () => {
    isEditing.value = false;
    socialForm.value = { platform: '', url: '', icon: 'fa-brands fa-link' };
    isModalOpen.value = true;
};

const openEditSocial = (link) => {
    isEditing.value = true;
    currentId.value = link.id;
    socialForm.value = { ...link };
    isModalOpen.value = true;
};

const handleSocialSubmit = () => {
    if (isEditing.value) {
        contactStore.updateSocialLink(currentId.value, socialForm.value);
    } else {
        contactStore.addSocialLink(socialForm.value);
    }
    isModalOpen.value = false;
    showSuccess('Enlace social actualizado');
};

const deleteSocial = (id) => {
    if (confirm('¿Estás seguro de eliminar este enlace?')) {
        contactStore.deleteSocialLink(id);
        showSuccess('Enlace eliminado');
    }
};

const selectPlatform = (p) => {
    socialForm.value.platform = p.name;
    socialForm.value.icon = p.icon;
};
</script>

<template>
    <div class="footer-manager">
        <div class="admin-toolbar">
            <h2>Gestionar Footer y Redes Sociales</h2>
            <button @click="handleSave" class="btn-admin btn-admin--primary">
                <i class="fa-solid fa-save"></i> Guardar Cambios
            </button>
        </div>

        <transition name="fade">
            <div v-if="successMessage" class="success-banner">
                <i class="fa-solid fa-check-circle"></i>
                {{ successMessage }}
            </div>
        </transition>

        <div class="manager-grid">
            <!-- Contenido del Footer (Descripción) -->
            <div class="manager-card">
                <div class="card-header">
                    <i class="fa-solid fa-info-circle"></i>
                    <h3>Contenido del Footer</h3>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label>Descripción del Club / Resumen</label>
                        <p class="form-help">Este texto aparece debajo del logo en el pie de página de todo el sitio.
                        </p>
                        <textarea v-model="footerData.description" class="form-control" rows="5"
                            placeholder="Escribe aquí el resumen del club..."></textarea>
                    </div>

                    <div class="footer-visibility-toggles"
                        style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--admin-border);">
                        <h4>Visibilidad de Columnas</h4>
                        <p class="form-help">Selecciona qué secciones quieres mostrar en el pie de página público.</p>

                        <div class="toggle-item"
                            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <span>Mostrar Columna "Menú"</span>
                            <label class="switch">
                                <input type="checkbox" v-model="footerData.showMenu">
                                <span class="slider round"></span>
                            </label>
                        </div>

                        <div class="toggle-item"
                            style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Mostrar Columna "Contacto"</span>
                            <label class="switch">
                                <input type="checkbox" v-model="footerData.showContact">
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Redes Sociales Dynamicas -->
            <div class="manager-card">
                <div class="card-header social-header">
                    <div class="title-with-icon">
                        <i class="fa-solid fa-share-nodes"></i>
                        <h3>Redes Sociales</h3>
                    </div>
                    <button @click="openAddSocial" class="btn-admin" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-plus"></i> Añadir Red
                    </button>
                </div>
                <div class="card-body">
                    <div v-if="contactStore.socialLinks.length === 0" class="empty-social">
                        No hay redes configuradas.
                    </div>
                    <div v-else class="social-list-admin">
                        <div v-for="link in contactStore.socialLinks" :key="link.id" class="social-item-admin">
                            <div class="social-item-info">
                                <div class="social-icon-preview"
                                    :class="link.platform.toLowerCase().replace(/[^a-z]/g, '')">
                                    <i :class="link.icon"></i>
                                </div>
                                <div class="social-text">
                                    <strong>{{ link.platform }}</strong>
                                    <span class="social-url">{{ link.url }}</span>
                                </div>
                            </div>
                            <div class="social-actions">
                                <button @click="openEditSocial(link)" class="btn-action edit"><i
                                        class="fa-solid fa-pen"></i></button>
                                <button @click="deleteSocial(link.id)" class="btn-action delete"><i
                                        class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para Redes Sociales -->
        <div v-if="isModalOpen" class="admin-modal-overlay">
            <div class="admin-modal">
                <div class="admin-modal-header">
                    <h3>{{ isEditing ? 'Editar Red Social' : 'Añadir Red Social' }}</h3>
                    <button @click="isModalOpen = false" class="close-btn">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <div class="platform-grid">
                        <button v-for="p in platforms" :key="p.name" type="button" class="platform-btn"
                            :class="{ active: socialForm.platform === p.name }" @click="selectPlatform(p)">
                            <i :class="p.icon"></i>
                            <span>{{ p.name }}</span>
                        </button>
                    </div>

                    <div class="form-group" style="margin-top: 1.5rem;">
                        <label>Nombre Personalizado (opcional)</label>
                        <input v-model="socialForm.platform" type="text" class="form-control"
                            placeholder="Ej: Facebook Principal">
                    </div>

                    <div class="form-group">
                        <label>URL del Perfil</label>
                        <input v-model="socialForm.url" type="text" class="form-control" placeholder="https://...">
                    </div>

                    <div class="form-group">
                        <label>Icono FontAwesome (personalizado)</label>
                        <input v-model="socialForm.icon" type="text" class="form-control">
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <button @click="isModalOpen = false" class="btn-admin" style="background: #eee;">Cancelar</button>
                    <button @click="handleSocialSubmit" class="btn-admin btn-admin--primary">
                        {{ isEditing ? 'Actualizar' : 'Añadir Red' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.manager-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-top: 1.5rem;
}

.manager-card {
    background: var(--admin-card);
    border-radius: 12px;
    border: 1px solid var(--admin-border);
    box-shadow: var(--admin-card-shadow);
    display: flex;
    flex-direction: column;
}

.card-header {
    padding: 1.25rem;
    background: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid var(--admin-border);
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.social-header {
    justify-content: space-between;
}

.title-with-icon {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.card-header i {
    color: var(--admin-accent);
}

.card-body {
    padding: 1.5rem;
    flex: 1;
}

.form-help {
    font-size: 0.85rem;
    color: var(--admin-text-light);
    margin-bottom: 0.5rem;
}

.social-list-admin {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.social-item-admin {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    border: 1px solid var(--admin-border);
}

.social-item-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.social-icon-preview {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: #333;
}

.social-icon-preview.facebook {
    background: #1877f2;
}

.social-icon-preview.instagram {
    background: #e4405f;
}

.social-icon-preview.twitterx {
    background: #000;
}

.social-icon-preview.youtube {
    background: #ff0000;
}

.social-icon-preview.tiktok {
    background: #000;
}

.social-icon-preview.whatsapp {
    background: #25d366;
}

.social-icon-preview.linkedin {
    background: #0077b5;
}

.social-text {
    display: flex;
    flex-direction: column;
}

.social-url {
    font-size: 0.75rem;
    color: var(--admin-text-light);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.social-actions {
    display: flex;
    gap: 0.5rem;
}

.platform-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
}

.platform-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid var(--admin-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.platform-btn:hover {
    background: rgba(var(--admin-accent-rgb), 0.1);
    border-color: var(--admin-accent);
}

.platform-btn.active {
    background: var(--admin-accent);
    color: #fff;
    border-color: var(--admin-accent);
}

.platform-btn i {
    font-size: 1.2rem;
}

.platform-btn span {
    font-size: 0.7rem;
    font-weight: 600;
}

.success-banner {
    background: #10b981;
    color: #fff;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
}

.empty-social {
    text-align: center;
    color: var(--admin-text-light);
    padding: 2rem;
    font-style: italic;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

@media (max-width: 768px) {
    .manager-grid {
        grid-template-columns: 1fr;
    }
}
</style>
