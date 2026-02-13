import api from '../api/axios';

export const ProductService = {
    getAllProducts : async () => {
        const response = await api.get('/produits');
        return response.data;
    },

    getProductById : async(id) => {
        const response = await api.get(`/produits/${id}`);
        return response.data;
    },

    addProduct : async(productData ) => {
        const response = await api.post('produits', productData);
        return response.data;
        },

        updateProduct : async(id, productData) => {
           const response = await api.put(`/produits/${id}`, productData);
            return response.data;
        },

        deleteProduct : async(id) =>{
            const response = await api.delete(`/produits/${id}`);
            return response.data;
        },
};