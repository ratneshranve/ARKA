import { SETTINGS_IMAGE_FIELDS, SiteSettings } from '../../models/SiteSettings.js';
import { cleanupLater } from '../../utils/cloudinaryUpload.js';

/** Returns the single settings document, creating it with defaults on first read. */
export async function getSettings() {
  return SiteSettings.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
}

export async function getPublicSettings() {
  const { notifications: _n, __v, ...rest } = await getSettings();
  return rest;
}

/** Partial update by section, e.g. { contact: {...} }. Replaced images are cleaned up. */
export async function updateSettings(payload) {
  const current = await getSettings();
  const $set = {};
  const removed = [];

  for (const [section, values] of Object.entries(payload)) {
    for (const [field, value] of Object.entries(values)) {
      $set[`${section}.${field}`] = value ?? null;
    }
    for (const field of SETTINGS_IMAGE_FIELDS[section] ?? []) {
      if (!(field in values)) continue;
      const before = current[section]?.[field]?.publicId;
      const after = values[field]?.publicId;
      if (before && before !== after) removed.push(before);
    }
    if (section === 'legal') $set['legal.updatedAt'] = new Date();
  }

  const updated = await SiteSettings.findOneAndUpdate({ _id: current._id }, { $set }, { new: true, runValidators: true }).lean();
  cleanupLater(removed);
  return updated;
}
