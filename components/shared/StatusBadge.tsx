import { CaseStatus } from '@/types/case.types';
import { WorkflowStepStatus } from '@/types/flow.types';

interface StatusBadgeProps {
  status: CaseStatus | WorkflowStepStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { label: string; color: string }> = {
  // Case statuses
  DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  SUBMITTED: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
  IN_REVIEW: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  RETURNED: { label: 'Devuelto', color: 'bg-orange-100 text-orange-800' },
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
  
  // Workflow step statuses
  PENDING: { label: 'Pendiente', color: 'bg-gray-100 text-gray-800' },
  IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
  SKIPPED: { label: 'Omitido', color: 'bg-gray-100 text-gray-800' },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
