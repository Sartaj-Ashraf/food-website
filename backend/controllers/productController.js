import Product from '../models/productModel.js';
import Combo from '../models/comboModel.js';
import { compressAndSaveImage, generateFilename, deleteImage } from '../utils/imageUtils.js';
import { getPaginationParams, getPaginationInfo } from '../utils/pagination.js';

const generateSlug = (title) => {
  return title.toLowerCase().replace(/\s+/g, '-');
};


export const getProductsAndCombos = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const {
      status,
      isFeatured,
      search,
      sortBy = 'createdAt',
      type = 'all', // 'products', 'combos', or 'all'
      maxPrice // Maximum price filter
    } = req.query;

    // Build aggregation pipelines
    const buildBasePipeline = (collectionType) => {
      const pipeline = [];

      // Match stage
      const matchStage = { isActive: true };
      if (status) matchStage.status = status;
      if (isFeatured !== undefined) matchStage.isFeatured = isFeatured === 'true';

      // Collection-specific filters
      if (collectionType === 'products') {
        // Filter by max price (use discountPrice if available, otherwise price)
        if (maxPrice) {
          matchStage.$or = [
            {
              discountPrice: { $exists: true, $ne: null, $lte: parseFloat(maxPrice) }
            },
            {
              discountPrice: { $exists: false },
              price: { $lte: parseFloat(maxPrice) }
            },
            {
              discountPrice: null,
              price: { $lte: parseFloat(maxPrice) }
            }
          ];
        }

        // Regex search for products - search in 'title' field only
        if (search) {
          const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
          matchStage.title = { $regex: searchRegex };
        }
      }

      if (collectionType === 'combos') {
        // Filter by max price for combos
        if (maxPrice) {
          matchStage.comboPrice = { $lte: parseFloat(maxPrice) };
        }

        // Regex search for combos - search in 'name' field only
        if (search) {
          const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
          matchStage.name = { $regex: searchRegex };
        }
      }

      pipeline.push({ $match: matchStage });

      // Add item type and properties
      pipeline.push({
        $addFields: {
          itemType: collectionType === 'products' ? 'product' : 'combo',
          isProduct: collectionType === 'products',
          isCombo: collectionType === 'combos'
        }
      });

      return pipeline;
    };

    const queries = [];

    // Build queries based on type filter
    if (type === 'all' || type === 'products') {
      const productPipeline = buildBasePipeline('products');
      productPipeline.push({
        $lookup: {
          from: 'moonlightusers',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [{ $project: { name: 1, email: 1 } }]
        }
      });
      productPipeline.push({
        $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true }
      });

      queries.push(Product.aggregate(productPipeline));
    } else {
      queries.push(Promise.resolve([]));
    }

    if (type === 'all' || type === 'combos') {
      const comboPipeline = buildBasePipeline('combos');
      comboPipeline.push({
        $lookup: {
          from: 'walnutfudgeproducts',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'populatedProducts',
          pipeline: [{ $project: { title: 1, price: 1, images: 1, slug: 1 } }]
        }
      });
      comboPipeline.push({
        $lookup: {
          from: 'moonlightusers',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [{ $project: { name: 1, email: 1 } }]
        }
      });
      comboPipeline.push({
        $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true }
      });

      queries.push(Combo.aggregate(comboPipeline));
    } else {
      queries.push(Promise.resolve([]));
    }

    // Execute queries
    const [products, combos] = await Promise.all(queries);

    // Combine results
    let allItems = [...products, ...combos];

    // Sort combined results (always descending by creation date for consistency)
    allItems.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle date sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0; // Always descending
    });

    // Apply pagination
    const totalDocs = allItems.length;
    const paginatedItems = allItems.slice(skip, skip + limit);

    // Calculate counts
    const productCount = products.length;
    const comboCount = combos.length;

    const pagination = getPaginationInfo(totalDocs, page, limit);

    res.json({
      success: true,
      items: paginatedItems,
      counts: {
        total: totalDocs,
        products: productCount,
        combos: comboCount
      },
      pagination
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      quantity,
      numberOfPieces,
      price,
      discountPrice,
      ingredients,
      isFeatured
    } = req.body;

    // Generate slug from title
    let slug = generateSlug(title);
    const slugExists = await Product.findOne({ slug });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await Product.findOne({ slug });
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

    const product = new Product({
      slug,
      title,
      description,
      quantity,
      numberOfPieces: numberOfPieces ? parseInt(numberOfPieces) : null,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      images: imageUrls,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      isFeatured: isFeatured === 'true',
      createdBy: req.user.userId // Assuming user is set from auth middleware
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Products with Pagination and Filters
export const getProducts = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { status, isFeatured, search, sortBy, sortOrder, minPieces, maxPieces } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    // Filter by number of pieces range
    if (minPieces || maxPieces) {
      filter.numberOfPieces = {};
      if (minPieces) filter.numberOfPieces.$gte = parseInt(minPieces);
      if (maxPieces) filter.numberOfPieces.$lte = parseInt(maxPieces);
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    const [products, totalDocs] = await Promise.all([
      Product.find(filter)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    const pagination = getPaginationInfo(totalDocs, page, limit);

    res.json({
      success: true,
      products,
      pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDeletedProducts = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { status, isFeatured, search, sortBy, sortOrder } = req.query;

    // Build filter object
    const filter = { isActive: false };

    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    const [products, totalDocs] = await Promise.all([
      Product.find(filter)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    const pagination = getPaginationInfo(totalDocs, page, limit);

    res.json({
      success: true,
      products,
      pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Product by Slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isActive: true })
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    let updates = { ...req.body };

    // Parse arrays if they come as strings
    if (updates.ingredients && typeof updates.ingredients === 'string') {
      updates.ingredients = JSON.parse(updates.ingredients);
    }

    // Convert string booleans
    if (updates.isFeatured !== undefined) {
      updates.isFeatured = updates.isFeatured === 'true';
    }

    // Convert numbers
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.discountPrice) updates.discountPrice = parseFloat(updates.discountPrice);
    if (updates.numberOfPieces) updates.numberOfPieces = updates.numberOfPieces !== "" && updates.numberOfPieces !== null && parseInt(updates.numberOfPieces) !== 0 ? parseInt(updates.numberOfPieces) : null;

    // Update slug if title is being updated
    if (updates.title) {
      updates.slug = generateSlug(updates.title);
      let slugExists = await Product.findOne({ slug: updates.slug });
      let counter = 1;

      while (slugExists) {
        updates.slug = `${generateSlug(updates.title)}-${counter}`;
        slugExists = await Product.findOne({ slug: updates.slug });
        counter++;
      }
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
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
        product.images.forEach(deleteImage);
        updates.images = newImageUrls;
      } else {
        // Add to existing images
        updates.images = [...product.images, ...newImageUrls];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Product (Soft Delete)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete all images except the first one
    if (product.images && product.images.length > 1) {
      const imagesToDelete = product.images.slice(1); // Get all images except the first one
      const imagesToKeep = [product.images[0]]; // Keep only the first image

      // Delete the physical image files
      imagesToDelete.forEach(imageUrl => {
        deleteImage(imageUrl);
      });

      // Update the product with only the first image and set as inactive
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          isActive: false,
          images: imagesToKeep
        },
        { new: true }
      );

      res.json({
        success: true,
        message: `Product deleted successfully. Kept 1 image, deleted ${imagesToDelete.length} images.`,
        product: updatedProduct
      });
    } else {
      // If there's only one or no images, just soft delete without touching images
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Product deleted successfully',
        product: updatedProduct
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Restore the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Product restored successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Permanently Delete Product
export const permanentDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete associated images
    product.images.forEach(deleteImage);

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product permanently deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove Image from Product
export const removeProductImage = async (req, res) => {
  try {
    const { productId, imageUrl } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Remove image from array
    product.images = product.images.filter(img => img !== imageUrl);
    await product.save();

    // Delete physical file
    deleteImage(imageUrl);

    res.json({
      success: true,
      message: 'Image removed successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Featured Products
export const getFeaturedProducts = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const [products, totalDocs] = await Promise.all([
      Product.find({ isFeatured: true, isActive: true })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ isFeatured: true, isActive: true })
    ]);

    const pagination = getPaginationInfo(totalDocs, page, limit);

    res.json({
      success: true,
      products,
      pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Products by Number of Pieces
export const getProductsByPieceCount = async (req, res) => {
  try {
    const { pieces } = req.params;
    const { page, limit, skip } = getPaginationParams(req);

    const filter = {
      numberOfPieces: parseInt(pieces),
      isActive: true
    };

    const [products, totalDocs] = await Promise.all([
      Product.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    const pagination = getPaginationInfo(totalDocs, page, limit);

    res.json({
      success: true,
      products,
      pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Products by Quantity Range
export const getProductsByQuantity = async (req, res) => {
  try {
    const { quantity } = req.params;
    const { page, limit, skip } = getPaginationParams(req);

    const filter = {
      quantity: new RegExp(quantity, 'i'),
      isActive: true
    };

    const [products, totalDocs] = await Promise.all([
      Product.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    const pagination = getPaginationInfo(totalDocs, page, limit);

    res.json({
      success: true,
      products,
      pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Product Statistics
export const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          featuredProducts: {
            $sum: {
              $cond: [{ $eq: ["$isFeatured", true] }, 1, 0]
            }
          },
          inStockProducts: {
            $sum: {
              $cond: [{ $eq: ["$status", "in_stock"] }, 1, 0]
            }
          },
          outOfStockProducts: {
            $sum: {
              $cond: [{ $eq: ["$status", "out_of_stock"] }, 1, 0]
            }
          },
          averagePrice: { $avg: "$price" },
          totalPieces: { $sum: "$numberOfPieces" },
          averagePieces: { $avg: "$numberOfPieces" }
        }
      }
    ]);

    // Get piece count distribution
    const pieceDistribution = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: "$numberOfPieces",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalProducts: 0,
        featuredProducts: 0,
        inStockProducts: 0,
        outOfStockProducts: 0,
        averagePrice: 0,
        totalPieces: 0,
        averagePieces: 0
      },
      pieceDistribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getproductForFilter = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select(' _id title ')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
