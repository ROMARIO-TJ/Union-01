<template>
    <div class="contacto-page">
        <!-- HERO SECTION -->
        <PageHero pageKey="contacto" :defaultImage="contactoHeroImg" />

        <!-- CONTACT SECTION -->
        <section class="contact-section">
            <div class="container">
                <div class="contact-grid">
                    <!-- FORM -->
                    <div v-if="contactStore.contactInfo.showForm !== false" class="contact-form-wrapper">
                        <h2 class="form-title">Envíanos un <span class="text-accent">mensaje</span></h2>
                        <p class="form-subtitle">Completa el formulario y te responderemos a la brevedad</p>

                        <form @submit.prevent="handleSubmit" class="contact-form">
                            <div class="form-group">
                                <label for="name">Nombre completo *</label>
                                <input type="text" id="name" v-model="formData.name" :class="{ 'error': errors.name }"
                                    placeholder="Tu nombre" required>
                                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                            </div>

                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" v-model="formData.email"
                                    :class="{ 'error': errors.email }" placeholder="tu@email.com" required>
                                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                            </div>

                            <div class="form-group">
                                <label for="phone">Teléfono</label>
                                <input type="tel" id="phone" v-model="formData.phone" placeholder="(opcional)">
                            </div>

                            <div class="form-group">
                                <label for="subject">Asunto *</label>
                                <select id="subject" v-model="formData.subject" :class="{ 'error': errors.subject }"
                                    required>
                                    <option value="">Selecciona un asunto</option>
                                    <option value="inscripcion">Inscripción</option>
                                    <option value="consulta">Consulta general</option>
                                    <option value="patrocinio">Patrocinio</option>
                                    <option value="prensa">Prensa</option>
                                    <option value="otro">Otro</option>
                                </select>
                                <span v-if="errors.subject" class="error-message">{{ errors.subject }}</span>
                            </div>

                            <div class="form-group">
                                <label for="message">Mensaje *</label>
                                <textarea id="message" v-model="formData.message" :class="{ 'error': errors.message }"
                                    rows="5" placeholder="Escribe tu mensaje aquí..." required></textarea>
                                <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
                            </div>

                            <button type="submit" class="btn-submit" :disabled="isSubmitting">
                                <span v-if="!isSubmitting">
                                    Enviar mensaje
                                    <i class="fa-solid fa-paper-plane"></i>
                                </span>
                                <span v-else>
                                    Enviando...
                                    <i class="fa-solid fa-spinner fa-spin"></i>
                                </span>
                            </button>

                            <!-- Success Message -->
                            <div v-if="showSuccess" class="success-message">
                                <i class="fa-solid fa-check-circle"></i>
                                ¡Mensaje enviado con éxito! Te responderemos pronto.
                            </div>
                        </form>
                    </div>

                    <!-- DISABLED FORM PLACEHOLDER -->
                    <div v-else class="contact-form-wrapper">
                        <div class="form-disabled-container">
                            <div class="disabled-icon">
                                <i class="fa-solid fa-comments-slash"></i>
                            </div>
                            <h2 class="form-title">Formulario <span class="text-accent">No Disponible</span></h2>
                            <p class="form-subtitle">Hemos desactivado temporalmente la recepción de mensajes por esta
                                vía. Por favor, utiliza los medios de contacto alternativos a tu derecha.</p>
                            <div class="alt-contact-btns">
                                <a :href="'tel:' + contactStore.contactInfo.phone" class="btn-submit"
                                    style="text-decoration: none;">
                                    <i class="fa-solid fa-phone"></i> Llamar
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- CONTACT INFO -->
                    <div class="contact-info">
                        <div class="info-card">
                            <div class="info-icon">
                                <i class="fa-solid fa-location-dot"></i>
                            </div>
                            <h3>Dirección</h3>
                            <p v-html="contactStore.contactInfo.address.replace(/\n/g, '<br>')"></p>
                        </div>

                        <div class="info-card">
                            <div class="info-icon">
                                <i class="fa-solid fa-phone"></i>
                            </div>
                            <h3>Teléfono</h3>
                            <p>{{ contactStore.contactInfo.phone }}</p>
                        </div>

                        <div class="info-card">
                            <div class="info-icon">
                                <i class="fa-solid fa-envelope"></i>
                            </div>
                            <h3>Email</h3>
                            <p>{{ contactStore.contactInfo.email }}</p>
                        </div>

                        <div class="info-card social-card" v-if="contactStore.socialLinks.length > 0">
                            <h3>Síguenos</h3>
                            <div class="social-links">
                                <a v-for="link in contactStore.socialLinks" :key="link.id" :href="link.url"
                                    target="_blank" class="social-link"
                                    :class="link.platform.toLowerCase().replace(/[^a-z]/g, '')" :title="link.platform">
                                    <i :class="link.icon"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <SponsorsCarousel />
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useContactStore } from '../store/contactStore';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';
import PageHero from '../components/PageHero.vue';
import contactoHeroImg from '../assets/img/heroes/contacto_hero.png';

const contactStore = useContactStore();

const formData = reactive({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
});

const errors = reactive({
    name: '',
    email: '',
    subject: '',
    message: ''
});

const isSubmitting = ref(false);
const showSuccess = ref(false);

const validateForm = () => {
    let isValid = true;

    // Reset errors
    Object.keys(errors).forEach(key => errors[key] = '');

    // Validate name
    if (!formData.name.trim()) {
        errors.name = 'El nombre es requerido';
        isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
        errors.email = 'El email es requerido';
        isValid = false;
    } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Email inválido';
        isValid = false;
    }

    // Validate subject
    if (!formData.subject) {
        errors.subject = 'Selecciona un asunto';
        isValid = false;
    }

    // Validate message
    if (!formData.message.trim()) {
        errors.message = 'El mensaje es requerido';
        isValid = false;
    } else if (formData.message.trim().length < 10) {
        errors.message = 'El mensaje debe tener al menos 10 caracteres';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;
    showSuccess.value = false;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show success message
    showSuccess.value = true;
    isSubmitting.value = false;

    // Reset form
    setTimeout(() => {
        Object.keys(formData).forEach(key => formData[key] = '');
        showSuccess.value = false;
    }, 3000);

    // En producción, aquí enviarías los datos a tu backend
    console.log('Form submitted:', formData);
};
</script>

<style scoped>
/* CONTACT SECTION */
.contact-section {
    padding: 5rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.contact-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 4rem;
}

/* FORM */
.contact-form-wrapper {
    background: var(--card-bg);
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

:root.dark .contact-form-wrapper {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.text-accent {
    color: var(--accent-color);
}

.form-subtitle {
    color: var(--text-secondary);
    margin-bottom: 2rem;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
    padding: 0.9rem 1.2rem;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    font-size: 1rem;
    font-family: inherit;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.3s ease;
}

:root.dark .form-group input,
:root.dark .form-group select,
:root.dark .form-group textarea {
    border-color: rgba(255, 255, 255, 0.1);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(31, 167, 116, 0.1);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
    border-color: #e74c3c;
}

.error-message {
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: -0.3rem;
}

.form-group textarea {
    resize: vertical;
    min-height: 120px;
}

.btn-submit {
    background: var(--accent-color);
    color: #fff;
    padding: 1rem 2rem;
    border-radius: 50px;
    border: none;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(31, 167, 116, 0.3);
    margin-top: 1rem;
}

.btn-submit:hover:not(:disabled) {
    background: #158f61;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(31, 167, 116, 0.5);
}

.btn-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.success-message {
    background: #27ae60;
    color: #fff;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-weight: 600;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* CONTACT INFO */
.contact-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.info-card {
    background: var(--card-bg);
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
}

.info-card:hover {
    transform: translateY(-5px);
}

:root.dark .info-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-icon {
    width: 60px;
    height: 60px;
    background: rgba(31, 167, 116, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    font-size: 1.5rem;
    color: var(--accent-color);
}

.info-card h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.8rem;
}

.info-card p {
    color: var(--text-secondary);
    line-height: 1.6;
}

.social-card {
    text-align: center;
}

.social-links {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
}

.social-link {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 1.2rem;
    transition: transform 0.3s ease;
    text-decoration: none;
}

.social-link:hover {
    transform: translateY(-5px);
    opacity: 0.9;
}

/* Default dynamic social backgrounds */
.social-link {
    background: #333;
    /* Fallback */
}

.social-link.facebook {
    background: #1877f2;
}

.social-link.instagram {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.social-link.twitterx {
    background: #000;
}

.social-link.youtube {
    background: #ff0000;
}

.social-link.tiktok {
    background: #000;
}

.social-link.whatsapp {
    background: #25d366;
}

.social-link.linkedin {
    background: #0077b5;
}

/* RESPONSIVE */
@media (max-width: 968px) {
    .contact-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
    }

    .contact-form-wrapper {
        padding: 2rem;
    }
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .hero-tagline {
        font-size: 1.1rem;
    }

    .form-title {
        font-size: 1.6rem;
    }
}

.form-disabled-container {
    text-align: center;
    padding: 2rem 0;
}

.disabled-icon {
    font-size: 4rem;
    color: var(--text-secondary);
    opacity: 0.3;
    margin-bottom: 2rem;
}

.alt-contact-btns {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
}
</style>
