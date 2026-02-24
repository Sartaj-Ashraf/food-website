import { customFetch } from "@/utils/customFetch";

export const getAllTestimonials = async ({ pageParam = 1 }) => {
    try {
        const { data } = await customFetch.get(`/testimonials?page=${pageParam}&limit=10`);
        console.log({ data })
        if (data?.status === 'success') {
            return data;
        }
    } catch (error) {
        console.log(error);
    }
    return [];
}

export const getFeaturedTestimonials = async () => {
    try {
        const { data } = await customFetch.get("/testimonials/featured-testimonials");
        if (data?.status === 'success') {
            return data?.testimonials;
        }
    } catch (error) {
        console.log(error);
    }
    return [];
}

export const getTestimonialById = async (id) => {
    try {
        const { data } = await customFetch.get(`/testimonials/${id}`);
        if (data?.status === 'success') {
            return data?.testimonial;
        }
    } catch (error) {
        console.log(error);
    }
    return null;
}

export const createTestimonial = async (payload) => {
    try {
        const { data } = await customFetch.post("/testimonials", payload);
        if (data?.status === 'success') {
            return data;
        }
    } catch (error) {
        console.log(error);
    }
    return null;
}