import { ref } from 'vue';

/**
 * Composable GLOBAL para subida de imágenes a servidor (PRODUCCIÓN)
 * ❌ NO usa Base64
 * ✅ Usa FormData + PHP
 * ✅ Retorna URL pública
 */
export function useFileUpload() {
    const isUploading = ref(false);
    const uploadError = ref(null);

    /**
     * Sube un archivo al servidor
     * @param {File} file
     * @returns {Promise<string>} URL pública del archivo
     */
    const uploadFile = async (file) => {
        isUploading.value = true;
        uploadError.value = null;

        try {
            const formData = new FormData();
            formData.append('file', file);

            // ⚠️ AJUSTA esta URL si tu backend está en otra ruta
            const response = await fetch('/api/upload.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();

            if (data.status !== 'success' || !data.url) {
                throw new Error(data.message || 'Error al subir archivo');
            }

            isUploading.value = false;
            return data.url;

        } catch (error) {
            console.error('Upload error:', error);
            uploadError.value = 'Error al subir la imagen';
            isUploading.value = false;
            throw error;
        }
    };

    return {
        uploadFile,
        isUploading,
        uploadError
    };
}
