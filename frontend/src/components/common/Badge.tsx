import React from 'react';
interface BadgeProps { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; children: React.ReactNode; }
const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const v: Record<string, string> = { success: 'badge-success', warning: 'badge-warning', danger: 'badge-danger', info: 'badge-info', default: 'badge-default' };
  return <span className={v[variant]}>{children}</span>;
};
export default Badge;
