import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import Combo from '../models/comboModel.js';
import mongoose from 'mongoose';

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { itemId, itemType, quantity = 1 } = req.body;
    const userId = req.user.userId;

    if(!itemId || !itemType){
      return res.status(400).json({
        success: false,
        message: 'Item ID and item type are required'
      });
    }

    // Validate itemType
    if (!['product', 'combo'].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type. Must be "product" or "combo"'
      });
    }

    // Find the item and validate it exists and is available
    let item;
    if (itemType === 'product') {
      item = await Product.findById(itemId);
      if (!item || !item.isActive || item.status !== 'in_stock') {
        return res.status(400).json({
          success: false,
          message: 'Product not found or not available'
        });
      }
    } else {
      item = await Combo.findById(itemId);
      if (!item || !item.isActive || item.status !== 'in_stock') {
        return res.status(400).json({
          success: false,
          message: 'Combo not found or not available'
        });
      }
    }

    // Find or create cart for user
    let cart = await Cart.findOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.itemId.toString() === itemId && cartItem.itemType === itemType
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item to cart
      const cartItem = {
        itemType,
        itemId,
        quantity: parseInt(quantity)
      };
      cart.items.push(cartItem);
    }

    await cart.save();

    // Populate the cart with item details
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.itemId',
        select: 'title name price comboPrice discountPrice images slug description quantity numberOfPieces'
      });

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: populatedCart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const transferGuestCartToUser = async (req, res) => {
  try {
    const { guestCartItems } = req.body;
    const userId = req.user.userId;

    if (!guestCartItems || !Array.isArray(guestCartItems) || guestCartItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No guest cart items to transfer'
      });
    }

    // Find or create user cart
    let userCart = await Cart.findOrCreateCart(userId);

    // Add each valid guest item to user cart (using existing addToCart logic)
    for (const guestItem of guestCartItems) {
      const { itemId, itemType, quantity } = guestItem;
      
      if (!itemId || !itemType || !quantity) continue;
      if (!['product', 'combo'].includes(itemType)) continue;

      // Validate item exists and is available
      let item;
      if (itemType === 'product') {
        item = await Product.findById(itemId);
        if (!item || !item.isActive || item.status !== 'in_stock') continue;
      } else {
        item = await Combo.findById(itemId);
        if (!item || !item.isActive || item.status !== 'in_stock') continue;
      }

      // Check if item already exists in user cart
      const existingItemIndex = userCart.items.findIndex(
        cartItem => cartItem.itemId.toString() === itemId && cartItem.itemType === itemType
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        userCart.items[existingItemIndex].quantity += parseInt(quantity);
      } else {
        // Add new item to cart
        userCart.items.push({
          itemType,
          itemId,
          quantity: parseInt(quantity)
        });
      }
    }

    await userCart.save();

    res.status(200).json({
      success: true,
      message: 'Guest cart items transferred successfully',
      transferredItems: guestCartItems.length
    });

  } catch (error) {
    console.error('Transfer guest cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId, status: 'active' })
      .populate({
        path: 'items.itemId',
        select: 'title name price comboPrice discountPrice originalPrice images slug description quantity numberOfPieces status isActive isFeatured tags products createdBy',
      })
      .populate({
        path: 'items.itemId.createdBy',
        select: 'name email'
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          itemCount: 0,
          totalQuantity: 0,
          totalPrice: 0,
          discountPrice: 0
        }
      });
    }

    // Separate population for combo products
    const comboItems = cart.items.filter(item => item.itemType === 'combo');
    
    if (comboItems.length > 0) {
      // Get all combo IDs
      const comboIds = comboItems.map(item => item.itemId._id);
      
      // Populate combo products separately
      const populatedCombos = await mongoose.model('walnutFudgeCombo')
        .find({ _id: { $in: comboIds } })
        .populate({
          path: 'products.productId',
          select: 'title price images slug quantity numberOfPieces'
        });

      // Map the populated combo data back to cart items
      cart.items.forEach(item => {
        if (item.itemType === 'combo') {
          const populatedCombo = populatedCombos.find(combo => 
            combo._id.toString() === item.itemId._id.toString()
          );
          if (populatedCombo) {
            item.itemId.products = populatedCombo.products;
          }
        }
      });
    }

    // Filter out items that are no longer available
    const availableItems = cart.items.filter(item => {
      const itemData = item.itemId;
      return itemData && itemData.isActive && itemData.status === 'in_stock';
    });

    // Update cart if some items were removed
    if (availableItems.length !== cart.items.length) {
      cart.items = availableItems;
      await cart.save();
    }

    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        
    // Calculate pricing based on item type
    const totalPrice = cart.items.reduce((sum, item) => {
      const itemPrice = item.itemType === 'combo'
        ? (item.itemId.comboPrice || item.itemId.originalPrice || 0)
        : (item.itemId.price || 0);
      return sum + (item.quantity * itemPrice);
    }, 0);
        
    const discountPrice = cart.items.reduce((sum, item) => {
      const itemDiscountPrice = item.itemType === 'combo'
        ? (item.itemId.comboPrice || 0)
        : (item.itemId.discountPrice || item.itemId.price || 0);
      return sum + (item.quantity * itemDiscountPrice);
    }, 0);

    res.status(200).json({
      success: true,
      cart: {
        ...cart.toObject(),
        itemCount: cart.items.length,
        totalQuantity,
        totalPrice,
        discountPrice
      }
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get guest cart
export const getGuestCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    // Validate input
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required and must be an array'
      });
    }

    if (cartItems.length === 0) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          itemCount: 0,
          totalQuantity: 0,
          totalPrice: 0,
          discountPrice: 0
        }
      });
    }

    // Separate product and combo items
    const productIds = cartItems
      .filter(item => item.itemType === 'product')
      .map(item => item.itemId);
    
    const comboIds = cartItems
      .filter(item => item.itemType === 'combo')
      .map(item => item.itemId);

    // Fetch products
    const products = await mongoose.model('walnutFudgeProduct')
      .find({ 
        _id: { $in: productIds },
        isActive: true,
        status: 'in_stock'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });

    // Fetch combos with populated products
    const combos = await mongoose.model('walnutFudgeCombo')
      .find({ 
        _id: { $in: comboIds },
        isActive: true,
        status: 'in_stock'
      })
      .populate({
        path: 'products.productId',
        select: 'title price images slug quantity numberOfPieces'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });

    // Build cart items with populated data
    const populatedItems = [];

    cartItems.forEach(cartItem => {
      let itemData = null;

      if (cartItem.itemType === 'product') {
        itemData = products.find(product => 
          product._id.toString() === cartItem.itemId
        );
      } else if (cartItem.itemType === 'combo') {
        itemData = combos.find(combo => 
          combo._id.toString() === cartItem.itemId
        );
      }

      // Only include items that exist and are available
      if (itemData && itemData.isActive && itemData.status === 'in_stock') {
        populatedItems.push({
          itemType: cartItem.itemType,
          itemId: itemData,
          quantity: cartItem.quantity,
          itemRef: cartItem.itemType === 'product' ? 'walnutFudgeProduct' : 'walnutFudgeCombo'
        });
      }
    });

    // Calculate totals
    const totalQuantity = populatedItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const totalPrice = populatedItems.reduce((sum, item) => {
      const itemPrice = item.itemType === 'combo'
        ? (item.itemId.comboPrice || item.itemId.originalPrice || 0)
        : (item.itemId.price || 0);
      return sum + (item.quantity * itemPrice);
    }, 0);
    
    const discountPrice = populatedItems.reduce((sum, item) => {
      const itemDiscountPrice = item.itemType === 'combo'
        ? (item.itemId.comboPrice || 0)
        : (item.itemId.discountPrice || item.itemId.price || 0);
      return sum + (item.quantity * itemDiscountPrice);
    }, 0);

    // Return in same format as getCart
    res.status(200).json({
      success: true,
      cart: {
        items: populatedItems,
        itemCount: populatedItems.length,
        totalQuantity,
        totalPrice,
        discountPrice,
        userId: null, // Guest user
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Guest cart fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { itemId, itemType, quantity } = req.body;
    const userId = req.user.userId;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      cartItem => cartItem.itemId.toString() === itemId && cartItem.itemType === itemType
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Update item quantity
    cart.items[itemIndex].quantity = parseInt(quantity);
    await cart.save();

    // Populate and return updated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.itemId',
        select: 'title name price comboPrice discountPrice images slug description quantity numberOfPieces'
      });

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart: populatedCart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      cartItem => !(cartItem.itemId.toString() === itemId && cartItem.itemType === itemType)
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Calculate totals and save
    await cart.save();
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        items: [],
        itemCount: 0,
        totalQuantity: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get cart count (for header display)
export const getCartCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId, status: 'active' });
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        count: 0,
        quantity: 0
      });
    }

    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      count: cart.items.length,
      quantity: totalQuantity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Validate cart items (check availability before checkout)
export const validateCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId, status: 'active' })
      .populate({
        path: 'items.itemId',
        select: 'title name price comboPrice discountPrice status isActive'
      });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Cart is empty',
        issues: []
      });
    }

    const issues = [];
    const validItems = [];

    for (const item of cart.items) {
      const product = item.itemId;
      
      if (!product || !product.isActive || product.status !== 'in_stock') {
        issues.push({
          itemId: item.itemId?._id || item.itemId,
          itemType: item.itemType,
          issue: 'Item is no longer available'
        });
      } else {
        validItems.push(item);
      }
    }

    res.status(200).json({
      success: true,
      valid: issues.length === 0,
      validItemCount: validItems.length,
      totalItemCount: cart.items.length,
      issues: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

