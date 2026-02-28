import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const usePaymentsStore = defineStore('payments', () => {
    const historicalPayments = ref([]);
    const subscriptions = ref([]);
    const billingCalendar = ref([]);
    const conventions = ref([]);
    const pazSalvoRequests = ref([]);
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
        try {
            const result = await apiService.request('payments', 'POST', paymentData);
            return result;
        } catch (error) {
            console.error('Error registering payment:', error);
            throw error;
        }
    };

    // --- NUEVAS FUNCIONALIDADES ---

    const fetchSubscriptions = async (playerId = null) => {
        const params = playerId ? { player_id: playerId } : {};
        const data = await apiService.request('subscriptions', 'GET', params);
        subscriptions.value = Array.isArray(data) ? data : [];
        return subscriptions.value;
    };

    const fetchBillingCalendar = async () => {
        const data = await apiService.request('billing_calendar', 'GET');
        billingCalendar.value = Array.isArray(data) ? data : [];
        return billingCalendar.value;
    };

    const updateBillingMonth = async (monthData) => {
        const method = monthData.id ? 'PUT' : 'POST';
        return await apiService.request('billing_calendar', method, monthData);
    };

    const fetchConventions = async (playerId = null) => {
        const params = playerId ? { player_id: playerId } : {};
        const data = await apiService.request('conventions', 'GET', params);
        conventions.value = Array.isArray(data) ? data : [];
        return conventions.value;
    };

    const fetchPazSalvoRequests = async (status = null) => {
        const params = status ? { status } : {};
        const data = await apiService.request('paz_salvo', 'GET', params);
        pazSalvoRequests.value = Array.isArray(data) ? data : [];
        return pazSalvoRequests.value;
    };

    const calculatePazSalvoDebt = async (playerId, monthlyDebt = 0) => {
        const result = await apiService.request('paz_salvo', 'POST', { 
            player_id: playerId, 
            monthly_debt: monthlyDebt,
            only_calculate: true 
        });
        return result.data;
    };

    const submitPazSalvoRequest = async (requestData) => {
        return await apiService.request('paz_salvo', 'POST', requestData);
    };

    const updatePazSalvoStatus = async (id, statusData) => {
        return await apiService.request('paz_salvo', 'PUT', { id, ...statusData });
    };

    return {
        historicalPayments,
        subscriptions,
        billingCalendar,
        conventions,
        pazSalvoRequests,
        isLoading,
        fetchPaymentsByPlayer,
        registerPayment,
        fetchSubscriptions,
        fetchBillingCalendar,
        updateBillingMonth,
        fetchConventions,
        fetchPazSalvoRequests,
        calculatePazSalvoDebt,
        submitPazSalvoRequest,
        updatePazSalvoStatus
    };
});
