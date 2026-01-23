<template>
    <div class="galeria-page">
        <!-- HERO SECTION -->
        <PageHero pageKey="galeria" :defaultImage="galeriaHeroImg" />

        <!-- FILTERS -->
        <section class="filters-section">
            <div class="container">
                <div class="filters">
                    <button v-for="category in galleryStore.categories" :key="category"
                        @click="selectedCategory = category" :class="{ 'active': selectedCategory === category }"
                        class="filter-btn">
                        {{ category }}
                    </button>
                </div>
            </div>
        </section>

        <!-- GALLERY GRID -->
        <section class="gallery-section">
            <div class="container">
                <div class="gallery-grid">
                    <div v-for="photo in filteredPhotos" :key="photo.id" class="gallery-item"
                        @click="openLightbox(photo)">
                        <div class="photo-placeholder">
                            <img v-if="photo.image" :src="photo.image"
                                style="width: 100%; height: 100%; object-fit: cover;">
                            <i v-else :class="photo.icon"></i>
                            <span class="photo-category-badge">{{ photo.category }}</span>
                            <div v-if="photo.type === 'video'" class="video-play-icon">
                                <i class="fa-solid fa-play"></i>
                            </div>
                        </div>
                        <div class="photo-overlay">
                            <i class="fa-solid fa-search-plus"></i>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- LIGHTBOX MODAL -->
        <transition name="fade">
            <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
                <div class="lightbox-content" @click.stop>
                    <button class="close-btn" @click="closeLightbox">
                        <i class="fa-solid fa-times"></i>
                    </button>

                    <!-- Video Player -->
                    <div v-if="selectedPhoto?.type === 'video'" class="lightbox-video">
                        <iframe :src="selectedPhoto?.videoUrl" frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen></iframe>
                    </div>

                    <!-- Photo Display -->
                    <div v-else class="lightbox-image">
                        <img v-if="selectedPhoto?.image" :src="selectedPhoto?.image"
                            style="max-width: 100%; max-height: 70vh; object-fit: contain;">
                        <i v-else :class="selectedPhoto?.icon"></i>
                    </div>

                    <div class="lightbox-info">
                        <h3>{{ selectedPhoto?.title }}</h3>
                        <p>{{ selectedPhoto?.category }}</p>
                    </div>
                </div>
            </div>
        </transition>
        <SponsorsCarousel />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGalleryStore } from '../store/galleryStore';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';
import PageHero from '../components/PageHero.vue';
import galeriaHeroImg from '../assets/img/heroes/galeria_hero.png';

const galleryStore = useGalleryStore();
const selectedCategory = ref('Todas');
const lightboxOpen = ref(false);
const selectedPhoto = ref(null);

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
/* FILTERS */
.filters-section {
    padding: 3rem 0 2rem;
    background: var(--bg-secondary);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.filters {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 0.7rem 1.5rem;
    border: 2px solid var(--text-secondary);
    background: transparent;
    color: var(--text-primary);
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
}

.filter-btn:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    transform: translateY(-2px);
}

.filter-btn.active {
    background: var(--accent-color);
    border-color: var(--accent-color);
    color: #fff;
}

/* GALLERY */
.gallery-section {
    padding: 4rem 0;
    background: var(--bg-secondary);
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.gallery-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 15px;
    overflow: hidden;
    cursor: pointer;
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

:root.dark .gallery-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.photo-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(31, 167, 116, 0.1) 0%, rgba(15, 61, 46, 0.05) 100%);
    position: relative;
}

.photo-placeholder i {
    font-size: 4rem;
    color: var(--accent-color);
    opacity: 0.6;
}

.photo-category-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: var(--accent-color);
    color: #fff;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.photo-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.gallery-item:hover .photo-overlay {
    opacity: 1;
}

.video-play-icon {
    position: absolute;
    width: 60px;
    height: 60px;
    background: var(--accent-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}

.video-play-icon i {
    font-size: 1.5rem;
    color: #fff;
    margin-left: 4px;
}

.photo-overlay i {
    font-size: 2.5rem;
    color: #fff;
}

/* LIGHTBOX */
.lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.lightbox-content {
    position: relative;
    max-width: 800px;
    width: 100%;
    background: var(--card-bg);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    background: var(--accent-color);
    transform: scale(1.1);
}

.lightbox-video {
    aspect-ratio: 16/9;
    width: 100%;
    background: #000;
}

.lightbox-video iframe {
    width: 100%;
    height: 100%;
}

.lightbox-image {
    min-height: 300px;
    background: linear-gradient(135deg, rgba(31, 167, 116, 0.2) 0%, rgba(15, 61, 46, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.lightbox-image i {
    font-size: 8rem;
    color: var(--accent-color);
    opacity: 0.5;
}

.lightbox-info {
    padding: 2rem;
    text-align: center;
}

.lightbox-info h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.lightbox-info p {
    color: var(--accent-color);
    font-weight: 600;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .hero-tagline {
        font-size: 1.1rem;
    }

    .gallery-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .filter-btn {
        font-size: 0.85rem;
        padding: 0.6rem 1.2rem;
    }

    .lightbox-image i {
        font-size: 5rem;
    }
}

@media (max-width: 480px) {
    .gallery-grid {
        grid-template-columns: 1fr;
    }
}
</style>
