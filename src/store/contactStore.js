import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api';

export const useContactStore = defineStore('contact', () => {
    const contactInfo = ref({
        address: 'Av. Siempre Viva 123, Barrio Norte',
        phone: '+54 11 1234-5678',
        email: 'contacto@unionjeguera.com',
        showForm: true
    });

    const footerInfo = ref({
        description: 'El club del pueblo. Formando jugadores y personas desde el corazón de nuestra comunidad.',
        showMenu: true,
        showContact: true
    });

    const socialLinks = ref([
        { id: 1, platform: 'Facebook', url: 'https://facebook.com', icon: 'fa-brands fa-facebook-f' },
        { id: 2, platform: 'Instagram', url: 'https://instagram.com', icon: 'fa-brands fa-instagram' },
        { id: 3, platform: 'Twitter', url: 'https://twitter.com', icon: 'fa-brands fa-x-twitter' }
    ]);

    const isLoading = ref(false);

    const initContact = async () => {
        isLoading.value = true;

        const savedContact = localStorage.getItem('union_contact_info');
        const savedFooter = localStorage.getItem('union_footer_info');
        const savedSocial = localStorage.getItem('union_social_links');

        if (savedContact) contactInfo.value = JSON.parse(savedContact);
        if (savedFooter) footerInfo.value = JSON.parse(savedFooter);
        if (savedSocial) socialLinks.value = JSON.parse(savedSocial);

        try {
            const data = await apiService.request('settings', 'GET', { key: 'contact_settings' });
            if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                if (data.contactInfo) contactInfo.value = data.contactInfo;
                if (data.footerInfo) footerInfo.value = data.footerInfo;
                if (data.socialLinks) socialLinks.value = data.socialLinks;
                saveAllLocally();
            }
        } catch (err) {
            console.error('Error loading contact settings:', err);
        } finally {
            isLoading.value = false;
        }
    };

    const saveSettingsToServer = async () => {
        try {
            await apiService.request('settings', 'POST', {
                key: 'contact_settings',
                value: {
                    contactInfo: contactInfo.value,
                    footerInfo: footerInfo.value,
                    socialLinks: socialLinks.value
                }
            });
        } catch (err) {
            console.error('Error saving contact settings to server:', err);
        }
    };

    const saveAllLocally = () => {
        localStorage.setItem('union_contact_info', JSON.stringify(contactInfo.value));
        localStorage.setItem('union_footer_info', JSON.stringify(footerInfo.value));
        localStorage.setItem('union_social_links', JSON.stringify(socialLinks.value));
    };

    const updateContactInfo = async (newInfo) => {
        contactInfo.value = { ...contactInfo.value, ...newInfo };
        saveAllLocally();
        await saveSettingsToServer();
    };

    const updateFooterInfo = async (newInfo) => {
        footerInfo.value = { ...footerInfo.value, ...newInfo };
        saveAllLocally();
        await saveSettingsToServer();
    };

    // Social Links CRUD
    const addSocialLink = async (link) => {
        const newLink = { ...link, id: Date.now() };
        socialLinks.value.push(newLink);
        saveAllLocally();
        await saveSettingsToServer();
    };

    const updateSocialLink = async (id, updatedLink) => {
        const index = socialLinks.value.findIndex(l => l.id === id);
        if (index !== -1) {
            socialLinks.value[index] = { ...updatedLink, id };
            saveAllLocally();
            await saveSettingsToServer();
        }
    };

    const deleteSocialLink = async (id) => {
        socialLinks.value = socialLinks.value.filter(l => l.id !== id);
        saveAllLocally();
        await saveSettingsToServer();
    };

    initContact();

    return {
        contactInfo,
        footerInfo,
        socialLinks,
        isLoading,
        updateContactInfo,
        updateFooterInfo,
        addSocialLink,
        updateSocialLink,
        deleteSocialLink
    };
});
