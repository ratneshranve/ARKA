import { http } from './http';

const data = (res) => res.data.data;
const list = (res) => ({ items: res.data.data, meta: res.data.meta });

export const publicApi = {
  settings: () => http.get('/settings').then(data),
  banners: () => http.get('/banners').then(data),
  categories: () => http.get('/categories').then(data),
  products: (params) => http.get('/products', { params }).then(list),
  product: (slug) => http.get(`/products/${encodeURIComponent(slug)}`).then(data),
  projects: (params) => http.get('/projects', { params }).then(list),
  project: (slug) => http.get(`/projects/${encodeURIComponent(slug)}`).then(data),
  createEnquiry: (payload) => http.post('/enquiries', payload).then(data),
};
