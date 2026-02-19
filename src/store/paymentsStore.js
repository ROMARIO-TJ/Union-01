import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const usePaymentsStore = defineStore('payments', () => {
    const historicalPayments = ref([]);
    const isLoading = ref(false);

    const fetchPaymentsByPlayer = async (jugadorId) => {
        isLoading.value = true;
        try {
            const data = await apiService.request('payments', 'GET', { jugadorId });
            historicalPayments.value = Array.isArray(data) ? data : [];
            return historicalPayments.value;
        } catch (error) {
            console.error('Error fetching historical payments:', error);
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    const registerPayment = async (paymentData) => {
        // Enviar al backend tabla 'payments'
        try {
            const result = await apiService.request('payments', 'POST', paymentData);
            return result.status === 'success';
        } catch (error) {
            console.error('Error registering payment:', error);
            return false;
        }
    };

    return {
        historicalPayments,
        isLoading,
        fetchPaymentsByPlayer,
        registerPayment
    };
});
