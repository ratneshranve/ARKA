import slugify from 'slugify';

export const toSlug = (text) => slugify(String(text), { lower: true, strict: true, trim: true });

/**
 * Returns a slug unique within the model's collection. On collision appends -2, -3, …
 * `excludeId` lets a document keep its own slug when updating.
 */
export async function uniqueSlug(Model, text, excludeId) {
  const base = toSlug(text) || 'item';
  let candidate = base;
  let n = 2;
  while (await Model.exists({ slug: candidate, ...(excludeId && { _id: { $ne: excludeId } }) })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}
