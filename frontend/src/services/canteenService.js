import axios from 'axios';

const API_URL = '/api/canteens/';

const getAuthHeaders = () => {
    const canteenOwner = JSON.parse(localStorage.getItem('canteenOwner'));
    return canteenOwner ? { Authorization: `Bearer ${canteenOwner.token}` } : {};
};

const getMyCanteen = async (ownerId) => {
    const response = await axios.get(API_URL + 'owner/' + ownerId, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const updateCanteen = async (id, canteenData) => {
    const response = await axios.put(API_URL + id, canteenData, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const uploadLogo = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(API_URL + id + '/upload-logo', formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const uploadBanner = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(API_URL + id + '/upload-banner', formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const uploadGallery = async (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await axios.post(API_URL + id + '/upload-gallery', formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const uploadDocuments = async (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await axios.post(API_URL + id + '/upload-documents', formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const canteenService = {
    getMyCanteen,
    updateCanteen,
    uploadLogo,
    uploadBanner,
    uploadGallery,
    uploadDocuments,
};

export default canteenService;
