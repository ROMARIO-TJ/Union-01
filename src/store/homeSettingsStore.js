import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHomeSettingsStore = defineStore('homeSettings', () => {
    const sections = ref({
        heroCarousel: {
            enabled: true,
            label: 'Carrusel Principal',
            icon: 'fa-solid fa-images',
            description: 'Carrusel de cabecera en el Inicio'
        },
        heroMatchSlide: {
            enabled: true,
            label: 'Slide - Próximo Partido',
            icon: 'fa-solid fa-trophy',
            description: 'Muestra el próximo partido en el carrusel'
        },
        matchCenter: {
            enabled: true,
            label: 'Próximos Encuentros',
            icon: 'fa-solid fa-futbol',
            description: 'Muestra el carrusel de próximos partidos'
        },
        latestNews: {
            enabled: true,
            label: 'Actualidad del Club',
            icon: 'fa-solid fa-newspaper',
            description: 'Muestra las últimas noticias'
        },
        categories: {
            enabled: true,
            label: 'Nuestras Categorías',
            icon: 'fa-solid fa-users',
            description: 'Muestra vista previa de categorías'
        },
        sponsors: {
            enabled: true,
            label: 'Patrocinadores',
            icon: 'fa-solid fa-handshake',
            description: 'Muestra el carrusel de patrocinadores'
        }
    });

    // --- NEW DYNAMIC CONTENT ---
    const heroSlides = ref([]);
    const philosophy = ref([]);
    const pageHeroes = ref({});

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
            isIdentity: true
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
            isIdentity: false
        }
    ];

    const initialPhilosophy = [
        {
            id: 1,
            title: 'Comunidad',
            description: 'Somos más que un equipo, somos una familia unida por los mismos colores.',
            icon: 'fa-solid fa-users'
        },
        {
            id: 2,
            title: 'Formación',
            description: 'Trabajamos día a día para potenciar el talento joven y formar deportistas integrales.',
            icon: 'fa-solid fa-futbol'
        },
        {
            id: 3,
            title: 'Pasión',
            description: 'Dejamos todo en la cancha. La garra y el corazón son nuestro sello de identidad.',
            icon: 'fa-solid fa-fire'
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

    // --- METHODS ---
    const initSettings = () => {
        const savedSettings = localStorage.getItem('union_home_settings_v3');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            // Merge sections visibility
            if (parsed.sections) {
                Object.keys(sections.value).forEach(key => {
                    if (parsed.sections[key] !== undefined) {
                        sections.value[key].enabled = parsed.sections[key].enabled;
                    }
                });
            }
            // Load dynamic content
            heroSlides.value = parsed.heroSlides || initialSlides;
            philosophy.value = parsed.philosophy || initialPhilosophy;
            pageHeroes.value = parsed.pageHeroes || initialPageHeroes;
        } else {
            heroSlides.value = initialSlides;
            philosophy.value = initialPhilosophy;
            pageHeroes.value = initialPageHeroes;
            saveToLocalStorage();
        }
    };

    const saveToLocalStorage = () => {
        localStorage.setItem('union_home_settings_v3', JSON.stringify({
            sections: sections.value,
            heroSlides: heroSlides.value,
            philosophy: philosophy.value,
            pageHeroes: pageHeroes.value
        }));
    };

    const toggleSection = (sectionKey) => {
        if (sections.value[sectionKey]) {
            sections.value[sectionKey].enabled = !sections.value[sectionKey].enabled;
            saveToLocalStorage();
        }
    };

    // Hero Slides CRUD
    const addHeroSlide = (slide) => {
        const newId = heroSlides.value.length > 0 ? Math.max(...heroSlides.value.map(s => s.id)) + 1 : 1;
        heroSlides.value.push({ ...slide, id: newId });
        saveToLocalStorage();
    };

    const updateHeroSlide = (id, updated) => {
        const index = heroSlides.value.findIndex(s => s.id === id);
        if (index !== -1) {
            heroSlides.value[index] = { ...heroSlides.value[index], ...updated, id };
            saveToLocalStorage();
        }
    };

    const deleteHeroSlide = (id) => {
        heroSlides.value = heroSlides.value.filter(s => s.id !== id);
        saveToLocalStorage();
    };

    // Philosophy CRUD
    const addPhilosophyItem = (item) => {
        const newId = philosophy.value.length > 0 ? Math.max(...philosophy.value.map(p => p.id)) + 1 : 1;
        philosophy.value.push({ ...item, id: newId });
        saveToLocalStorage();
    };

    const updatePhilosophyItem = (id, updated) => {
        const index = philosophy.value.findIndex(p => p.id === id);
        if (index !== -1) {
            philosophy.value[index] = { ...philosophy.value[index], ...updated, id };
            saveToLocalStorage();
        }
    };

    const deletePhilosophyItem = (id) => {
        philosophy.value = philosophy.value.filter(p => p.id !== id);
        saveToLocalStorage();
    };

    // Page Heroes Update
    const updatePageHero = (pageKey, updated) => {
        if (pageHeroes.value[pageKey]) {
            pageHeroes.value[pageKey] = { ...pageHeroes.value[pageKey], ...updated };
            saveToLocalStorage();
        }
    };

    initSettings();

    return {
        sections,
        heroSlides,
        philosophy,
        pageHeroes,
        toggleSection,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        addPhilosophyItem,
        updatePhilosophyItem,
        deletePhilosophyItem,
        updatePageHero,
        saveToLocalStorage
    };
});
