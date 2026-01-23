<template>
    <div class="noticias-page">
        <!-- HERO SECTION -->
        <PageHero pageKey="noticias" :defaultImage="noticiasHeroImg" />

        <!-- NEWS GRID -->
        <section class="news-section">
            <div class="container">
                <div class="news-grid">
                    <article v-for="article in newsStore.news" :key="article.id" class="news-card">
                        <div class="news-card__image">
                            <img :src="article.image" :alt="article.title">
                            <div class="news-date">{{ article.date }}</div>
                        </div>
                        <div class="news-card__content">
                            <h3 class="news-title">{{ article.title }}</h3>
                            <p class="news-excerpt">{{ article.excerpt }}</p>
                            <router-link :to="`/noticias/${article.id}`" class="read-more">
                                Leer más
                                <i class="fa-solid fa-arrow-right"></i>
                            </router-link>
                        </div>
                    </article>
                </div>

                <!-- Load More Button (Optional) -->
                <div v-if="hasMore" class="load-more-section">
                    <button @click="loadMore" class="btn-load-more">
                        Cargar más noticias
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        </section>
        <SponsorsCarousel />
    </div>
</template>
<script setup>
import { useNewsStore } from '../store/newsStore';
import SponsorsCarousel from '../components/SponsorsCarousel.vue';
import PageHero from '../components/PageHero.vue';
import noticiasHeroImg from '../assets/img/heroes/noticias_hero.png';

const newsStore = useNewsStore();
</script>

<style scoped>
/* NEWS SECTION */
.news-section {
    padding: 5rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2.5rem;
}

.news-card {
    background-color: var(--card-bg);
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
}

.news-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

:root.dark .news-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.news-card__image {
    height: 220px;
    overflow: hidden;
    position: relative;
}

.news-card__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.news-card:hover .news-card__image img {
    transform: scale(1.1);
}

.news-date {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: var(--accent-color);
    color: #fff;
    padding: 0.25rem 0.8rem;
    border-radius: 5px;
    font-weight: 700;
    font-size: 0.8rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.news-card__content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
}

.news-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
}

.news-excerpt {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
}

.read-more {
    color: var(--accent-color);
    font-weight: 600;
    text-decoration: none;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: auto;
    transition: gap 0.3s ease;
}

.read-more:hover {
    gap: 0.8rem;
}

.read-more i {
    transition: transform 0.3s ease;
}

.read-more:hover i {
    transform: translateX(3px);
}

/* LOAD MORE */
.load-more-section {
    margin-top: 4rem;
    text-align: center;
}

.btn-load-more {
    background: var(--accent-color);
    color: #fff;
    padding: 1rem 2.5rem;
    border-radius: 50px;
    border: none;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(31, 167, 116, 0.3);
}

.btn-load-more:hover {
    background: #158f61;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(31, 167, 116, 0.5);
}

.btn-load-more i {
    transition: transform 0.3s ease;
}

.btn-load-more:hover i {
    transform: translateY(3px);
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .hero-tagline {
        font-size: 1.1rem;
    }

    .news-grid {
        grid-template-columns: 1fr;
        max-width: 500px;
        margin: 0 auto;
        gap: 2rem;
    }

    .news-card__image {
        height: 200px;
    }
}
</style>
