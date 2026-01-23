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

                        <!-- Share Section -->
                        <div class="share-section">
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

        <!-- Not Found -->
        <div v-else class="not-found">
            <div class="container">
                <i class="fa-solid fa-newspaper"></i>
                <h2>Noticia no encontrada</h2>
                <p>Lo sentimos, no pudimos encontrar la noticia que buscas.</p>
                <router-link to="/noticias" class="btn-back">Volver a noticias</router-link>
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

/* SHARE SECTION */
.share-section {
    margin-top: 3rem;
    padding: 2rem;
    background: var(--bg-secondary);
    border-radius: 15px;
    text-align: center;
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
