import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PageLoader from '@/components/common/PageLoader';
import RouteError from '@/components/common/RouteError';
import PublicLayout from '@/components/layout/PublicLayout';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import ProductsPage from '@/pages/ProductsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import ProjectsPage from '@/pages/ProjectsPage';
import TermsPage from '@/pages/TermsPage';

// Admin — every module is code-split so public visitors never download admin code.
const AdminRoot = lazy(() => import('@/admin/AdminRoot'));
const ProtectedLayout = lazy(() => import('@/admin/layout/ProtectedLayout'));
const LoginPage = lazy(() => import('@/admin/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/admin/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/admin/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/admin/pages/DashboardPage'));
const ProductListPage = lazy(() => import('@/admin/pages/products/ProductListPage'));
const ProductFormPage = lazy(() => import('@/admin/pages/products/ProductFormPage'));
const CategoriesPage = lazy(() => import('@/admin/pages/categories/CategoriesPage'));
const ProjectListPage = lazy(() => import('@/admin/pages/projects/ProjectListPage'));
const ProjectFormPage = lazy(() => import('@/admin/pages/projects/ProjectFormPage'));
const EnquiryListPage = lazy(() => import('@/admin/pages/enquiries/EnquiryListPage'));
const EnquiryDetailPage = lazy(() => import('@/admin/pages/enquiries/EnquiryDetailPage'));
const BannersPage = lazy(() => import('@/admin/pages/content/BannersPage'));
const FeaturedPage = lazy(() => import('@/admin/pages/content/FeaturedPage'));
const SettingsPage = lazy(() => import('@/admin/pages/settings/SettingsPage'));
const AccountPage = lazy(() => import('@/admin/pages/account/ChangePasswordPage'));

const s = (Component, props) => (
  <Suspense fallback={<PageLoader />}>
    <Component {...props} />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:slug', element: <ProjectDetailPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'terms-and-conditions', element: <TermsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: s(AdminRoot),
    errorElement: <RouteError />,
    children: [
      { path: 'login', element: s(LoginPage) },
      { path: 'forgot-password', element: s(ForgotPasswordPage) },
      { path: 'reset-password', element: s(ResetPasswordPage) },
      {
        element: s(ProtectedLayout),
        children: [
          { index: true, element: s(DashboardPage) },
          { path: 'products', element: s(ProductListPage) },
          { path: 'products/new', element: s(ProductFormPage) },
          { path: 'products/:id/edit', element: s(ProductFormPage) },
          { path: 'categories', element: s(CategoriesPage) },
          { path: 'projects', element: s(ProjectListPage) },
          { path: 'projects/new', element: s(ProjectFormPage) },
          { path: 'projects/:id/edit', element: s(ProjectFormPage) },
          { path: 'enquiries', element: s(EnquiryListPage) },
          { path: 'enquiries/:id', element: s(EnquiryDetailPage) },
          { path: 'banners', element: s(BannersPage) },
          { path: 'featured', element: s(FeaturedPage) },
          { path: 'settings', element: s(SettingsPage) },
          { path: 'account', element: s(AccountPage) },
          { path: '*', element: <NotFoundPage admin /> },
        ],
      },
    ],
  },
]);
