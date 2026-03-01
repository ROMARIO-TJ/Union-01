<template>
    <div class="galeria-page">
        <!-- HERO SECTION -->
        <PageHero pageKey="galeria" :defaultImage="galeriaHeroImg" />

        <!-- FILTERS -->
        <section class="filters-section">
            <div class="container gallery-container">
                <div class="filters-header">
                    <span class="filter-label">Explorar por categoría</span>
                    <h2 class="filter-main-title">Momentos de <span class="text-accent">Nuestra Historia</span></h2>
                </div>
                <div class="category-pills">
                    <button v-for="category in galleryStore.categories" :key="category"
                        @click="selectedCategory = category" :class="{ 'active': selectedCategory === category }"
                        class="pill-btn">
                        <span class="pill-dot"></span>
                        {{ category }}
                    </button>
                </div>
            </div>
        </section>

        <!-- GALLERY GRID -->
        <section class="gallery-section">
            <div class="container gallery-container">
                <div v-if="filteredPhotos.length > 0" class="modern-grid" :class="{ 'loading': galleryStore.isLoading }">
                    <div v-for="(photo, index) in filteredPhotos" :key="photo.id" 
                        class="modern-gallery-item"
                        :class="{ 'item-wide': index % 7 === 0 || index % 7 === 3 }"
                        @click="openLightbox(photo)">
                        
                        <div class="item-visual">
                            <img v-if="photo.image" :src="photo.image" class="item-img" loading="lazy" :alt="photo.title">
                            <div v-else class="item-placeholder">
                                <i :class="photo.icon || 'fa-solid fa-image'"></i>
                            </div>
                            
                            <div class="item-badges">
                                <span class="badge-cat">{{ photo.category }}</span>
                                <span v-if="photo.type === 'video'" class="badge-type">
                                    <i class="fa-solid fa-play"></i> Video
                                </span>
                            </div>

                            <div class="item-glass-overlay">
                                <div class="overlay-content">
                                    <h3 class="overlay-title">{{ photo.title || 'Galería' }}</h3>
                                    <div class="overlay-action">
                                        <span>Ver detalle</span>
                                        <i class="fa-solid fa-arrow-right-long"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div v-else-if="!galleryStore.isLoading" class="empty-gallery">
                    <div class="empty-state-icon">
                        <i class="fa-regular fa-image"></i>
                    </div>
                    <h3>No hay archivos aquí</h3>
                    <p>Pronto subiremos nuevo contenido a esta categoría.</p>
                    <button @click="selectedCategory = 'Todas'" class="btn-reset">Ver todo</button>
                </div>
            </div>
        </section>

        <!-- LIGHTBOX MODAL -->
        <transition name="modal-scale">
            <div v-if="lightboxOpen" class="premium-lightbox" @click="closeLightbox">
                <button class="lightbox-close" @click="closeLightbox">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                
                <div class="lightbox-main" @click.stop>
                    <div class="lightbox-stage">
                        <!-- Video Player -->
                        <div v-if="selectedPhoto?.type === 'video'" class="stage-video">
                            <iframe :src="selectedPhoto?.videoUrl" frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen></iframe>
                        </div>

                        <!-- Photo Display -->
                        <div v-else class="stage-image">
                            <img v-if="selectedPhoto?.image" :src="selectedPhoto?.image" :alt="selectedPhoto?.title">
                            <i v-else :class="selectedPhoto?.icon" class="stage-icon"></i>
                        </div>
                    </div>

                    <div class="lightbox-footer">
                        <div class="footer-meta">
                            <span class="meta-tag">{{ selectedPhoto?.category }}</span>
                            <h3 class="meta-title">{{ selectedPhoto?.title }}</h3>
                        </div>
                        <div class="footer-actions">
                           <a v-if="selectedPhoto?.image" :href="selectedPhoto?.image" download class="btn-action-light">
                             <i class="fa-solid fa-download"></i>
                           </a>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        
        <SponsorsCarousel />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGalleryStore } from '../store/galleryStore';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';
import PageHero from '../components/PageHero.vue';
import galeriaHeroImg from '../assets/img/heroes/galeria_hero.png';

const galleryStore = useGalleryStore();
const selectedCategory = ref('Todas');
const lightboxOpen = ref(false);
const selectedPhoto = ref(null);

onMounted(() => {
    galleryStore.initGallery();
});

const filteredPhotos = computed(() => {
    if (selectedCategory.value === 'Todas') {
        return galleryStore.photos;
    }
    return galleryStore.photos.filter(photo => photo.category === selectedCategory.value);
});

const openLightbox = (photo) => {
    selectedPhoto.value = photo;
    lightboxOpen.value = true;
    document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
    lightboxOpen.value = false;
    selectedPhoto.value = null;
    document.body.style.overflow = 'auto';
};
</script>

<style scoped>
.galeria-page {
    background: var(--bg-primary);
}

.gallery-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

/* FILTERS SECTION */
.filters-section {
    padding: 4rem 0 2rem;
    background: linear-gradient(to bottom, var(--bg-secondary) 0%, var(--bg-primary) 100%);
}

.filters-header {
    text-align: center;
    margin-bottom: 2.5rem;
}

.filter-label {
    display: inline-block;
    color: var(--accent-color);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
}

.filter-main-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-primary);
}

.category-pills {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.pill-btn {
    padding: 0.6rem 1.4rem;
    border: 1px solid rgba(0, 0, 0, 0.05);
    background: var(--card-bg);
    color: var(--text-secondary);
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

:root.dark .pill-btn {
    border-color: rgba(255, 255, 255, 0.05);
}

.pill-dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.3;
}

.pill-btn:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.pill-btn.active {
    background: var(--accent-color);
    border-color: var(--accent-color);
    color: #fff;
    box-shadow: 0 8px 20px rgba(31, 167, 116, 0.3);
}

.pill-btn.active .pill-dot {
    opacity: 1;
    background: #fff;
}

/* GALLERY GRID */
.gallery-section {
    padding-bottom: 6rem;
}

.modern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-auto-rows: 300px;
    grid-auto-flow: dense;
    gap: 1.5rem;
}

.modern-gallery-item {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    background: var(--card-bg);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.item-wide {
    grid-column: span 2;
}

.item-visual {
    width: 100%;
    height: 100%;
    position: relative;
}

.item-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.2, 0, 0.2, 1);
}

.modern-gallery-item:hover .item-img {
    transform: scale(1.1);
}

.item-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(31, 167, 116, 0.1) 0%, rgba(15, 61, 46, 0.05) 100%);
}

.item-placeholder i {
    font-size: 4rem;
    color: var(--accent-color);
    opacity: 0.4;
}

.item-badges {
    position: absolute;
    top: 1.25rem;
    left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 2;
}

.badge-cat {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    color: #1f2937;
    padding: 0.4rem 1rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}

.badge-type {
    background: var(--accent-color);
    color: #fff;
    padding: 0.4rem 1rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.item-glass-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
    display: flex;
    align-items: flex-end;
    padding: 2rem;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.modern-gallery-item:hover .item-glass-overlay {
    opacity: 1;
}

.overlay-content {
    width: 100%;
    transform: translateY(20px);
    transition: transform 0.4s cubic-bezier(0.2, 0, 0.2, 1);
}

.modern-gallery-item:hover .overlay-content {
    transform: translateY(0);
}

.overlay-title {
    color: #fff;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.overlay-action {
    color: var(--accent-light);
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* EMPTY STATE */
.empty-gallery {
    text-align: center;
    padding: 5rem 0;
    background: var(--card-bg);
    border-radius: 30px;
    border: 2px dashed rgba(0,0,0,0.05);
}

.empty-state-icon {
    font-size: 4rem;
    color: var(--text-secondary);
    opacity: 0.3;
    margin-bottom: 1.5rem;
}

.btn-reset {
    margin-top: 1.5rem;
    padding: 0.8rem 2rem;
    background: var(--accent-color);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
}

/* PREMIUM LIGHTBOX */
.premium-lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 15, 20, 0.98);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 2rem;
    backdrop-filter: blur(10px);
}

.lightbox-close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 100;
    transition: all 0.3s ease;
}

.lightbox-close:hover {
    background: #ef4444;
    transform: rotate(90deg);
}

.lightbox-main {
    width: 100%;
    max-width: 1100px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.lightbox-stage {
    width: 100%;
    aspect-ratio: 16/9;
    max-height: 70vh;
    background: #000;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
}

.stage-image img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
}

.stage-video {
    width: 100%;
    height: 100%;
}

.stage-video iframe {
    width: 100%;
    height: 100%;
}

.stage-icon {
    font-size: 8rem;
    color: var(--accent-color);
    opacity: 0.3;
}

.lightbox-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 1rem;
}

.meta-tag {
    color: var(--accent-color);
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    display: block;
}

.meta-title {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
}

.btn-action-light {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: 45px;
    background: rgba(255,255,255,0.1);
    color: #fff;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s ease;
}

.btn-action-light:hover {
    background: var(--accent-color);
}

/* ANIMATIONS */
.modal-scale-enter-active,
.modal-scale-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
    opacity: 0;
    transform: scale(1.1);
}

/* RESPONSIVE */
@media (max-width: 1024px) {
    .modern-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .item-wide {
        grid-column: span 1;
    }
}

@media (max-width: 768px) {
    .filter-main-title {
        font-size: 2rem;
    }

    .pill-btn {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
    }

    .modern-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 200px;
    }

    .overlay-title {
        font-size: 1rem;
    }

    .premium-lightbox {
        padding: 1rem;
    }

    .lightbox-stage {
        aspect-ratio: 4/5;
    }
}

@media (max-width: 480px) {
    .modern-grid {
        grid-template-columns: 1fr;
    }
}
</style>
