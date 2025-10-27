import React from 'react';
import { AIPolicyRuleStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface RuleStatusBadgeProps {
  status: AIPolicyRuleStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RuleStatusBadge: React.FC<RuleStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const getStatusConfig = (status: AIPolicyRuleStatus) => {
    switch (status) {
      case AIPolicyRuleStatus.IMPLEMENTED:
        return {
          label: t('policy.implemented'),
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
          borderColor: 'border-green-500/50',
          icon: CheckCircle2
        };
      case AIPolicyRuleStatus.IN_PROGRESS:
        return {
          label: t('policy.in_progress'),
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-400',
          borderColor: 'border-yellow-500/50',
          icon: Clock
        };
      case AIPolicyRuleStatus.NOT_IMPLEMENTED:
        return {
          label: t('policy.not_implemented'),
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/50',
          icon: XCircle
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${sizeClasses[size]}
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
      `}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
};
