import { WorkflowProgressView } from '@/types/flow.types';
import { CheckCircle, Circle, XCircle, Clock } from 'lucide-react';

interface FlowStepperProps {
  steps: WorkflowProgressView[];
}

const areaLabels: Record<string, string> = {
  COMERCIAL: 'Comercial',
  TECNICA: 'Técnica',
  FINANCIERA: 'Financiera',
  LEGAL: 'Legal',
};

export function FlowStepper({ steps }: FlowStepperProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'PENDING':
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'border-green-500 bg-green-50';
      case 'REJECTED':
        return 'border-red-500 bg-red-50';
      case 'IN_PROGRESS':
        return 'border-blue-500 bg-blue-50';
      case 'PENDING':
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="py-6">
      <nav aria-label="Progress">
        <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, idx) => (
            <li key={step.stepOrder} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${getStepColor(
                  step.stepStatus
                )}`}
              >
                <div className="flex items-center">
                  {getStepIcon(step.stepStatus)}
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {step.stepName}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Área: {areaLabels[step.requiredArea] || step.requiredArea}
                </div>
                {step.reviewedByName && (
                  <div className="mt-1 text-xs text-gray-600">
                    Revisado por: {step.reviewedByName}
                  </div>
                )}
                {step.comments && (
                  <div className="mt-1 text-xs text-gray-600 italic">
                    "{step.comments}"
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
