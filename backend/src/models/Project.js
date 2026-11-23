import mongoose from 'mongoose';
import { ImageSchema, KeyValueSchema } from './shared.js';

export const PROJECT_TYPES = ['residential', 'commercial', 'industrial', 'institutional', 'agricultural', 'other'];

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true },
    location: { type: String, required: true, trim: true, maxlength: 150 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 250 },
    description: { type: String, default: '', maxlength: 10000 },
    coverImage: { type: ImageSchema, required: true },
    gallery: {
      type: [ImageSchema],
      default: [],
      validate: { validator: (v) => v.length <= 20, message: 'A maximum of 20 gallery images is allowed' },
    },
    capacity: { type: String, default: '', maxlength: 50 },
    projectType: { type: String, enum: [...PROJECT_TYPES, null], default: null },
    completedOn: { type: Date, default: null },
    details: {
      type: [KeyValueSchema],
      default: [],
      validate: { validator: (v) => v.length <= 30, message: 'A maximum of 30 detail rows is allowed' },
    },
    additionalInfo: { type: String, default: '', maxlength: 10000 },
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    featuredOrder: { type: Number, default: 0 },
    metaTitle: { type: String, default: '', maxlength: 120 },
    metaDescription: { type: String, default: '', maxlength: 300 },
  },
  { timestamps: true },
);

ProjectSchema.index({ isPublished: 1, createdAt: -1 });
ProjectSchema.index({ isFeatured: 1, featuredOrder: 1 });
ProjectSchema.index({ title: 'text' });

export const Project = mongoose.model('Project', ProjectSchema);
