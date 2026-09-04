import React, { createContext, useContext, useState } from 'react';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState(ROLES.SUPER_ADMIN);
  const [user, setUser] = useState({
    name: 'Inspector V. Jadeja',
    badgeNumber: 'GP-8841',
    designation: 'Senior Surveillance Officer'
  });

  const switchRole = (roleKey) => {
    if (ROLES[roleKey]) {
      setCurrentRole(ROLES[roleKey]);
    }
  };

  const isTabAllowed = (tabKey) => {
    return currentRole.allowedTabs.includes(tabKey);
  };

  const login = (roleKey, userData) => {
    if (ROLES[roleKey]) {
      setCurrentRole(ROLES[roleKey]);
    }
    if (userData) {
      setUser(userData);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
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
