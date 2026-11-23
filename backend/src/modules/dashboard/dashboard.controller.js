import { Enquiry } from '../../models/Enquiry.js';
import { Product } from '../../models/Product.js';
import { Project } from '../../models/Project.js';
import { ok } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    productsTotal,
    productsPublished,
    projectsTotal,
    projectsPublished,
    enquiriesTotal,
    enquiriesNew,
    enquiriesUnread,
    productEnquiries,
    generalEnquiries,
    latest,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isPublished: true }),
    Project.countDocuments(),
    Project.countDocuments({ isPublished: true }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: 'new' }),
    Enquiry.countDocuments({ isRead: false }),
    Enquiry.countDocuments({ type: 'product' }),
    Enquiry.countDocuments({ type: 'general' }),
    Enquiry.find()
      .select('name type intent productSnapshot subject status isRead createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  ok(res, {
    products: { total: productsTotal, published: productsPublished, hidden: productsTotal - productsPublished },
    projects: { total: projectsTotal, published: projectsPublished, hidden: projectsTotal - projectsPublished },
    enquiries: {
      total: enquiriesTotal,
      new: enquiriesNew,
      unread: enquiriesUnread,
      product: productEnquiries,
      general: generalEnquiries,
    },
    latestEnquiries: latest,
  });
});
