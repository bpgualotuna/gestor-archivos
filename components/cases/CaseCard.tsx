import Link from 'next/link';
import { CaseWithCreator } from '@/types/case.types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { format } from 'date-fns';
import { FileText, MessageSquare, Calendar } from 'lucide-react';

interface CaseCardProps {
  case: CaseWithCreator;
}

export function CaseCard({ case: caseData }: CaseCardProps) {
  return (
    <Link href={`/cases/${caseData.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{caseData.title}</h3>
              <StatusBadge status={caseData.status} size="sm" />
            </div>
            <p className="text-sm text-gray-600 mb-2">{caseData.caseNumber}</p>
            {caseData.description && (
              <p className="text-sm text-gray-700 line-clamp-2">{caseData.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{caseData.fileCount} archivos</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{caseData.commentCount} comentarios</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
          <div>
            <span className="font-medium">Creado por:</span> {caseData.creatorName}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(caseData.createdAt), "d 'de' MMM, yyyy")}
          </div>
        </div>
      </div>
    </Link>
  );
}
