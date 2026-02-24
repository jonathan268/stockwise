import api from "../api/axios";

export const aiService = {
    getAllAnalytics : async (params = {}) =>{
        const response = await api.get('/analysis', {params});
        return response.data;
    
},

}