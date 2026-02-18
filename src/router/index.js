import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Club from "../views/Club.vue";
import Categoria from "../views/Categoria.vue";
import Galeria from "../views/Galeria.vue";
import Noticias from "../views/Noticias.vue";
import NoticiaDetalle from "../views/NoticiaDetalle.vue";
import Contacto from "../views/Contacto.vue";

import { useAuthStore } from "../store/authStore";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/club",
    name: "Club",
    component: Club,
  },
  {
    path: "/categoria",
    name: "Categoria",
    component: Categoria,
  },
  {
    path: "/galeria",
    name: "Galeria",
    component: Galeria,
  },
  {
    path: "/noticias",
    name: "Noticias",
    component: Noticias,
  },
  {
    path: "/noticias/:id",
    name: "NoticiaDetalle",
    component: NoticiaDetalle,
  },
  {
    path: "/contacto",
    name: "Contacto",
    component: Contacto,
  },
  {
    path: "/partidos",
    name: "Partidos",
    component: () => import("../views/Partidos.vue"), // Lazy load
  },
  {
    path: "/portal-padres",
    name: "PortalPadres",
    component: () => import("../views/PortalPadres.vue"),
  },
  // ADMIN ROUTES
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("../views/admin/Login.vue"),
  },
  {
    path: "/admin",
    component: () => import("../components/admin/AdminLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("../views/admin/Dashboard.vue"),
      },
      {
        path: "news",
        name: "AdminNews",
        component: () => import("../views/admin/NewsManager.vue"),
      },
      {
        path: "matches",
        name: "AdminMatches",
        component: () => import("../views/admin/MatchesManager.vue"),
      },
      {
        path: "standings",
        name: "AdminStandings",
        component: () => import("../views/admin/StandingsManager.vue"),
      },
      {
        path: "gallery",
        name: "AdminGallery",
        component: () => import("../views/admin/GalleryManager.vue"),
      },
      {
        path: "sponsors",
        name: "AdminSponsors",
        component: () => import("../views/admin/SponsorsManager.vue"),
      },
      {
        path: "players",
        name: "AdminPlayers",
        component: () => import("../views/admin/PlayersManager.vue"),
      },
      {
        path: "club",
        name: "AdminClub",
        component: () => import("../views/admin/ClubManager.vue"),
      },
      {
        path: "home-settings",
        name: "AdminHomeSettings",
        component: () => import("../views/admin/HomeSettingsManager.vue"),
      },
      {
        path: "categories",
        name: "AdminCategories",
        component: () => import("../views/admin/CategoryManager.vue"),
      },
      {
        path: "contact",
        name: "AdminContact",
        component: () => import("../views/admin/ContactManager.vue"),
      },
      {
        path: "footer",
        name: "AdminFooter",
        component: () => import("../views/admin/FooterManager.vue"),
      },
      {
        path: "modules",
        name: "AdminModules",
        component: () => import("../views/admin/ModulesManager.vue"),
      },
      // FINANCIERO ROUTES
      {
        path: "financiero/pagos",
        name: "FinancieroPagos",
        component: () => import("../views/admin/financiero/Pagos.vue"),
      },
      {
        path: "financiero/paz-y-salvo",
        name: "FinancieroPazYSalvo",
        component: () => import("../views/admin/financiero/PazySalvo.vue"),
      },
      {
        path: "financiero/reportes",
        name: "FinancieroReportes",
        component: () => import("../views/admin/financiero/Reportes.vue"),
      },
      // PORTAL PADRE ROUTES
      {
        path: "portal/hijo",
        name: "PortalHijo",
        component: () => import("../views/admin/portal/MiHijo.vue"),
      },
      {
        path: "portal/pagos",
        name: "PortalPagos",
        component: () => import("../views/admin/financiero/Pagos.vue"), // Placeholder
      },
      {
        path: "portal/paz-y-salvo",
        name: "PortalPazYSalvo",
        component: () => import("../views/admin/financiero/PazySalvo.vue"), // Placeholder
      },
      {
        path: "portal/inscripcion",
        name: "PortalInscripcion",
        redirect: "/admin/portal/hijo" // MiHijo.vue maneja la inscripción internamente
      },

    ]
  },
  {
    path: "/inscripcion",
    name: "Inscripcion",
    component: () => import("../views/Inscripcion.vue"),
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  },
});

// Navigation Guard
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // 1. Check authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    // Si es una ruta del portal de padres, mandar al portal público
    if (to.path.startsWith('/admin/portal')) {
      return { name: 'PortalPadres' };
    }
    return { name: 'AdminLogin' };
  }

  if (to.name === 'AdminLogin' && authStore.isAuthenticated) {
    // Si es padre, mandarlo a su portal
    if (authStore.user?.role === 'padre_familia') {
      return { path: '/admin/portal/hijo' };
    }
    return { name: 'AdminDashboard' };
  }

  // Redirigir padres ya logueados fuera del portal de login
  if (to.name === 'PortalPadres' && authStore.isAuthenticated) {
    if (authStore.user?.role === 'padre_familia') {
      return { path: '/admin/portal/hijo' };
    }
    return { name: 'AdminDashboard' };
  }

  // 3. Proteger rutas admin de padres de familia
  if (authStore.isAuthenticated && authStore.user?.role === 'padre_familia') {
    // Si la ruta es administrativa (/admin...) pero NO es del portal, bloquear
    if (to.path.startsWith('/admin') && !to.path.startsWith('/admin/portal')) {
      return { path: '/admin/portal/hijo' };
    }
  }

  // 4. Check module access for non-admin routes
  if (!to.path.startsWith('/admin')) {
    try {
      // Dynamic import to avoid circular dependency
      const { useGlobalSettingsStore } = await import('../store/globalSettingsStore');
      const globalSettings = useGlobalSettingsStore();

      if (!globalSettings.canAccessRoute(to.path)) {
        return { name: 'Home' };
      }
    } catch (error) {
      console.error('Error checking route access:', error);
    }
  }

  // 5. Allow passage
  return true;
});

export default router;
