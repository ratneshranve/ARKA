import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Drawer from '@/components/ui/Drawer';
import { cn } from '@/lib/cn';
import Sidebar, { SidebarNav } from './Sidebar';
import Topbar from './Topbar';

const STORAGE_KEY = 'arka-admin-sidebar-collapsed';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? '0' : '1');
      } catch {
        /* storage unavailable */
      }
      return !c;
    });

  return (
    <div className="min-h-screen bg-muted">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} side="left" title="ARKA Admin Panel">
        <div className="flex min-h-full flex-col bg-primary-800">
          <SidebarNav onNavigate={() => setDrawerOpen(false)} />
        </div>
      </Drawer>
      <div className={cn('flex min-h-screen flex-col transition-[padding] duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <Topbar onMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
