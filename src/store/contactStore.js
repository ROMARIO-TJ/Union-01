import { defineStore } from 'pinia';
import { ref } from 'vue';

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

    const initContact = () => {
        const savedContact = localStorage.getItem('union_contact_info');
        const savedFooter = localStorage.getItem('union_footer_info');
        const savedSocial = localStorage.getItem('union_social_links');

        if (savedContact) {
            const parsed = JSON.parse(savedContact);
            contactInfo.value = { ...contactInfo.value, ...parsed };
        }
        if (savedFooter) {
            const parsed = JSON.parse(savedFooter);
            footerInfo.value = { ...footerInfo.value, ...parsed };
        }
        if (savedSocial) socialLinks.value = JSON.parse(savedSocial);

        if (!savedContact && !savedFooter && !savedSocial) {
            saveAll();
        }
    };

    const saveAll = () => {
        localStorage.setItem('union_contact_info', JSON.stringify(contactInfo.value));
        localStorage.setItem('union_footer_info', JSON.stringify(footerInfo.value));
        localStorage.setItem('union_social_links', JSON.stringify(socialLinks.value));
    };

    const updateContactInfo = (newInfo) => {
        contactInfo.value = { ...contactInfo.value, ...newInfo };
        localStorage.setItem('union_contact_info', JSON.stringify(contactInfo.value));
    };

    const updateFooterInfo = (newInfo) => {
        footerInfo.value = { ...footerInfo.value, ...newInfo };
        localStorage.setItem('union_footer_info', JSON.stringify(footerInfo.value));
    };

    // Social Links CRUD
    const addSocialLink = (link) => {
        const newLink = {
            ...link,
            id: Date.now()
        };
        socialLinks.value.push(newLink);
        localStorage.setItem('union_social_links', JSON.stringify(socialLinks.value));
    };

    const updateSocialLink = (id, updatedLink) => {
        const index = socialLinks.value.findIndex(l => l.id === id);
        if (index !== -1) {
            socialLinks.value[index] = { ...updatedLink, id };
            localStorage.setItem('union_social_links', JSON.stringify(socialLinks.value));
        }
    };

    const deleteSocialLink = (id) => {
        socialLinks.value = socialLinks.value.filter(l => l.id !== id);
        localStorage.setItem('union_social_links', JSON.stringify(socialLinks.value));
    };

    initContact();

    return {
        contactInfo,
        footerInfo,
        socialLinks,
        updateContactInfo,
        updateFooterInfo,
        addSocialLink,
        updateSocialLink,
        deleteSocialLink
    };
});
