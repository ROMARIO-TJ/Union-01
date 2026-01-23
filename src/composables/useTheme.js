import { ref, onMounted } from 'vue';

const isDarkMode = ref(false);

export function useTheme() {
    const toggleDarkMode = () => {
        console.log('Toggling dark mode. Current value:', isDarkMode.value);
        isDarkMode.value = !isDarkMode.value;
        console.log('New value:', isDarkMode.value);
        updateBodyClass();
        localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    };

    const updateBodyClass = () => {
        console.log('Updating body class. isDarkMode:', isDarkMode.value);
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark');
            console.log('Added .dark class to html');
        } else {
            document.documentElement.classList.remove('dark');
            console.log('Removed .dark class from html');
        }
    };

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            isDarkMode.value = true;
        } else if (savedTheme === 'light') {
            isDarkMode.value = false;
        } else {
            // Check system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            isDarkMode.value = prefersDark;
        }
        updateBodyClass();
    };

    onMounted(() => {
        initTheme();
    });

    return {
        isDarkMode,
        toggleDarkMode
    };
}
