<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);

const checkScroll = () => {
    // Show button when scrolled down 300px
    isVisible.value = window.scrollY > 300;
};

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

onMounted(() => {
    window.addEventListener('scroll', checkScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', checkScroll);
});
</script>

<template>
    <transition name="fade">
        <button v-show="isVisible" @click="scrollToTop" class="back-to-top" aria-label="Volver arriba">
            <i class="fa-solid fa-arrow-up"></i>
        </button>
    </transition>
</template>

<style scoped>
.back-to-top {
    position: fixed;
    bottom: 2.5rem;
    right: 2rem;
    background-color: var(--accent-color);
    color: #102215;
    width: 42px;
    height: 42px;
    padding: 0;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    box-shadow: 0 4px 15px rgba(17, 212, 66, 0.4);
    z-index: 1000;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.back-to-top:hover {
    transform: translateY(-5px) scale(1.05);
    background-color: #0fb839;
    box-shadow: 0 8px 20px rgba(17, 212, 66, 0.5);
}

.back-to-top:focus {
    outline: none;
    box-shadow: none;
}

/* Transition classes */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

/* Mobile adjustments */
@media (max-width: 768px) {
    .back-to-top {
        bottom: 1.5rem;
        right: 1.5rem;
        width: 38px;
        height: 38px;
        font-size: 1rem;
    }
}
</style>
