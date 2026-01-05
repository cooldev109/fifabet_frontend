import { NavLink } from 'react-router-dom';
import type { CSSProperties } from 'react';

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/statistics', label: 'Statistics', icon: '📊' },
  ];

  return (
    <aside
      style={{
        width: '220px',
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        padding: '0',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          padding: '20px 16px',
          borderBottom: '1px solid #374151',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '18px', color: 'white', fontWeight: 'bold' }}>
          Betting Monitor
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
          Goal Line Detection
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }: { isActive: boolean }): CSSProperties => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 20px',
              textDecoration: 'none',
              background: isActive ? '#374151' : 'transparent',
              color: isActive ? 'white' : '#9ca3af',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '400',
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
            })}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      {onLogout && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #374151',
          }}
        >
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ef4444';
            }}
          >
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #374151',
          fontSize: '11px',
          color: '#6b7280',
        }}
      >
        v1.0.0 | BetsAPI
      </div>
    </aside>
  );
}

export default Sidebar;
