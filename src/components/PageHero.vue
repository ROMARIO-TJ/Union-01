<template>
    <section class="general-hero" :style="heroStyle">
        <div class="hero-overlay"></div>
        <div class="hero-content-wrapper">
            <div class="hero-content">
                <div class="hero-badge">
                    <i class="fa-solid fa-circle-check badge-icon"></i>
                    {{ heroData.tagline }}
                </div>
                <h1 class="hero-title" v-html="formattedTitle"></h1>
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
        title: 'Unión Jaguera',
        tagline: 'Pasión y Fútbol',
        image: ''
    };
});

const formattedTitle = computed(() => {
    const title = heroData.value.title;
    // Highlight first or last word depending on length
    const words = title.split(' ');
    if (words.length > 1) {
        words[words.length - 1] = `<span class="text-primary italic">${words[words.length - 1]}</span>`;
    }
    return words.join(' ');
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
    height: 100vh;
    min-height: 450px;
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
    inset: 0;
    background: linear-gradient(to bottom, rgba(16, 34, 21, 0.7) 0%, rgba(16, 34, 21, 0.4) 50%, rgba(16, 34, 21, 0.8) 100%);
    z-index: 1;
}

.hero-content-wrapper {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 1280px;
    padding: 0 1.5rem;
    text-align: center;
}

.hero-content {
    /* REMOVED: Transparent box styles */
    padding: 2rem 0;
    color: #fff;
    animation: fadeIn 1.2s ease-out forwards;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.5rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 4px solid var(--primary-color);
    border-radius: 4px;
    color: #fff;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    margin-bottom: 2rem;
    opacity: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: fadeInUp 0.8s ease-out 0.3s forwards;
}

.badge-icon {
    color: var(--primary-color);
    font-size: 1rem;
    filter: drop-shadow(0 0 8px rgba(17, 212, 66, 0.6));
}



.hero-title {
    font-size: 5.5rem;
    font-weight: 950;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: -0.05em;
    line-height: 1;
    opacity: 0;
    animation: fadeInUp 0.8s ease-out 0.5s forwards;
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
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 992px) {

    .general-hero {
        height: 90vh;

    }

    .hero-title {
        font-size: 4rem;
    }
}

@media (max-width: 768px) {


    .general-hero {
        height: 50vh;
    }


    .hero-title {
        font-size: 2.75rem;
    }

    .hero-badge {
        font-size: 0.75rem;
        margin-bottom: 1rem;
    }
}
</style>
