import { ref } from 'vue';

/**
 * Composable for handling file uploads.
 * Currently converts files to Base64 for local storage,
 * but structured to be easily replaced by an API call.
 */
export function useFileUpload() {
    const isUploading = ref(false);
    const uploadError = ref(null);

    /**
     * Process a file selected by the user.
     * @param {File} file - The file to upload.
     * @returns {Promise<string>} - The "URL" of the uploaded file (Base64 for now).
     */
    const uploadFile = async (file) => {
        isUploading.value = true;
        uploadError.value = null;

        try {
            // Logic for current Phase (Local Storage / Base64)
            const base64Url = await fileToBase64(file);

            // LOGIC FOR FUTURE PHASE (API):
            // const formData = new FormData();
            // formData.append('file', file);
            // const response = await fetch('/api/upload', { method: 'POST', body: formData });
            // const data = await response.json();
            // return data.url;

            isUploading.value = false;
            return base64Url;
        } catch (err) {
            isUploading.value = false;
            uploadError.value = 'Error al procesar el archivo';
            throw err;
        }
    };

    /**
     * Helper to convert a File to a Base64 string.
     */
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    return {
        uploadFile,
        isUploading,
        uploadError
    };
}
