import { Project } from '../../models/Project.js';
import { ApiError } from '../../utils/ApiError.js';
import { cleanupLater, removedPublicIds } from '../../utils/cloudinaryUpload.js';
import { buildMeta, escapeRegex, parsePagination } from '../../utils/pagination.js';
import { uniqueSlug } from '../../utils/slug.js';

const LIST_FIELDS = 'title slug location shortDescription coverImage gallery capacity projectType completedOn isFeatured featuredOrder createdAt';
const allImages = (p) => [p.coverImage, ...(p.gallery ?? [])].filter(Boolean);

/* ───────────── Public ───────────── */

export async function listPublic(query) {
  const { page, limit, skip } = parsePagination(query, 9);
  const filter = { isPublished: true, ...(query.featured && { isFeatured: true }) };
  if (query.type) {
    filter.projectType = query.type;
  }
  const sort = query.featured ? { featuredOrder: 1, createdAt: -1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([
    Project.find(filter).select(LIST_FIELDS).sort(sort).skip(skip).limit(limit).lean(),
    Project.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function getPublicBySlug(slug) {
  const project = await Project.findOne({ slug, isPublished: true }).select('-featuredOrder -__v').lean();
  if (!project) throw ApiError.notFound('Project not found');
  const related = await Project.find({ _id: { $ne: project._id }, isPublished: true })
    .select(LIST_FIELDS)
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
  return { ...project, related };
}

/* ───────────── Admin ───────────── */

const SORTS = {
  '-updatedAt': { updatedAt: -1 },
  updatedAt: { updatedAt: 1 },
  '-createdAt': { createdAt: -1 },
  createdAt: { createdAt: 1 },
  title: { title: 1 },
  '-title': { title: -1 },
};

export async function listAdmin(query) {
  const { page, limit, skip } = parsePagination(query, 20);
  const filter = {};
  if (query.search) filter.title = { $regex: escapeRegex(query.search), $options: 'i' };
  if (query.status === 'published') filter.isPublished = true;
  if (query.status === 'hidden') filter.isPublished = false;
  if (query.featured !== undefined) filter.isFeatured = query.featured;

  const [items, total] = await Promise.all([
    Project.find(filter)
      .select(`${LIST_FIELDS} isPublished updatedAt`)
      .sort(SORTS[query.sort] ?? SORTS['-updatedAt'])
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function getById(id) {
  const project = await Project.findById(id).lean();
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

async function nextFeaturedOrder() {
  const last = await Project.findOne({ isFeatured: true }).sort({ featuredOrder: -1 }).select('featuredOrder').lean();
  return (last?.featuredOrder ?? -1) + 1;
}

export async function create(data) {
  const slug = await uniqueSlug(Project, data.slug || data.title);
  const featuredOrder = data.isFeatured ? await nextFeaturedOrder() : 0;
  return Project.create({ ...data, slug, featuredOrder });
}

export async function update(id, data) {
  const project = await Project.findById(id);
  if (!project) throw ApiError.notFound('Project not found');

  const removed = removedPublicIds(allImages(project), allImages(data));
  const wantedSlug = data.slug || project.slug;
  const slug = wantedSlug === project.slug ? project.slug : await uniqueSlug(Project, wantedSlug, project._id);
  if (data.isFeatured && !project.isFeatured) project.featuredOrder = await nextFeaturedOrder();

  Object.assign(project, { ...data, slug });
  await project.save();
  cleanupLater(removed);
  return project;
}

export async function remove(id) {
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw ApiError.notFound('Project not found');
  cleanupLater(allImages(project).map((img) => img.publicId));
}

export async function setVisibility(id, isPublished) {
  const project = await Project.findByIdAndUpdate(id, { isPublished }, { new: true }).select('isPublished').lean();
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

export async function setFeatured(id, isFeatured) {
  const update = { isFeatured, ...(isFeatured && { featuredOrder: await nextFeaturedOrder() }) };
  const project = await Project.findByIdAndUpdate(id, update, { new: true }).select('isFeatured featuredOrder').lean();
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}
