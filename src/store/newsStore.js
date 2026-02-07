import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '../services/api';

export const useNewsStore = defineStore('news', () => {
    const news = ref([]);

    // Datos iniciales
    const initialNews = [
        {
            id: 1,
            title: 'Inicio de la Pretemporada 2026',
            excerpt: 'El primer equipo arrancó los entrenamientos con la mira puesta en el campeonato.',
            date: '12 ENE',
            image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            content: 'El Unión Jeguera comenzó oficialmente su pretemporada 2026 con gran entusiasmo y energía. El cuerpo técnico ha preparado un plan de trabajo intensivo que incluye sesiones de entrenamiento físico, táctico y técnico para preparar al equipo de cara a los desafíos que se avecinan en el campeonato.'
        },
        {
            id: 2,
            title: 'Nueva indumentaria oficial',
            excerpt: 'Conoce la nueva piel del Unión Jeguera para esta temporada. Ya disponible.',
            date: '10 ENE',
            image: 'https://images.unsplash.com/photo-1510051640316-5b56ca5290bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            content: 'Con gran orgullo presentamos la nueva indumentaria oficial del club para la temporada 2026. El diseño mantiene nuestros colores tradicionales con un toque moderno y tecnológico. Ya está disponible en nuestra tienda oficial.'
        },
        {
            id: 3,
            title: 'Convocatoria abierta Sub-20',
            excerpt: '¿Tienes talento? Ven a las pruebas abiertas este fin de semana en el estadio.',
            date: '08 ENE',
            image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            content: 'El Unión Jeguera abre sus puertas a jóvenes talentos menores de 20 años. Las pruebas se realizarán este sábado y domingo en nuestro estadio. ¡No pierdas esta oportunidad de formar parte de nuestro proyecto!'
        },
        {
            id: 4,
            title: 'Victoria contundente en el clásico',
            excerpt: 'El equipo se impuso 3-0 ante su rival histórico en un partido memorable.',
            date: '05 ENE',
            image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            content: 'Una actuación brillante del Unión Jeguera que se impuso 3-0 ante su rival de toda la vida en un partido que quedará en la memoria de todos los aficionados. Tres goles que demuestran la calidad de nuestro equipo.'
        },
        {
            id: 5,
            title: 'Nuevo patrocinador se suma al proyecto',
            excerpt: 'Empresa local apoya la formación de jóvenes talentos en nuestras categorías.',
            date: '02 ENE',
            image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            content: 'Estamos orgullosos de anunciar la incorporación de un nuevo patrocinador que apoyará nuestro programa de formación juvenil. Esta alianza fortalece nuestro compromiso con el desarrollo de jóvenes talentos.'
        },
        {
            id: 6,
            title: 'Inauguración de nuevas instalaciones',
            excerpt: 'El club estrena vestuarios modernos y sala de fisioterapia equipada.',
            date: '28 DIC',
            image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            content: 'Grandes mejoras en nuestras instalaciones con la inauguración de vestuarios completamente renovados y una moderna sala de fisioterapia que permitirá un mejor cuidado de nuestros jugadores.'
        },
        {
            id: 7,
            title: 'Torneo navideño de formativas',
            excerpt: 'Nuestras categorías menores brillaron en el torneo de fin de año.',
            date: '25 DIC',
            image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            content: 'Excelente desempeño de nuestras categorías formativas en el torneo navideño. Los jóvenes demostraron todo lo aprendido durante el año y dejaron el nombre del club en alto.'
        },
        {
            id: 8,
            title: 'Entrevista al capitán del equipo',
            excerpt: 'Conoce más sobre el líder del vestuario y sus objetivos para la temporada.',
            date: '20 DIC',
            image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            content: 'En una entrevista exclusiva, nuestro capitán comparte sus expectativas para la nueva temporada y habla sobre el espíritu de equipo que caracteriza al Unión Jeguera.'
        },
        {
            id: 9,
            title: 'Clínica de fútbol para niños',
            excerpt: 'Exitosa jornada de capacitación con más de 100 participantes.',
            date: '15 DIC',
            image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            content: 'Más de 100 niños participaron en nuestra clínica de fútbol donde aprendieron técnicas, valores deportivos y disfrutaron de una jornada inolvidable junto a jugadores del primer equipo.'
        }
    ];

    const isLoading = ref(false);
    const error = ref(null);

    // Inicializar sincronizando con el servidor
    const initNews = async () => {
        isLoading.value = true;
        error.value = null;

        // Carga rápida del respaldo local
        const savedNews = localStorage.getItem('union_news');
        if (savedNews) {
            news.value = JSON.parse(savedNews);
        } else {
            news.value = initialNews;
        }

        try {
            const data = await apiService.request('news');
            if (data && Array.isArray(data)) {
                news.value = data.map(item => ({
                    ...item,
                    date: item.date_str // Normalizar el campo de fecha de la DB
                }));
                saveToLocalStorage();
            }
        } catch (err) {
            console.error('Error al cargar noticias del servidor:', err);
            error.value = 'No se pudieron sincronizar las noticias.';
        } finally {
            isLoading.value = false;
        }
    };

    // Guardar en localStorage como caché
    const saveToLocalStorage = () => {
        localStorage.setItem('union_news', JSON.stringify(news.value));
    };

    // CRUD Operations
    const addNews = async (newsItem) => {
        try {
            const result = await apiService.request('news', 'POST', newsItem);
            if (result.status === 'success') {
                await initNews();
                return true;
            }
        } catch (err) {
            console.error('Error al añadir noticia:', err);
        }
        return false;
    };

    const updateNews = async (id, updatedNews) => {
        try {
            const result = await apiService.request('news', 'PUT', { ...updatedNews, id });
            if (result.status === 'success') {
                await initNews();
                return true;
            }
        } catch (err) {
            console.error('Error al actualizar noticia:', err);
        }
        return false;
    };

    const deleteNews = async (id) => {
        try {
            const result = await apiService.request('news', 'DELETE', { id });
            if (result.status === 'success') {
                await initNews();
                return true;
            }
        } catch (err) {
            console.error('Error al eliminar noticia:', err);
        }
        return false;
    };

    const getNewsById = (id) => {
        return news.value.find(n => n.id === parseInt(id));
    };

    const getLatestNews = (count = 3) => {
        return news.value.slice(0, count);
    };

    // Inicializar al cargar
    initNews();

    return {
        news,
        isLoading,
        error,
        addNews,
        updateNews,
        deleteNews,
        getNewsById,
        getLatestNews
    };
});
