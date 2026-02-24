import Combo from '../models/comboModel.js';
import Product from '../models/productModel.js';
import { compressAndSaveImage, generateFilename, deleteImage } from '../utils/imageUtils.js';
import { getPaginationParams, getPaginationInfo } from '../utils/pagination.js';

const generateSlug = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

// Create Combo
export const createCombo = async (req, res) => {
  try {
    const {
      name,
      description,
      products,
      comboPrice,
      tags,
      isFeatured
    } = req.body;

    // Parse products if it comes as string
    const parsedProducts = typeof products === 'string' ? JSON.parse(products) : products;

    // Validate products exist and calculate original price
    let originalPrice = 0;
    const transformedProducts = [];

    for (const item of parsedProducts) {
      const productId = item._id || item.productId;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is missing in the request'
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${productId} not found`
        });
      }
      
      originalPrice += product.price * item.quantity;
      
      // Transform to match your database schema
      transformedProducts.push({
        productId: productId,
        quantity: item.quantity
      });
    }

    // Generate unique slug from name
    let slug = generateSlug(name);
    let slugExists = await Combo.findOne({ slug });
    let counter = 1;
    
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await Combo.findOne({ slug });
      counter++;
    }

    // Process uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filename = generateFilename(file.originalname);
        const imageUrl = await compressAndSaveImage(file.buffer, filename);
        imageUrls.push(imageUrl);
      }
    }

    const combo = new Combo({
      name,
      slug,
      description,
      products: transformedProducts, // Use transformed products
      originalPrice,
      comboPrice: parseFloat(comboPrice),
      images: imageUrls,
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      isFeatured: isFeatured === 'true',
      createdBy: req.user.userId
    });

    await combo.save();

    // Populate the combo with product details
    const populatedCombo = await Combo.findById(combo._id)
      .populate('products.productId', 'title price images')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Combo created successfully',
      combo: populatedCombo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Combos with Pagination and Filters
export const getCombos = async (req, res) => {
    try {
      const { page, limit, skip } = getPaginationParams(req);
      const { status, isFeatured, search, productId } = req.query;
  
      // Build filter object
      const filter = { isActive: true };
      
      if (status) filter.status = status;
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
      
      // Filter by product - combos containing specific product
      if (productId && productId !== 'all') {
        filter['products.productId'] = productId;
      }
      
      // Text search
      if (search) {
        filter.$text = { $search: search };
      }
  
      // Build sort object
    
      const [combos, totalDocs] = await Promise.all([
        Combo.find(filter)
          .populate('products.productId', 'title price images slug')
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Combo.countDocuments(filter)
      ]);
  
      const pagination = getPaginationInfo(totalDocs, page, limit);
  
      res.json({
        success: true,
        combos,
        pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

// Get Deleted Combos
export const getDeletedCombos = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { status, isFeatured, search } = req.query;

    // Build filter object
    const filter = { isActive: false };
    
    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    
    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    const [combos, totalDocs] = await Promise.all([
      Combo.find(filter)
        .populate('products.productId', 'title price images slug')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Combo.countDocuments(filter)
    ]);

    const pagination = getPaginationInfo(totalDocs, page, limit);

    res.json({
      success: true,
      combos,
      pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Combo by ID
export const getComboById = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id)
      .populate('products.productId', 'title price images slug description')
      .populate('createdBy', 'name email');

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found'
      });
    }

    res.json({
      success: true,
      combo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Combo by Slug
export const getComboBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const combo = await Combo.findOne({ slug, isActive: true })
      .populate('products.productId', 'title price images slug description')
      .populate('createdBy', 'name email');

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found'
      });
    }

    res.json({
      success: true,
      combo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Combo
export const updateCombo = async (req, res) => {
  try {
    const comboId = req.params.id;
    const updates = { ...req.body };

    // Parse arrays if they come as strings
    if (updates.products && typeof updates.products === 'string') {
      updates.products = JSON.parse(updates.products);
    }
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = JSON.parse(updates.tags);
    }

    // Convert string booleans
    if (updates.isFeatured !== undefined) {
      updates.isFeatured = updates.isFeatured === 'true';
    }

    // Convert numbers
    if (updates.comboPrice) updates.comboPrice = parseFloat(updates.comboPrice);

    // Update slug if name is being updated
    if (updates.name) {
      let newSlug = generateSlug(updates.name);
      let slugExists = await Combo.findOne({ slug: newSlug, _id: { $ne: comboId } });
      let counter = 1;
      
      while (slugExists) {
        newSlug = `${generateSlug(updates.name)}-${counter}`;
        slugExists = await Combo.findOne({ slug: newSlug, _id: { $ne: comboId } });
        counter++;
      }
      
      updates.slug = newSlug;
    }

    // Recalculate original price if products are updated
    if (updates.products) {
      let originalPrice = 0;
      
      // Transform the products array to match your database schema
      const transformedProducts = [];
      
      for (const item of updates.products) {
        // The frontend sends { _id, quantity }, but we need { productId, quantity }
        const productId = item._id || item.productId;
        
        if (!productId) {
          return res.status(400).json({
            success: false,
            message: 'Product ID is missing in the request'
          });
        }

        const product = await Product.findById(productId);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product with ID ${productId} not found`
          });
        }
        
        originalPrice += product.price * item.quantity;
        
        // Transform to match your database schema
        transformedProducts.push({
          productId: productId,
          quantity: item.quantity
        });
      }
      
      updates.originalPrice = originalPrice;
      updates.products = transformedProducts;
    }

    const combo = await Combo.findById(comboId);
    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found'
      });
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      for (const file of req.files) {
        const filename = generateFilename(file.originalname);
        const imageUrl = await compressAndSaveImage(file.buffer, filename);
        newImageUrls.push(imageUrl);
      }
      
      // If replacing images, delete old ones
      if (updates.replaceImages === 'true') {
        combo.images.forEach(deleteImage);
        updates.images = newImageUrls;
      } else {
        // Add to existing images
        updates.images = [...combo.images, ...newImageUrls];
      }
    }

    const updatedCombo = await Combo.findByIdAndUpdate(
      comboId,
      updates,
      { new: true, runValidators: true }
    )
      .populate('products.productId', 'title price images slug description')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Combo updated successfully',
      combo: updatedCombo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// Delete Combo (Soft Delete)
export const deleteCombo = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id);

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found'
      });
    }

    // Delete all images except the first one
    if (combo.images && combo.images.length > 1) {
      const imagesToDelete = combo.images.slice(1); // Get all images except the first one
      const imagesToKeep = [combo.images[0]]; // Keep only the first image
      
      // Delete the physical image files
      imagesToDelete.forEach(imageUrl => {
        deleteImage(imageUrl);
      });

      // Update the combo with only the first image and set as inactive
      const updatedCombo = await Combo.findByIdAndUpdate(
        req.params.id,
        { 
          isActive: false,
          images: imagesToKeep
        },
        { new: true }
      );

      res.json({
        success: true,
        message: `Combo deleted successfully. Kept 1 image, deleted ${imagesToDelete.length} images.`,
        combo: updatedCombo
      });
    } else {
      // If there's only one or no images, just soft delete without touching images
      const updatedCombo = await Combo.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Combo deleted successfully',
        combo: updatedCombo
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Restore Combo
export const restoreCombo = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id);

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found'
      });
    }

    // Restore the combo
    const updatedCombo = await Combo.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Combo restored successfully',
      combo: updatedCombo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Permanently Delete Combo
export const permanentDeleteCombo = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id);
    
    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found'
      });
    }

    // Delete associated images
    combo.images.forEach(deleteImage);

    await Combo.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Combo permanently deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove Image from Combo
export const removeComboImage = async (req, res) => {
  try {
    const { comboId, imageUrl } = req.params;
    
    const combo = await Combo.findById(comboId);
    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found'
      });
    }

    // Remove image from array
    combo.images = combo.images.filter(img => img !== imageUrl);
    await combo.save();

    // Delete physical file
    deleteImage(imageUrl);

    res.json({
      success: true,
      message: 'Image removed successfully',
      combo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check Combo Availability
export const checkComboAvailability = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id)
      .populate('products.productId', 'title status quantity');

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found'
      });
    }

    let isAvailable = true;
    const productAvailability = [];

    for (const item of combo.products) {
      const product = item.productId;
      const available = product.status === 'in_stock';
      
      productAvailability.push({
        productId: product._id,
        title: product.title,
        requiredQuantity: item.quantity,
        available,
        status: product.status
      });

      if (!available) {
        isAvailable = false;
      }
    }

    res.json({
      success: true,
      combo: {
        id: combo._id,
        name: combo.name,
        isAvailable,
        comboStatus: combo.status
      },
      productAvailability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


