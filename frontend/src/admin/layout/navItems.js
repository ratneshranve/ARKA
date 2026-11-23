import {
  FolderTree,
  Images,
  Inbox,
  LayoutDashboard,
  Package,
  Settings,
  Star,
  SunMedium,
  UserCog,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export const ADMIN_NAV = [
  { label: 'Dashboard', to: ROUTES.admin.root, Icon: LayoutDashboard, end: true },
  { label: 'Products', to: ROUTES.admin.products, Icon: Package },
  { label: 'Categories', to: ROUTES.admin.categories, Icon: FolderTree },
  { label: 'Projects', to: ROUTES.admin.projects, Icon: SunMedium },
  { label: 'Enquiries', to: ROUTES.admin.enquiries, Icon: Inbox, badge: 'unread' },
  { label: 'Homepage Banners', to: ROUTES.admin.banners, Icon: Images },
  { label: 'Featured Items', to: ROUTES.admin.featured, Icon: Star },
  { label: 'Site Settings', to: ROUTES.admin.settings, Icon: Settings },
  { label: 'My Account', to: ROUTES.admin.account, Icon: UserCog },
];

/** Title for the topbar, from the most specific matching nav item. */
export function pageTitle(pathname) {
  if (/\/products\/new$/.test(pathname)) return 'Add Product';
  if (/\/products\/[^/]+\/edit$/.test(pathname)) return 'Edit Product';
  if (/\/projects\/new$/.test(pathname)) return 'Add Project';
  if (/\/projects\/[^/]+\/edit$/.test(pathname)) return 'Edit Project';
  if (/\/enquiries\/[^/]+$/.test(pathname)) return 'Enquiry Details';
  const match = [...ADMIN_NAV].reverse().find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));
  return match?.label ?? 'Admin';
}
