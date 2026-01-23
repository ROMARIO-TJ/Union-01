<template>
    <div class="club-page">
        <!-- HERO SECTION -->
        <PageHero pageKey="club" :defaultImage="clubHeroImg" />

        <!-- HISTORIA SECTION -->
        <section class="historia-section">
            <div class="container">
                <h2 class="section-title">Nuestra <span class="text-accent">Historia</span></h2>

                <div class="timeline" ref="timelineSection">
                    <div v-for="(milestone, index) in timeline" :key="index" class="timeline-item"
                        :class="{ 'left': index % 2 === 0, 'right': index % 2 !== 0, 'visible': visibleItems.includes(index) }">
                        <div class="timeline-content">
                            <div class="timeline-year">{{ milestone.year }}</div>
                            <h3 class="timeline-title">{{ milestone.title }}</h3>
                            <p class="timeline-description">{{ milestone.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- MISIÓN Y VISIÓN SECTION -->
        <section class="mission-vision-section">
            <div class="container">
                <div class="mission-vision-grid">
                    <div class="mv-card">
                        <div class="mv-icon">
                            <i class="fa-solid fa-bullseye"></i>
                        </div>
                        <h3 class="mv-title">Misión</h3>
                        <p class="mv-text">
                            Formar deportistas integrales a través del fútbol, promoviendo valores de respeto,
                            trabajo en equipo y superación personal, mientras representamos con orgullo a nuestra
                            comunidad.
                        </p>
                    </div>

                    <div class="mv-card">
                        <div class="mv-icon">
                            <i class="fa-solid fa-eye"></i>
                        </div>
                        <h3 class="mv-title">Visión</h3>
                        <p class="mv-text">
                            Ser un club referente en la región, reconocido por nuestra excelencia deportiva,
                            compromiso social y desarrollo de talento joven que trascienda fronteras.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- DIRECTIVA SECTION -->
        <section class="directiva-section">
            <div class="container">
                <h2 class="section-title">Comisión <span class="text-accent">Directiva</span></h2>

                <div class="directiva-grid">
                    <div v-for="member in clubStore.boardMembers" :key="member.id" class="directiva-card">
                        <div class="directiva-photo" :class="{ 'has-image': member.image }">
                            <img v-if="member.image" :src="member.image" :alt="member.name" class="member-img">
                            <i v-else class="fa-solid fa-user"></i>
                        </div>
                        <h3 class="directiva-name">{{ member.name }}</h3>
                        <p class="directiva-position">{{ member.position }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- INSTALACIONES SECTION -->
        <section class="instalaciones-section">
            <div class="container">
                <h2 class="section-title">Nuestras <span class="text-accent">Instalaciones</span></h2>

                <div class="instalaciones-grid">
                    <div v-for="facility in clubStore.facilities" :key="facility.id" class="facility-card">
                        <div class="facility-image" :class="{ 'has-image': facility.image }">
                            <img v-if="facility.image" :src="facility.image" :alt="facility.name" class="facility-img">
                            <i v-else :class="facility.icon"></i>
                        </div>
                        <h3 class="facility-name">{{ facility.name }}</h3>
                        <p class="facility-description">{{ facility.description }}</p>
                    </div>
                </div>
            </div>
        </section>
        <SponsorsCarousel />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useClubStore } from '../store/clubStore';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';
import PageHero from '../components/PageHero.vue';
import clubHeroImg from '../assets/img/heroes/club_hero.png';

const clubStore = useClubStore();

const timeline = ref([
    {
        year: '1985',
        title: 'Fundación del Club',
        description: 'Nace Unión Jeguera con el sueño de unir a la comunidad a través del fútbol.'
    },
    {
        year: '1992',
        title: 'Primer Campeonato Local',
        description: 'Conquistamos nuestro primer título en la liga regional, marcando el inicio de una era dorada.'
    },
    {
        year: '2005',
        title: 'Inauguración del Estadio',
        description: 'Abrimos las puertas de nuestro estadio municipal, casa de grandes victorias.'
    },
    {
        year: '2018',
        title: 'Categorías Formativas',
        description: 'Expandimos nuestro proyecto con equipos Sub-20 y Femenino, apostando por el futuro.'
    },
    {
        year: '2024',
        title: 'Renovación Integral',
        description: 'Modernizamos instalaciones y estructura directiva para seguir creciendo.'
    }
]);

// Timeline animation
const timelineSection = ref(null);
const visibleItems = ref([]);
let observer = null;

onMounted(() => {
    // Create observer for timeline items
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.dataset.index);
                if (!visibleItems.value.includes(index)) {
                    visibleItems.value.push(index);
                }
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe all timeline items
    setTimeout(() => {
        if (timelineSection.value) {
            const items = timelineSection.value.querySelectorAll('.timeline-item');
            items.forEach((item, index) => {
                item.dataset.index = index;
                observer.observe(item);
            });
        }
    }, 100);
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
});
</script>

<style scoped>
/* SECTIONS */
.historia-section,
.mission-vision-section,
.directiva-section,
.instalaciones-section {
    padding: 5rem 0;
}

.mission-vision-section {
    background-color: var(--bg-secondary);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 800;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-primary);
}

.text-accent {
    color: var(--accent-color);
}

/* TIMELINE */
.timeline {
    position: relative;
    max-width: 900px;
    margin: 0 auto;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent-color);
    transform: translateX(-50%);
}

.timeline-item {
    position: relative;
    margin-bottom: 3rem;
    width: 50%;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.timeline-item.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Staggered animation delays */
.timeline-item:nth-child(1).visible {
    transition-delay: 0.1s;
}

.timeline-item:nth-child(2).visible {
    transition-delay: 0.2s;
}

.timeline-item:nth-child(3).visible {
    transition-delay: 0.3s;
}

.timeline-item:nth-child(4).visible {
    transition-delay: 0.4s;
}

.timeline-item:nth-child(5).visible {
    transition-delay: 0.5s;
}

.timeline-item.left {
    padding-right: 3rem;
    text-align: right;
}

.timeline-item.right {
    padding-left: 3rem;
    margin-left: 50%;
}

.timeline-item::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: var(--accent-color);
    border: 4px solid var(--bg-primary);
    border-radius: 50%;
    top: 0;
    z-index: 2;
}

.timeline-item.left::before {
    right: -10px;
}

.timeline-item.right::before {
    left: -10px;
}

.timeline-content {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.timeline-content:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

:root.dark .timeline-content {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-year {
    font-size: 1.8rem;
    font-weight: 900;
    color: var(--accent-color);
    margin-bottom: 0.5rem;
}

.timeline-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.timeline-description {
    color: var(--text-secondary);
    line-height: 1.6;
}

/* MISSION & VISION */
.mission-vision-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    max-width: 900px;
    margin: 0 auto;
}

.mv-card {
    background: var(--bg-primary);
    padding: 3rem 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.mv-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

:root.dark .mv-card {
    background: var(--card-bg);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.mv-icon {
    width: 80px;
    height: 80px;
    background: rgba(31, 167, 116, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2rem;
    color: var(--accent-color);
}

.mv-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.mv-text {
    color: var(--text-secondary);
    line-height: 1.8;
    font-size: 1.05rem;
}

/* DIRECTIVA */
.directiva-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2.5rem;
}

.directiva-card {
    background: var(--card-bg);
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.directiva-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
}

:root.dark .directiva-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.directiva-photo {
    width: 120px;
    height: 120px;
    background: var(--bg-secondary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 3rem;
    color: var(--text-secondary);
    border: 4px solid var(--accent-color);
    overflow: hidden;
}

.directiva-photo.has-image {
    padding: 0;
}

.member-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.directiva-name {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.directiva-position {
    color: var(--accent-color);
    font-weight: 600;
    font-size: 1rem;
}

/* INSTALACIONES */
.instalaciones-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2.5rem;
}

.facility-card {
    background: var(--card-bg);
    padding: 2.5rem 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.facility-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
}

:root.dark .facility-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.facility-image {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, rgba(31, 167, 116, 0.1) 0%, rgba(15, 61, 46, 0.1) 100%);
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2.5rem;
    color: var(--accent-color);
    overflow: hidden;
}

.facility-image.has-image {
    padding: 0;
}

.facility-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.facility-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.8rem;
}

.facility-description {
    color: var(--text-secondary);
    line-height: 1.6;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .hero-tagline {
        font-size: 1.1rem;
    }

    .section-title {
        font-size: 2rem;
    }

    /* Timeline mobile */
    .timeline::before {
        left: 20px;
    }

    .timeline-item {
        width: 100%;
        padding-left: 3rem !important;
        padding-right: 0 !important;
        margin-left: 0 !important;
        text-align: left !important;
    }

    .timeline-item::before {
        left: 11px !important;
    }

    .mission-vision-grid,
    .directiva-grid,
    .instalaciones-grid {
        grid-template-columns: 1fr;
        max-width: 400px;
        margin: 0 auto;
    }
}
</style>
