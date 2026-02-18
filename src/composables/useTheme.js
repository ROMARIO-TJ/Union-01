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
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        // Default to false (light) unless explicitly saved as dark
        isDarkMode.value = savedTheme === 'dark';
        updateBodyClass();
    };

    // Run initialization immediately to avoid flickers
    initTheme();

    onMounted(() => {
        // Double check on mount
        updateBodyClass();
    });

    return {
        isDarkMode,
        toggleDarkMode
    };
}
