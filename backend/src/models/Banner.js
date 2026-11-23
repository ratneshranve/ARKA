import mongoose from 'mongoose';
import { ImageSchema } from './shared.js';

export const MAX_BANNERS = 8;

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, default: '', maxlength: 250 },
    image: { type: ImageSchema, required: true },
    mobileImage: { type: ImageSchema, default: null },
    ctaLabel: { type: String, default: '', maxlength: 40 },
    ctaLink: { type: String, default: '', maxlength: 300 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Banner = mongoose.model('Banner', BannerSchema);
