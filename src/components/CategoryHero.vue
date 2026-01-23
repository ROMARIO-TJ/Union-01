<template>
    <div class="category-hero-carousel">
        <transition-group name="fade" tag="div" class="slides-container">
            <div v-for="(category, index) in categories" :key="category.id" class="hero-slide"
                :class="{ active: currentSlide === index }" v-show="currentSlide === index">
                <div class="slide-image" :style="{ backgroundImage: `url(${getImage(category)})` }"></div>
                <div class="slide-overlay">
                    <div class="container">
                        <div class="slide-content">
                            <span class="category-tag">Categoría</span>
                            <h1 class="slide-title">{{ category.name }}</h1>
                            <p class="slide-subtitle">{{ category.age }}</p>
                            <router-link :to="{ name: 'Inscripcion', query: { categoria: category.name } }"
                                class="btn-hero">
                                Unirse al Equipo <i class="fa-solid fa-arrow-right"></i>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </transition-group>

        <!-- Dots Navigation -->
        <div class="carousel-dots">
            <button v-for="(category, index) in categories" :key="'dot-' + category.id" class="dot"
                :class="{ active: currentSlide === index }" @click="goToSlide(index)"
                :aria-label="'Ir a ' + category.name">
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useCategoryStore } from '../store/categoryStore';

const categoryStore = useCategoryStore();
const currentSlide = ref(0);
const intervalId = ref(null);

const categories = computed(() => categoryStore.categories);

// Helper to get image or fallback
const getImage = (category) => {
    return category.teamImage || 'https://images.unsplash.com/photo-1579952363873-27f3bde9beec?q=80&w=1200&auto=format&fit=crop';
};

const nextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % categories.value.length;
};

const goToSlide = (index) => {
    currentSlide.value = index;
    resetTimer();
};

const startTimer = () => {
    intervalId.value = setInterval(nextSlide, 5000); // 5 seconds
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

<style scoped>
.category-hero-carousel {
    position: relative;
    height: 85vh;
    min-height: 500px;
    max-height: 800px;
    width: 100%;
    overflow: hidden;
    background-color: #000;
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
    z-index: 1;
}

.hero-slide.active {
    z-index: 2;
    /* Active slide always on top */
}

.slide-image {
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    transition: transform 6s ease;
}

/* Subtle zoom effect for active slide */
.hero-slide {
    animation: zoomEffect 6s infinite alternate;
}

@keyframes zoomEffect {
    from {
        transform: scale(1);
    }

    to {
        transform: scale(1.05);
    }
}

.slide-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
    display: flex;
    align-items: center;
}

.slide-content {
    max-width: 600px;
    color: #fff;
    padding: 2rem;
    animation: slideUp 0.8s ease-out forwards;
}

.category-tag {
    display: inline-block;
    background-color: var(--accent-color);
    color: #fff;
    padding: 0.4rem 1rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.slide-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    line-height: 1.1;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.slide-subtitle {
    font-size: 1.5rem;
    opacity: 0.9;
    margin-bottom: 2rem;
    font-weight: 300;
}

.btn-hero {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 2rem;
    background-color: #3d3d3ddc;
    color: var(--bg-primary);
    text-decoration: none;
    font-weight: 700;
    border-radius: 50px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-hero:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    background-color: var(--accent-color);
    color: #fff;
}

.btn-hero:focus {
    outline: none;
    box-shadow: none;
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
    background-color: rgba(255, 255, 255, 0.3);
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
    background-color: rgba(255, 255, 255, 0.6);
}

.dot.active {
    background-color: var(--accent-color);
    transform: scale(1.2);
    width: 30px;
    border-radius: 12px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease;
}

.fade-leave-active {
    pointer-events: none;
    /* Prevent ghost clicks on leaving slide */
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
@media (max-width: 768px) {
    .slide-title {
        font-size: 2.5rem;
    }

    .slide-overlay {
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%);
        align-items: flex-end;
        padding-bottom: 4rem;
    }

    .slide-content {
        padding: 1.5rem;
    }
}
</style>
