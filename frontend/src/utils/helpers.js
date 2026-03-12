export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusBadge = (status) => {
  const map = {
    PENDING: 'badge-pending',
    ACCEPTED: 'badge-accepted',
    SHIPPED: 'badge-shipped',
    DELIVERED: 'badge-delivered',
    REJECTED: 'badge-rejected',
  };
  return map[status] || 'badge-pending';
};

export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${path}`;
};

export const truncate = (str, len = 50) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};
