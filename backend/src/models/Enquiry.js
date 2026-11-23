import mongoose from 'mongoose';

export const ENQUIRY_TYPES = ['product', 'general'];
export const ENQUIRY_INTENTS = ['enquiry', 'order'];
export const ENQUIRY_STATUSES = ['new', 'in_progress', 'closed'];

const EnquirySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ENQUIRY_TYPES, required: true, index: true },
    intent: { type: String, enum: ENQUIRY_INTENTS, default: 'enquiry' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productSnapshot: { name: String, slug: String },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, default: '', maxlength: 150 },
    quantity: { type: String, default: '', maxlength: 50 },
    message: { type: String, required: true, minlength: 5, maxlength: 2000 },
    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new', index: true },
    isRead: { type: Boolean, default: false },
    adminNote: { type: String, default: '', maxlength: 2000 },
    meta: { ip: String, userAgent: String, pageUrl: String },
  },
  { timestamps: true },
);

EnquirySchema.pre('validate', function requireProduct(next) {
  if (this.type === 'product' && !this.product && !this.productSnapshot?.name) {
    this.invalidate('product', 'Product is required for product enquiries');
  }
  next();
});

EnquirySchema.index({ type: 1, status: 1, createdAt: -1 });

export const Enquiry = mongoose.model('Enquiry', EnquirySchema);
