export const ROUTES = {
  home: '/',
  about: '/about',
  products: '/products',
  product: (slug) => `/products/${slug}`,
  projects: '/projects',
  project: (slug) => `/projects/${slug}`,
  contact: '/contact',
  privacy: '/privacy-policy',
  terms: '/terms-and-conditions',
  admin: {
    root: '/admin',
    login: '/admin/login',
    forgot: '/admin/forgot-password',
    reset: '/admin/reset-password',
    products: '/admin/products',
    productNew: '/admin/products/new',
    productEdit: (id) => `/admin/products/${id}/edit`,
    categories: '/admin/categories',
    projects: '/admin/projects',
    projectNew: '/admin/projects/new',
    projectEdit: (id) => `/admin/projects/${id}/edit`,
    enquiries: '/admin/enquiries',
    enquiry: (id) => `/admin/enquiries/${id}`,
    banners: '/admin/banners',
    featured: '/admin/featured',
    settings: '/admin/settings',
    account: '/admin/account',
  },
};

export const NAV_LINKS = [
  { label: 'Home', to: ROUTES.home, end: true },
  { label: 'About Us', to: ROUTES.about },
  { label: 'Products', to: ROUTES.products },
  { label: 'Projects', to: ROUTES.projects },
  { label: 'Contact Us', to: ROUTES.contact },
];

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
];

export const ENQUIRY_TYPES = [
  { value: 'product', label: 'Product' },
  { value: 'general', label: 'General' },
];

export const ENQUIRY_INTENTS = { enquiry: 'Enquiry', order: 'Order request' };

export const PROJECT_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'other', label: 'Other' },
];

export const projectTypeLabel = (value) => PROJECT_TYPES.find((t) => t.value === value)?.label ?? '';
export const statusLabel = (value) => ENQUIRY_STATUSES.find((s) => s.value === value)?.label ?? value;

export const UPLOAD = {
  maxMb: 5,
  types: ['image/jpeg', 'image/png', 'image/webp'],
  folders: { products: 'products', projects: 'projects', banners: 'banners', site: 'site' },
};

export const PAGE_SIZE = { products: 12, projects: 9, admin: 20 };

export const DEFAULT_LOGO = '/images/logo.png';
export const DEFAULT_LOGO_LIGHT = '/images/logo-light.png';
export const LOGO_ICON = '/images/logo-icon.png';
export const PLACEHOLDER_IMG = '/images/placeholder.svg';
