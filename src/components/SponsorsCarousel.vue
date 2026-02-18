<script setup>
import { useSponsorsStore } from '../store/sponsorsStore';
import { useGlobalSettingsStore } from '../store/globalSettingsStore';

const sponsorsStore = useSponsorsStore();
const globalSettings = useGlobalSettingsStore();
</script>

<template>
    <section v-if="globalSettings.modules.sponsors.enabled" class="sponsors-section py-24">
        <div class="container">
            <div class="section-header text-center mb-12">
                <span class="text-primary font-bold tracking-widest uppercase text-xs">Apoyando el Deporte</span>
                <h2 class="section-title mt-2">Nuestros <span class="text-primary italic">Aliados</span></h2>
            </div>

            <div class="sponsors-carousel">
                <div class="sponsors-track">
                    <!-- First set of sponsors -->
                    <div v-for="sponsor in sponsorsStore.sponsors" :key="`sponsor-1-${sponsor.id}`"
                        class="sponsor-card">
                        <div class="sponsor-logo-box">
                            <img v-if="sponsor.image" :src="sponsor.image" :alt="sponsor.name">
                            <span v-else class="material-symbols-outlined text-slate-300">handshake</span>
                        </div>
                    </div>
                    <!-- Second set for infinite loop -->
                    <div v-for="sponsor in sponsorsStore.sponsors" :key="`sponsor-2-${sponsor.id}`"
                        class="sponsor-card">
                        <div class="sponsor-logo-box">
                            <img v-if="sponsor.image" :src="sponsor.image" :alt="sponsor.name">
                            <span v-else class="material-symbols-outlined text-slate-300">handshake</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.py-24 {
    padding: 6rem 0;
}

.mb-12 {
    margin-bottom: 3rem;
}

.mt-2 {
    margin-top: 0.5rem;
}

.sponsors-section {
    background-color: var(--bg-primary);
    overflow: hidden;
    border-top: 1px solid rgba(17, 212, 66, 0.05);
    border-bottom: 1px solid rgba(17, 212, 66, 0.05);
}

.sponsors-carousel {
    position: relative;
    width: 100%;
    padding: 3rem 0;
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

.sponsors-track {
    display: flex;
    width: max-content;
    gap: 1.5rem;
    animation: scroll 45s linear infinite;
}

.sponsors-track:hover {
    animation-play-state: paused;
}

.sponsor-card {
    flex: 0 0 160px;
    background: transparent;
    padding: 1rem;
    border-radius: 0;
    text-align: center;
    border: none;
    transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
}

.sponsor-card:hover {
    transform: scale(1.1);
}

.sponsor-logo-box {
    width: 140px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease;
}

.sponsor-logo-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: grayscale(1) brightness(0.8);
    opacity: 0.5;
    transition: all 0.5s ease;
}

.sponsor-card:hover .sponsor-logo-box img {
    filter: grayscale(0) brightness(1.1);
    opacity: 1;
    transform: scale(1.08);
}

.sponsor-name {
    font-size: 0.75rem;
    font-weight: 900;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    transition: color 0.3s ease;
}

.sponsor-card:hover .sponsor-name {
    color: var(--accent-color);
}

@keyframes scroll {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(calc(-50% - 1.5rem));
    }
}

@media (max-width: 768px) {
    .sponsor-card {
        flex: 0 0 180px;
        padding: 1.5rem;
    }

    .sponsor-logo-box {
        width: 100px;
        height: 60px;
    }

    .sponsors-track {
        gap: 1.5rem;
        animation-duration: 30s;
    }
}
</style>
