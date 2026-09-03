import React, { useState, useEffect } from 'react';
import { Map, Video, Database, AlertOctagon, Route, ShieldCheck, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'map', label: 'GIS Command Map', icon: Map },
  { id: 'videowall', label: 'Live Video Wall', icon: Video },
  { id: 'registry', label: 'Camera Registry', icon: Database },
  { id: 'watchlist', label: 'Watchlist DB', icon: AlertOctagon },
  { id: 'tracking', label: 'Vehicle Route Trace', icon: Route },
  { id: 'evidence', label: 'BSA 2023 Evidence Vault', icon: ShieldCheck }
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const { isTabAllowed, currentRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse sidebar below 1024px viewport width per section 6
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside style={{
      width: collapsed ? '64px' : '220px',
      background: '#002045',
      borderRight: '1px solid #1a365d',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 900,
      flexShrink: 0
    }}>
      {/* Nav List */}
      <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const allowed = isTabAllowed(item.id);
          const isActive = activeTab === item.id;

          if (!allowed) return null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? '#1a365d' : 'transparent',
                color: isActive ? '#ffffff' : '#86a0cd',
                border: 'none',
                borderLeft: isActive ? '3px solid #fe932c' : '3px solid transparent',
                borderRadius: collapsed ? '4px' : '0 4px 4px 0',
                cursor: 'pointer',
                fontFamily: 'var(--font-headline)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseOut={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#86a0cd';
                }
              }}
            >
              <Icon size={18} color={isActive ? '#fe932c' : 'currentColor'} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div style={{
        padding: '10px 8px',
        borderTop: '1px solid #1a365d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        {!collapsed && (
          <div style={{ fontSize: '10px', color: '#86a0cd', fontFamily: 'var(--font-mono)' }}>
            VMS NAV • {currentRole.badge}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          style={{
            background: '#1a365d',
            border: 'none',
            color: '#adc7f7',
            padding: '6px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}
