export function ok(res, data, meta) {
  return res.status(200).json(meta ? { success: true, data, meta } : { success: true, data });
}

export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

export function noContent(res) {
  return res.status(204).end();
}
