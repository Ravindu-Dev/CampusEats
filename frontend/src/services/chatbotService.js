import axios from 'axios';

const chatbotService = {
    sendMessage: async (message) => {
        const response = await axios.post('/api/chatbot/query', { message });
        return response.data;
    }
};

export default chatbotService;
