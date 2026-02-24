import { customFetch } from "@/utils/customFetch";

// Create a new address
export const createAddress = async (addressData) => {
    try {
        const { data } = await customFetch.post('/addresses', {
            address: addressData
        });
        return {data};
    } catch (error) {
        console.error('Error creating address:', error);
        throw {error};
    }
};

// Get all addresses for the current user
export const getAllAddresses = async () => {
    try {
        const { data } = await customFetch.get('/addresses/get-all-addresses');
        return {data};
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw {error};
    }
};

// Update an existing address
export const updateAddress = async (addressId, updatedAddress) => {
    try {
        const { data } = await customFetch.patch('/addresses/update-address', {
            addressId,
            updatedAddress
        });
        return {data};
    } catch (error) {
        console.error('Error updating address:', error);
        throw {error};
    }
};

// Delete a specific address
export const deleteAddress = async (addressId) => {
    try {
        const { data } = await customFetch.delete('/addresses/delete-address', {
            data: { addressId }
        });
        return {data};
    } catch (error) {
        console.error('Error deleting address:', error);
        throw {error};
    }
};

// Delete all addresses for the current user
export const deleteAllAddresses = async () => {
    try {
        const { data } = await customFetch.delete('/addresses/delete-all-addresses');
        return {data};
    } catch (error) {
        console.error('Error deleting all addresses:', error);
        throw {error};
    }
};

// Set an address as default
export const setAddressToDefault = async (addressId) => {
    try {
        const { data } = await customFetch.patch('/addresses/set-default-address', {
            addressId
        });
        return {data};
    } catch (error) {
        console.error('Error setting address as default:', error);
        throw {error};
    }
};

// Get the default address
export const getDefaultAddress = async () => {
    try {
        const { data } = await customFetch.get('/addresses/get-default-address');
        return {data};
    } catch (error) {
        console.error('Error fetching default address:', error);
        throw {error};
    }
};