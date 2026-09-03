import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, ChevronDown, Check, ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { currentRole, user, switchRole, ROLES } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

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

      {/* Right Telemetry: Clock, User Avatar, Role Badge & Switcher */}
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
          <span>{timeStr || '16:10:00 IST'}</span>
        </div>

        {/* User Identity & Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
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
                color: '#fe932c',
                fontWeight: 700
              }}>
                {currentRole.badge}
              </span>
            </div>

            <ChevronDown size={12} color="#86a0cd" />
          </button>

          {/* Interactive RBAC Switcher Dropdown */}
          {showRoleDropdown && (
            <div style={{
              position: 'absolute',
              top: '38px',
              right: 0,
              width: '240px',
              background: '#ffffff',
              border: '1px solid #c4c6cf',
              borderRadius: '6px',
              boxShadow: '0 8px 16px rgba(0, 32, 69, 0.15)',
              zIndex: 2000,
              padding: '8px 0',
              color: '#191c1e'
            }}>
              <div style={{ padding: '6px 12px', borderBottom: '1px solid #eceef0', fontSize: '10px', color: '#74777f', fontWeight: 700, letterSpacing: '0.04em' }}>
                SWITCH ACTIVE ROLE (RBAC)
              </div>

              {Object.keys(ROLES).map((roleKey) => {
                const role = ROLES[roleKey];
                const isActive = currentRole.id === role.id;
                return (
                  <button
                    key={roleKey}
                    onClick={() => {
                      switchRole(roleKey);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: isActive ? '#f2f4f6' : 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#002045' }}>{role.label}</div>
                      <div style={{ fontSize: '10px', color: '#74777f' }}>{role.department}</div>
                    </div>
                    {isActive && <Check size={14} color="#15803d" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
