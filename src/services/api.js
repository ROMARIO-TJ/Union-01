// Centralized API calls for the Union Jeguera backend

const API_BASE = import.meta.env.VITE_API_URL || '/api/api.php';
const UPLOAD_BASE = import.meta.env.VITE_UPLOAD_URL || '/api/upload.php';

export const apiService = {
    // Generic request helper
    async request(action, method = 'GET', data = null) {
        let url = `${API_BASE}?action=${action}`;

        if (data) {
            if (method === 'GET') {
                // Convert data object to query params
                const params = new URLSearchParams();
                for (const key in data) {
                    if (data[key] !== null && data[key] !== undefined) {
                        params.append(key, data[key]);
                    }
                }
                const queryString = params.toString();
                if (queryString) {
                    url += `&${queryString}`;
                }
            } else if ((method === 'DELETE' || method === 'PATCH' || method === 'PUT') && data.id) {
                // Legacy support: some delete/update calls rely on &id=... in URL
                url += `&id=${data.id}`;
            }
        }

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && method !== 'GET' && method !== 'DELETE') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
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
