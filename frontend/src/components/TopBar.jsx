import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { currentRole, user, logout } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-bar" style={{
      height: '46px',
      background: '#002045',
      borderBottom: '1px solid #1a365d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 1000,
      flexShrink: 0
    }}>
      {/* Brand & Organization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: '#fe932c',
          color: '#002045',
          padding: '4px 6px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800
        }}>
          <Shield size={16} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '15px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.04em'
          }}>
            NETRA-GP
          </span>
          <span style={{
            background: 'rgba(254, 147, 44, 0.15)',
            color: '#fe932c',
            border: '1px solid rgba(254, 147, 44, 0.35)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            fontWeight: 700,
            padding: '1px 5px',
            borderRadius: '2px',
            letterSpacing: '0.06em'
          }}>
            GUJARAT POLICE
          </span>
          <span style={{ fontSize: '11px', color: '#86a0cd', borderLeft: '1px solid #1a365d', paddingLeft: '8px' }}>
            VMS & ANPR Platform
          </span>
        </div>
      </div>

      {/* Right Telemetry: Clock, Role Badge, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Live Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#adc7f7',
          background: 'rgba(26, 54, 93, 0.5)',
          padding: '3px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(134, 160, 205, 0.2)'
        }}>
          <Clock size={12} color="#fe932c" />
          <span>{timeStr || '00:00:00 IST'}</span>
        </div>

        {/* Role Badge (Read-Only, Locked) */}
        <div style={{
          background: currentRole.bg,
          color: currentRole.color,
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '3px',
          letterSpacing: '0.05em'
        }}>
          {currentRole.badge}
        </div>

        {/* User Identity & Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1a365d',
              border: '1px solid #27374b',
              padding: '3px 10px 3px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#ffffff'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#fe932c',
              color: '#002045',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px'
            }}>
              <User size={13} />
            </div>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', lineHeight: 1.1 }}>
                {user.name}
              </span>
              <span style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                color: '#86a0cd',
                fontWeight: 600
              }}>
                {user.badgeNumber}
              </span>
            </div>

            <ChevronDown size={12} color="#86a0cd" />
          </button>

          {/* User Profile Dropdown (No Role Switching — RBAC Enforced) */}
          {showProfileDropdown && (
            <div style={{
              position: 'absolute',
              top: '38px',
              right: 0,
              width: '260px',
              background: '#ffffff',
              border: '1px solid #c4c6cf',
              borderRadius: '8px',
              boxShadow: '0 12px 32px rgba(0, 32, 69, 0.2)',
              zIndex: 2000,
              padding: '0',
              color: '#191c1e',
              overflow: 'hidden'
            }}>
              {/* Profile Header */}
              <div style={{
                padding: '16px',
                background: '#f7f9fb',
                borderBottom: '1px solid #eceef0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#002045',
                    color: '#fe932c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    <User size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#002045' }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: '#74777f', fontFamily: 'var(--font-mono)' }}>{user.badgeNumber}</div>
                  </div>
                </div>
              </div>

              {/* Role & Department Info (Locked — Cannot Be Changed) */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #eceef0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <ShieldCheck size={14} color="#15803d" />
                  <span style={{ fontSize: '10px', color: '#74777f', fontWeight: 700, letterSpacing: '0.04em' }}>ASSIGNED ROLE (LOCKED)</span>
                </div>
                <div style={{
                  background: currentRole.bg,
                  color: currentRole.color,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  <div>{currentRole.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{currentRole.department}</div>
                </div>
              </div>

              {/* Designation */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #eceef0', fontSize: '11px', color: '#43474e' }}>
                <span style={{ color: '#74777f', fontWeight: 600 }}>Designation: </span>
                {user.designation}
              </div>

              {/* Sign Out */}
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#ba1a1a',
                  fontWeight: 700,
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ffdad6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
