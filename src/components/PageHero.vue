<template>
    <section class="general-hero" :style="heroStyle">
        <div class="hero-overlay"></div>
        <div class="hero-content-wrapper">
            <div class="hero-content">
                <h1 class="hero-title">{{ heroData.title }}</h1>
                <p class="hero-tagline">{{ heroData.tagline }}</p>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useHomeSettingsStore } from '../store/homeSettingsStore';

const props = defineProps({
    pageKey: {
        type: String,
        required: true
    },
    defaultImage: {
        type: String,
        default: ''
    }
});

const homeSettings = useHomeSettingsStore();

const heroData = computed(() => {
    return homeSettings.pageHeroes[props.pageKey] || {
        title: 'Unión Jeguera',
        tagline: 'Pasión y Fútbol',
        image: ''
    };
});

const heroStyle = computed(() => {
    const img = heroData.value.image || props.defaultImage;
    if (!img) return {};
    return {
        backgroundImage: `url(${img})`
    };
});
</script>

<style scoped>
.general-hero {
    position: relative;
    height: 70vh;
    min-height: 500px;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(15, 61, 46, 0.3), rgba(0, 0, 0, 0.6));
    z-index: 1;
}

.hero-content-wrapper {
    position: relative;
    z-index: 2;
    padding: 2rem;
    width: 100%;
    max-width: 900px;
}

.hero-content {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 5rem 2rem;
    border-radius: 40px;
    text-align: center;
    color: #fff;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
    animation: fadeIn 1.2s ease-out forwards;
}

.hero-title {
    font-size: 5rem;
    font-weight: 900;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: -2px;
    line-height: .9;
    opacity: 0;
    animation: fadeInUp 0.8s ease-out 0.4s forwards;
}

.hero-tagline {
    font-size: 1.8rem;
    font-weight: 300;
    opacity: 0;
    letter-spacing: 3px;
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

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .hero-tagline {
        font-size: 1.1rem;
    }

    .general-hero {
        height: 50vh;
        min-height: 400px;
    }

    .hero-content {
        padding: 3rem 1.5rem;
    }
}
</style>
