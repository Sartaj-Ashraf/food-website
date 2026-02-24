import { customFetch } from "@/utils/customFetch";

// ========================================
// CART-BASED ORDER SERVICES
// ========================================

// Legacy functions (backward compatibility)
export const createRazorpayOrder = async (amount, addressId) => {
  try {
    const { data } = await customFetch.post("/orderPayment/razorpay/order", {
      amount,
      addressId,
    });
    return { data };
  } catch (error) {
    console.error("Create Razorpay order failed:", error);
    return { error };
  }
};

export const createOrder = async (razorpayOrderId, totalPrice, totalDiscountPrice, addressId, phone, coordinates) => {
  try {
    const { data } = await customFetch.post("/orderPayment/orders", {
      razorpayOrderId,
      totalPrice,
      totalDiscountPrice,
      addressId,
      phone,
      coordinates,
    });
    return { data };
  } catch (error) {
    console.error("Create order failed:", error);
    return { error };
  }
};

// New explicit cart functions
export const createCartRazorpayOrder = async (amount, addressId) => {
  try {
    const { data } = await customFetch.post("/orderPayment/cart/razorpay/order", {
      amount,
      addressId,
    });
    return { data };
  } catch (error) {
    console.error("Create cart Razorpay order failed:", error);
    return { error };
  }
};

export const createCartOrder = async (razorpayOrderId, totalPrice, totalDiscountPrice, addressId, phone, coordinates) => {
  try {
    const { data } = await customFetch.post("/orderPayment/cart/orders", {
      razorpayOrderId,
      totalPrice,
      totalDiscountPrice,
      addressId,
      phone,
      coordinates,
    });
    return { data };
  } catch (error) {
    console.error("Create cart order failed:", error);
    return { error };
  }
};

// ========================================
// DIRECT PURCHASE SERVICES
// ========================================

// Create Razorpay order for direct purchase (single product/combo)
export const createDirectRazorpayOrder = async (itemType, itemId, quantity, addressId) => {
  try {
    const { data } = await customFetch.post("/orderPayment/direct/razorpay/order", {
      itemType,
      itemId,
      quantity,
      addressId,
    });
    return { data };
  } catch (error) {
    console.error("Create direct Razorpay order failed:", error);
    return { error };
  }
};

// Create direct order (single product/combo purchase)
export const createDirectOrder = async (razorpayOrderId, itemType, itemId, quantity, addressId, phone, coordinates) => {
  try {
    const { data } = await customFetch.post("/orderPayment/direct/orders", {
      razorpayOrderId,
      itemType,
      itemId,
      quantity,
      addressId,
      phone,
      coordinates,
    });
    return { data };
  } catch (error) {
    console.error("Create direct order failed:", error);
    return { error };
  }
};

// ========================================
// ORDER MANAGEMENT SERVICES
// ========================================

// Get list of user orders with pagination and optional status filter
export const getUserOrders = async (page = 1, limit = 10, status = null) => {
  try {
    let url = `/orderPayment/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const { data } = await customFetch.get(url);
    return { data };
  } catch (error) {
    console.error("Get user orders failed:", error);
    return { error };
  }
};

// Get order details by order ID
export const getOrderById = async (orderId) => {
  try {
    const { data } = await customFetch.get(`/orderPayment/orders/${orderId}`);
    return { data };
  } catch (error) {
    console.error("Get order by ID failed:", error);
    return { error };
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data } = await customFetch.patch(`/orderPayment/orders/${orderId}/status`, { status });
    return { data };
  } catch (error) {
    console.error("Update order status failed:", error);
    return { error };
  }
};

// ========================================
// PAYMENT SERVICES
// ========================================

// Create payment record after payment success
export const createPayment = async (paymentData) => {
  try {
    const { data } = await customFetch.post("/orderPayment/payments", paymentData);
    return { data };
  } catch (error) {
    console.error("Create payment failed:", error);
    return { error };
  }
};

// Get payment details by payment ID
export const getPaymentById = async (paymentId) => {
  try {
    const { data } = await customFetch.get(`/orderPayment/payments/${paymentId}`);
    return { data };
  } catch (error) {
    console.error("Get payment by ID failed:", error);
    return { error };
  }
};

// ========================================
// ADDRESS VALIDATION SERVICES
// ========================================

// Validate if delivery address is within service area
export const validateDeliveryAddress = async (addressId) => {
  try {
    const { data } = await customFetch.post("/orderPayment/validate-delivery-address", {
      addressId,
    });
    return { data };
  } catch (error) {
    console.error("Validate delivery address failed:", error);
    return { error };
  }
};

// ========================================
// UTILITY SERVICES
// ========================================

// Get order summary for checkout (can be used before payment)
export const getOrderSummary = async (itemType, itemId, quantity, addressId) => {
  try {
    // This would call a summary endpoint if you create one
    // For now, you can use the direct Razorpay order creation to get pricing info
    const result = await createDirectRazorpayOrder(itemType, itemId, quantity, addressId);
    
    if (result.data) {
      return {
        data: {
          itemDetails: result.data.itemDetails,
          deliveryInfo: result.data.deliveryInfo,
          summary: {
            itemPrice: result.data.itemDetails.price,
            quantity: result.data.itemDetails.quantity,
            totalAmount: result.data.itemDetails.totalAmount,
            deliveryConfirmed: result.data.deliveryInfo.deliveryConfirmed
          }
        }
      };
    }
    
    return result;
  } catch (error) {
    console.error("Get order summary failed:", error);
    return { error };
  }
};

// ========================================
// BULK OPERATIONS (if needed)
// ========================================

// Get orders by status (useful for admin dashboard)
export const getOrdersByStatus = async (status, page = 1, limit = 10) => {
  return getUserOrders(page, limit, status);
};

// Get recent orders (last 30 days)
export const getRecentOrders = async (days = 30, page = 1, limit = 10) => {
  try {
    const { data } = await customFetch.get(`/orderPayment/orders?page=${page}&limit=${limit}&days=${days}`);
    return { data };
  } catch (error) {
    console.error("Get recent orders failed:", error);
    return { error };
  }
};

// ========================================
// ADVANCED CART OPERATIONS
// ========================================

// Get cart total and validate items before checkout
export const validateCartForCheckout = async (addressId) => {
  try {
    // This would typically call a cart validation endpoint
    // For now, you can create the cart Razorpay order to validate everything
    const { data } = await customFetch.post("/orderPayment/cart/validate", {
      addressId,
    });
    return { data };
  } catch (error) {
    console.error("Validate cart for checkout failed:", error);
    return { error };
  }
};

// ========================================
// DIRECT PURCHASE HELPERS
// ========================================

// Quick buy function (combines validation and order creation)
export const quickBuyProduct = async (productId, quantity, addressId, phone) => {
  try {
    console.log("🚀 Quick buy initiated for product:", productId);
    
    // Step 1: Create Razorpay order
    const razorpayResult = await createDirectRazorpayOrder('product', productId, quantity, addressId);
    
    if (razorpayResult.error) {
      return razorpayResult;
    }
    
    return {
      data: {
        razorpayOrderId: razorpayResult.data.razorpayOrderId,
        orderDetails: razorpayResult.data.orderDetails,
        itemDetails: razorpayResult.data.itemDetails,
        deliveryInfo: razorpayResult.data.deliveryInfo,
        quickBuy: true
      }
    };
  } catch (error) {
    console.error("Quick buy product failed:", error);
    return { error };
  }
};

// Quick buy combo function
export const quickBuyCombo = async (comboId, quantity, addressId, phone) => {
  try {
    console.log("🚀 Quick buy initiated for combo:", comboId);
    
    // Step 1: Create Razorpay order
    const razorpayResult = await createDirectRazorpayOrder('combo', comboId, quantity, addressId);
    
    if (razorpayResult.error) {
      return razorpayResult;
    }
    
    return {
      data: {
        razorpayOrderId: razorpayResult.data.razorpayOrderId,
        orderDetails: razorpayResult.data.orderDetails,
        itemDetails: razorpayResult.data.itemDetails,
        deliveryInfo: razorpayResult.data.deliveryInfo,
        quickBuy: true
      }
    };
  } catch (error) {
    console.error("Quick buy combo failed:", error);
    return { error };
  }
};

