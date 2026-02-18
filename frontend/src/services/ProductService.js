import api from '../api/axios';

export const ProductService = {
    getAllProducts : async () => {
        const response = await api.get('/api/v1/products');
        return response.data;
    },

    getProductById : async(id) => {
        const response = await api.get(`/api/v1/products/${id}`);
        return response.data;
    },

    addProduct : async(productData ) => {
        const response = await api.post('/api/v1/products', productData);
        return response.data;
        },

        updateProduct : async(id, productData) => {
           const response = await api.put(`/api/v1/products/${id}`, productData);
            return response.data;
        },

        deleteProduct : async(id) =>{
            const response = await api.delete(`/api/v1/products/${id}`);
            return response.data;
        },
};