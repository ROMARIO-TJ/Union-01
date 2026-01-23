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
    bottom: 2rem;
    right: 2rem;
    background-color: var(--accent-color);
    color: #fff;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 15px rgba(31, 167, 116, 0.4);
    z-index: 999;
    transition: all 0.3s ease;
}

.back-to-top:hover {
    transform: translateY(-5px);
    background-color: #158f61;
    /* Darker accent */
    box-shadow: 0 6px 20px rgba(31, 167, 116, 0.6);
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
        width: 45px;
        height: 45px;
    }
}
</style>
