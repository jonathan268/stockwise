import api from "../api/axios";

export const suppliersService = {
    getAllSuppliers : async () => {
        const response = await api.get('/suppliers');
        return response.data;
    },

    getSupplierById : async (id) => {
        const response = await api.get(`/suppliers/${id}`);
        return response.data;
    },

    addSuppliers : async () => {
        const response = await api.post('/suppliers');
        return response.data;
    },

    

}