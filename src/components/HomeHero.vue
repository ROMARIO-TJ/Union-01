<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useMatchesStore } from '../store/matchesStore';
import { useHomeSettingsStore } from '../store/homeSettingsStore';

const matchesStore = useMatchesStore();
const homeSettings = useHomeSettingsStore();
const currentSlide = ref(0);
const intervalId = ref(null);

const nextMatch = computed(() => {
    const upcoming = matchesStore.getUpcomingMatches();
    // Filtrar solo partidos del Unión Jaguera
    const unionMatches = upcoming.filter(m =>
        m.homeTeam?.toUpperCase().includes('UNION JAGUERA') ||
        m.awayTeam?.toUpperCase().includes('UNION JAGUERA')
    );
    return unionMatches.length > 0 ? unionMatches[0] : null;
});

// Slides with dynamic + match slide if enabled
const allSlides = computed(() => {
    const slides = [...homeSettings.heroSlides];

    // Add match slide if enabled and there's a match
    if (homeSettings.sections.heroMatchSlide?.enabled) {
        slides.push({
            id: 'match-slide',
            isMatch: true
        });
    }

    return slides;
});

const totalSlides = computed(() => allSlides.value.length);

const nextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % totalSlides.value;
};

const goToSlide = (index) => {
    currentSlide.value = index;
    resetTimer();
};

const startTimer = () => {
    intervalId.value = setInterval(nextSlide, 8000);
};

const stopTimer = () => {
    if (intervalId.value) clearInterval(intervalId.value);
};

const resetTimer = () => {
    stopTimer();
    startTimer();
};

onMounted(() => {
    startTimer();
});

onUnmounted(() => {
    stopTimer();
});
</script>

<template>
    <div class="home-hero-carousel">
        <transition-group name="fade" tag="div" class="slides-container">
            <div v-for="(slide, index) in allSlides" :key="slide.id" v-show="currentSlide === index">

                <!-- DYNAMIC SLIDE -->
                <div v-if="!slide.isMatch" class="hero-slide">
                    <!-- Background -->
                    <div class="slide-bg-image"
                        :style="{ backgroundImage: `url(${slide.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuANfCGIMub5F2suFSE8VdlAZELvKCelYOcmhFUauUO7a4K7LWaV4BUWBzh0-935qbTjL5HBXWO8hgekmKfC6Ue20TbYJwMlclIDaa9vdRQZ0NLzCILzz8pWgxAxJg5GNfZmSjImsXssPC27i4hi338vl-Gm0YDYVjgPRZG_zetKhZiWpgIcPZalNvSLDjtMiQJlThfCQoxJE1BJg5nnVs-9V7z4Ksu6qFCFBTFk3VqGuEUvrZhWL-hP4uz164Y9duWejzKRNTQ0-jw3'})` }">
                    </div>
                    <div class="slide-overlay"></div>

                    <div class="slide-content-wrapper">
                        <div class="container hero__container">
                            <div class="hero__content">
                                <!-- Badge -->
                                <div class="hero-badge">
                                    <span class="pulse-dot">
                                        <span class="ping"></span>
                                        <span class="dot"></span>
                                    </span>
                                    Temporada 2026 Abierta
                                </div>

                                <h1 class="hero__title"
                                    v-html="slide.title.replace(/Futuro/g, '<span class=\'text-primary italic\'>Futuro</span>').replace(/Jaguera/g, '<span class=\'text-primary italic\'>Jaguera</span>')">
                                </h1>

                                <p class="hero__subtitle">{{ slide.subtitle }}</p>

                                <div v-if="slide.showButtons" class="hero__actions">
                                    <router-link :to="slide.primaryBtnLink || '/inscripciones'"
                                        class="btn btn-primary btn-hero-lg group">
                                        {{ slide.primaryBtnText || 'Inscripciones' }}
                                        <span class="material-symbols-outlined icon-move">arrow_forward</span>
                                    </router-link>

                                    <router-link v-if="slide.secondaryBtnText || slide.isIdentity"
                                        :to="slide.secondaryBtnLink || '/club'" class="btn btn-outline-hero">
                                        {{ slide.secondaryBtnText || 'Conoce el Club' }}
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MATCH SLIDE -->
                <div v-else class="hero-slide slide-match">
                    <div class="slide-bg-image"
                        :style="{ backgroundImage: `url(${homeSettings.matchSlideImage || 'https://realvalladolidacademy.com/wp-content/uploads/2024/06/tecnificacion-futbol-3.webp'})` }">
                    </div>
                    <div class="slide-overlay"></div>

                    <div class="slide-content-wrapper">
                        <div class="container hero__container">
                            <div class="hero__content text-center">
                                <div class="hero-badge mx-auto">Próximo Encuentro</div>

                                <div v-if="nextMatch" class="match-display">
                                    <h2 class="match-teams">
                                        <span class="team-name">{{ nextMatch.homeTeam }}</span>
                                        <span class="vs-circle">VS</span>
                                        <span class="team-name">{{ nextMatch.awayTeam }}</span>
                                    </h2>

                                    <div class="match-info-row">
                                        <div class="info-tag"><span
                                                class="material-symbols-outlined">calendar_today</span> {{
                                                    nextMatch.date }}</div>
                                        <div class="info-tag"><span class="material-symbols-outlined">schedule</span> {{
                                            nextMatch.time }}</div>
                                        <div class="info-tag"><span class="material-symbols-outlined">location_on</span>
                                            {{ nextMatch.stadium }}</div>
                                    </div>

                                    <div class="hero__actions center-actions">
                                        <router-link to="/partidos" class="btn btn-primary">Ver Centro de
                                            Partidos</router-link>
                                    </div>
                                </div>

                                <div v-else class="no-match-box">
                                    <h2 class="text-4xl font-black italic">¡TEMPORADA EN CURSO!</h2>
                                    <p class="text-slate-300 mt-4">Sigue atento a nuestros próximos partidos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </transition-group>

        <!-- Dots Navigation -->
        <div class="carousel-dots">
            <button v-for="(slide, index) in totalSlides" :key="'dot-' + index" class="dot"
                :class="{ active: currentSlide === index }" @click="goToSlide(index)">
            </button>
        </div>
    </div>
</template>

<style scoped>
.home-hero-carousel {
    position: relative;
    height: 100vh;
    min-height: 700px;
    width: 100%;
    overflow: hidden;
    background-color: #102215;
}

.slides-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.hero-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.slide-bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    animation: zoomEffect 20s infinite alternate linear;
    z-index: 1;
}

@keyframes zoomEffect {
    from {
        transform: scale(1);
    }

    to {
        transform: scale(1.1);
    }
}

.slide-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(16, 34, 21, 0.9) 0%, rgba(16, 34, 21, 0.4) 50%, rgba(16, 34, 21, 0.1) 100%);
    z-index: 2;
}

.slide-content-wrapper {
    position: relative;
    z-index: 10;
    width: 100%;
}

.hero__container {
    display: flex;
    align-items: center;
    width: 100%;
}

.hero__content {
    max-width: 800px;
}

.text-center {
    text-align: center;
    margin: 0 auto;
}

/* Badge */
.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: rgba(17, 212, 66, 0.2);
    border: 1px solid rgba(17, 212, 66, 0.3);
    border-radius: 9999px;
    color: var(--primary-color);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
}

.pulse-dot {
    position: relative;
    display: flex;
    height: 8px;
    width: 8px;
}

.ping {
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    position: absolute;
    display: inline-flex;
    height: 100%;
    width: 100%;
    border-radius: 9999px;
    background-color: var(--primary-color);
    opacity: 0.75;
}

@keyframes ping {

    75%,
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

.dot {
    position: relative;
    display: inline-flex;
    border-radius: 9999px;
    height: 8px;
    width: 8px;
    background-color: var(--primary-color);
}

.mx-auto {
    margin-left: auto;
    margin-right: auto;
}

/* Typography */
.hero__title {
    font-size: 4.5rem;
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    color: #fff;
}

.hero__subtitle {
    font-size: 1.25rem;
    color: #cbd5e1;
    max-width: 600px;
    line-height: 1.6;
    margin-bottom: 2.5rem;
}

/* Buttons */
.hero__actions {
    display: flex;
    gap: 1rem;
}

.center-actions {
    justify-content: center;
    margin-top: 2rem;
}

.btn-hero-lg {
    padding: 1rem 2rem;
    font-size: 1.125rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.icon-move {
    transition: transform 0.3s;
}

.btn-hero-lg:hover .icon-move {
    transform: translateX(4px);
}

.btn-outline-hero {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(4px);
    color: #fff;
}

.btn-outline-hero:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
}

/* Match Slide */
.match-display {
    padding: 2rem 0;
    max-width: 900px;
    margin: 0 auto;
}

.match-teams {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    font-size: 3rem;
    font-weight: 900;
    font-style: italic;
    margin-bottom: 2rem;
    color: #ffffff;
}

.vs-circle {
    width: 60px;
    height: 60px;
    background: var(--primary-color);
    color: #102215;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1.25rem;
    font-weight: 900;
}

.match-info-row {
    display: flex;
    justify-content: center;
    gap: 3rem;
    color: #ffffff;
    font-weight: 600;
}

.info-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-tag .material-symbols-outlined {
    color: var(--primary-color);
}

/* Dots */
.carousel-dots {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.75rem;
    z-index: 20;
}

.dot {
    width: 25px;
    height: 4px;
    border-radius: 0;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    cursor: pointer;
    transition: var(--transition);
}

.dot.active {
    background: var(--primary-color);
    width: 40px;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Responsive */
@media (max-width: 992px) {
    .hero__title {
        font-size: 3.5rem;
    }

    .match-teams {
        font-size: 2.25rem;
    }

    .match-info-row {
        gap: 1.5rem;
        font-size: 0.875rem;
    }
}

@media (max-width: 768px) {
    .hero__title {
        font-size: 2.75rem;
    }

    .hero-slide {
        text-align: center;
    }

    .hero__container {
        justify-content: center;
    }

    .hero__actions {
        flex-direction: column;
        align-items: center;
    }

    .match-teams {
        flex-direction: column;
        gap: 1rem;
    }

    .match-info-row {
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }
}
</style>
