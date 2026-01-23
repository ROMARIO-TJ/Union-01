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
    return upcoming.length > 0 ? upcoming[0] : null;
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
    intervalId.value = setInterval(nextSlide, 6000);
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

                <!-- DYNAMIC SLIDE (Normal or Identity) -->
                <div v-if="!slide.isMatch" class="hero-slide" :class="{ 'slide-identity': slide.isIdentity }">
                    <!-- Background for normal slide -->
                    <div v-if="slide.image" class="slide-bg-image" :style="{ backgroundImage: `url(${slide.image})` }">
                    </div>
                    <div v-if="slide.image" class="slide-overlay"></div>

                    <!-- Logo style for identity slide -->
                    <div v-if="slide.isIdentity" class="slide-image">
                        <div class="image-wrapper">
                            <img src="../assets/img/logosinfondo.png" alt="Unión Jeguera Logo" />
                        </div>
                    </div>

                    <div class="slide-content-wrapper">
                        <div class="container hero__container">
                            <div class="hero__content">
                                <h1 class="hero__title"
                                    v-html="slide.title.replace(/Jeguera/g, '<span class=\'highlight\'>Jeguera</span>')">
                                </h1>
                                <p class="hero__subtitle">{{ slide.subtitle }}</p>
                                <div class="hero__actions">
                                    <router-link :to="slide.primaryBtnLink" class="btn btn--primary">
                                        {{ slide.primaryBtnText }}
                                    </router-link>
                                    <router-link v-if="slide.secondaryBtnText" :to="slide.secondaryBtnLink"
                                        :class="slide.isIdentity ? 'btn btn--outline-identity' : 'btn btn--outline'">
                                        {{ slide.secondaryBtnText }}
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MATCH SLIDE (Special logic) -->
                <div v-else class="hero-slide slide-match">
                    <div class="slide-bg-image"
                        style="background-image: url('https://realvalladolidacademy.com/wp-content/uploads/2024/06/tecnificacion-futbol-3.webp')">
                    </div>
                    <div class="slide-overlay">
                        <div class="container hero__container">
                            <div class="hero__content text-center">
                                <div class="match-badge">Próximo Encuentro</div>
                                <div v-if="nextMatch" class="match-display">
                                    <h2 class="match-teams">
                                        <span class="home-team">{{ nextMatch.homeTeam }}</span>
                                        <span class="Vs">VS</span>
                                        <span class="away-team">{{ nextMatch.awayTeam }}</span>
                                    </h2>
                                    <div class="match-details">
                                        <div class="detail-item"><i class="fa-solid fa-calendar"></i> {{ nextMatch.date
                                        }}</div>
                                        <div class="detail-item"><i class="fa-solid fa-clock"></i> {{ nextMatch.time }}
                                        </div>
                                        <div class="detail-item"><i class="fa-solid fa-location-dot"></i> {{
                                            nextMatch.stadium }}</div>
                                    </div>
                                    <div class="hero__actions center-actions">
                                        <router-link to="/partidos" class="btn btn--primary">Ver Match
                                            Center</router-link>
                                    </div>
                                </div>
                                <div v-else class="no-match">
                                    <h2>¡Temporada en Curso!</h2>
                                    <p>Sigue atento a nuestros próximos partidos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </transition-group>

        <!-- Dots Navigation -->
        <div class="carousel-dots" :class="{ 'dots-theme-aware': allSlides[currentSlide]?.isIdentity }">
            <button v-for="(slide, index) in totalSlides" :key="'dot-' + index" class="dot"
                :class="{ active: currentSlide === index }" @click="goToSlide(index)">
            </button>
        </div>
    </div>
</template>

<style scoped>
.home-hero-carousel {
    position: relative;
    height: 65vh;
    min-height: 450px;
    max-height: 700px;
    width: 100%;
    overflow: hidden;
    background-color: var(--bg-primary);
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

/* Background Images for Slide 2 & 3 */
.slide-bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    animation: zoomEffect 15s infinite alternate;
    z-index: 1;
    /* Explicitly set z-index */
    display: block;
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
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.3) 100%);
    z-index: 2;
    /* Ensure overlay is on top */
    display: flex;
    align-items: center;
}

/* Specific Style for Identity Slide */
.slide-identity {
    background-color: var(--bg-primary);
    /* Subtle gradient that works in both modes but respects theme base */
    background: radial-gradient(circle at top right, var(--card-bg), var(--bg-primary));
}

.slide-content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    z-index: 3;
}

.slide-identity .hero__title {
    color: var(--text-primary);
}

.slide-identity .hero__subtitle {
    color: var(--text-secondary);
}

.slide-identity .btn--outline-identity {
    border: 2px solid var(--text-secondary);
    color: var(--text-primary);
    background: transparent;
}

.slide-identity .btn--outline-identity:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
}

.slide-identity .slide-image {
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
}

.slide-identity .hero__container {
    pointer-events: auto;
}

/* Reusing Hero Styles from Home.vue */
.hero__container {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 2rem;
    position: relative;
    z-index: 3;
}

.hero__content {
    max-width: 600px;
    color: #fff;
    animation: slideUp 0.8s ease-out forwards;
}

.text-center {
    text-align: center;
    margin: 0 auto;
}

/* Default Hero Text (For Image Slides) */
.hero__title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    line-height: 1.1;
    color: #fff;
    /* Image slides always white */
}

.highlight {
    color: var(--accent-color);
}

.hero__subtitle {
    font-size: 1.25rem;
    color: #e5e7eb;
    /* Light grey for image slides */
    margin-bottom: 2.5rem;
    line-height: 1.6;
}

.hero__actions {
    display: flex;
    gap: 1rem;
}

.center-actions {
    justify-content: center;
    margin-top: 2rem;
}

/* Button Styles */
.btn {
    display: inline-block;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
    border: 2px solid transparent;
}

.btn--primary {
    background-color: var(--accent-color);
    color: #fff;
}

.btn:focus {
    outline: none;
}

.btn--primary:hover {
    background-color: #15803d;
    /* dark green */
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn--primary:focus {
    background-color: #158f61;
    box-shadow: none;
}

/* Outline button for Image Slides (always white context) */
.btn--outline {
    border-color: rgba(255, 255, 255, 0.5);
    color: #fff;
}

.btn--outline:hover {
    border-color: #fff;
    background-color: rgba(255, 255, 255, 0.993);
    color: var(--accent-color);
    font-weight: 700;
}

/* Match Slide Styles */
.match-badge {
    display: inline-block;
    background-color: var(--accent-color);
    color: #fff;
    padding: 0.5rem 1.5rem;
    border-radius: 50px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1.5rem;
}

.match-teams {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    /* Stack VERTICALLY as requested */
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    line-height: 1.2;
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    width: 100%;
}



.Vs {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    font-size: 1rem;
    font-weight: 900;
    color: var(--accent-color);
    margin: 0 0.5rem;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
    /* Prevent squishing */
}

.home-team,
.away-team {
    text-align: center;
    /* Force center alignment */
}

.match-details {
    display: flex;
    justify-content: center;
    gap: 2rem;
    font-size: 1.2rem;
    color: #ffd;
}

.detail-item i {
    color: var(--accent-color);
    margin-right: 0.5rem;
}

/* Academy Slide Styles */
.highlight-tag {
    color: var(--accent-color);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
    display: block;
}

/* Dots Navigation */
.carousel-dots {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.8rem;
    z-index: 10;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.4);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
    outline: none;
    box-shadow: none;
}

.dot:focus {
    outline: none;
}

.dot:hover {
    background-color: rgba(255, 255, 255, 0.8);
    transform: scale(1.1);
}

.dot.active {
    background-color: var(--accent-color);
    transform: scale(1.2);
    width: 30px;
    border-radius: 12px;
}

/* Theme Aware Dots (For Identity Slide) */
.dots-theme-aware .dot {
    background-color: var(--text-secondary);
    /* Visible on both dark and light theme backgrounds */
    opacity: 0.5;
}

.dots-theme-aware .dot:hover {
    opacity: 1;
}

.dots-theme-aware .dot.active {
    background-color: var(--accent-color);
    opacity: 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 968px) {
    .slide-identity .slide-image {
        display: none;
        /* Hide image on tablet/mobile for cleaner text */
    }

    .hero__content {
        text-align: center;
        margin: 0 auto;
        padding: 0 1rem;
        /* Ensure padding on smaller screens */
    }

    .hero__actions {
        justify-content: center;
    }

    .match-teams {
        font-size: 2.5rem;
    }
}

@media (max-width: 768px) {
    .match-teams {
        flex-direction: column;
        /* Stack vertically on mobile */
        gap: 1rem;
    }

    .match-details {
        flex-direction: column;
        gap: 0.5rem;
    }

    .hero__title {
        font-size: 2.5rem;
        /* Smaller title */
    }

    .hero__subtitle {
        font-size: 1.1rem;
    }

    .Vs {
        margin: 0.5rem 0;
        /* Add vertical margin */
    }
}

@media (max-width: 480px) {
    .hero__title {
        font-size: 2rem;
    }

    .match-teams {
        font-size: 1.8rem;
    }

    .hero__actions {
        flex-direction: column;
        width: 100%;
        gap: 0.8rem;
    }

    .btn {
        width: 100%;
        text-align: center;
        padding: 0.8rem 1.5rem;
    }

    .home-hero-carousel {
        min-height: 500px;
        /* Ensure enough height for stacked content */
    }
}
</style>
