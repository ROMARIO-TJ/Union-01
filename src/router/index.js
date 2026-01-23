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
    return { name: 'AdminLogin' };
  }

  if (to.name === 'AdminLogin' && authStore.isAuthenticated) {
    return { name: 'AdminDashboard' };
  }

  // 2. Check module access for non-admin routes
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

  // 3. Allow passage
  return true;
});

export default router;
