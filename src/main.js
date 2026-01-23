import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// estilos globales
import "./assets/css/reset.css";
import "./assets/css/main.css";
// import "./assets/css/animations.css"; // Removed or commented out if causing issues, but keeping file for now or deleting? User said clean code.
import "./style.css";
// fuentes e íconos
import "./assets/fonts/fontawesome-free-6.1.2-web/css/all.min.css";
import "./assets/fonts/dmsans/dmsans.css";
import "./assets/fonts/poppins/poppins.css";


import { createPinia } from 'pinia';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router).mount("#app");

