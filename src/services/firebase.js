// Configuración de Firebase para Unión Jeguera
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Datos reales de tu proyecto uniojaguera
const firebaseConfig = {
    apiKey: "AIzaSyC5qVGmhL64PfrT5eSqJyBLfGOHDnEJ9HQ",
    authDomain: "uniojaguera.firebaseapp.com",
    projectId: "uniojaguera",
    storageBucket: "uniojaguera.firebasestorage.app",
    messagingSenderId: "293733644046",
    appId: "1:293733644046:web:a2af0365af4a714099c95f",
    measurementId: "G-S9LK7MF5PG"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configurar para que siempre pida elegir cuenta
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { auth, googleProvider, signInWithPopup };
