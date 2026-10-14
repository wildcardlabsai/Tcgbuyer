import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';
import {
  LayoutDashboard, Inbox, Send, ShoppingBag, Users, Settings, LogOut,
  Menu, X, Tag, UserCircle,
} from 'lucide-react';

const dealerNav = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/submissions', icon: Inbox, label: 'Submissions' },
  { to: '/app/offers', icon: Send, label: 'Offers' },
  { to: '/app/customers', icon: Users, label: 'Customers' },
  { to: '/app/portal', icon: Tag, label: 'Portal Settings' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/applications', icon: Inbox, label: 'Applications' },
  { to: '/admin/dealers', icon: ShoppingBag, label: 'Dealers' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export const AppShell: React.FC<{ variant: 'dealer' | 'admin' }> = ({ variant }) => {
  const { profile, organisation, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = variant === 'admin' ? adminNav : dealerNav;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          minWidth: '240px',
          background: 'var(--color-navy)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: sidebarOpen ? 0 : '-240px',
          zIndex: 50,
          transition: 'left 0.2s',
        }}
        className="app-sidebar"
      >
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo height={24} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close-btn"
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {variant === 'admin' && (
          <div style={{ padding: '0 20px 12px' }}>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Admin Panel
            </span>
          </div>
        )}

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                transition: 'all 0.15s',
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--color-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.7rem', fontWeight: 700,
            }}>
              {(profile?.full_name || profile?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {variant === 'admin' ? (profile?.full_name || 'Admin') : (organisation?.name || profile?.full_name || 'Account')}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '8px 0', background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: '240px', minWidth: 0 }} className="app-main">
        {/* Mobile top bar */}
        <div className="app-mobile-header" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--color-navy)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <Menu size={24} />
          </button>
          <Logo height={20} />
          <NavLink to={variant === 'admin' ? '/admin' : '/app/settings'} style={{ color: '#fff' }}>
            <UserCircle size={24} />
          </NavLink>
        </div>

        <main style={{ padding: '24px 32px', maxWidth: '1400px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
