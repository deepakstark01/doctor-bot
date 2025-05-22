/*************Utility functions for the Doctor Appointment System *************/


export function formatDate(dateString) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export function formatTime(timeString) {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', options);
}


export function formatDateTime(dateString, timeString) {
  return `${formatDate(dateString)} at ${formatTime(timeString)}`;
}

export function isUpcoming(appointmentDate, appointmentTime) {
  const appointmentDateTime = new Date(`${appointmentDate} ${appointmentTime}`);
  return appointmentDateTime > new Date();
}

export function getStatusColor(status) {
  switch (status) {
    case 'booked':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}


export function generateTimeSlots(startHour = 9, endHour = 17, intervalMinutes = 30) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) break;
      
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
}


export function getMinBookingDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}


export function getMaxBookingDate() {
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  return maxDate.toISOString().split('T')[0];
}


export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


export function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}


export function capitalizeWords(str) {
  if (!str) return '';
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}


export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}


export function convertTo12Hour(time24) {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}



export function convertTo24Hour(time12) {
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hours24 = hours;
  
  if (period === 'PM' && hours !== 12) hours24 += 12;
  if (period === 'AM' && hours === 12) hours24 = 0;
  
  return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}


export function getDaysOfWeek() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}


export function isWeekend(dateString) {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6; 
}


export function getRelativeTime(dateString, timeString = null) {
  const targetDate = timeString 
    ? new Date(`${dateString} ${timeString}`)
    : new Date(dateString);
  
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (Math.abs(diffMins) < 1) return 'now';
  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} minutes` : `${Math.abs(diffMins)} minutes ago`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
  }
  if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
  }
  

  return formatDate(dateString);
}


export function generateAvatarColor(seed) {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}


export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}


export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}


export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}


export function isMobile() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
}