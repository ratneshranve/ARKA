import { Banner, MAX_BANNERS } from '../../models/Banner.js';
import { ApiError } from '../../utils/ApiError.js';
import { cleanupLater } from '../../utils/cloudinaryUpload.js';

export const listPublic = () =>
  Banner.find({ isActive: true }).select('-__v -createdAt -updatedAt').sort({ order: 1, createdAt: 1 }).lean();

export const listAdmin = () => Banner.find().sort({ order: 1, createdAt: 1 }).lean();

export async function create(data) {
  const count = await Banner.countDocuments();
  if (count >= MAX_BANNERS) {
    throw ApiError.conflict(`You can have up to ${MAX_BANNERS} banners. Delete one first.`, 'BANNER_LIMIT');
  }
  return Banner.create({ ...data, order: count });
}

export async function update(id, data) {
  const banner = await Banner.findById(id);
  if (!banner) throw ApiError.notFound('Banner not found');

  const removed = [];
  for (const field of ['image', 'mobileImage']) {
    if (!(field in data)) continue;
    const before = banner[field]?.publicId;
    if (before && before !== data[field]?.publicId) removed.push(before);
  }

  Object.assign(banner, data);
  await banner.save();
  cleanupLater(removed);
  return banner;
}

export async function remove(id) {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw ApiError.notFound('Banner not found');
  cleanupLater([banner.image?.publicId, banner.mobileImage?.publicId]);
}

export async function reorder(ids) {
  await Banner.bulkWrite(ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { order: index } } })));
}
