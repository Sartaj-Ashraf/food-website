import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for temporary file storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  }
});

// Compress and save image
export const compressAndSaveImage = async (buffer, filename) => {
  try {
    const outputPath = path.join(uploadsDir, filename);
    
    // await sharp(buffer)
    //   .resize(800, 800, { 
    //     fit: 'inside', 
    //     withoutEnlargement: true 
    //   })
    //   .jpeg({ quality: 70, mozjpeg: true })
    //   .toFile(outputPath);
    // Remove .resize() entirely:
await sharp(buffer)
.resize(1600, 1600, { 
  fit: 'inside', 
  withoutEnlargement: true 
})
.jpeg({ quality: 90, progressive: true })
.toFile(outputPath);

    
    return `/uploads/products/${filename}`;
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
};

// Generate unique filename
export const generateFilename = (originalname) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = path.extname(originalname);
  return `${timestamp}-${random}${ext}`;
};

// Delete image file
export const deleteImage = (imagePath) => {
  try {
    const fullPath = path.join(__dirname, '../public', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};