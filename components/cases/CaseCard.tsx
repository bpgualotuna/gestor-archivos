import Link from 'next/link';
import { CaseWithCreator } from '@/types/case.types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { format } from 'date-fns';
import { FileText, MessageSquare, Calendar } from 'lucide-react';
import { formatCaseNumber } from '@/lib/utils/format';

interface CaseCardProps {
  case: CaseWithCreator;
}

export function CaseCard({ case: caseData }: CaseCardProps) {
  return (
    <Link href={`/cases/${caseData.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 sm:p-6 cursor-pointer border border-gray-200">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
              {caseData.title}
            </h3>
            <StatusBadge status={caseData.status} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600">{formatCaseNumber(caseData.caseNumber)}</p>
          {caseData.description && (
            <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{caseData.description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{caseData.fileCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{caseData.commentCount}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
          <div className="truncate">
            <span className="font-medium">Creado por:</span> {caseData.creatorName}
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Calendar className="w-3 h-3" />
            {format(new Date(caseData.createdAt), "d 'de' MMM, yyyy")}
          </div>
        </div>
      </div>
    </Link>
  );
}
