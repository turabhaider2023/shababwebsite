import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    brand: { type: String, default: 'ZAYVORN' },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, required: true, index: true },
    material: { type: String, default: '' },
    sku: { type: String, default: '' },
    images: [{ type: String }],
    mrp: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    price: { type: Number, required: true },
    sizes: [{ type: String }],
    colors: [{ name: String, hex: String }],
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
