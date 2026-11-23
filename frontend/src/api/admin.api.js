import { http } from './http';

const data = (res) => res.data.data;
const list = (res) => ({ items: res.data.data, meta: res.data.meta });
/** Drops empty filter values so URLs stay clean. */
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null));

export const authApi = {
  login: (body) => http.post('/auth/login', body).then(data),
  logout: () => http.post('/auth/logout').then(data),
  me: () => http.get('/auth/me').then(data),
  forgotPassword: (body) => http.post('/auth/forgot-password', body).then(data),
  resetPassword: (body) => http.post('/auth/reset-password', body).then(data),
  changePassword: (body) => http.patch('/auth/change-password', body).then(data),
  updateProfile: (body) => http.patch('/auth/profile', body).then(data),
};

const crud = (base) => ({
  list: (params) => http.get(base, { params: clean(params) }).then(list),
  get: (id) => http.get(`${base}/${id}`).then(data),
  create: (body) => http.post(base, body).then(data),
  update: (id, body) => http.patch(`${base}/${id}`, body).then(data),
  remove: (id) => http.delete(`${base}/${id}`),
});

export const adminApi = {
  dashboard: () => http.get('/admin/dashboard').then(data),

  categories: {
    list: () => http.get('/admin/categories').then(data),
    create: (body) => http.post('/admin/categories', body).then(data),
    update: (id, body) => http.patch(`/admin/categories/${id}`, body).then(data),
    remove: (id) => http.delete(`/admin/categories/${id}`),
    reorder: (ids) => http.patch('/admin/categories/reorder', { ids }).then(data),
  },

  products: {
    ...crud('/admin/products'),
    setVisibility: (id, isPublished) => http.patch(`/admin/products/${id}/visibility`, { isPublished }).then(data),
    setFeatured: (id, isFeatured) => http.patch(`/admin/products/${id}/featured`, { isFeatured }).then(data),
  },

  projects: {
    ...crud('/admin/projects'),
    setVisibility: (id, isPublished) => http.patch(`/admin/projects/${id}/visibility`, { isPublished }).then(data),
    setFeatured: (id, isFeatured) => http.patch(`/admin/projects/${id}/featured`, { isFeatured }).then(data),
  },

  featured: {
    reorder: (type, ids) => http.patch('/admin/featured/reorder', { type, ids }).then(data),
  },

  enquiries: crud('/admin/enquiries'),

  banners: {
    list: () => http.get('/admin/banners').then(data),
    create: (body) => http.post('/admin/banners', body).then(data),
    update: (id, body) => http.patch(`/admin/banners/${id}`, body).then(data),
    remove: (id) => http.delete(`/admin/banners/${id}`),
    reorder: (ids) => http.patch('/admin/banners/reorder', { ids }).then(data),
  },

  settings: {
    get: () => http.get('/admin/settings').then(data),
    update: (body) => http.put('/admin/settings', body).then(data),
  },

  uploads: {
    upload: (file, folder, onProgress) => {
      const form = new FormData();
      form.append('folder', folder);
      form.append('image', file);
      return http
        .post('/admin/uploads', form, {
          timeout: 120000,
          onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
        })
        .then(data);
    },
    remove: (publicId) => http.delete('/admin/uploads', { data: { publicId } }),
  },
};
