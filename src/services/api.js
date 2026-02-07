// Centralized API calls for the Union Jeguera backend

const API_BASE = import.meta.env.VITE_API_URL || '/api/api.php';
const UPLOAD_BASE = import.meta.env.VITE_UPLOAD_URL || '/api/upload.php';

export const apiService = {
    // Generic request helper
    async request(action, method = 'GET', data = null) {
        // Para máxima compatibilidad, emulamos métodos si no son GET o POST
        const effectiveMethod = (method === 'GET' || method === 'POST') ? method : 'POST';
        let url = `${API_BASE}?action=${action}`;

        if (effectiveMethod === 'POST' && method !== 'POST') {
            url += `&_method=${method}`;
        }

        if (data) {
            if (method === 'GET') {
                const params = new URLSearchParams();
                for (const key in data) {
                    if (data[key] !== null && data[key] !== undefined) {
                        params.append(key, data[key]);
                    }
                }
                const queryString = params.toString();
                if (queryString) url += `&${queryString}`;
            } else if (data.id) {
                url += `&id=${data.id}`;
            }
        }

        const options = {
            method: effectiveMethod,
            headers: { 'Content-Type': 'application/json' }
        };

        if (data && effectiveMethod === 'POST') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        let result;
        const contentType = response.headers.get("content-type");

        try {
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const text = await response.text();
                // Si el servidor devuelve HTML, es un error de configuración o de PHP
                if (text.includes('<!doctype') || text.includes('<html>')) {
                    console.error('Respuesta HTML detectada:', text.substring(0, 500));
                    throw new Error('El servidor devolvió HTML. Es posible que la ruta /backend/api.php sea incorrecta o el archivo no exista. Revisa la consola para ver el error completo.');
                }
                throw new Error(text || 'Error desconocido del servidor');
            }
        } catch (e) {
            throw new Error(e.message);
        }

        if (!response.ok || (result && result.status === 'error')) {
            throw new Error(result?.message || 'Error en la petición del servidor');
        }

        return result;
    },

    // File Upload
    async upload(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(UPLOAD_BASE, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        if (data.status === 'error') throw new Error(data.message);
        return data.url;
    }
};
