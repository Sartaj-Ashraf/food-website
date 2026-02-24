import { customFetch } from "@/utils/customFetch";

// Add Item to Cart
export const addToCart = async (itemId, itemType, quantity = 1) => {
    try {
        const { data } = await customFetch.post("/cart/add", {
            itemId,
            itemType,
            quantity,
        });
        return { data };
    } catch (error) {
        console.error("Add to cart failed:", error);
        return { error };
    }
};

// Get User's Cart
export const getCart = async () => {
    try {
        const { data } = await customFetch.get("/cart");
        return { data };
    } catch (error) {
        console.error("Get cart failed:", error);
        return { error };
    }
};

// Update Cart Item Quantity
export const updateCartItem = async (itemId, itemType, quantity) => {
    try {
        const { data } = await customFetch.put("/cart/update", {
            itemId,
            itemType,
            quantity,
        });
        return { data };
    } catch (error) {
        console.error("Update cart item failed:", error);
        return { error };
    }
};

// Remove Item from Cart
export const removeFromCart = async (itemId, itemType) => {
    try {
        const { data } = await customFetch.delete("/cart/remove", {
            data: {
                itemId,
                itemType,
            }
        });
        return { data };
    } catch (error) {
        console.error("Remove from cart failed:", error);
        return { error };
    }
};

// Clear Entire Cart
export const clearCart = async () => {
    try {
        const { data } = await customFetch.delete("/cart/clear");
        return { data };
    } catch (error) {
        console.error("Clear cart failed:", error);
        return { error };
    }
};

// Get Cart Count (for header badge)
export const getCartCount = async () => {
    try {
        const { data } = await customFetch.get("/cart/count");
        return data.quantity;
    } catch (error) {
        console.error("Get cart count failed:", error);
        return { error };
    }
};

// Validate Cart Items (before checkout)
export const validateCart = async () => {
    try {
        const { data } = await customFetch.get("/cart/validate");
        return { data };
    } catch (error) {
        console.error("Validate cart failed:", error);
        return { error };
    }
};

// local storage cart

export const additemtoCart_localstorage = async (itemId, itemType, quantity = 1) => {
    // Use consistent key name
    const cart = localStorage.getItem("cart") || "[]";
    const parsedCart = JSON.parse(cart);
    
    // Find if item already exists in cart
    const itemIndex = parsedCart.findIndex(item => 
        item.itemId === itemId && item.itemType === itemType
    );
    
    if (itemIndex > -1) {
        // Item exists - increase quantity
        parsedCart[itemIndex].quantity += quantity;
    } else {
        // Item doesn't exist - add new item
        parsedCart.push({ itemId, itemType, quantity });
    }

    // Save back to localStorage with consistent key
    localStorage.setItem("cart", JSON.stringify(parsedCart));
    
    return { data: parsedCart };
};

export const gettotalquantity_localstorage = () => {
    const cart = localStorage.getItem("cart") || "[]";
    const parsedCart = JSON.parse(cart);
    return parsedCart.reduce((total, item) => total + item.quantity, 0);
};

export const getCart_localstorage = async() => {
  try {
    const cart = localStorage.getItem("cart") || "[]";
    const parsedCart = JSON.parse(cart);
   const {data} = await customFetch.post("/cart/guest", {
    cartItems: parsedCart,
   });
   console.log({datafromgetcart:data});
   return {data};
  } catch (error) {
    console.error("Get cart failed:", error);
    return { error };
  }
};

export const updatecart_localstorage = async (itemId, itemType, quantity) => {
    try {
    const cart = localStorage.getItem("cart") || "[]";
    const parsedCart = JSON.parse(cart);
    const itemIndex = parsedCart.findIndex(item => 
        item.itemId === itemId && item.itemType === itemType
    );
    if (itemIndex > -1) {
            // Item exists - update quantity
            parsedCart[itemIndex].quantity = quantity;
                } else {
            // Item doesn't exist - add new item
            parsedCart.push({ itemId, itemType, quantity });
        }
    localStorage.setItem("cart", JSON.stringify(parsedCart));
    return { data: parsedCart };
    } catch (error) {
        console.error("Update cart failed:", error);
        return { error };
    }
};


export const removeFromCart_localstorage = async (itemId, itemType) => {
    try {
    const cart = localStorage.getItem("cart") || "[]";
    const parsedCart = JSON.parse(cart);
    const itemIndex = parsedCart.findIndex(item => 
        item.itemId === itemId && item.itemType === itemType
    );
    if (itemIndex > -1) {
            // Item exists - remove item
            parsedCart.splice(itemIndex, 1);
        }
    localStorage.setItem("cart", JSON.stringify(parsedCart));
    return { data: parsedCart };
    } catch (error) {   
        console.error("Remove from cart failed:", error);
        return { error };
    }
};
export const clearCart_localstorage = async () => {
    try {
    localStorage.removeItem("cart");
    return { data: [] };
    } catch (error) {
        console.error("Clear cart failed:", error);
        return { error };
    }
};


export const mergeGuestCartToUserCart = async () => {
    try {
        const cartitems = localStorage.getItem("cart") || "[]";
    const guestCartItems = JSON.parse(cartitems);
        const { data } = await customFetch.post("/cart/transfer", {
            guestCartItems,
        });
    localStorage.removeItem("cart");
        return { data };
    } catch (error) {
        console.error("Merge guest cart to user cart failed:", error);
        return { error };
    }   
};