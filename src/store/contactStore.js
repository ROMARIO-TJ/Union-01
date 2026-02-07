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
            // Si el servidor tiene datos, mandan sobre el LocalStorage
            if (data && typeof data === 'object' && (data.contactInfo || data.footerInfo || data.socialLinks)) {
                if (data.contactInfo) contactInfo.value = data.contactInfo;
                if (data.footerInfo) footerInfo.value = data.footerInfo;
                if (data.socialLinks) socialLinks.value = data.socialLinks;
                saveAllLocally();
            } else if (!savedContact && !savedFooter && !savedSocial) {
                // Si todo está vacío (servidor y local), guardamos los defaults iniciales
                saveAllLocally();
                saveSettingsToServer();
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
        isLoading.value = true;
        try {
            await apiService.request('settings', 'POST', {
                key: 'contact_settings',
                value: {
                    contactInfo: { ...contactInfo.value, ...newInfo },
                    footerInfo: footerInfo.value,
                    socialLinks: socialLinks.value
                }
            });
            await initContact();
        } catch (err) {
            console.error('Error updating contact info:', err);
        } finally {
            isLoading.value = false;
        }
    };

    const updateFooterInfo = async (newInfo) => {
        isLoading.value = true;
        try {
            await apiService.request('settings', 'POST', {
                key: 'contact_settings',
                value: {
                    contactInfo: contactInfo.value,
                    footerInfo: { ...footerInfo.value, ...newInfo },
                    socialLinks: socialLinks.value
                }
            });
            await initContact();
        } catch (err) {
            console.error('Error updating footer info:', err);
        } finally {
            isLoading.value = false;
        }
    };

    // Social Links CRUD
    const addSocialLink = async (link) => {
        isLoading.value = true;
        const newLinks = [...socialLinks.value, { ...link, id: Date.now() }];
        try {
            await apiService.request('settings', 'POST', {
                key: 'contact_settings',
                value: {
                    contactInfo: contactInfo.value,
                    footerInfo: footerInfo.value,
                    socialLinks: newLinks
                }
            });
            await initContact();
        } catch (err) {
            console.error('Error adding social link:', err);
        } finally {
            isLoading.value = false;
        }
    };

    const updateSocialLink = async (id, updatedLink) => {
        isLoading.value = true;
        const newLinks = socialLinks.value.map(l => l.id === id ? { ...updatedLink, id } : l);
        try {
            await apiService.request('settings', 'POST', {
                key: 'contact_settings',
                value: {
                    contactInfo: contactInfo.value,
                    footerInfo: footerInfo.value,
                    socialLinks: newLinks
                }
            });
            await initContact();
        } catch (err) {
            console.error('Error updating social link:', err);
        } finally {
            isLoading.value = false;
        }
    };

    const deleteSocialLink = async (id) => {
        isLoading.value = true;
        const newLinks = socialLinks.value.filter(l => l.id !== id);
        try {
            await apiService.request('settings', 'POST', {
                key: 'contact_settings',
                value: {
                    contactInfo: contactInfo.value,
                    footerInfo: footerInfo.value,
                    socialLinks: newLinks
                }
            });
            await initContact();
        } catch (err) {
            console.error('Error deleting social link:', err);
        } finally {
            isLoading.value = false;
        }
    };

    initContact();

    return {
        contactInfo,
        footerInfo,
        socialLinks,
        isLoading,
        initContact,
        updateContactInfo,
        updateFooterInfo,
        addSocialLink,
        updateSocialLink,
        deleteSocialLink
    };
});
