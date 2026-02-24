import mongoose from "mongoose";

// Cart schema for managing user shopping cart
const cartSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "moonlightUser",
    required: true,
  },
  
  items: [{
    // Type of item: 'product' or 'combo'
    itemType: {
      type: String,
      enum: ["product", "combo"],
      required: true,
    },
    
    // Reference to either product or combo
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'items.itemRef'
    },
    
    // Dynamic reference based on itemType
    itemRef: {
      type: String,
      enum: ['walnutFudgeProduct', 'walnutFudgeCombo']
    },
    
    // Quantity of the item
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    
  }],
  
  // Cart status
  status: {
    type: String,
    enum: ["active", "converted"],
    default: "active",
  },
  
}, {
  timestamps: true,
});

// Pre-save middleware to set itemRef based on itemType
cartSchema.pre('save', function(next) {
  this.items.forEach(item => {
    if (item.itemType === 'product') {
      item.itemRef = 'walnutFudgeProduct';
    } else if (item.itemType === 'combo') {
      item.itemRef = 'walnutFudgeCombo';
    }
  });
  next();
});

// Static method to find or create cart for user
cartSchema.statics.findOrCreateCart = async function(userId) {
  let cart = await this.findOne({ userId, status: 'active' });
  
  if (!cart) {
    cart = new this({ userId, items: [] });
    await cart.save();
  }
  
  return cart;
};

// Indexes for better performance
cartSchema.index({ userId: 1, status: 1 });
cartSchema.index({ 'items.itemId': 1, 'items.itemType': 1 });

export default mongoose.model("walnutFudgeCart", cartSchema);