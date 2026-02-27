<template>
    <div class="noticia-detalle">
        <div v-if="noticia" class="article-container">
            <!-- Header -->
            <div class="article-header">
                <div class="container">
                    <router-link to="/noticias" class="back-link">
                        <i class="fa-solid fa-arrow-left"></i>
                        Volver a noticias
                    </router-link>

                    <div class="article-meta">
                        <span class="article-date">{{ noticia.date }}</span>
                        <span class="article-category">{{ noticia.category || 'General' }}</span>
                    </div>

                    <h1 class="article-title">{{ noticia.title }}</h1>
                </div>
            </div>

            <!-- Featured Image -->
            <div class="article-image">
                <img :src="noticia.image" :alt="noticia.title">
            </div>

            <!-- Content -->
            <div class="article-content">
                <div class="container">
                    <div class="content-body">
                        <p class="lead">{{ noticia.excerpt }}</p>

                        <div class="article-text">
                            <p>{{ noticia.fullContent || generateFullContent() }}</p>
                        </div>

                        <!-- Gallery Carousel Section -->
                        <div v-if="getGallery().length > 0" class="article-gallery-carousel">
                            <div class="gallery-header">
                                <h3 class="gallery-title">Galería de <span class="text-accent">Fotos</span></h3>
                                <div class="carousel-nav">
                                    <button @click="scrollGallery('left')" class="nav-btn"><i
                                            class="fa-solid fa-chevron-left"></i></button>
                                    <button @click="scrollGallery('right')" class="nav-btn"><i
                                            class="fa-solid fa-chevron-right"></i></button>
                                </div>
                            </div>

                            <div class="gallery-track no-scrollbar" ref="galleryTrack">
                                <div v-for="(img, idx) in getGallery()" :key="idx" class="gallery-card-mini"
                                    @click="openLightbox(idx)">
                                    <div class="card-img-box">
                                        <img :src="img" loading="lazy">
                                        <div class="card-overlay">
                                            <i class="fa-solid fa-magnifying-glass-plus"></i>
                                        </div>
                                    </div>
                                    <span class="img-idx">Imagen {{ idx + 1 }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Share Section -->
                        <div v-if="parseInt(noticia.show_social) !== 0" class="share-section">
                            <h3>Compartir esta noticia</h3>
                            <div class="share-buttons">
                                <button class="share-btn facebook">
                                    <i class="fa-brands fa-facebook-f"></i>
                                </button>
                                <button class="share-btn twitter">
                                    <i class="fa-brands fa-twitter"></i>
                                </button>
                                <button class="share-btn whatsapp">
                                    <i class="fa-brands fa-whatsapp"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Related News -->
                    <div class="related-news">
                        <h2 class="section-title">Noticias <span class="text-accent">Relacionadas</span></h2>
                        <div class="related-grid">
                            <article v-for="related in relatedNews" :key="related.id" class="related-card"
                                @click="navigateToNews(related.id)">
                                <div class="related-image">
                                    <img :src="related.image" :alt="related.title">
                                </div>
                                <div class="related-content">
                                    <h4>{{ related.title }}</h4>
                                    <span class="related-date">{{ related.date }}</span>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Not Found Section -->
        <div v-else class="not-found">
            <div class="container">
                <i class="fa-solid fa-newspaper"></i>
                <h2>Noticia no encontrada</h2>
                <p>Lo sentimos, no pudimos encontrar la noticia que buscas.</p>
                <router-link to="/noticias" class="btn-back">Volver a noticias</router-link>
            </div>
        </div>

        <!-- Lightbox Modal -->
        <div v-if="lightboxOpen" class="lightbox-overlay" @click.self="closeLightbox">
            <button class="lightbox-close" @click="closeLightbox" aria-label="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" class="close-icon-svg" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
            <div class="lightbox-content">
                <img :src="getGallery()[lightboxIndex]" class="lightbox-img">

                <div v-if="getGallery().length > 1" class="lightbox-navs">
                    <button class="l-nav prev" @click="prevLightbox">&lsaquo;</button>
                    <button class="l-nav next" @click="nextLightbox">&rsaquo;</button>
                </div>

                <div class="lightbox-counter">{{ lightboxIndex + 1 }} / {{ getGallery().length }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNewsStore } from '../store/newsStore';

const route = useRoute();
const router = useRouter();
const newsStore = useNewsStore();

const noticia = ref(null);

const loadNoticia = () => {
    const id = parseInt(route.params.id);
    noticia.value = newsStore.getNewsById(id);
};

const relatedNews = computed(() => {
    if (!noticia.value) return [];
    return newsStore.news
        .filter(n => n.id !== noticia.value.id)
        .slice(0, 3);
});

const generateFullContent = () => {
    if (noticia.value?.content) return noticia.value.content;

    return `${noticia.value?.excerpt || ''}\n\nEste es un contenido generado automáticamente. En el panel administrativo puedes editar este texto para que sea más completo.\n\nEl Unión Jeguera continúa trabajando día a día para ofrecer lo mejor a su afición y seguir creciendo como institución deportiva. Con el apoyo de todos, seguimos construyendo historia.`;
};

const navigateToNews = (id) => {
    router.push(`/noticias/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const getGallery = () => {
    if (!noticia.value?.gallery) return [];
    if (typeof noticia.value.gallery === 'string') {
        try {
            return JSON.parse(noticia.value.gallery);
        } catch (e) {
            return [];
        }
    }
    return noticia.value.gallery;
};

const galleryTrack = ref(null);

const scrollGallery = (direction) => {
    if (galleryTrack.value) {
        const amount = 300;
        galleryTrack.value.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth'
        });
    }
};

const activeSlide = ref(0);
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

const nextSlide = () => {
    const total = getGallery().length;
    activeSlide.value = (activeSlide.value + 1) % total;
};

const prevSlide = () => {
    const total = getGallery().length;
    activeSlide.value = (activeSlide.value - 1 + total) % total;
};

const openLightbox = (index) => {
    lightboxIndex.value = index;
    lightboxOpen.value = true;
    document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
    lightboxOpen.value = false;
    document.body.style.overflow = 'auto';
};

const nextLightbox = () => {
    const total = getGallery().length;
    lightboxIndex.value = (lightboxIndex.value + 1) % total;
};

const prevLightbox = () => {
    const total = getGallery().length;
    lightboxIndex.value = (lightboxIndex.value - 1 + total) % total;
};

// Re-cargar si cambia el ID en la URL
watch(() => route.params.id, () => {
    loadNoticia();
});

onMounted(() => {
    window.scrollTo({ top: 0 });
    loadNoticia();
});
</script>

<style scoped>
.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

/* ARTICLE HEADER */
.article-header {
    padding: 8rem 0 2rem;
    background: var(--bg-secondary);
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent-color);
    text-decoration: none;
    font-weight: 600;
    margin-bottom: 2rem;
    transition: gap 0.3s ease;
}

.back-link:hover {
    gap: 0.8rem;
}

.article-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.article-date,
.article-category {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
}

.article-category {
    color: var(--accent-color);
}

.article-title {
    font-size: 3rem;
    font-weight: 900;
    color: var(--text-primary);
    line-height: 1.2;
    margin-bottom: 0;
}

/* FEATURED IMAGE */
.article-image {
    width: 100%;
    max-height: 500px;
    overflow: hidden;
}

.article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* CONTENT */
.article-content {
    padding: 4rem 0;
}

.content-body {
    margin-bottom: 4rem;
}

.lead {
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid var(--bg-secondary);
}

.article-text {
    font-size: 1.1rem;
    line-height: 1.9;
    color: var(--text-primary);
}

.article-text p {
    margin-bottom: 1.5rem;
    white-space: pre-line;
}

/* GALLERY CAROUSEL (CATEGORIES STYLE) */
.article-gallery-carousel {
    margin-top: 5rem;
    padding-top: 3rem;
    border-top: 1px solid var(--bg-secondary);
}

.gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.gallery-title {
    font-size: 1.6rem;
    font-weight: 900;
    margin-bottom: 0;
    text-transform: uppercase;
    letter-spacing: -1px;
}

.carousel-nav {
    display: flex;
    gap: 0.8rem;
}

.nav-btn {
    width: 45px;
    height: 45px;
    border-radius: 0;
    border: 1px solid rgba(17, 212, 66, 0.2);
    background: var(--card-bg);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-btn:hover {
    background: var(--accent-color);
    color: #102215;
    transform: translateY(-2px);
}

.gallery-track {
    display: flex;
    gap: 1.5rem;
    overflow-x: auto;
    padding: 1rem 0 2rem;
    scroll-snap-type: x mandatory;
}

.gallery-card-mini {
    flex: 0 0 240px;
    background: var(--card-bg);
    border: 1px solid rgba(17, 212, 66, 0.1);
    padding: 0.8rem;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.4s ease;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.gallery-card-mini:hover {
    border-color: var(--accent-color);
    transform: translateY(-8px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-img-box {
    width: 100%;
    aspect-ratio: 4/3;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.card-img-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
}

.card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(17, 212, 66, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s;
}

.gallery-card-mini:hover .card-img-box img {
    transform: scale(1.1);
}

.gallery-card-mini:hover .card-overlay {
    opacity: 1;
}

.img-idx {
    margin-top: 1rem;
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--accent-color);
    letter-spacing: 1px;
}

/* LIGHTBOX */
.lightbox-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    backdrop-filter: blur(10px);
}

.lightbox-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.lightbox-img {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 8px;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
    object-fit: contain;
}

.lightbox-close {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 2010;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.close-icon-svg {
    width: 100%;
    height: 100%;
    stroke: rgba(255, 255, 255, 0.4);
    stroke-width: 1px;
    /* Ultra thin like categories */
    transition: stroke 0.3s ease;
}

.lightbox-close:hover {
    transform: rotate(90deg);
}

.lightbox-close:hover .close-icon-svg {
    stroke: #fff;
}

.lightbox-navs {
    position: absolute;
    width: 120%;
    top: 50%;
    left: -10%;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
}

.l-nav {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 3rem;
    border: none;
    cursor: pointer;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.l-nav:hover {
    background: var(--accent-color);
}

.lightbox-counter {
    color: #94a3b8;
    margin-top: 1.5rem;
    font-weight: 700;
}

/* SHARE SECTION */
.share-section {
    margin-top: 4rem;
    padding: 2.5rem;
    background: var(--bg-secondary);
    border-radius: 20px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.03);
}

.share-section h3 {
    font-size: 1.2rem;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
}

.share-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.share-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.share-btn:hover {
    transform: translateY(-3px);
}

.share-btn.facebook {
    background: #1877f2;
}

.share-btn.twitter {
    background: #1da1f2;
}

.share-btn.whatsapp {
    background: #25d366;
}

/* RELATED NEWS */
.related-news {
    margin-top: 5rem;
    padding-top: 3rem;
    border-top: 2px solid var(--bg-secondary);
}

.section-title {
    font-size: 2rem;
    font-weight: 800;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-primary);
}

.text-accent {
    color: var(--accent-color);
}

.related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.related-card {
    background: var(--card-bg);
    border-radius: 15px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.related-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

:root.dark .related-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.related-image {
    height: 150px;
    overflow: hidden;
}

.related-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.related-card:hover .related-image img {
    transform: scale(1.1);
}

.related-content {
    padding: 1.5rem;
}

.related-content h4 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    line-height: 1.3;
}

.related-date {
    font-size: 0.85rem;
    color: var(--accent-color);
    font-weight: 600;
}

/* NOT FOUND */
.not-found {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 2rem;
}

.not-found i {
    font-size: 5rem;
    color: var(--accent-color);
    opacity: 0.5;
    margin-bottom: 2rem;
}

.not-found h2 {
    font-size: 2rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.not-found p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
}

.btn-back {
    display: inline-block;
    background: var(--accent-color);
    color: #fff;
    padding: 0.8rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-back:hover {
    background: #158f61;
    transform: translateY(-2px);
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .article-header {
        padding: 6rem 0 1.5rem;
    }

    .article-title {
        font-size: 2rem;
    }

    .lead {
        font-size: 1.1rem;
    }

    .article-text {
        font-size: 1rem;
    }

    .related-grid {
        grid-template-columns: 1fr;
    }
}
</style>
