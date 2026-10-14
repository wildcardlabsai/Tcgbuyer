import React from 'react';

const iconProps = { width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const ArrowRight: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg {...iconProps} width={size} height={size} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);

export const PlayIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg {...iconProps} width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" /></svg>
);

export const CheckCircle: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg {...iconProps} width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="var(--color-green)" /><path d="M9 12l2 2 4-4" stroke="var(--color-green)" /></svg>
);

export const UploadIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
);

export const InboxIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
);

export const ClipboardIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
);

export const SettingsIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
);

export const MenuIcon: React.FC = () => (
  <svg {...iconProps} width={24} height={24} viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
);

export const CloseIcon: React.FC = () => (
  <svg {...iconProps} width={24} height={24} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

export const SearchIcon: React.FC = () => (
  <svg {...iconProps} width={16} height={16} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);

export const EnvelopeIcon: React.FC = () => (
  <svg {...iconProps} width={18} height={18} viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>
);

export const ClockIcon: React.FC = () => (
  <svg {...iconProps} width={18} height={18} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

export const SendIcon: React.FC = () => (
  <svg {...iconProps} width={18} height={18} viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);

export const CheckIcon: React.FC = () => (
  <svg {...iconProps} width={18} height={18} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
);

export const DashboardIcon: React.FC = () => (
  <svg {...iconProps} width={18} height={18} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>
);

export const UsersIcon: React.FC = () => (
  <svg {...iconProps} width={18} height={18} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

export const TagIcon: React.FC = () => (
  <svg {...iconProps} width={18} height={18} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
);

export const ShoppingBagIcon: React.FC = () => (
  <svg {...iconProps} width={18} height={18} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
);

export const ListIcon: React.FC = () => (
  <svg {...iconProps} width={18} height={18} viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
);
