import { useQuery } from '@tanstack/react-query';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { cn } from '@/lib/cn';
import { LOGO_ICON } from '@/lib/constants';
import { queryKeys } from '@/lib/queryKeys';
import { ADMIN_NAV } from './navItems';

export function useUnreadCount() {
  const { data } = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: adminApi.dashboard,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
  return data?.enquiries?.unread ?? 0;
}

export function SidebarNav({ collapsed = false, onNavigate }) {
  const unread = useUnreadCount();

  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-1">
        {ADMIN_NAV.map(({ label, to, Icon, end, badge }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  isActive ? 'bg-accent text-primary' : 'text-primary-200 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className={cn('truncate', collapsed && 'sr-only')}>{label}</span>
              {badge === 'unread' && unread > 0 && (
                <span
                  className={cn(
                    'ml-auto inline-flex min-w-[22px] items-center justify-center rounded-full bg-danger px-1.5 text-xs font-bold text-white',
                    collapsed && 'absolute right-1 top-1 ml-0 min-w-[18px] text-[10px]',
                  )}
                  aria-label={`${unread} unread`}
                >
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SidebarBrand({ collapsed }) {
  return (
    <div className={cn('flex h-16 items-center gap-2.5 border-b border-white/10 px-4', collapsed && 'justify-center px-0')}>
      <img src={LOGO_ICON} alt="" width="783" height="525" className="h-9 w-auto shrink-0" />
      {!collapsed && (
        <span className="leading-none">
          <span className="block text-lg font-extrabold tracking-[0.08em] text-white">ARKA</span>
          <span className="block text-[10px] font-semibold tracking-[0.2em] text-brand-light">ADMIN PANEL</span>
        </span>
      )}
    </div>
  );
}

/** Fixed sidebar from lg up, collapsible to icons. */
export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden flex-col bg-primary-800 transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <SidebarBrand collapsed={collapsed} />
      <SidebarNav collapsed={collapsed} />
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[48px] items-center justify-center gap-2 border-t border-white/10 text-sm text-primary-200 hover:bg-white/5 hover:text-white"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
