<template>
    <div class="categorias-page">
        <!-- HEADER HERO COMPONENT -->
        <PageHero pageKey="categoria" :defaultImage="clubHeroImg" />

        <!-- CATEGORIAS SECTION -->
        <section class="categorias-section">
            <div class="container">
                <div class="section-header-carousel mb-8">
                    <div>
                        <h2 class="section-title">Nuestras <span class="text-accent">Categorías</span></h2>
                    </div>
                    <div class="carousel-nav-btns">
                        <button @click="scrollCatLeft" class="nav-control-btn">
                            <span class="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button @click="scrollCatRight" class="nav-control-btn">
                            <span class="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>

                <div class="categorias-carousel-wrapper no-scrollbar" ref="catCarousel">
                    <div v-for="categoria in orderedCategories" :key="categoria.id" class="categoria-card-mini">
                        <h3 class="categoria-name-mini">{{ categoria.name }}</h3>
                        <p class="categoria-age-mini">{{ categoria.age }}</p>

                        <div class="categoria-info-mini">
                            <div class="info-item-mini">
                                <i class="fa-solid fa-calendar-days"></i>
                                <span>{{ categoria.schedule }}</span>
                            </div>
                            <div class="info-item-mini">
                                <i class="fa-solid fa-clock"></i>
                                <span>{{ categoria.time }}</span>
                            </div>
                            <div class="info-item-mini">
                                <i class="fa-solid fa-user-tie"></i>
                                <span>{{ categoria.coach }}</span>
                            </div>
                        </div>

                        <button 
                            @click="handleJoinCategory(categoria.name)"
                            class="btn-inscribir-mini">
                            Inscribirse
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- INFO SECTION -->
        <section class="info-section">
            <div class="container">
                <div class="info-content">
                    <h2 class="section-title text-center">¿Por qué elegir <span class="text-accent">Unión
                            Jaguera</span>?</h2>
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
                    <div v-for="categoria in orderedCategories" :key="`img-${categoria.id}`" class="gallery-item"
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
                <button class="close-btn" @click="closeLightbox" aria-label="Cerrar">
                    <svg viewBox="0 0 24 24" fill="none" class="close-icon-svg" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import { useCategoryStore } from '../store/categoryStore';
import PageHero from '../components/PageHero.vue';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';
import clubHeroImg from '../assets/img/heroes/club_hero.png';

const categoryStore = useCategoryStore();
const authStore = useAuthStore();
const router = useRouter();
const lightboxOpen = ref(false);
const selectedTeam = ref(null);
const catCarousel = ref(null);

const handleJoinCategory = (categoryName) => {
    if (authStore.isParentAuthenticated) {
        // Si ya está logueado, lo mandamos al portal a inscribir
        router.push({ name: 'PortalHijo', query: { categoria: categoryName } });
    } else {
        // Si no, lo mandamos a que se registre/loguee primero
        router.push({ name: 'PortalPadres', query: { redirect: 'PortalHijo', categoria: categoryName } });
    }
};

const scrollCatLeft = () => {
    if (catCarousel.value) {
        catCarousel.value.scrollBy({ left: -320, behavior: 'smooth' });
    }
};

const scrollCatRight = () => {
    if (catCarousel.value) {
        catCarousel.value.scrollBy({ left: 320, behavior: 'smooth' });
    }
};

const orderedCategories = computed(() => {
    if (!categoryStore.categories) return [];
    const orderValue = (name) => {
        const n = name.toLowerCase();
        if (n.includes('escuela')) return 0;
        const sub = n.match(/sub[\s-]*(\d+)/);
        if (sub) return 100 + parseInt(sub[1]);
        if (n.includes('primera')) return 300;
        return 999;
    };
    return [...categoryStore.categories].sort((a, b) => orderValue(a.name) - orderValue(b.name));
});

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
.categorias-page {
    background-color: var(--bg-primary);
}

.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

/* CATEGORIAS SECTION */
.categorias-section {
    padding: 6rem 0;
    background-color: var(--bg-primary);
}

.section-header-carousel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
}

.carousel-nav-btns {
    display: flex;
    gap: 1rem;
}

.nav-control-btn {
    width: 40px;
    height: 40px;
    border-radius: 0;
    border: 1px solid rgba(17, 212, 66, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    background: var(--card-bg);
    cursor: pointer;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.nav-control-btn::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent-color);
    transition: width 0.3s ease;
}

.nav-control-btn:hover::after {
    width: 100%;
}

.nav-control-btn:hover {
    background: var(--bg-secondary);
    color: var(--accent-color);
    transform: translateY(-2px);
}

.categorias-carousel-wrapper {
    display: flex;
    gap: 1.5rem;
    overflow-x: auto;
    padding: 1rem 0 2rem;
    scroll-snap-type: x mandatory;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}

/* CATEGORIA CARD MINI */
.categoria-card-mini {
    flex: 0 0 280px;
    background-color: var(--card-bg);
    padding: 2.5rem 2rem;
    border-radius: 0;
    border: 1px solid rgba(17, 212, 66, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.4s ease;
    scroll-snap-align: start;
    position: relative;
}

.categoria-card-mini:hover {
    border-color: var(--accent-color);
    box-shadow: 0 0 20px rgba(17, 212, 66, 0.15);
    transform: translateY(-5px);
}

.categoria-name-mini {
    font-size: 1.4rem;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: -0.5px;
}

.categoria-age-mini {
    font-size: 0.85rem;
    color: var(--accent-color);
    font-weight: 800;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.categoria-info-mini {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-bottom: 2rem;
    padding: 1.5rem 0;
    border-top: 1px solid rgba(17, 212, 66, 0.1);
    border-bottom: 1px solid rgba(17, 212, 66, 0.1);
}

.info-item-mini {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
    transition: color 0.3s ease;
}

.categoria-card-mini:hover .info-item-mini {
    color: var(--text-primary);
}

.info-item-mini i {
    color: var(--accent-color);
    width: 18px;
    font-size: 1rem;
}

/* Elegant Button Transition */
.btn-inscribir-mini {
    background: transparent;
    color: var(--text-primary) !important;
    padding: 0.9rem 2rem;
    border-radius: 0;
    text-decoration: none;
    font-weight: 900;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    width: 100%;
    justify-content: center;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: 1px solid rgba(17, 212, 66, 0.3);
    position: relative;
    z-index: 1;
    overflow: hidden;
}

.btn-inscribir-mini::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: var(--accent-color);
    transition: width 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    z-index: -1;
}

.btn-inscribir-mini:hover {
    color: #102215 !important;
    border-color: var(--accent-color);
    gap: 1.2rem;
}

.btn-inscribir-mini:hover::before {
    width: 100%;
}

/* INFO SECTION */
.info-section {
    padding: 6rem 0;
    background: radial-gradient(circle at center, rgba(17, 212, 66, 0.08) 0%, #f8faf8 80%);
    color: var(--text-primary);
    transition: all 0.3s ease;
}

:root.dark .info-section {
    background: radial-gradient(circle at center, rgba(17, 212, 66, 0.15) 0%, #000000 80%);
    color: #ffffff;
}

.benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-top: 3rem;
}

.benefit-item {
    text-align: left;
    padding: 2.5rem;
    background: var(--bg-secondary);
    border: 1px solid rgba(17, 212, 66, 0.1);
    transition: all 0.4s ease;
}

:root.dark .benefit-item {
    background: rgba(255, 255, 255, 0.03);
}

.benefit-item:hover {
    background: rgba(17, 212, 66, 0.05);
    border-color: var(--accent-color);
    transform: translateY(-5px);
}

.benefit-item i {
    font-size: 2.5rem;
    color: var(--accent-color);
    margin-bottom: 2rem;
    display: block;
}

.benefit-item h4 {
    font-size: 1.25rem;
    font-weight: 900;
    margin-bottom: 1rem;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
}

:root.dark .benefit-item h4 {
    color: #ffffff;
}

.benefit-item p {
    color: var(--text-secondary);
    line-height: 1.8;
    font-size: 0.9rem;
}

:root.dark .benefit-item p {
    color: #94a3b8;
}

/* TEAMS GALLERY SECTION */
.teams-gallery {
    padding: 6rem 0;
    background: var(--bg-primary);
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 3rem;
}

.gallery-item {
    position: relative;
    overflow: hidden;
    height: 300px;
    cursor: pointer;
    background: #000;
    transition: all 0.5s ease;
}

.gallery-item:hover {
    transform: scale(0.97);
}

.img-wrapper {
    width: 100%;
    height: 100%;
}

.img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
}

.gallery-item:hover img {
    transform: scale(1.1);
}

.img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 2rem;
    opacity: 0;
    transition: opacity 0.4s ease;
    color: #fff;
}

.gallery-item:hover .img-overlay {
    opacity: 1;
}

.img-overlay i {
    font-size: 2rem;
    margin-bottom: 0.75rem;
}

.img-overlay span {
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-size: 1rem;
}

.img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: #475569;
}

.img-placeholder i {
    font-size: 3rem;
}

/* LIGHTBOX */
.lightbox {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.95);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem;
    overflow-y: auto;
    cursor: zoom-out;
}

.close-btn {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 2010;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.close-icon-svg {
    width: 100%;
    height: 100%;
    stroke: rgba(255, 255, 255, 0.4);
    stroke-width: 1px;
    /* Ultra thin */
    transition: stroke 0.3s ease;
}

.close-btn:hover {
    transform: rotate(90deg);
}

.close-btn:hover .close-icon-svg {
    stroke: #fff;
}

.lightbox-content {
    max-width: 1000px;
    width: 100%;
    margin: auto;
    position: relative;
    animation: zoomIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    cursor: default;
}

.lightbox-content img {
    width: 100%;
    max-height: 70vh;
    object-fit: contain;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
    display: block;
}

.lightbox-info {
    color: #fff;
    text-align: center;
    margin-top: 1.5rem;
    padding-bottom: 2rem;
}

.lightbox-info h3 {
    font-size: 2rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -1px;
    margin-bottom: 0.25rem;
    color: var(--primary-color);
}

.lightbox-info p {
    font-size: 1.1rem;
    color: #e2e8f0;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@media (max-width: 768px) {
    .section-title {
        font-size: 2.2rem;
    }

    .categorias-section, .info-section, .teams-gallery {
        padding: 4rem 0;
    }

    .categoria-card-mini {
        flex: 0 0 280px;
        padding: 2rem 1.5rem;
    }

    .benefit-item {
        padding: 1.5rem;
    }
}

@media (max-width: 480px) {
    .section-title {
        font-size: 1.8rem;
    }

    .categoria-card-mini {
        flex: 0 0 250px;
    }

    .gallery-grid {
        grid-template-columns: 1fr;
    }
}
</style>
