<template>
    <div class="inscripcion-page">
        <section class="inscripcion-hero">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1>Únete al Unión Jeguera</h1>
                <p>Forma parte de nuestra familia deportiva</p>
            </div>
        </section>

        <section class="form-section">
            <div class="container container--narrow">
                <div class="registration-card">
                    <!-- Stepper -->
                    <div class="stepper">
                        <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
                            <span class="step-number">1</span>
                            <span class="step-label">Personales</span>
                        </div>
                        <div class="step-divider"></div>
                        <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
                            <span class="step-number">2</span>
                            <span class="step-label">Contacto</span>
                        </div>
                        <div class="step-divider"></div>
                        <div :class="['step', { active: currentStep >= 3, completed: currentStep > 3 }]">
                            <span class="step-number">3</span>
                            <span class="step-label">Documentación</span>
                        </div>
                    </div>

                    <form @submit.prevent="nextStep">
                        <!-- STEP 1: PERSONAL DATA -->
                        <div v-if="currentStep === 1" class="form-step">
                            <h2 class="step-title">Información del Jugador</h2>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Nombre Completo</label>
                                    <input v-model="formData.fullName" type="text" class="form-control" required
                                        placeholder="Ej: Juan Pérez">
                                </div>
                                <div class="form-group">
                                    <label>Fecha de Nacimiento</label>
                                    <input v-model="formData.birthDate" type="date" class="form-control" required
                                        @change="calculateAge">
                                </div>
                                <div class="form-group">
                                    <label>Edad</label>
                                    <input :value="calculatedAge" type="text" class="form-control" readonly
                                        placeholder="Se calcula automáticamente">
                                </div>
                                <div class="form-group">
                                    <label>Categoría</label>
                                    <select v-model="formData.category" class="form-control" required>
                                        <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.name">
                                            {{ cat.name }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" @click="$router.back()" class="btn-secondary">Cancelar</button>
                                <button type="submit" class="btn-primary">Siguiente <i
                                        class="fa-solid fa-arrow-right"></i></button>
                            </div>
                        </div>

                        <!-- STEP 2: CONTACT DATA -->
                        <div v-if="currentStep === 2" class="form-step">
                            <h2 class="step-title">Datos de Contacto (Padre/Tutor si es menor)</h2>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Nombre del Responsable</label>
                                    <input v-model="formData.parentName" type="text" class="form-control" required
                                        placeholder="Nombre completo">
                                </div>
                                <div class="form-group">
                                    <label>Teléfono de Contacto</label>
                                    <input v-model="formData.phone" type="tel" class="form-control" required
                                        placeholder="Ej: +54 11 ...">
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input v-model="formData.email" type="email" class="form-control" required
                                        placeholder="email@ejemplo.com">
                                </div>
                                <div class="form-group">
                                    <label>Dirección</label>
                                    <input v-model="formData.address" type="text" class="form-control"
                                        placeholder="Calle, Número, Ciudad">
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" @click="currentStep = 1" class="btn-secondary"><i
                                        class="fa-solid fa-arrow-left"></i> Anterior</button>
                                <button type="submit" class="btn-primary">Siguiente <i
                                        class="fa-solid fa-arrow-right"></i></button>
                            </div>
                        </div>

                        <!-- STEP 3: DOCUMENTATION -->
                        <div v-if="currentStep === 3" class="form-step">
                            <h2 class="step-title">Fotos y Documentación</h2>
                            <p class="step-desc">Sube una foto del jugador y una imagen de su identificación.</p>

                            <div class="file-uploads-grid">
                                <!-- Profile Image -->
                                <div class="file-upload-item">
                                    <label>Foto de Perfil <span class="required">*</span> (Solo JPG)</label>
                                    <div class="compact-upload" :class="{ 'has-file': formData.photo }">
                                        <div v-if="!formData.photo" class="upload-trigger"
                                            @click="triggerFile('profile')">
                                            <i class="fa-solid fa-cloud-arrow-up"></i>
                                            <span>Seleccionar Foto</span>
                                        </div>
                                        <div v-else class="file-status">
                                            <i class="fa-solid fa-image"></i>
                                            <span class="file-name">Foto cargada correctamente</span>
                                            <div class="file-actions">
                                                <button type="button" @click="triggerFile('profile')" class="btn-mini"
                                                    title="Cambiar">
                                                    <i class="fa-solid fa-rotate"></i>
                                                </button>
                                                <button type="button" @click="removeFile('photo')"
                                                    class="btn-mini btn-mini--danger" title="Eliminar">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="file" ref="fileProfile" @change="e => handleFile(e, 'photo')"
                                        style="display:none" accept=".jpg,.jpeg">
                                </div>

                                <!-- ID Document -->
                                <div class="file-upload-item">
                                    <label>{{ documentLabel }} <span class="required">*</span> (Solo PDF)</label>
                                    <div class="compact-upload" :class="{ 'has-file': formData.dniImage }">
                                        <div v-if="!formData.dniImage" class="upload-trigger"
                                            @click="triggerFile('dni')">
                                            <i class="fa-solid fa-file-pdf"></i>
                                            <span>Subir {{ documentLabelShort }}</span>
                                        </div>
                                        <div v-else class="file-status">
                                            <i class="fa-solid fa-check-circle"></i>
                                            <span class="file-name">Documento cargado</span>
                                            <div class="file-actions">
                                                <button type="button" @click="triggerFile('dni')" class="btn-mini"
                                                    title="Cambiar">
                                                    <i class="fa-solid fa-rotate"></i>
                                                </button>
                                                <button type="button" @click="removeFile('dniImage')"
                                                    class="btn-mini btn-mini--danger" title="Eliminar">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="file" ref="fileDni" @change="e => handleFile(e, 'dniImage')"
                                        style="display:none" accept=".pdf">
                                </div>

                                <!-- Medical Certificate -->
                                <div class="file-upload-item">
                                    <label>Seguro Médico <span class="required">*</span> (ADRES/EPS - Solo PDF)</label>
                                    <div class="compact-upload" :class="{ 'has-file': formData.medicalCertificate }">
                                        <div v-if="!formData.medicalCertificate" class="upload-trigger"
                                            @click="triggerFile('medical')">
                                            <i class="fa-solid fa-file-shield"></i>
                                            <span>Subir Certificado</span>
                                        </div>
                                        <div v-else class="file-status">
                                            <i class="fa-solid fa-check-circle"></i>
                                            <span class="file-name">Certificado cargado</span>
                                            <div class="file-actions">
                                                <button type="button" @click="triggerFile('medical')" class="btn-mini"
                                                    title="Cambiar">
                                                    <i class="fa-solid fa-rotate"></i>
                                                </button>
                                                <button type="button" @click="removeFile('medicalCertificate')"
                                                    class="btn-mini btn-mini--danger" title="Eliminar">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="file" ref="fileMedical"
                                        @change="e => handleFile(e, 'medicalCertificate')" style="display:none"
                                        accept=".pdf">
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="button" @click="currentStep = 2" class="btn-secondary"><i
                                        class="fa-solid fa-arrow-left"></i> Anterior</button>
                                <button type="button" @click="finishRegistration" class="btn-primary"
                                    :disabled="isSubmitting">
                                    {{ isSubmitting ? 'Procesando...' : 'Finalizar Inscripción' }} <i
                                        class="fa-solid fa-check"></i>
                                </button>
                            </div>
                        </div>
                    </form>

                    <!-- SUCCESS MESSAGE -->
                    <div v-if="currentStep === 4" class="success-message">
                        <div class="success-icon">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <h2>¡Inscripción Enviada!</h2>
                        <p>Hemos recibido correctamente tu solicitud para <strong>{{ formData.fullName }}</strong>.</p>
                        <p>Nuestro equipo revisará la documentación y se pondrá en contacto contigo pronto.</p>
                        <router-link to="/" class="btn-primary">Volver al Inicio</router-link>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayersStore } from '../store/playersStore';
import { useCategoryStore } from '../store/categoryStore';
import { useFileUpload } from '../composables/useFileUpload';

const route = useRoute();
const router = useRouter();
const playersStore = usePlayersStore();
const categoryStore = useCategoryStore();
const { uploadFile } = useFileUpload();

const currentStep = ref(1);
const isSubmitting = ref(false);
const calculatedAge = ref('');

const formData = ref({
    fullName: '',
    birthDate: '',
    age: '',
    category: '',
    parentName: '',
    phone: '',
    email: '',
    address: '',
    photo: '',
    dniImage: '',
    documentType: '', // Registro, TI, CC
    medicalCertificate: ''
});

const fileProfile = ref(null);
const fileDni = ref(null);
const fileMedical = ref(null);
const documentLabel = ref('Documento de Identidad');
const documentLabelShort = ref('Documento');

onMounted(() => {
    if (route.query.categoria) {
        formData.value.category = route.query.categoria;
    }
});

const calculateAge = () => {
    if (!formData.value.birthDate) return;
    const birth = new Date(formData.value.birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
    }
    calculatedAge.value = age + ' años';
    formData.value.age = age;

    // Update document type label based on Colombian age thresholds
    if (age < 7) {
        documentLabel.value = 'Registro Civil de Nacimiento';
        documentLabelShort.value = 'Registro';
        formData.value.documentType = 'Registro Civil';
    } else if (age < 18) {
        documentLabel.value = 'Tarjeta de Identidad';
        documentLabelShort.value = 'T.I.';
        formData.value.documentType = 'Tarjeta Identidad';
    } else {
        documentLabel.value = 'Cédula de Ciudadanía';
        documentLabelShort.value = 'Cédula';
        formData.value.documentType = 'Cédula';
    }
};

const nextStep = () => {
    if (currentStep.value < 3) {
        currentStep.value++;
        window.scrollTo({ top: 400, behavior: 'smooth' });
    }
};

const triggerFile = (type) => {
    if (type === 'profile') fileProfile.value.click();
    else if (type === 'dni') fileDni.value.click();
    else fileMedical.value.click();
};

const handleFile = async (event, field) => {
    const file = event.target.files[0];
    if (!file) return;

    // Strict type validation
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (field === 'photo') {
        if (!['jpg', 'jpeg'].includes(fileExt)) {
            alert('Por favor, selecciona solo archivos JPG para la foto.');
            event.target.value = '';
            return;
        }
    } else {
        if (fileExt !== 'pdf') {
            alert('Por favor, selecciona solo archivos PDF para los documentos.');
            event.target.value = '';
            return;
        }
    }

    try {
        const url = await uploadFile(file);
        formData.value[field] = url;
    } catch (error) {
        alert('Error al cargar el archivo');
    }
};

const removeFile = (field) => {
    formData.value[field] = '';
    // Reset inputs to allow selecting same file again
    if (field === 'photo') fileProfile.value.value = '';
    else if (field === 'dniImage') fileDni.value.value = '';
    else if (field === 'medicalCertificate') fileMedical.value.value = '';
};

const finishRegistration = async () => {
    // Validate mandatory files
    if (!formData.value.photo || !formData.value.dniImage || !formData.value.medicalCertificate) {
        alert('Por favor, sube todos los documentos obligatorios (Foto, Identificación y Seguro Médico) para continuar.');
        window.scrollTo({ top: 400, behavior: 'smooth' });
        return;
    }

    isSubmitting.value = true;
    try {
        const success = await playersStore.addPlayer(formData.value);
        if (success) {
            currentStep.value = 4;
            window.scrollTo({ top: 300, behavior: 'smooth' });
        } else {
            alert('Hubo un error al procesar tu inscripción en el servidor.');
        }
    } catch (error) {
        alert('Hubo un error al procesar tu inscripción');
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
.inscripcion-page {
    background: var(--bg-secondary);
    min-height: 100vh;
}

.inscripcion-hero {
    position: relative;
    height: 30vh;
    min-height: 250px;
    background: linear-gradient(135deg, #0f3d2e 0%, #1fa774 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
}

.hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #fff;
}

.hero-content h1 {
    font-size: 2.5rem;
    font-weight: 900;
    margin-bottom: 0.5rem;
}

/* FORM SECTION */
.form-section {
    padding: 4rem 0;

}

.container--narrow {
    max-width: 800px;
    margin: auto;
}

.registration-card {
    background: var(--card-bg);
    border-radius: 20px;
    padding: 3rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 5;
}

/* STEPPER */
.stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 3rem;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.4;
    transition: all 0.3s ease;
}

.step.active {
    opacity: 1;
}

.step.completed {
    opacity: 0.8;
}

.step-number {
    width: 40px;
    height: 40px;
    background: #eee;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #666;
}

.step.active .step-number {
    background: var(--accent-color);
    color: #fff;
    box-shadow: 0 4px 10px rgba(31, 167, 116, 0.4);
}

.step.completed .step-number {
    background: #1fa774;
    color: #fff;
}

.step-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
}

.step-divider {
    flex: 1;
    height: 2px;
    background: #eee;
    margin: 0 1rem;
    margin-top: -1.5rem;
}

/* FORM STYLES */
.step-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 2rem;
    color: var(--text-primary);
    border-bottom: 3px solid var(--accent-color);
    display: inline-block;
    padding-bottom: 0.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
}

.form-control {
    padding: 0.8rem 1rem;
    border: 2px solid #eee;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: var(--bg-primary);
    color: var(--text-primary);
}

.form-control:focus {
    border-color: var(--accent-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(31, 167, 116, 0.1);
}

.form-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.btn-primary,
.btn-secondary {
    padding: 0.8rem 2rem;
    border-radius: 50px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: var(--accent-color);
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: #158f61;
    transform: translateY(-2px);
}

.btn-secondary {
    background: #eee;
    color: #444;
}

/* COMPACT UPLOAD UI */
.compact-upload {
    width: 100%;
    margin-top: 0.5rem;
    border: 2px dashed #ddd;
    border-radius: 12px;
    background: var(--bg-primary);
    transition: all 0.3s ease;
}

.compact-upload.has-file {
    border-style: solid;
    border-color: var(--accent-color);
    background: rgba(31, 167, 116, 0.05);
}

.upload-trigger {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: var(--text-secondary);
}

.upload-trigger i {
    font-size: 1.5rem;
    color: var(--accent-color);
}

.upload-trigger:hover {
    background: #f8f9fa;
    border-radius: 12px;
}

.file-status {
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.file-status i {
    color: var(--accent-color);
    font-size: 1.2rem;
}

.file-name {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-mini {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    background: #eee;
    color: #444;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-mini:hover {
    background: #e0e0e0;
}

.btn-mini--danger {
    background: #fee2e2;
    color: #dc2626;
}

.btn-mini--danger:hover {
    background: #fecaca;
}

.required {
    color: #dc2626;
    font-weight: bold;
    margin-left: 2px;
}

/* SUCCESS */
.success-message {
    text-align: center;
    padding: 2rem 0;
}

.success-icon {
    font-size: 5rem;
    color: #1fa774;
    margin-bottom: 1.5rem;
}

.success-message h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.success-message p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

@media (max-width: 600px) {
    .registration-card {
        padding: 1.5rem;
    }

    .file-uploads-grid {
        grid-template-columns: 1fr;
    }
}
</style>
