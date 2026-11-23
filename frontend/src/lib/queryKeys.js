export const queryKeys = {
  settings: ['settings'],
  banners: ['banners'],
  categories: ['categories'],
  products: (params) => ['products', params],
  product: (slug) => ['product', slug],
  projects: (params) => ['projects', params],
  project: (slug) => ['project', slug],

  admin: {
    all: ['admin'],
    dashboard: ['admin', 'dashboard'],
    categories: ['admin', 'categories'],
    products: (params) => ['admin', 'products', params],
    product: (id) => ['admin', 'product', id],
    projects: (params) => ['admin', 'projects', params],
    project: (id) => ['admin', 'project', id],
    enquiries: (params) => ['admin', 'enquiries', params],
    enquiry: (id) => ['admin', 'enquiry', id],
    banners: ['admin', 'banners'],
    featured: (type) => ['admin', 'featured', type],
    settings: ['admin', 'settings'],
  },
};
