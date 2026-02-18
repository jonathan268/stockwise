import api from '../api/axios';

export const ProductService = {
    getAllProducts : async () => {
        const response = await api.get('/products');
        return response.data;
    },

    getProductById : async(id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    addProduct : async(productData ) => {
        const response = await api.post('products', productData);
        return response.data;
        },

        updateProduct : async(id, productData) => {
           const response = await api.put(`/products/${id}`, productData);
            return response.data;
        },

        deleteProduct : async(id) =>{
            const response = await api.delete(`/products/${id}`);
            return response.data;
        },
};