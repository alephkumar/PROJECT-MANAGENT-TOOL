export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isOverdue = (deadline, status) => {
  if (status === 'Completed') return false;
  return new Date(deadline) < new Date();
};

export const daysUntil = (date) => {
  const diff = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

export const priorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'badge-danger';
    case 'Medium':
      return 'badge-warning';
    case 'Low':
      return 'badge-success';
    default:
      return 'badge-neutral';
  }
};

export const statusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'badge-success';
    case 'In Progress':
      return 'badge-info';
    case 'Review':
      return 'badge-purple';
    case 'Not Started':
    case 'To Do':
      return 'badge-neutral';
    default:
      return 'badge-neutral';
  }
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const truncate = (text = '', length = 100) =>
  text.length > length ? `${text.slice(0, length)}…` : text;
