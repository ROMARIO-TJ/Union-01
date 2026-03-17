<script setup>
import { useContactStore } from '../store/contactStore';
const contactStore = useContactStore();
const currentYear = new Date().getFullYear();
</script>

<template>
    <footer class="site-footer">
        <div class="footer-container">

            <!-- COLUMN 1: BRAND -->
            <div class="footer-col brand-col">
                <div class="footer-logo">
                    <div class="footer-logo-container">
                        <img src="../assets/img/logosinfondo.png" alt="Unión Jaguera" class="footer-logo-img">
                    </div>
                    <span class="footer-brand-text">Unión <span class="text-primary italic">Jaguera</span></span>
                </div>
                <p class="footer-desc">
                    {{ contactStore.footerInfo.description }}
                </p>
            </div>

            <!-- COLUMN 2: LINKS -->
            <div class="footer-col" v-if="contactStore.footerInfo.showMenu !== false">
                <h3 class="footer-title">Navegación</h3>
                <ul class="footer-links">
                    <li><router-link to="/">Inicio</router-link></li>
                    <li><router-link to="/club">El Club</router-link></li>
                    <li><router-link to="/noticias">Noticias</router-link></li>
                    <li><router-link to="/contacto">Contacto</router-link></li>
                </ul>
            </div>

            <!-- COLUMN 3: CONTACT -->
            <div class="footer-col" v-if="contactStore.footerInfo.showContact !== false">
                <h3 class="footer-title">Contacto</h3>
                <ul class="contact-list">
                    <li>
                        <span class="material-symbols-outlined">location_on</span>
                        <span>{{ contactStore.contactInfo.address }}</span>
                    </li>
                    <li>
                        <span class="material-symbols-outlined">call</span>
                        <span>{{ contactStore.contactInfo.phone }}</span>
                    </li>
                    <li>
                        <span class="material-symbols-outlined">mail</span>
                        <span>{{ contactStore.contactInfo.email }}</span>
                    </li>
                </ul>
            </div>

            <!-- COLUMN 4: SOCIAL -->
            <div class="footer-col">
                <h3 class="footer-title">Redes Sociales</h3>
                <div class="social-links">
                    <a v-for="link in contactStore.socialLinks" :key="link.id" :href="link.url" target="_blank"
                        class="social-btn" :class="link.platform.toLowerCase().replace(/[^a-z]/g, '')"
                        :title="link.platform">
                        <i :class="link.icon"></i>
                    </a>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="container flex-col-center">
                <p>&copy; {{ currentYear }} Unión Jaguera. Todos los derechos reservados.</p>
                <div class="footer-legal">
                    <router-link to="/admin" class="admin-access-link">Admin</router-link>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.site-footer {
    background: radial-gradient(circle at center, rgba(17, 212, 66, 0.08) 0%, #f8faf8 80%);
    color: var(--text-primary);
    padding: 6rem 0 0 0;
    border-top: 1px solid rgba(17, 212, 66, 0.1);
    position: relative;
    overflow: hidden;
    transition: background 0.3s ease, color 0.3s ease;
}

:root.dark .site-footer {
    background: radial-gradient(circle at center, rgba(17, 212, 66, 0.15) 0%, #000000 80%);
    color: #ffffff;
    border-top-color: rgba(17, 212, 66, 0.05);
}

.footer-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 4rem;
    margin-bottom: 5rem;
}

/* BRAND COLUMN */
.footer-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.footer-logo-container {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
}

.footer-logo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0 10px rgba(17, 212, 66, 0.2));
}

.footer-brand-text {
    font-size: 1.5rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.05em;
    position: relative;
    padding-bottom: 0.25rem;
    color: var(--text-primary);
}

:root.dark .footer-brand-text {
    color: #ffffff;
}

.footer-brand-text::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 3px;
    background: var(--primary-color);
    transition: width 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.footer-logo:hover .footer-brand-text::after {
    width: 100%;
}

.footer-desc {
    color: var(--text-secondary);
    line-height: 1.8;
    font-size: 0.9375rem;
    max-width: 320px;
    transition: color 0.3s ease;
}

:root.dark .footer-desc {
    color: #94a3b8;
}

.brand-col:hover .footer-desc {
    color: var(--text-primary);
}

:root.dark .brand-col:hover .footer-desc {
    color: #cbd5e1;
}

/* HEADINGS */
.footer-title {
    color: var(--text-primary);
    margin-bottom: 2rem;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

:root.dark .footer-title {
    color: #ffffff;
}

/* LINKS */
.footer-links {
    list-style: none;
    padding: 0;
}

.footer-links li {
    margin-bottom: 1rem;
}

.footer-links a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: var(--transition);
    font-size: 0.9375rem;
}

:root.dark .footer-links a {
    color: #94a3b8;
}

.footer-links a:hover {
    color: var(--primary-color) !important;
    padding-left: 5px;
}

/* CONTACT LIST */
.contact-list {
    list-style: none;
    padding: 0;
}

.contact-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    color: var(--text-secondary);
    font-size: 0.9375rem;
}

:root.dark .contact-list li {
    color: #94a3b8;
}

.contact-list li span:last-child {
    color: #94a3b8 !important;
}

.contact-list .material-symbols-outlined {
    color: var(--primary-color) !important;
    font-size: 1.25rem;
}

/* SOCIAL */
.social-links {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.social-btn {
    width: 40px;
    height: 40px;
    border-radius: 0.5rem;
    background-color: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    text-decoration: none;
    transition: var(--transition);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

:root.dark .social-btn {
    background-color: rgba(255, 255, 255, 0.05);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.05);
}

.social-btn:hover {
    transform: translateY(-3px);
    background: var(--primary-color) !important;
    color: #102215 !important;
}

/* BOTTOM BAR */
.footer-bottom {
    background: rgba(0, 0, 0, 0.3);
    padding: 2.5rem 0;
    text-align: center;
    color: #64748b !important;
    font-size: 0.875rem;
    border-top: 1px solid rgba(17, 212, 66, 0.03);
}

.footer-bottom p {
    color: #64748b !important;
}

.flex-col-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.footer-legal {
    display: flex;
    gap: 2rem;
}

.footer-legal a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: var(--transition);
}

:root.dark .footer-legal a {
    color: #475569;
}

.footer-legal a:hover {
    color: var(--primary-color) !important;
}

.admin-access-link {
    font-weight: 700;
}

@media (max-width: 992px) {
    .footer-container {
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
    }
}

@media (max-width: 640px) {
    .footer-container {
        grid-template-columns: 1fr;
        gap: 2.5rem;
    }

    .footer-desc {
        max-width: 100%;
    }
}
</style>
