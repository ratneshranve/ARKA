import mongoose from 'mongoose';

export const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
    alt: { type: String, default: '', maxlength: 200 },
  },
  { _id: false },
);

export const KeyValueSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 100 },
    value: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false },
);
