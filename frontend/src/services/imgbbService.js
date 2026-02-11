import axios from 'axios';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '';

const uploadImage = async (file) => {
    if (!IMGBB_API_KEY) {
        console.error('imgbb API key is missing');
        throw new Error('imgbb API key is missing. Please add VITE_IMGBB_API_KEY to your .env file.');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
        return response.data.data.url;
    } catch (error) {
        console.error('Error uploading to imgbb:', error);
        throw error;
    }
};

export const imgbbService = {
    uploadImage
};
