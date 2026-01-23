<script setup>
import { ref, onMounted, watch } from 'vue';
import { useContactStore } from '../../store/contactStore';
import HeroEditor from '../../components/admin/HeroEditor.vue';

const contactStore = useContactStore();
const successMessage = ref('');

const contactForm = ref({
    address: '',
    phone: '',
    email: '',
    showForm: true
});

onMounted(() => {
    contactForm.value = {
        address: contactStore.contactInfo.address || '',
        phone: contactStore.contactInfo.phone || '',
        email: contactStore.contactInfo.email || '',
        showForm: contactStore.contactInfo.showForm !== false
    };
});

// Watch for toggle changes to save immediately
watch(() => contactForm.value.showForm, (newVal) => {
    if (newVal !== contactStore.contactInfo.showForm) {
        contactStore.updateContactInfo({ showForm: newVal });
        showSuccess(newVal ? 'Formulario activado' : 'Formulario desactivado');
    }
});

const saveContact = () => {
    contactStore.updateContactInfo(contactForm.value);
    showSuccess('Información de contacto guardada');
};

const showSuccess = (msg) => {
    successMessage.value = msg;
    setTimeout(() => successMessage.value = '', 3000);
};
</script>

<template>
    <div class="contact-manager">
        <HeroEditor pageKey="contacto" />
        <div class="admin-toolbar">
            <h2>Gestionar Contacto</h2>
            <button @click="saveContact" class="btn-admin btn-admin--primary">
                <i class="fa-solid fa-save"></i> Guardar Todo
            </button>
        </div>

        <transition name="fade">
            <div v-if="successMessage" class="success-banner">
                <i class="fa-solid fa-check-circle"></i>
                {{ successMessage }}
            </div>
        </transition>

        <div class="manager-grid">
            <!-- Datos de Contacto -->
            <div class="manager-card">
                <div class="card-header">
                    <i class="fa-solid fa-address-book"></i>
                    <h3>Datos del Club</h3>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label>Dirección</label>
                        <input v-model="contactForm.address" type="text" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input v-model="contactForm.phone" type="text" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input v-model="contactForm.email" type="email" class="form-control">
                    </div>

                    <div class="form-group toggle-group"
                        style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center;">
                        <div class="toggle-info">
                            <label style="display: block; font-weight: 600;">Formulario de Contacto</label>
                            <p style="font-size: 0.8rem; color: var(--admin-text-light); margin: 0;">Activa o desactiva
                                el formulario público.</p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" v-model="contactForm.showForm">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Information about where to manage Social Links -->
            <div class="info-notice-card">
                <i class="fa-solid fa-lightbulb"></i>
                <div>
                    <h4>¿Buscas las Redes Sociales?</h4>
                    <p>Ahora puedes gestionarlas cómodamente desde la sección <strong><router-link
                                to="/admin/footer">Footer</router-link></strong> para mantener una configuración global
                        unificada.</p>
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

.card-header i {
    color: var(--admin-accent);
}

.card-body {
    padding: 1.5rem;
    flex: 1;
}

/* Switch Slider */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
}

input:checked+.slider {
    background-color: var(--admin-accent);
}

input:checked+.slider:before {
    transform: translateX(26px);
}

.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
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

.info-notice-card {
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
}

.info-notice-card i {
    font-size: 1.5rem;
    margin-top: 0.2rem;
}

.info-notice-card h4 {
    margin: 0 0 0.5rem 0;
    font-weight: 700;
}

.info-notice-card p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
}

.info-notice-card strong a {
    color: inherit;
    text-decoration: underline;
}

@media (max-width: 768px) {
    .manager-grid {
        grid-template-columns: 1fr;
    }
}
</style>
