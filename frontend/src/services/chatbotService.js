import axios from 'axios';

const chatbotService = {
    sendMessage: async (message, history = []) => {
        const response = await axios.post('/api/chatbot/query', { message, history });
        return response.data;
    }
};

export default chatbotService;
