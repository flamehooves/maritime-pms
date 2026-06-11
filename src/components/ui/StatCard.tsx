import { type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; direction: 'up' | 'down'; label?: string };
  color?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  size?: 'sm' | 'md';
  onClick?: () => void;
}

const colorMap = {
  default: { icon: 'text-slate-500 bg-slate-100', value: 'text-slate-900' },
  danger: { icon: 'text-red-600 bg-red-50', value: 'text-red-700' },
  warning: { icon: 'text-amber-600 bg-amber-50', value: 'text-amber-700' },
  success: { icon: 'text-emerald-600 bg-emerald-50', value: 'text-emerald-700' },
  info: { icon: 'text-sky-600 bg-sky-50', value: 'text-sky-700' },
};

export function StatCard({ label, value, icon, trend, color = 'default', size = 'md', onClick }: StatCardProps) {
  const colors = colorMap[color];

  if (size === 'sm') {
    return (
      <div
        className={`bg-white rounded-lg border border-slate-200 p-3 ${onClick ? 'cursor-pointer hover:border-sky-300 hover:shadow-sm transition-all' : ''}`}
        onClick={onClick}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 font-medium">{label}</span>
          {icon && <div className={`w-6 h-6 rounded flex items-center justify-center ${colors.icon}`}>{icon}</div>}
        </div>
        <div className={`text-xl font-bold ${colors.value}`}>{value}</div>
        {trend && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${trend.direction === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% {trend.label}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-5 ${onClick ? 'cursor-pointer hover:border-sky-300 hover:shadow-md transition-all' : ''}`}
      onClick={onClick}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
          <p className={`text-3xl font-bold tracking-tight ${colors.value}`}>{value}</p>
          {trend && (
            <div className={`text-xs mt-2 flex items-center gap-1 ${trend.direction === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% {trend.label ?? 'vs last month'}
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
