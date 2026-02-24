import crypto from "crypto";
import Order from '../models/orderModel.js';
import Payment from '../models/paymentModel.js';
import Cart from '../models/cartModel.js';
import WalnutFudgeProduct from '../models/productModel.js';
import WalnutFudgeCombo from '../models/comboModel.js';
import MoonlightAddress from '../models/addressModel.js';
import ServiceArea from '../models/serviceAreaModel.js';
import sendOrderConfirmationEmail from '../utils/sendOrderConfirmationEmail.js';
import sendOrderUpdateEmail from '../utils/sendOrderUpdateEmail.js';
import sendOrderNotificationToAdmin from '../utils/sendOrderNotificationToAdmin.js';
import User from '../models/userModel.js';

import { getPaginationParams, getPaginationInfo } from '../utils/pagination.js';
import { instance } from '../server.js'; // Razorpay instance

// ========================================
// HELPER FUNCTIONS
// ========================================

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper function to check if address is within service area
const checkServiceAreaDelivery = async (coordinates, orderType = 'order') => {
  try {
    console.log(`🌍 ${orderType}: Checking service area for coordinates:`, coordinates);
    
    const serviceAreas = await ServiceArea.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [coordinates.lng, coordinates.lat] // GeoJSON format [lng, lat]
          },
          $maxDistance: 50000 // Maximum 50km search radius
        }
      }
    });

    console.log(`📍 ${orderType}: Found service areas:`, serviceAreas.length);

    for (let area of serviceAreas) {
      const distance = calculateDistance(
        coordinates.lat,
        coordinates.lng,
        area.location.coordinates[1], // service area latitude
        area.location.coordinates[0]  // service area longitude
      );
      
      console.log(`📏 ${orderType}: Distance to ${area.address}: ${distance.toFixed(2)}km (max: ${area.deliveryRadius}km)`);
      
      if (distance <= area.deliveryRadius) {
        return {
          isServiced: true,
          serviceArea: area,
          distance: distance
        };
      }
    }

    return {
      isServiced: false,
      nearestArea: serviceAreas.length > 0 ? serviceAreas[0] : null,
      serviceAreas: serviceAreas
    };
    
  } catch (error) {
    console.error(`❌ ${orderType}: Service area check error:`, error);
    return { isServiced: true, error: error.message };
  }
};

// Mark cart as converted after successful payment
const markCartConverted = async (userId) => {
  try {
    await Cart.findOneAndUpdate(
      { userId, status: 'active' },
      { status: 'converted' }
    );
    console.log("✅ Cart marked as converted for user:", userId);
  } catch (error) {
    console.error("❌ Error marking cart as converted:", error);
  }
};

// ========================================
// CART ORDER CONTROLLERS
// ========================================

// Create Razorpay order from cart
export const createCartRazorpayOrder = async (req, res) => {
  try {
    const { amount, addressId } = req.body;
    const userId = req.user.userId;
    
    console.log("🛒 Cart Order: Creating Razorpay order for user:", userId);

    // Validate amount and address
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid amount is required" 
      });
    }

    if (!addressId) {
      return res.status(400).json({ 
        success: false, 
        message: "Delivery address is required" 
      });
    }

    // Check if user has active cart
    const cart = await Cart.findOne({ userId, status: "active" }).populate({
      path: 'items.itemId',
      select: 'title name slug price discountPrice comboPrice images description quantity numberOfPieces tags',
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // Find and validate address
    const address = await MoonlightAddress.findById(addressId);
    if (!address) {
      return res.status(404).json({ 
        success: false, 
        message: "Delivery address not found" 
      });
    }

    // Check service area delivery
    const addressCoordinates = {
      lat: address.location.coordinates[1],
      lng: address.location.coordinates[0]
    };

    const serviceAreaCheck = await checkServiceAreaDelivery(addressCoordinates, 'Cart Order');
    
    if (!serviceAreaCheck.isServiced && !serviceAreaCheck.error) {
      return res.status(400).json({
        success: false,
        message: "The selected delivery address is outside our current service areas. Please choose a different address or contact support.",
        deliveryAddress: {
          address: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode
        },
        nearestServiceArea: serviceAreaCheck.nearestArea ? {
          address: serviceAreaCheck.nearestArea.address,
          maxDeliveryRadius: serviceAreaCheck.nearestArea.deliveryRadius
        } : null
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `cart_order_${Date.now()}`,
      notes: {
        purchaseType: 'cart',
        userId: userId.toString(),
        cartItemsCount: cart.items.length.toString(),
        addressId: addressId,
        deliveryCity: address.city,
        deliveryState: address.state,
        serviceArea: serviceAreaCheck.serviceArea?.address || 'Unknown'
      }
    };

    const razorpayOrder = await instance.orders.create(options);
    console.log("✅ Cart Order: Razorpay order created:", razorpayOrder.id);

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      orderDetails: razorpayOrder,
      cartInfo: {
        itemsCount: cart.items.length,
        totalAmount: amount
      },
      deliveryInfo: {
        address: {
          address: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode
        },
        serviceArea: serviceAreaCheck.serviceArea ? {
          name: serviceAreaCheck.serviceArea.address,
          distance: serviceAreaCheck.distance?.toFixed(2) + ' km',
          deliveryRadius: serviceAreaCheck.serviceArea.deliveryRadius + ' km'
        } : null,
        deliveryConfirmed: serviceAreaCheck.isServiced
      }
    });

  } catch (error) {
    console.error("❌ Cart Order: Razorpay order creation error:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid address ID format" 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create payment order"
    });
  }
};

// Create order from cart
export const createCartOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      razorpayOrderId, 
      totalPrice, 
      totalDiscountPrice, 
      addressId, 
      phone, 
      coordinates,
      deliveryCharge = parseInt(process.env.DELIVERY_CHARGE) || 150
    } = req.body;

    console.log("🔨 Cart Order: Creating order from cart for user:", userId);

    if (!razorpayOrderId || !addressId || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Razorpay order ID, address ID, and phone are required" 
      });
    }

    // Get user's active cart
    const cart = await Cart.findOne({ userId, status: "active" }).populate({
      path: 'items.itemId',
      select: 'title name slug price discountPrice comboPrice images description quantity numberOfPieces tags',
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cart is empty" 
      });
    }

    // Get address and user info
    const address = await MoonlightAddress.findById(addressId);
    const user = await User.findById(userId);
    
    if (!address) {
      return res.status(404).json({ 
        success: false, 
        message: "Address not found" 
      });
    }

    // Transform cart items to order items
    const orderItems = cart.items.map((item) => ({
      itemType: item.itemType,
      itemId: item.itemId._id,
      quantity: item.quantity,
      title: item.itemId.title || item.itemId.name || '',
      slug: item.itemId.slug || '',
      price: item.itemId.price || null,
      discountPrice: item.itemId.discountPrice || null,
      comboPrice: item.itemId.comboPrice || null,
      images: item.itemId.images || [],
      description: item.itemId.description || '',
      quantityLabel: item.itemId.quantity || '',
      numberOfPieces: item.itemId.numberOfPieces || null,
      tags: item.itemType === 'combo' ? item.itemId.tags || [] : [],
    }));

    // Create order with delivery charges
    const order = new Order({
      userId,
      address: {
        address: address.address,
        location: address.location,
        isDefault: address.isDefault,
        coordinates: coordinates || [address.location.coordinates[0], address.location.coordinates[1]],
      },
      phone,
      items: orderItems,
      status: "pending",
      totalPrice,
      totalDiscountPrice,
      deliveryCharge,  // NEW: Store delivery charge
      finalTotal: totalDiscountPrice  // NEW: Store final total
    });

    await order.save();
    console.log("✅ Cart Order: Order created successfully:", order._id);

    // Send emails
    if (user && user.email) {
      try {
        // Send customer confirmation email
        await sendOrderConfirmationEmail({
          customerName: user.fullName || 'Customer',
          customerEmail: user.email,
          order: order,
          payment: null // Will be added when payment is processed
        });
        console.log("📧 Customer order confirmation email sent successfully");

        // Send admin notification email
        await sendOrderNotificationToAdmin({
          order: order,
          customer: user,
          payment: null
        });
        console.log("📧 Admin order notification email sent successfully");
        
      } catch (emailError) {
        console.error("📧 Failed to send emails:", emailError);
        // Don't fail the order creation if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: "Cart order created successfully",
      order,
      razorpayOrderId,
      purchaseType: 'cart'
    });

  } catch (error) {
    console.error("❌ Cart Order: Creation error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create cart order"
    });
  }
};


// ========================================
// DIRECT ORDER CONTROLLERS  
// ========================================

// Create Razorpay order for direct purchase (single product or combo)
export const createDirectRazorpayOrder = async (req, res) => {
  try {
    const { itemType, itemId, quantity, addressId } = req.body;
    console.log("🛒 Direct Order: Creating Razorpay order for:", { itemType, itemId, quantity });

    // Validate input
    if (!itemType || !itemId || !quantity || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Item type, item ID, quantity, and delivery address are required"
      });
    }

    if (!['product', 'combo'].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item type. Must be 'product' or 'combo'"
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0"
      });
    }

    // Find the item based on type
    let item;
    let itemPrice;

    if (itemType === 'product') {
      item = await WalnutFudgeProduct.findById(itemId);
      itemPrice = item?.discountPrice || item?.price;
    } else {
      item = await WalnutFudgeCombo.findById(itemId).populate('products.productId');
      itemPrice = item?.comboPrice;
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${itemType} not found`
      });
    }

    if (!item.isActive || item.status !== 'in_stock') {
      return res.status(400).json({
        success: false,
        message: `${itemType} is not available for purchase`
      });
    }

    // Calculate total amount
    const totalAmount = itemPrice * quantity + parseInt(process.env.DELIVERY_CHARGE) || 150;

    // Find and validate address
    const address = await MoonlightAddress.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found"
      });
    }

    // Check service area delivery
    const addressCoordinates = {
      lat: address.location.coordinates[1], // latitude from GeoJSON
      lng: address.location.coordinates[0]  // longitude from GeoJSON
    };

    const serviceAreaCheck = await checkServiceAreaDelivery(addressCoordinates, 'Direct Order');
    
    if (!serviceAreaCheck.isServiced && !serviceAreaCheck.error) {
      return res.status(400).json({
        success: false,
        message: "The selected delivery address is outside our current service areas. Please choose a different address or contact support.",
        deliveryAddress: {
          address: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode
        },
        nearestServiceArea: serviceAreaCheck.nearestArea ? {
          address: serviceAreaCheck.nearestArea.address,
          maxDeliveryRadius: serviceAreaCheck.nearestArea.deliveryRadius
        } : null
      });
    }

    // Create Razorpay order
    const options = {
      amount: totalAmount * 100, // amount in paise
      currency: "INR",
      receipt: `direct_${itemType}_${Date.now()}`,
      notes: {
        purchaseType: 'direct',
        itemType: itemType,
        itemId: itemId.toString(),
        itemName: item.title || item.name,
        quantity: quantity.toString(),
        addressId: addressId,
        deliveryCity: address.city,
        deliveryState: address.state,
        serviceArea: serviceAreaCheck.serviceArea?.address || 'Unknown'
      }
    };

    const razorpayOrder = await instance.orders.create(options);
    console.log("✅ Direct Order: Razorpay order created:", razorpayOrder.id);

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      orderDetails: razorpayOrder,
      itemDetails: {
        type: itemType,
        id: itemId,
        name: item.title || item.name,
        price: itemPrice,
        quantity: quantity,
        totalAmount: totalAmount
      },
      deliveryInfo: {
        address: {
          address: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode
        },
        serviceArea: serviceAreaCheck.serviceArea ? {
          name: serviceAreaCheck.serviceArea.address,
          distance: serviceAreaCheck.distance?.toFixed(2) + ' km',
          deliveryRadius: serviceAreaCheck.serviceArea.deliveryRadius + ' km'
        } : null,
        deliveryConfirmed: serviceAreaCheck.isServiced
      }
    });

  } catch (error) {
    console.error("❌ Direct Order: Razorpay order creation error:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order"
    });
  }
};

// Create direct order (non-cart purchase)
// Create direct order (non-cart purchase)
export const createDirectOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      razorpayOrderId, 
      itemType, 
      itemId, 
      quantity, 
      addressId, 
      phone, 
      coordinates,
      deliveryCharge = parseInt(process.env.DELIVERY_CHARGE) || 150
    } = req.body;

    console.log("🔨 Direct Order: Creating order for user:", userId);

    // Validate required fields
    if (!razorpayOrderId || !itemType || !itemId || !quantity || !addressId || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required for direct order creation"
      });
    }

    // Find the item
    let item;
    if (itemType === 'product') {
      item = await WalnutFudgeProduct.findById(itemId);
    } else {
      item = await WalnutFudgeCombo.findById(itemId).populate('products.productId');
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${itemType} not found`
      });
    }

    // Find address and user info
    const address = await MoonlightAddress.findById(addressId);
    const user = await User.findById(userId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Calculate prices
    const itemPrice = itemType === 'product' ? 
      (item.discountPrice || item.price) : 
      item.comboPrice;
    
    const itemTotal = itemPrice * quantity;
    const totalPrice = item.price ? item.price * quantity : itemTotal;
    const finalTotal = itemTotal + deliveryCharge;

    // Create order item
    const orderItem = {
      itemType: itemType,
      itemId: item._id,
      quantity: quantity,
      title: item.title || item.name || '',
      slug: item.slug || '',
      price: item.price || null,
      discountPrice: item.discountPrice || null,
      comboPrice: item.comboPrice || null,
      images: item.images || [],
      description: item.description || '',
      quantityLabel: item.quantity || '',
      numberOfPieces: item.numberOfPieces || null,
      tags: itemType === 'combo' ? (item.tags || []) : [],
    };

    // Create order with delivery charges
    const order = new Order({
      userId,
      address: {
        address: address.address,
        location: address.location,
        isDefault: address.isDefault,
        coordinates: coordinates || [address.location.coordinates[0], address.location.coordinates[1]],
      },
      phone,
      items: [orderItem], // Single item for direct purchase
      status: "pending",
      totalPrice: totalPrice + deliveryCharge,
      totalDiscountPrice: finalTotal,  // Total including delivery
      deliveryCharge,  // NEW: Store delivery charge
      finalTotal  // NEW: Store final total
    });

    await order.save();
    console.log("✅ Direct Order: Order created successfully:", order._id);

    // Send emails
    if (user && user.email) {
      try {
        // Send customer confirmation email
        await sendOrderConfirmationEmail({
          customerName: user.fullName || 'Customer',
          customerEmail: user.email,
          order: order,
          payment: null // Will be added when payment is processed
        });
        console.log("📧 Direct order confirmation email sent successfully");

        // Send admin notification email
        await sendOrderNotificationToAdmin({
          order: order,
          customer: user,
          payment: null
        });
        console.log("📧 Admin order notification email sent successfully");
        
      } catch (emailError) {
        console.error("📧 Failed to send emails:", emailError);
        // Don't fail the order creation if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: "Direct order created successfully",
      order,
      razorpayOrderId,
      purchaseType: 'direct'
    });

  } catch (error) {
    console.error("❌ Direct Order: Creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create direct order"
    });
  }
};
;

// ========================================
// LEGACY CONTROLLERS (For backward compatibility)
// ========================================

// Legacy createRazorpayOrder (maps to cart order for backward compatibility)
export const createRazorpayOrder = createCartRazorpayOrder;

// Legacy createOrder (maps to cart order for backward compatibility)
export const createOrder = createCartOrder;

// ========================================
// PAYMENT CONTROLLERS
// ========================================

// Create payment record (used by both direct and cart purchases)
export const createPayment = async (req, res) => {
  try {
    const {
      customerId,
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      status,
    } = req.body;

    console.log("💳 Creating payment record for order:", orderId);

    const payment = new Payment({
      customerId,
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      status,
    });

    await payment.save();

    // Link payment to order
    const order = await Order.findByIdAndUpdate(orderId, { paymentId: payment._id }, { new: true });

    // Mark cart as converted if this is a successful cart purchase
    if (status === "Success" && order) {
      // Check if this was a cart purchase by looking at the original razorpay order notes
      try {
        const razorpayOrder = await instance.orders.fetch(razorpay_order_id);
        if (razorpayOrder.notes?.purchaseType === 'cart') {
          await markCartConverted(order.userId);
        }
      } catch (error) {
        console.log("Could not fetch Razorpay order notes, skipping cart conversion check");
      }
    }

    console.log("✅ Payment record created successfully:", payment._id);

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
      order,
    });
  } catch (error) {
    console.error("❌ Payment creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment record"
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("❌ Get payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment"
    });
  }
};

// ========================================
// ORDER MANAGEMENT CONTROLLERS
// ========================================

// Get orders by user with pagination and optional status filter
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, status } = req.query;
    const query = { userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('paymentId')
      .exec();

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get order by ID for user
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, userId }).populate('paymentId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status (admin or user)
// Update order status (admin or user)
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Get the current order to check previous status
    const currentOrder = await Order.findById(orderId).populate('userId');
    
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const previousStatus = currentOrder.status;

    // Update the order
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    await sendOrderNotificationToAdmin({
      order: order,
      customer: {
        fullName: 'Customer',
        email: 'aquib@gmail.com',
        phoneNumber: '8899000000',
      },
      payment: null
    });
    // Send order update email if status changed and user has email
    if (previousStatus !== status && currentOrder.userId && currentOrder.userId.email) {
      try {
        await sendOrderUpdateEmail({
          customerName: currentOrder.userId.fullName || 'Customer',
          customerEmail: currentOrder.userId.email,
          order: order,
          newStatus: status,
          previousStatus: previousStatus
        });
        console.log(`📧 Order status update email sent: ${previousStatus} → ${status}`);
      } catch (emailError) {
        console.error("📧 Failed to send order update email:", emailError);
        // Don't fail the status update if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// ADDRESS VALIDATION CONTROLLERS
// ========================================

// Validate delivery address before checkout
export const validateDeliveryAddress = async (req, res) => {
  try {
    const { addressId } = req.body;
    
    if (!addressId) {
      return res.status(400).json({ 
        success: false, 
        message: "Address ID is required" 
      });
    }

    // Find address
    const address = await MoonlightAddress.findById(addressId);
    if (!address) {
      return res.status(404).json({ 
        success: false, 
        message: "Address not found" 
      });
    }

    // Check service area
    const addressCoordinates = {
      lat: address.location.coordinates[1], // latitude from GeoJSON
      lng: address.location.coordinates[0]  // longitude from GeoJSON
    };

    const serviceAreaCheck = await checkServiceAreaDelivery(addressCoordinates, 'Address Validation');

    if (!serviceAreaCheck.isServiced && !serviceAreaCheck.error) {
      return res.status(400).json({
        success: false,
        isDeliverable: false,
        message: "Delivery not available to this location",
        address: {
          address: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode
        },
        nearestServiceArea: serviceAreaCheck.nearestArea ? {
          address: serviceAreaCheck.nearestArea.address,
          maxDeliveryRadius: serviceAreaCheck.nearestArea.deliveryRadius
        } : null
      });
    }

    // Address is serviceable
    res.status(200).json({
      success: true,
      isDeliverable: true,
      message: "Delivery available to this location",
      address: {
        address: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode
      },
      serviceArea: serviceAreaCheck.serviceArea ? {
        name: serviceAreaCheck.serviceArea.address,
        distance: serviceAreaCheck.distance?.toFixed(2) + ' km',
        deliveryRadius: serviceAreaCheck.serviceArea.deliveryRadius + ' km'
      } : null
    });

  } catch (error) {
    console.error("❌ Address validation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to validate delivery address" 
    });
  }
};

// ========================================
// WEBHOOK CONTROLLERS
// ========================================

// Unified Razorpay webhook handler (handles both cart and direct purchases)
export const razorpayWebhookHandler = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpaySignature = req.headers['x-razorpay-signature'];

    if (!razorpaySignature) {
      return res.status(400).send("Signature missing");
    }

    const rawBody = req.rawBody;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.warn("Razorpay Webhook signature mismatch");
      return res.status(400).send("Invalid signature");
    }

    // Parse raw JSON payload
    const webhookPayload = JSON.parse(rawBody);
    const event = webhookPayload.event;
    const payload = webhookPayload.payload;

    console.log("🎣 Razorpay webhook verified for event:", event);

    // Get purchase type from order notes
    const orderNotes = payload.payment?.entity?.notes || payload.order?.entity?.notes;
    const purchaseType = orderNotes?.purchaseType || 'cart'; // Default to cart for backward compatibility
    
    console.log("🛒 Purchase type detected:", purchaseType);

    switch(event) {
      case 'payment.authorized': {
        const paymentEntity = payload.payment.entity;
        const paymentRecord = await Payment.findOne({ razorpay_payment_id: paymentEntity.id });
        if (paymentRecord && paymentRecord.status !== "Authorized") {
          paymentRecord.status = "Authorized";
          await paymentRecord.save();
          await Order.findByIdAndUpdate(paymentRecord.orderId, { status: "authorized" });
          console.log(`✅ ${purchaseType} Purchase: Payment authorized for order:`, paymentRecord.orderId);
        }
        break;
      }

      case 'payment.captured': {
        const paymentEntity = payload.payment.entity;
        const paymentRecord = await Payment.findOne({ razorpay_payment_id: paymentEntity.id });
        if (paymentRecord && paymentRecord.status !== "Success") {
          paymentRecord.status = "Success";
          await paymentRecord.save();
          
          const order = await Order.findByIdAndUpdate(paymentRecord.orderId, { 
            status: "confirmed", 
            paymentId: paymentRecord._id 
          });

          // Mark cart as converted only for cart purchases
          if (purchaseType === 'cart' && order) {
            await markCartConverted(order.userId);
            console.log(`✅ ${purchaseType} Purchase: Payment captured, order confirmed, cart converted:`, paymentRecord.orderId);
          } else {
            console.log(`✅ ${purchaseType} Purchase: Payment captured and order confirmed:`, paymentRecord.orderId);
          }
        }
        break;
      }

      case 'payment.failed': {
        const paymentEntity = payload.payment.entity;
        const paymentRecord = await Payment.findOne({ razorpay_payment_id: paymentEntity.id });
        if (paymentRecord && paymentRecord.status !== "Failed") {
          paymentRecord.status = "Failed";
          await paymentRecord.save();
          await Order.findByIdAndUpdate(paymentRecord.orderId, { status: "cancelled" });
          console.log(`❌ ${purchaseType} Purchase: Payment failed, order cancelled:`, paymentRecord.orderId);
        }
        break;
      }

      // Handle disputes, refunds, etc.
      case 'payment.dispute.created': {
        const paymentEntity = payload.payment.entity;
        console.log(`⚠️ ${purchaseType} Purchase: Dispute created for payment:`, paymentEntity.id);
        // You can add dispute handling logic here
        break;
      }

      default:
        console.log(`🤷 ${purchaseType} Purchase: Unhandled webhook event:`, event);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error("❌ Razorpay webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
};


export const getAllOrders = async (req, res) => {
  try {
    // Get pagination parameters
    const { page, limit, skip } = getPaginationParams(req);
    
    // Build search and filter query
    const query = {};
    const sort = {};
    
    // Search by Order ID
    if (req.query.orderId) {
      query._id = { $regex: req.query.orderId, $options: 'i' };
    }
    
    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        // Add one day to include the end date
        const endDate = new Date(req.query.endDate);
        endDate.setDate(endDate.getDate() + 1);
        query.createdAt.$lt = endDate;
      }
    }
    
    // Filter by price range
    if (req.query.minAmount) {
      query.totalDiscountPrice = { ...query.totalDiscountPrice, $gte: parseFloat(req.query.minAmount) };
    }
    if (req.query.maxAmount) {
      query.totalDiscountPrice = { ...query.totalDiscountPrice, $lte: parseFloat(req.query.maxAmount) };
    }
    
    // Sort options
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'oldest':
          sort.createdAt = 1;
          break;
        case 'amount_high':
          sort.totalDiscountPrice = -1;
          break;
        case 'amount_low':
          sort.totalDiscountPrice = 1;
          break;
        case 'status':
          sort.status = 1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1; // Default to newest first
    }

    // Build aggregation pipeline for complex searching
    let pipeline = [
      // First populate the user data
      {
        $lookup: {
          from: "moonlightusers",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      // Then populate payment data
      {
        $lookup: {
          from: "payments",
          localField: "paymentId",
          foreignField: "_id",
          as: "paymentInfo"
        }
      },
      {
        $unwind: {
          path: "$paymentInfo",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Add search conditions
    const searchConditions = [];

    // Basic query conditions
    if (Object.keys(query).length > 0) {
      searchConditions.push(query);
    }

    // Search by user name, email, or phone
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      searchConditions.push({
        $or: [
          { "userInfo.fullName": searchRegex },
          { "userInfo.email": searchRegex },
          { "userInfo.phoneNumber": searchRegex },
          { phone: searchRegex },
          { "address.city": searchRegex },
          { "address.state": searchRegex },
          { "address.postalCode": searchRegex },
          { "paymentInfo.razorpay_payment_id": searchRegex },
          { "paymentInfo.razorpay_order_id": searchRegex }
        ]
      });
    }

    // Search by payment ID
    if (req.query.paymentId) {
      searchConditions.push({
        $or: [
          { "paymentInfo.razorpay_payment_id": { $regex: req.query.paymentId, $options: 'i' } },
          { "paymentInfo.razorpay_order_id": { $regex: req.query.paymentId, $options: 'i' } }
        ]
      });
    }

    // Filter by city
    if (req.query.city) {
      searchConditions.push({
        "address.city": { $regex: req.query.city, $options: 'i' }
      });
    }

    // Filter by state  
    if (req.query.state) {
      searchConditions.push({
        "address.state": { $regex: req.query.state, $options: 'i' }
      });
    }

    // Add match stage if there are search conditions
    if (searchConditions.length > 0) {
      pipeline.push({
        $match: {
          $and: searchConditions
        }
      });
    }

    // Add sort stage
    pipeline.push({ $sort: sort });

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Order.aggregate(countPipeline);
    const totalDocs = countResult[0]?.total || 0;

    // Add pagination to main pipeline
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // Execute the aggregation
    const orders = await Order.aggregate(pipeline);

    // Get pagination info
    const pagination = getPaginationInfo(totalDocs, page, limit);

    // Add additional computed fields
    const enrichedOrders = orders.map(order => ({
      ...order,
      // Add computed fields for easier frontend consumption
      customerName: order.userInfo?.fullName || 'N/A',
      customerEmail: order.userInfo?.email || 'N/A',
      customerPhone: order.userInfo?.phoneNumber || order.phone || 'N/A',
      paymentStatus: order.paymentInfo?.status || 'N/A',
      razorpayPaymentId: order.paymentInfo?.razorpay_payment_id || 'N/A',
      razorpayOrderId: order.paymentInfo?.razorpay_order_id || 'N/A',
      orderValue: order.totalDiscountPrice,
      savings: order.totalPrice - order.totalDiscountPrice,
      itemsCount: order.items?.length || 0,
      deliveryAddress: `${order.address?.city}, ${order.address?.state} - ${order.address?.postalCode}`,
    }));

    res.status(200).json({
      success: true,
      orders: enrichedOrders,
      pagination,
      filters: {
        totalOrders: totalDocs,
        currentFilters: {
          search: req.query.search || null,
          status: req.query.status || 'all',
          sortBy: req.query.sortBy || 'newest',
          dateRange: {
            start: req.query.startDate || null,
            end: req.query.endDate || null
          },
          amountRange: {
            min: req.query.minAmount || null,
            max: req.query.maxAmount || null
          },
          location: {
            city: req.query.city || null,
            state: req.query.state || null
          }
        }
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional helper endpoint to get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalDiscountPrice" },
          averageOrderValue: { $avg: "$totalDiscountPrice" },
          totalSavings: { $sum: { $subtract: ["$totalPrice", "$totalDiscountPrice"] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          averageOrderValue: { $round: ["$averageOrderValue", 2] },
          totalSavings: { $round: ["$totalSavings", 2] }
        }
      }
    ]);

    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalSavings: 0
      },
      statusBreakdown: statusStats
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
