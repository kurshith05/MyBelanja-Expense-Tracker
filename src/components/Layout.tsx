import { useState } from 'react';
import {
  LayoutDashboard, PlusCircle, History, Wallet, Tag, BarChart3,
  Settings, Menu, X, TrendingDown, Bell, LogOut
} from 'lucide-react';
import { Screen, UserProfile } from '../types';

interface NavItem {
  id: Screen;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'add-expense', label: 'Add Expense', icon: <PlusCircle size={18} /> },
  { id: 'expense-history', label: 'History', icon: <History size={18} /> },
  { id: 'monthly-budget', label: 'Budget', icon: <Wallet size={18} /> },
  { id: 'categories', label: 'Categories', icon: <Tag size={18} /> },
  { id: 'monthly-reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

interface LayoutProps {
  current: Screen;
  onNavigate: (screen: Screen) => void;
  children: React.ReactNode;
  profile: UserProfile;
  onSignOut: () => void;
}

export default function Layout({ current, onNavigate, children, profile, onSignOut }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (profile.name || profile.email || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F7FF' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-60 shrink-0 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: '#FFFFFF', borderRight: '1px solid #E5E0F8' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#7C3AED' }}>
              <TrendingDown size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>
              MyBelanja
            </span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} style={{ color: '#6B7280' }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? '#EDE9FE' : 'transparent',
                  color: active ? '#7C3AED' : '#6B7280',
                  fontFamily: 'Outfit, sans-serif',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#F5F3FF';
                    (e.currentTarget as HTMLButtonElement).style.color = '#1A1028';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#6B7280';
                  }
                }}
              >
                <span style={{ color: active ? '#7C3AED' : 'inherit' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="p-3 m-3 rounded-xl" style={{ background: '#F5F3FF' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: '#7C3AED', fontFamily: 'Outfit, sans-serif' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#1A1028', fontFamily: 'Outfit, sans-serif' }}>{profile.name || profile.email}</p>
              <p className="text-xs truncate" style={{ color: '#6B7280' }}>{profile.currency}</p>
            </div>
            <button
              onClick={onSignOut}
              title="Sign out"
              className="p-1.5 rounded-lg shrink-0"
              style={{ color: '#6B7280' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EDE9FE'; (e.currentTarget as HTMLButtonElement).style.color = '#7C3AED'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7280'; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between px-5 py-3.5" style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E0F8' }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg" style={{ color: '#6B7280' }} onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>
                {navItems.find(n => n.id === current)?.label}
              </h1>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-xl flex items-center justify-center relative" style={{ background: '#F5F3FF' }}>
              <Bell size={16} style={{ color: '#7C3AED' }} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#7C3AED' }} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: '#7C3AED', fontFamily: 'Outfit, sans-serif' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
