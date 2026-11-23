import { Category } from '../../models/Category.js';
import { Product } from '../../models/Product.js';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug } from '../../utils/slug.js';

async function productCounts(match = {}) {
  const rows = await Product.aggregate([{ $match: match }, { $group: { _id: '$category', count: { $sum: 1 } } }]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
}

/** Active categories with their published product count. */
export async function listPublic() {
  const [categories, counts] = await Promise.all([
    Category.find({ isActive: true }).select('name slug description order').sort({ order: 1, name: 1 }).lean(),
    productCounts({ isPublished: true }),
  ]);
  return categories.map((c) => ({ ...c, productCount: counts.get(String(c._id)) ?? 0 }));
}

export async function listAdmin() {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).lean(),
    productCounts(),
  ]);
  return categories.map((c) => ({ ...c, productCount: counts.get(String(c._id)) ?? 0 }));
}

export async function create(data) {
  const order = data.order ?? (await Category.countDocuments());
  const slug = await uniqueSlug(Category, data.name);
  return Category.create({ ...data, order, slug });
}

export async function update(id, data) {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Category not found');
  if (data.name && data.name !== category.name) {
    category.slug = await uniqueSlug(Category, data.name, category._id);
  }
  Object.assign(category, data);
  await category.save();
  return category;
}

export async function remove(id) {
  const inUse = await Product.countDocuments({ category: id });
  if (inUse) {
    throw ApiError.conflict(
      `This category has ${inUse} product${inUse === 1 ? '' : 's'}. Move or delete them before deleting the category.`,
      'CATEGORY_IN_USE',
    );
  }
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound('Category not found');
}

export async function reorder(ids) {
  await Category.bulkWrite(ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { order: index } } })));
}
