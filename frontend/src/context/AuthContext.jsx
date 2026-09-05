import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export const ROLES = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    label: 'Super Admin',
    badge: 'SUPER ADMIN',
    color: '#002045',
    bg: '#d6e3ff',
    department: 'State Police HQ',
    allowedTabs: ['map', 'videowall', 'registry', 'watchlist', 'tracking', 'evidence'],
    canMutateCameras: true,
    canMutateWatchlist: true,
    canExportReports: true
  },
  OPERATOR: {
    id: 'OPERATOR',
    label: 'Control Room Operator',
    badge: 'OPERATOR',
    color: '#15803d',
    bg: '#dcfce7',
    department: 'Command & Control Room',
    allowedTabs: ['map', 'videowall', 'tracking'],
    canMutateCameras: false,
    canMutateWatchlist: false,
    canExportReports: true
  },
  INVESTIGATOR: {
    id: 'INVESTIGATOR',
    label: 'Investigation Officer',
    badge: 'INVESTIGATOR',
    color: '#904d00',
    bg: '#ffdcc3',
    department: 'Crime Branch / CID',
    allowedTabs: ['map', 'watchlist', 'tracking', 'evidence'],
    canMutateCameras: false,
    canMutateWatchlist: false,
    canExportReports: true
  },
  DEPT_ADMIN: {
    id: 'DEPT_ADMIN',
    label: 'Department Admin',
    badge: 'DEPT ADMIN',
    color: '#1a365d',
    bg: '#e0e3e5',
    department: 'Ahmedabad Traffic Zone',
    allowedTabs: ['map', 'videowall', 'registry', 'watchlist'],
    canMutateCameras: true,
    canMutateWatchlist: true,
    canExportReports: true
  },
  VIEWER: {
    id: 'VIEWER',
    label: 'Viewer / Command',
    badge: 'VIEWER',
    color: '#43474e',
    bg: '#eceef0',
    department: 'Executive Secretariat',
    allowedTabs: ['map', 'videowall'],
    canMutateCameras: false,
    canMutateWatchlist: false,
    canExportReports: false
  }
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('netra_is_logged_in') === 'true';
  });

  const [currentRole, setCurrentRole] = useState(() => {
    const savedRole = localStorage.getItem('netra_role_key');
    return ROLES[savedRole] || ROLES.SUPER_ADMIN;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('netra_user_data');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    return {
      name: 'Inspector V. Jadeja',
      badgeNumber: 'GP-1001',
      designation: 'Senior Surveillance Officer'
    };
  });

  // Verify session on mount via HttpOnly cookie to /api/v1/auth/me
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Unauthenticated');
      })
      .then(profile => {
        if (profile) {
          const roleKey = profile.role_key || 'SUPER_ADMIN';
          if (ROLES[roleKey]) setCurrentRole(ROLES[roleKey]);
          const userData = {
            name: profile.full_name || profile.username,
            badgeNumber: profile.badge_number || profile.username,
            designation: profile.designation || profile.department
          };
          setUser(userData);
          setIsLoggedIn(true);
          localStorage.setItem('netra_is_logged_in', 'true');
          localStorage.setItem('netra_role_key', roleKey);
          localStorage.setItem('netra_user_data', JSON.stringify(userData));
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        localStorage.removeItem('netra_is_logged_in');
        localStorage.removeItem('netra_role_key');
        localStorage.removeItem('netra_user_data');
        localStorage.removeItem('netra_token');
      });
  }, []);

  const switchRole = (roleKey) => {
    if (ROLES[roleKey]) {
      setCurrentRole(ROLES[roleKey]);
      localStorage.setItem('netra_role_key', roleKey);
    }
  };

  const isTabAllowed = (tabKey) => {
    return currentRole.allowedTabs.includes(tabKey);
  };

  const login = (roleKey, userData) => {
    if (ROLES[roleKey]) {
      setCurrentRole(ROLES[roleKey]);
      localStorage.setItem('netra_role_key', roleKey);
    }
    if (userData) {
      setUser(userData);
      localStorage.setItem('netra_user_data', JSON.stringify(userData));
    }
    setIsLoggedIn(true);
    localStorage.setItem('netra_is_logged_in', 'true');
  };

  const logout = () => {
    fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).finally(() => {
      localStorage.removeItem('netra_token');
      localStorage.removeItem('netra_is_logged_in');
      localStorage.removeItem('netra_role_key');
      localStorage.removeItem('netra_user_data');
      setIsLoggedIn(false);
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, currentRole, user, switchRole, isTabAllowed, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
