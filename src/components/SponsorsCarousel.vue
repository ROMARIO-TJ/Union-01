<script setup>
import { useSponsorsStore } from '../store/sponsorsStore';
import { useGlobalSettingsStore } from '../store/globalSettingsStore';

const sponsorsStore = useSponsorsStore();
const globalSettings = useGlobalSettingsStore();
</script>

<template>
    <section v-if="globalSettings.modules.sponsors.enabled" class="sponsors-section">
        <div class="container">
            <h2 class="section-title text-center">Nuestros <span class="text-accent">Patrocinadores</span></h2>
            <p class="sponsors-subtitle">Gracias a quienes hacen posible nuestro proyecto</p>

            <div class="sponsors-carousel">
                <div class="sponsors-track">
                    <!-- First set of sponsors -->
                    <div v-for="sponsor in sponsorsStore.sponsors" :key="`sponsor-1-${sponsor.id}`"
                        class="sponsor-card">
                        <div class="sponsor-logo">
                            <img v-if="sponsor.image" :src="sponsor.image"
                                style="max-width: 100%; max-height: 100%; object-fit: contain;">
                            <i v-else :class="sponsor.icon"></i>
                        </div>
                        <p class="sponsor-name">{{ sponsor.name }}</p>
                    </div>
                    <!-- Second set for infinite loop -->
                    <div v-for="sponsor in sponsorsStore.sponsors" :key="`sponsor-2-${sponsor.id}`"
                        class="sponsor-card">
                        <div class="sponsor-logo">
                            <img v-if="sponsor.image" :src="sponsor.image"
                                style="max-width: 100%; max-height: 100%; object-fit: contain;">
                            <i v-else :class="sponsor.icon"></i>
                        </div>
                        <p class="sponsor-name">{{ sponsor.name }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.text-accent {
    color: var(--accent-color);
}

.text-center {
    text-align: center;
}

.sponsors-section {
    padding: 5rem 0;
    background-color: var(--bg-primary);
    overflow: hidden;
}

.sponsors-subtitle {
    text-align: center;
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 3rem;
}

.sponsors-carousel {
    position: relative;
    width: 100%;
    overflow: hidden;
    padding: 2rem 0;
    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
}

.sponsors-track {
    display: flex;
    width: max-content;
    gap: 2.5rem;
    animation: scroll 40s linear infinite;
}

.sponsors-track:hover {
    animation-play-state: paused;
}

.sponsor-card {
    flex: 0 0 250px;
    background: var(--card-bg);
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.sponsor-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    border-color: var(--accent-color);
}

:root.dark .sponsor-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.sponsor-logo {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, rgba(31, 167, 116, 0.1) 0%, rgba(15, 61, 46, 0.05) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: var(--accent-color);
    transition: all 0.3s ease;
}

.sponsor-card:hover .sponsor-logo {
    background: var(--accent-color);
    color: #fff;
    transform: scale(1.1);
}

.sponsor-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

@keyframes scroll {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(calc(-50% - 1.25rem));
    }
}

@media (max-width: 768px) {
    .section-title {
        font-size: 2rem;
    }

    .sponsor-card {
        flex: 0 0 200px;
        padding: 1.5rem;
    }

    .sponsor-logo {
        width: 80px;
        height: 80px;
        font-size: 2rem;
    }

    .sponsors-track {
        gap: 1.5rem;
        animation-duration: 30s;
    }

    @keyframes scroll {
        0% {
            transform: translateX(0);
        }

        100% {
            transform: translateX(calc(-50% - 0.75rem));
        }
    }
}
</style>
