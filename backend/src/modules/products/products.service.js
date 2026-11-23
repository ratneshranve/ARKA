import { Category } from '../../models/Category.js';
import { Product } from '../../models/Product.js';
import { ApiError } from '../../utils/ApiError.js';
import { cleanupLater, removedPublicIds } from '../../utils/cloudinaryUpload.js';
import { buildMeta, escapeRegex, parsePagination } from '../../utils/pagination.js';
import { uniqueSlug } from '../../utils/slug.js';

const LIST_FIELDS = ['name', 'slug', 'category', 'shortDescription', 'price', 'isFeatured', 'featuredOrder', 'createdAt'];
/** Listing projection: only card fields and the cover image — never full descriptions or galleries. */
const listProjection = (...extra) => ({
  ...Object.fromEntries([...LIST_FIELDS, ...extra].map((f) => [f, 1])),
  images: { $slice: 1 },
});
const activeCategoryIds = () => Category.find({ isActive: true }).distinct('_id');

async function assertCategory(id) {
  if (!(await Category.exists({ _id: id }))) {
    throw ApiError.badRequest('Selected category does not exist', 'INVALID_CATEGORY', [
      { path: 'category', message: 'Select a valid category' },
    ]);
  }
}

/* ───────────── Public ───────────── */

export async function listPublic(query) {
  const { page, limit, skip } = parsePagination(query, 12);
  const activeIds = await activeCategoryIds();
  const filter = { isPublished: true, category: { $in: activeIds } };

  if (query.category) {
    const cat = await Category.findOne({ slug: query.category, isActive: true }).select('_id').lean();
    if (!cat) return { items: [], meta: buildMeta(page, limit, 0) };
    filter.category = cat._id;
  }
  if (query.featured) filter.isFeatured = true;

  const sort = query.featured ? { featuredOrder: 1, createdAt: -1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([
    Product.find(filter, listProjection())
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function getPublicBySlug(slug) {
  const activeIds = await activeCategoryIds();
  const product = await Product.findOne({ slug, isPublished: true, category: { $in: activeIds } })
    .select('-featuredOrder -__v')
    .populate('category', 'name slug')
    .lean();
  if (!product) throw ApiError.notFound('Product not found');

  const related = await Product.find(
    { _id: { $ne: product._id }, category: product.category._id, isPublished: true },
    listProjection(),
  )
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  return { ...product, related };
}

/* ───────────── Admin ───────────── */

const SORTS = {
  '-updatedAt': { updatedAt: -1 },
  updatedAt: { updatedAt: 1 },
  '-createdAt': { createdAt: -1 },
  createdAt: { createdAt: 1 },
  name: { name: 1 },
  '-name': { name: -1 },
};

export async function listAdmin(query) {
  const { page, limit, skip } = parsePagination(query, 20);
  const filter = {};
  if (query.search) filter.name = { $regex: escapeRegex(query.search), $options: 'i' };
  if (query.category) filter.category = query.category;
  if (query.status === 'published') filter.isPublished = true;
  if (query.status === 'hidden') filter.isPublished = false;
  if (query.featured !== undefined) filter.isFeatured = query.featured;

  const [items, total] = await Promise.all([
    Product.find(filter, listProjection('isPublished', 'updatedAt'))
      .populate('category', 'name slug')
      .sort(SORTS[query.sort] ?? SORTS['-updatedAt'])
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function getById(id) {
  const product = await Product.findById(id).populate('category', 'name slug').lean();
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

async function nextFeaturedOrder() {
  const last = await Product.findOne({ isFeatured: true }).sort({ featuredOrder: -1 }).select('featuredOrder').lean();
  return (last?.featuredOrder ?? -1) + 1;
}

export async function create(data) {
  await assertCategory(data.category);
  const slug = await uniqueSlug(Product, data.slug || data.name);
  const featuredOrder = data.isFeatured ? await nextFeaturedOrder() : 0;
  return Product.create({ ...data, slug, featuredOrder });
}

export async function update(id, data) {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');
  await assertCategory(data.category);

  const removed = removedPublicIds(product.images, data.images);
  const wantedSlug = data.slug || product.slug;
  const slug = wantedSlug === product.slug ? product.slug : await uniqueSlug(Product, wantedSlug, product._id);
  if (data.isFeatured && !product.isFeatured) product.featuredOrder = await nextFeaturedOrder();

  Object.assign(product, { ...data, slug });
  await product.save();
  cleanupLater(removed);
  return product;
}

export async function remove(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw ApiError.notFound('Product not found');
  cleanupLater(product.images.map((img) => img.publicId));
}

export async function setVisibility(id, isPublished) {
  const product = await Product.findByIdAndUpdate(id, { isPublished }, { new: true }).select('isPublished').lean();
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

export async function setFeatured(id, isFeatured) {
  const update = { isFeatured, ...(isFeatured && { featuredOrder: await nextFeaturedOrder() }) };
  const product = await Product.findByIdAndUpdate(id, update, { new: true }).select('isFeatured featuredOrder').lean();
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}
