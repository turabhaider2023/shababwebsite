import mongoose from 'mongoose';

const extraSubcategorySchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

extraSubcategorySchema.index({ category: 1, slug: 1 }, { unique: true });

const ExtraSubcategory = mongoose.model('ExtraSubcategory', extraSubcategorySchema);
export default ExtraSubcategory;
