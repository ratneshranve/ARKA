import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { enquiryAckEmail } from '../../emails/enquiryAck.js';
import { newEnquiryEmail } from '../../emails/newEnquiry.js';
import { sendMail } from '../../emails/sendMail.js';
import { Enquiry } from '../../models/Enquiry.js';
import { Product } from '../../models/Product.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildMeta, escapeRegex, parsePagination } from '../../utils/pagination.js';
import { getSettings } from '../settings/settings.service.js';

export async function create(data, meta) {
  const record = {
    type: data.type,
    name: data.name,
    phone: data.phone,
    email: data.email,
    message: data.message,
    meta,
  };

  if (data.type === 'product') {
    const product = await Product.findOne({ _id: data.productId, isPublished: true }).select('name slug').lean();
    if (!product) throw ApiError.badRequest('This product is no longer available', 'INVALID_PRODUCT');
    Object.assign(record, {
      product: product._id,
      productSnapshot: { name: product.name, slug: product.slug },
      intent: data.intent,
      quantity: data.quantity,
    });
  } else {
    record.subject = data.subject;
  }

  const enquiry = await Enquiry.create(record);
  setImmediate(() => notify(enquiry.toObject()));
  return enquiry;
}

/** Sends the company notification and the customer acknowledgement. Never throws. */
async function notify(enquiry) {
  try {
    const settings = await getSettings();
    const companyTo = settings.notifications?.enquiryEmails?.length
      ? settings.notifications.enquiryEmails
      : [env.ENQUIRY_NOTIFY_EMAIL];
    await Promise.all([
      sendMail({ to: companyTo, replyTo: enquiry.email, ...newEnquiryEmail(enquiry, settings) }),
      sendMail({ to: enquiry.email, ...enquiryAckEmail(enquiry, settings) }),
    ]);
  } catch (err) {
    logger.error({ err: err.message, enquiryId: enquiry._id }, 'Enquiry notification failed');
  }
}

export async function listAdmin(query) {
  const { page, limit, skip } = parsePagination(query, 20);
  const filter = {};
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const rx = { $regex: escapeRegex(query.search), $options: 'i' };
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) {
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }

  const [items, total] = await Promise.all([
    Enquiry.find(filter)
      .select('-meta -adminNote -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Enquiry.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function getById(id) {
  const enquiry = await Enquiry.findByIdAndUpdate(id, { isRead: true }, { new: true })
    .populate('product', 'name slug isPublished')
    .lean();
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  return enquiry;
}

export async function update(id, data) {
  const enquiry = await Enquiry.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('product', 'name slug isPublished')
    .lean();
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  return enquiry;
}

export async function remove(id) {
  const deleted = await Enquiry.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound('Enquiry not found');
}
