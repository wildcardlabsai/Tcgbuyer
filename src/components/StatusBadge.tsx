import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  'Review': { bg: '#fef3c7', text: '#92400e' },
  'Offer Sent': { bg: '#dbeafe', text: '#1e40af' },
  'New': { bg: '#dcfce7', text: '#166534' },
  'Completed': { bg: '#d1fae5', text: '#065f46' },
  'Declined': { bg: '#fee2e2', text: '#991b1b' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = statusColors[status] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: colors.bg,
      color: colors.text,
    }}>
      {status}
    </span>
  );
};
