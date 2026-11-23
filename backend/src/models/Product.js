import mongoose from 'mongoose';
import { ImageSchema, KeyValueSchema } from './shared.js';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 250 },
    description: { type: String, default: '', maxlength: 10000 },
    images: {
      type: [ImageSchema],
      validate: [
        { validator: (v) => v.length >= 1, message: 'At least one image is required' },
        { validator: (v) => v.length <= 10, message: 'A maximum of 10 images is allowed' },
      ],
    },
    specifications: {
      type: [KeyValueSchema],
      default: [],
      validate: { validator: (v) => v.length <= 40, message: 'A maximum of 40 specifications is allowed' },
    },
    additionalInfo: { type: String, default: '', maxlength: 10000 },
    price: {
      amount: { type: Number, min: 0, default: null },
      label: { type: String, default: '', maxlength: 50 },
      show: { type: Boolean, default: false },
    },
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    featuredOrder: { type: Number, default: 0 },
    metaTitle: { type: String, default: '', maxlength: 120 },
    metaDescription: { type: String, default: '', maxlength: 300 },
  },
  { timestamps: true },
);

ProductSchema.index({ isPublished: 1, category: 1, createdAt: -1 });
ProductSchema.index({ isFeatured: 1, featuredOrder: 1 });
ProductSchema.index({ name: 'text' });

export const Product = mongoose.model('Product', ProductSchema);
