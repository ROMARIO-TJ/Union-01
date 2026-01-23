<template>
    <div class="categorias-page">
        <!-- HEADER HERO COMPONENT -->
        <PageHero pageKey="categoria" :defaultImage="clubHeroImg" />

        <!-- CATEGORIAS SECTION -->
        <section class="categorias-section">
            <div class="container">
                <div class="categorias-grid">
                    <div v-for="categoria in categoryStore.categories" :key="categoria.id" class="categoria-card">
                        <div class="categoria-icon-wrapper">
                            <i :class="categoria.icon"></i>
                        </div>

                        <h3 class="categoria-name">{{ categoria.name }}</h3>
                        <p class="categoria-age">{{ categoria.age }}</p>

                        <div class="categoria-info">
                            <div class="info-item">
                                <i class="fa-solid fa-calendar-days"></i>
                                <span>{{ categoria.schedule }}</span>
                            </div>
                            <div class="info-item">
                                <i class="fa-solid fa-clock"></i>
                                <span>{{ categoria.time }}</span>
                            </div>
                            <div class="info-item">
                                <i class="fa-solid fa-user-tie"></i>
                                <span>{{ categoria.coach }}</span>
                            </div>
                        </div>

                        <router-link :to="{ name: 'Inscripcion', query: { categoria: categoria.name } }"
                            class="btn-inscribir">
                            Inscribirse
                            <i class="fa-solid fa-arrow-right"></i>
                        </router-link>
                    </div>
                </div>
            </div>
        </section>

        <!-- INFO SECTION -->
        <section class="info-section">
            <div class="container">
                <div class="info-content">
                    <h2 class="section-title text-center">¿Por qué elegir <span class="text-accent">Unión
                            Jeguera</span>?</h2>
                    <div class="benefits-grid">
                        <div v-for="benefit in categoryStore.benefits" :key="benefit.id" class="benefit-item">
                            <i :class="benefit.icon"></i>
                            <h4>{{ benefit.title }}</h4>
                            <p>{{ benefit.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- TEAMS GALLERY SECTION -->
        <section class="teams-gallery">
            <div class="container">
                <h2 class="section-title text-center">Nuestros <span class="text-accent">Equipos</span></h2>
                <div class="gallery-grid">
                    <div v-for="categoria in categoryStore.categories" :key="`img-${categoria.id}`" class="gallery-item"
                        @click="openLightbox(categoria)">
                        <div v-if="categoria.teamImage" class="img-wrapper">
                            <img :src="categoria.teamImage" :alt="categoria.name">
                            <div class="img-overlay">
                                <i class="fa-solid fa-expand"></i>
                                <span>{{ categoria.name }}</span>
                            </div>
                        </div>
                        <div v-else class="img-placeholder">
                            <i class="fa-solid fa-camera"></i>
                            <span>Próximamente {{ categoria.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- LIGHTBOX MODAL -->
        <transition name="fade">
            <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
                <button class="close-btn" @click="closeLightbox">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="lightbox-content">
                    <img :src="selectedTeam?.teamImage" :alt="selectedTeam?.name">
                    <div class="lightbox-info">
                        <h3>{{ selectedTeam?.name }}</h3>
                        <p>{{ selectedTeam?.age }} - {{ selectedTeam?.coach }}</p>
                    </div>
                </div>
            </div>
        </transition>
        <SponsorsCarousel />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCategoryStore } from '../store/categoryStore';
import PageHero from '../components/PageHero.vue';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';
import clubHeroImg from '../assets/img/heroes/club_hero.png';

const categoryStore = useCategoryStore();
const lightboxOpen = ref(false);
const selectedTeam = ref(null);

const openLightbox = (team) => {
    if (!team.teamImage) return;
    selectedTeam.value = team;
    lightboxOpen.value = true;
    document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
    lightboxOpen.value = false;
    selectedTeam.value = null;
    document.body.style.overflow = 'auto';
};

</script>

<style scoped>
/* CONTAINER */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}


.hero-title {
    font-size: 4rem;
    font-weight: 900;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: -1px;
    line-height: 1;
    text-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    opacity: 0;
    animation: fadeInUp 0.8s ease-out 0.4s forwards;
}

.hero-tagline {
    font-size: 1.5rem;
    font-weight: 300;
    opacity: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
    animation: fadeInUp 0.8s ease-out 0.7s forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 0.9;
        transform: translateY(0);
    }
}

/* CATEGORIAS SECTION */
.categorias-section {
    padding: 5rem 0;
    background-color: var(--bg-primary);
}

/* CATEGORIAS GRID */
.categorias-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
    gap: 2rem;
    padding: 1rem 0;
}

/* CATEGORIA CARD */
.categoria-card {
    background-color: var(--card-bg);
    padding: 2.8rem 2rem;
    border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.4s ease;
    height: 100%;
}

:root.dark .categoria-card {
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.categoria-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: var(--accent-color);
}

.categoria-icon-wrapper {
    width: 85px;
    height: 85px;
    background: linear-gradient(135deg, rgba(31, 167, 116, 0.1) 0%, rgba(31, 167, 116, 0.05) 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.4rem;
    color: var(--accent-color);
    margin-bottom: 1.8rem;
    transition: all 0.3s ease;
}

.categoria-card:hover .categoria-icon-wrapper {
    background: var(--accent-color);
    color: #fff;
    transform: rotate(5deg) scale(1.1);
}

.categoria-name {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.categoria-age {
    font-size: 1rem;
    color: var(--accent-color);
    font-weight: 700;
    margin-bottom: 1.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.categoria-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    margin-bottom: 2.2rem;
    padding: 1.8rem 0;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

:root.dark .categoria-info {
    border-color: rgba(255, 255, 255, 0.1);
}

.info-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
}

.info-item i {
    color: var(--accent-color);
    width: 20px;
    font-size: 1.1rem;
}

.btn-inscribir {
    background: var(--accent-color);
    color: #fff !important;
    padding: 0.9rem 2.2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.3s ease;
    width: 100%;
    justify-content: center;
}

.btn-inscribir:hover {
    background: #158f61;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(31, 167, 116, 0.4);
}

/* INFO SECTION */
.info-section {
    padding: 5rem 0;
    background: var(--bg-secondary);
}

.text-center {
    text-align: center;
}

.benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 3rem;
    margin-top: 3rem;
}

.benefit-item {
    text-align: center;
    padding: 1rem;
}

.benefit-item i {
    font-size: 3.2rem;
    color: var(--accent-color);
    margin-bottom: 1.5rem;
}

.benefit-item h4 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.benefit-item p {
    color: var(--text-secondary);
    line-height: 1.7;
}

/* RESPONSIVE */
/* TEAMS GALLERY */
.teams-gallery {
    padding: 5rem 0;
    background: var(--bg-primary);
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 3rem;
}

.gallery-item {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    height: 250px;
    cursor: pointer;
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.img-wrapper {
    width: 100%;
    height: 100%;
}

.img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.gallery-item:hover img {
    transform: scale(1.1);
}

.img-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: #fff;
}

.gallery-item:hover .img-overlay {
    opacity: 1;
}

.img-overlay i {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.img-overlay span {
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 0.9rem;
}

.img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--text-secondary);
    opacity: 0.6;
}

.img-placeholder i {
    font-size: 3rem;
}

/* LIGHTBOX */
.lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.close-btn {
    position: absolute;
    top: 2rem;
    right: 2rem;
    background: none;
    border: none;
    color: #fff;
    font-size: 2.5rem;
    cursor: pointer;
    z-index: 2010;
    transition: transform 0.3s ease;
}

.close-btn:hover {
    transform: scale(1.1) rotate(90deg);
}

.lightbox-content {
    max-width: 1000px;
    width: 100%;
    position: relative;
    animation: zoomIn 0.3s ease-out;
}

.lightbox-content img {
    width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 10px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.lightbox-info {
    color: #fff;
    text-align: center;
    margin-top: 1.5rem;
}

.lightbox-info h3 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
}

.lightbox-info p {
    font-size: 1.1rem;
    opacity: 0.8;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@media (max-width: 1150px) {
    .carousel-controls {
        left: 10px;
        right: 10px;
    }

    .nav-btn {
        width: 50px;
        height: 50px;
        font-size: 1.2rem;
    }
}

@media (max-width: 1024px) {
    .categoria-card {
        flex: 0 0 300px;
        min-width: 300px;
    }

    .carousel-controls {
        display: none;
        /* Swipe is standard on mobile */
    }
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .section-title {
        font-size: 2rem;
    }

    .categoria-card {
        flex: 0 0 280px;
        min-width: 280px;
        padding: 2.2rem 1.5rem;
    }

    .categorias-carousel {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}
</style>
