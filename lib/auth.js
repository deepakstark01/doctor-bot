/*********** Authentication Functions ***********/
import Cookies from 'js-cookie';
export function setAuthToken(user) {
  const userData = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    phone: user.phone
  };
  
  Cookies.set('auth_user', JSON.stringify(userData), { 
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
}


export function getAuthToken() {
  try {
    const userData = Cookies.get('auth_user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing auth token:', error);
    removeAuthToken();
    return null;
  }
}


export function removeAuthToken() {
  Cookies.remove('auth_user');
  Cookies.remove('auth_user', { path: '/' }); 
}


export function isAuthenticated() {
  return !!getAuthToken();
}


export function isAdmin() {
  const user = getAuthToken();
  return user?.role === 'admin';
}


export function isPatient() {
  const user = getAuthToken();
  return user?.role === 'patient';
}


export function requireAuth() {
  if (typeof window !== 'undefined' && !isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  return true;
}


export function requireAdmin() {
  if (typeof window !== 'undefined') {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return false;
    }
    if (!isAdmin()) {
      window.location.href = '/';
      return false;
    }
  }
  return true;
}


export function requirePatient() {
  if (typeof window !== 'undefined') {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return false;
    }
    if (!isPatient()) {
      window.location.href = '/';
      return false;
    }
  }
  return true;
}


export function getUserRole() {
  const user = getAuthToken();
  return user?.role || null;
}


export function getCurrentUserId() {
  const user = getAuthToken();
  return user?.id || null;
}


export function canAccessAdmin() {
  return isAuthenticated() && isAdmin();
}


export function canBookAppointments() {
  return isAuthenticated() && isPatient();
}


export function getUserDisplayName() {
  const user = getAuthToken();
  if (!user) return 'Guest';
  return user.full_name || user.username || 'User';
}