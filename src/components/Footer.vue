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
                <h2 class="footer-logo">Unión <span>Jeguera</span></h2>
                <p class="footer-desc">
                    {{ contactStore.footerInfo.description }}
                </p>
            </div>

            <!-- COLUMN 2: LINKS -->
            <div class="footer-col" v-if="contactStore.footerInfo.showMenu !== false">
                <h3>Menu</h3>
                <ul class="footer-links">
                    <li><router-link to="/">Inicio</router-link></li>
                    <li><router-link to="/club">El Club</router-link></li>
                    <li><router-link to="/noticias">Noticias</router-link></li>
                    <li><router-link to="/contacto">Contacto</router-link></li>
                </ul>
            </div>

            <!-- COLUMN 3: CONTACT -->
            <div class="footer-col" v-if="contactStore.footerInfo.showContact !== false">
                <h3>Contacto</h3>
                <ul class="contact-list">
                    <li>
                        <i class="fa-solid fa-location-dot"></i>
                        <span>{{ contactStore.contactInfo.address }}</span>
                    </li>
                    <li>
                        <i class="fa-solid fa-phone"></i>
                        <span>{{ contactStore.contactInfo.phone }}</span>
                    </li>
                    <li>
                        <i class="fa-solid fa-envelope"></i>
                        <span>{{ contactStore.contactInfo.email }}</span>
                    </li>
                </ul>
            </div>

            <!-- COLUMN 4: SOCIAL -->
            <div class="footer-col">
                <h3>Síguenos</h3>
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
            <p>&copy; {{ currentYear }} Unión Jeguera. Todos los derechos reservados.</p>
            <router-link to="/admin" class="admin-access-link">Administración</router-link>
        </div>
    </footer>
</template>

<style scoped>
.site-footer {
    background-color: #1a1a1a;
    color: #e0e0e0;
    padding: 4rem 0 0 0;
    font-size: 0.95rem;
    border-top: 4px solid var(--accent-color);
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 3rem;
    margin-bottom: 3rem;
}

/* BRAND COLUMN */
.footer-logo {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
}

.footer-logo span {
    color: var(--accent-color);
}

.footer-desc {
    color: #a0a0a0;
    line-height: 1.6;
}

/* HEADINGS */
.footer-col h3 {
    color: #fff;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    font-weight: 600;
    position: relative;
    display: inline-block;
}

.footer-col h3::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -5px;
    width: 30px;
    height: 3px;
    background-color: var(--accent-color);
    border-radius: 2px;
}

/* LINKS */
.footer-links {
    list-style: none;
    padding: 0;
}

.footer-links li {
    margin-bottom: 0.8rem;
}

.footer-links a {
    color: #a0a0a0;
    text-decoration: none;
    transition: color 0.3s ease, transform 0.3s ease;
    display: inline-block;
}

.footer-links a:hover {
    color: var(--accent-color);
    transform: translateX(5px);
}

/* CONTACT LIST */
.contact-list {
    list-style: none;
    padding: 0;
}

.contact-list li {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #a0a0a0;
}

.contact-list i {
    color: var(--accent-color);
    margin-top: 4px;
}

/* SOCIAL */
.social-links {
    display: flex;
    gap: 1rem;
}

.social-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    text-decoration: none;
    transition: all 0.3s ease;
}

.social-btn:hover {
    transform: translateY(-3px);
    color: #fff;
    opacity: 0.9;
}

/* Dynamic social backgrounds */
.social-btn.facebook {
    background-color: #1877f2;
}

.social-btn.instagram {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.social-btn.twitterx {
    background-color: #000;
}

.social-btn.youtube {
    background-color: #ff0000;
}

.social-btn.tiktok {
    background-color: #000;
}

.social-btn.whatsapp {
    background-color: #25d366;
}

.social-btn.linkedin {
    background-color: #0077b5;
}

/* BOTTOM BAR */
.footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 2rem 0;
    text-align: center;
    color: #666;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.admin-access-link {
    color: #444;
    text-decoration: none;
    font-size: 0.75rem;
    transition: color 0.3s ease;
}

.admin-access-link:hover {
    color: var(--accent-color);
}
</style>
