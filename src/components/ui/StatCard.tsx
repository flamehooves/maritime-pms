import { type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; direction: 'up' | 'down'; label?: string };
  color?: 'default' | 'danger' | 'warning' | 'success' | 'info' | 'purple' | 'teal';
  size?: 'sm' | 'md';
  variant?: 'default' | 'pastel';
  onClick?: () => void;
}

const colorMap = {
  default: {
    icon: 'text-slate-500 bg-slate-100',
    value: 'text-slate-900',
    bg: 'bg-white',
    pastelBg: '#F5F5F7',
    pastelIconBg: '#E5E5EA',
    pastelIconColor: '#6B7280',
    pastelValue: '#1C1C1E',
  },
  danger: {
    icon: 'text-red-600 bg-red-50',
    value: 'text-red-700',
    bg: 'bg-white',
    pastelBg: '#FFE5E4',
    pastelIconBg: '#FFCCCB',
    pastelIconColor: '#FF453A',
    pastelValue: '#CC1100',
  },
  warning: {
    icon: 'text-orange-500 bg-orange-50',
    value: 'text-orange-600',
    bg: 'bg-white',
    pastelBg: '#eef2ff',
    pastelIconBg: '#FFE4B0',
    pastelIconColor: '#FF9F0A',
    pastelValue: '#3730a3',
  },
  success: {
    icon: 'text-emerald-600 bg-emerald-50',
    value: 'text-emerald-700',
    bg: 'bg-white',
    pastelBg: '#DCFCE7',
    pastelIconBg: '#BBF7D0',
    pastelIconColor: '#34C759',
    pastelValue: '#15803D',
  },
  info: {
    icon: 'text-blue-500 bg-blue-50',
    value: 'text-blue-600',
    bg: 'bg-white',
    pastelBg: '#EBF2FF',
    pastelIconBg: '#BFDBFE',
    pastelIconColor: '#5B8DEF',
    pastelValue: '#1D4ED8',
  },
  purple: {
    icon: 'text-purple-600 bg-purple-50',
    value: 'text-purple-700',
    bg: 'bg-white',
    pastelBg: '#F3E8FF',
    pastelIconBg: '#E9D5FF',
    pastelIconColor: '#BF5AF2',
    pastelValue: '#7C3AED',
  },
  teal: {
    icon: 'text-teal-600 bg-teal-50',
    value: 'text-teal-700',
    bg: 'bg-white',
    pastelBg: '#E0F7FF',
    pastelIconBg: '#BAF0FF',
    pastelIconColor: '#5AC8FA',
    pastelValue: '#0369A1',
  },
};

export function StatCard({ label, value, icon, trend, color = 'default', size = 'md', variant = 'default', onClick }: StatCardProps) {
  const colors = colorMap[color] ?? colorMap.default;
  const isPastel = variant === 'pastel';

  if (size === 'sm') {
    if (isPastel) {
      return (
        <div
          className={`rounded-2xl p-4 ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-all' : ''}`}
          style={{ background: colors.pastelBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          onClick={onClick}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: colors.pastelIconColor }}>{label}</span>
            {icon && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: colors.pastelIconBg, color: colors.pastelIconColor }}>
                {icon}
              </div>
            )}
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: colors.pastelValue }}>{value}</div>
          {trend && (
            <div className={`text-xs mt-1 flex items-center gap-1 ${trend.direction === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`bg-white rounded-2xl p-3 ${onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}
        onClick={onClick}
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 font-medium">{label}</span>
          {icon && <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${colors.icon}`}>{icon}</div>}
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
      className={`rounded-2xl p-5 ${onClick ? 'cursor-pointer hover:scale-[1.01] transition-all' : ''}`}
      onClick={onClick}
      style={{
        background: isPastel ? colors.pastelBg : '#FFFFFF',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: isPastel ? colors.pastelIconColor : '#6B7280' }}>{label}</p>
          <p className={`text-3xl font-bold tracking-tight`} style={{ color: isPastel ? colors.pastelValue : undefined, ...(isPastel ? {} : {}) }}>
            <span className={isPastel ? '' : colors.value}>{value}</span>
          </p>
          {trend && (
            <div className={`text-xs mt-2 flex items-center gap-1 ${trend.direction === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% {trend.label ?? 'vs last month'}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPastel ? '' : colors.icon}`}
            style={isPastel ? { background: colors.pastelIconBg, color: colors.pastelIconColor } : {}}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
