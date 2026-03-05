import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const useHomeSettingsStore = defineStore('homeSettings', () => {
    const sections = ref({
        heroCarousel: {
            enabled: true,
            label: 'Carrusel Principal',
            icon: 'images',
            description: 'Carrusel de cabecera en el Inicio'
        },
        heroMatchSlide: {
            enabled: true,
            label: 'Slide - Próximo Partido',
            icon: 'trophy',
            description: 'Muestra el próximo partido en el carrusel'
        },
        matchCenter: {
            enabled: true,
            label: 'Próximos Encuentros',
            icon: 'sports_soccer',
            description: 'Muestra el carrusel de próximos partidos'
        },
        latestNews: {
            enabled: true,
            label: 'Actualidad del Club',
            icon: 'newspaper',
            description: 'Muestra las últimas noticias'
        },
        categories: {
            enabled: true,
            label: 'Nuestras Categorías',
            icon: 'groups',
            description: 'Muestra vista previa de categorías'
        },
        sponsors: {
            enabled: true,
            label: 'Patrocinadores',
            icon: 'handshake',
            description: 'Muestra el carrusel de patrocinadores'
        }
    });

    const initialSlides = [
        {
            id: 1,
            title: 'Unión Jeguera',
            subtitle: 'Más que un equipo, somos una familia. Pasión, garra y buen fútbol en cada jugada.',
            image: '', // Empty means use identity/logo style
            primaryBtnText: 'Conoce el Club',
            primaryBtnLink: '/club',
            secondaryBtnText: 'Inscripciones',
            secondaryBtnLink: '/categoria',
            isIdentity: true,
            showButtons: true
        },
        {
            id: 2,
            title: 'Futuras Promesas',
            subtitle: 'Formamos a los campeones del mañana con valores, disciplina y técnica. ¡Inscripciones abiertas!',
            image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200',
            primaryBtnText: 'Inscribirse Ahora',
            primaryBtnLink: '/inscripcion?categoria=Escuela de Formación',
            secondaryBtnText: 'Ver Categorías',
            secondaryBtnLink: '/categoria',
            isIdentity: false,
            showButtons: true
        }
    ];

    const initialPhilosophy = [
        {
            id: 1,
            title: 'Comunidad',
            description: 'Somos más que un equipo, somos una familia unida por los mismos colores.',
            icon: 'groups'
        },
        {
            id: 2,
            title: 'Formación',
            description: 'Trabajamos día a día para potenciar el talento joven y formar deportistas integrales.',
            icon: 'sports_soccer'
        },
        {
            id: 3,
            title: 'Pasión',
            description: 'Dejamos todo en la cancha. La garra y el corazón son nuestro sello de identidad.',
            icon: 'whatshot'
        }
    ];

    const initialPageHeroes = {
        club: {
            title: 'Unión Jeguera',
            tagline: 'Pasión, Historia y Tradición desde 1985',
            image: '' // Default defined in component
        },
        noticias: {
            title: 'Actualidad',
            tagline: 'Todas las novedades del club en un solo lugar',
            image: ''
        },
        galeria: {
            title: 'Galería',
            tagline: 'Nuestros mejores momentos en imágenes',
            image: ''
        },
        contacto: {
            title: 'Contacto',
            tagline: 'Estamos aquí para escucharte y ayudarte',
            image: ''
        },
        categoria: {
            title: 'Categorías',
            tagline: 'Elige tu equipo y comienza a formar parte de nuestra historia',
            image: ''
        },
        partidos: {
            title: 'Partidos',
            tagline: 'Sigue el calendario y resultados de todos nuestros equipos',
            image: ''
        }
    };

    // --- REFS ---
    const heroSlides = ref([...initialSlides]);
    const philosophy = ref([...initialPhilosophy]);
    const pageHeroes = ref({ ...initialPageHeroes });
    const matchSlideImage = ref('https://realvalladolidacademy.com/wp-content/uploads/2024/06/tecnificacion-futbol-3.webp');
    const isLoading = ref(false);
    const error = ref(null);

    // --- UTILS ---
    const sanitizeIcon = (icon) => {
        if (!icon) return 'star';
        // Clean FontAwesome or Material Symbols names to a standard format
        return icon.replace(/fa-solid /g, '')
            .replace(/fa- /g, '')
            .replace(/fa-/g, '')
            .replace(/groups/g, 'groups')
            .replace(/users/g, 'groups')
            .replace(/futbol/g, 'sports_soccer')
            .replace(/fire/g, 'whatshot')
            .replace(/check/g, 'verified')
            .replace(/star/g, 'grade')
            .replace(/trophy/g, 'emoji_events')
            .replace(/newspaper/g, 'newspaper')
            .replace(/handshake/g, 'handshake')
            .replace(/images/g, 'images');
    };

    // --- METHODS ---
    const initSettings = async () => {
        isLoading.value = true;
        error.value = null;

        const savedSettings = localStorage.getItem('union_home_settings_v3');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed.sections) {
                    Object.keys(sections.value).forEach(key => {
                        if (parsed.sections[key] !== undefined) {
                            sections.value[key].enabled = parsed.sections[key].enabled;
                            if (parsed.sections[key].icon) {
                                sections.value[key].icon = sanitizeIcon(parsed.sections[key].icon);
                            }
                        }
                    });
                }
                if (parsed.heroSlides) heroSlides.value = parsed.heroSlides.map(s => ({ ...s, showButtons: s.showButtons !== undefined ? s.showButtons : true }));
                if (parsed.philosophy) philosophy.value = parsed.philosophy.map(p => ({ ...p, icon: sanitizeIcon(p.icon) }));
                if (parsed.pageHeroes) pageHeroes.value = { ...initialPageHeroes, ...parsed.pageHeroes };
                if (parsed.matchSlideImage) matchSlideImage.value = parsed.matchSlideImage;
            } catch (e) {
                console.error('Error parsing local settings:', e);
            }
        }

        try {
            const response = await apiService.request('settings', 'GET', { key: 'home_settings' });
            // La API standard devuelve { status: 'success', data: { ... } }
            // Extraemos 'data' que es donde reside el objeto de configuración real
            const data = response?.data;

            if (data && typeof data === 'object') {
                if (data.sections) {
                    Object.keys(sections.value).forEach(key => {
                        if (data.sections[key] !== undefined) {
                            sections.value[key].enabled = data.sections[key].enabled;
                            if (data.sections[key].icon) {
                                sections.value[key].icon = sanitizeIcon(data.sections[key].icon);
                            }
                        }
                    });
                }
                heroSlides.value = (data.heroSlides || initialSlides).map(s => ({
                    ...s,
                    showButtons: s.showButtons !== undefined ? s.showButtons : true
                }));

                philosophy.value = (data.philosophy || initialPhilosophy).map(p => ({
                    ...p,
                    icon: sanitizeIcon(p.icon)
                }));

                pageHeroes.value = { ...initialPageHeroes, ...(data.pageHeroes || {}) };
                matchSlideImage.value = data.matchSlideImage || 'https://realvalladolidacademy.com/wp-content/uploads/2024/06/tecnificacion-futbol-3.webp';

                saveToLocalStorage();
            }
        } catch (err) {
            console.error('Error loading home settings from server:', err);
        } finally {
            isLoading.value = false;
        }
    };

    const pushSettingsToServer = async (newContent) => {
        // Update local state first to ensure UI consistency
        if (newContent.sections) sections.value = { ...newContent.sections };
        if (newContent.heroSlides) heroSlides.value = [...newContent.heroSlides];
        if (newContent.philosophy) philosophy.value = [...newContent.philosophy];
        if (newContent.pageHeroes) pageHeroes.value = { ...newContent.pageHeroes };
        if (newContent.matchSlideImage) matchSlideImage.value = newContent.matchSlideImage;

        saveToLocalStorage();

        try {
            await apiService.request('settings', 'POST', {
                key: 'home_settings',
                value: newContent
            });
        } catch (err) {
            console.error('Error saving settings to server:', err);
        }
    };

    const saveToLocalStorage = () => {
        localStorage.setItem('union_home_settings_v3', JSON.stringify({
            sections: sections.value,
            heroSlides: heroSlides.value,
            philosophy: philosophy.value,
            pageHeroes: pageHeroes.value,
            matchSlideImage: matchSlideImage.value
        }));
    };

    const toggleSection = async (sectionKey) => {
        if (!sections.value[sectionKey]) return;
        const newSections = { ...sections.value };
        newSections[sectionKey].enabled = !newSections[sectionKey].enabled;
        await pushSettingsToServer({
            sections: newSections,
            heroSlides: heroSlides.value,
            philosophy: philosophy.value,
            pageHeroes: pageHeroes.value,
            matchSlideImage: matchSlideImage.value
        });
    };

    const addHeroSlide = async (slide) => {
        const newId = heroSlides.value.length > 0 ? Math.max(...heroSlides.value.map(s => s.id)) + 1 : 1;
        const newSlides = [...heroSlides.value, { ...slide, id: newId }];
        await pushSettingsToServer({
            sections: sections.value,
            heroSlides: newSlides,
            philosophy: philosophy.value,
            pageHeroes: pageHeroes.value,
            matchSlideImage: matchSlideImage.value
        });
    };

    const updateHeroSlide = async (id, updated) => {
        const newSlides = heroSlides.value.map(s => s.id === id ? { ...updated, id } : s);
        await pushSettingsToServer({
            sections: sections.value,
            heroSlides: newSlides,
            philosophy: philosophy.value,
            pageHeroes: pageHeroes.value,
            matchSlideImage: matchSlideImage.value
        });
    };

    const deleteHeroSlide = async (id) => {
        const newSlides = heroSlides.value.filter(s => s.id !== id);
        await pushSettingsToServer({
            sections: sections.value,
            heroSlides: newSlides,
            philosophy: philosophy.value,
            pageHeroes: pageHeroes.value,
            matchSlideImage: matchSlideImage.value
        });
    };

    const addPhilosophyItem = async (item) => {
        const newId = philosophy.value.length > 0 ? Math.max(...philosophy.value.map(p => p.id)) + 1 : 1;
        const newPhilosophy = [...philosophy.value, { ...item, id: newId }];
        await pushSettingsToServer({
            sections: sections.value,
            heroSlides: heroSlides.value,
            philosophy: newPhilosophy,
            pageHeroes: pageHeroes.value,
            matchSlideImage: matchSlideImage.value
        });
    };

    const updatePhilosophyItem = async (id, updated) => {
        const newPhilosophy = philosophy.value.map(p => p.id === id ? { ...updated, id } : p);
        await pushSettingsToServer({
            sections: sections.value,
            heroSlides: heroSlides.value,
            philosophy: newPhilosophy,
            pageHeroes: pageHeroes.value,
            matchSlideImage: matchSlideImage.value
        });
    };

    const deletePhilosophyItem = async (id) => {
        const newPhilosophy = philosophy.value.filter(p => p.id !== id);
        await pushSettingsToServer({
            sections: sections.value,
            heroSlides: heroSlides.value,
            philosophy: newPhilosophy,
            pageHeroes: pageHeroes.value,
            matchSlideImage: matchSlideImage.value
        });
    };

    const updatePageHero = async (pageKey, updated) => {
        const newPageHeroes = { ...pageHeroes.value };
        newPageHeroes[pageKey] = { ...newPageHeroes[pageKey], ...updated };
        await pushSettingsToServer({
            sections: sections.value,
            heroSlides: heroSlides.value,
            philosophy: philosophy.value,
            pageHeroes: newPageHeroes,
            matchSlideImage: matchSlideImage.value
        });
    };

    const updateMatchSlideImage = async (newImageUrl) => {
        await pushSettingsToServer({
            sections: sections.value,
            heroSlides: heroSlides.value,
            philosophy: philosophy.value,
            pageHeroes: pageHeroes.value,
            matchSlideImage: newImageUrl
        });
    };

    initSettings();

    return {
        sections,
        heroSlides,
        philosophy,
        pageHeroes,
        matchSlideImage,
        isLoading,
        error,
        initSettings,
        toggleSection,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        addPhilosophyItem,
        updatePhilosophyItem,
        deletePhilosophyItem,
        updatePageHero,
        updateMatchSlideImage,
        saveToLocalStorage
    };
});
