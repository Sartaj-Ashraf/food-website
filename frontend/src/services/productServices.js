import { customFetch } from "@/utils/customFetch";

export const fetchProducts = async (params) => {
    try {
        const {data} = await customFetch.get('/products/all', {
            params,
        });
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};