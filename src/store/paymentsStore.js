import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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
            const response = await apiService.request('payments', 'GET', { jugadorId });
            const data = response?.data;
            historicalPayments.value = Array.isArray(data) ? data : [];
            return historicalPayments.value;
        } catch (error) {
            console.error('Error fetching historical payments:', error);
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    const fetchAllPayments = async (params = {}) => {
        isLoading.value = true;
        try {
            const response = await apiService.request('payments', 'GET', params);
            const data = response?.data;
            historicalPayments.value = Array.isArray(data) ? data : [];
            return historicalPayments.value;
        } catch (error) {
            console.error('Error fetching all payments:', error);
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    const fetchPaymentsReport = async (month, year) => {
        isLoading.value = true;
        try {
            const response = await apiService.request('payments_report', 'GET', { month, year });
            return response?.data;
        } catch (error) {
            // Si no existe el endpoint, el componente lo manejará filtrando historicalPayments
            console.warn('Endpoint payments_report no disponible, usando histórico general');
            return null;
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

    const deletePayment = async (id) => {
        try {
            const result = await apiService.request('payments', 'DELETE', { id });
            return result;
        } catch (error) {
            console.error('Error deleting payment:', error);
            throw error;
        }
    };

    // --- NUEVAS FUNCIONALIDADES ---

    const fetchSubscriptions = async (playerId = null) => {
        const params = playerId ? { player_id: playerId } : {};
        const response = await apiService.request('subscriptions', 'GET', params);
        const data = response?.data;
        subscriptions.value = Array.isArray(data) ? data : [];
        return subscriptions.value;
    };

    const fetchBillingCalendar = async () => {
        const response = await apiService.request('billing_calendar', 'GET');
        const data = response?.data;
        billingCalendar.value = Array.isArray(data) ? data : [];
        return billingCalendar.value;
    };

    const updateBillingMonth = async (monthData) => {
        const method = monthData.id ? 'PUT' : 'POST';
        return await apiService.request('billing_calendar', method, monthData);
    };

    const fetchConventions = async (playerId = null) => {
        const params = playerId ? { player_id: playerId } : {};
        const response = await apiService.request('conventions', 'GET', params);
        const data = response?.data;
        conventions.value = Array.isArray(data) ? data : [];
        return conventions.value;
    };

    const fetchPazSalvoRequests = async (status = null) => {
        const params = status ? { status } : {};
        const response = await apiService.request('paz_salvo', 'GET', params);
        const data = response?.data;
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

    const syncFinances = async () => {
        return await apiService.request('sync_finances', 'POST');
    };

    return {
        historicalPayments,
        subscriptions,
        billingCalendar,
        conventions,
        pazSalvoRequests,
        isLoading,
        fetchPaymentsByPlayer,
        fetchAllPayments,
        fetchPaymentsReport,
        registerPayment,
        deletePayment,
        fetchSubscriptions,
        fetchBillingCalendar,
        updateBillingMonth,
        fetchConventions,
        fetchPazSalvoRequests,
        calculatePazSalvoDebt,
        submitPazSalvoRequest,
        updatePazSalvoStatus,
        syncFinances
    };
});
