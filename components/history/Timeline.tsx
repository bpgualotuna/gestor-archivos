import { AuditLogWithUser } from '@/types/history.types';
import { format } from 'date-fns';

interface TimelineProps {
  history: AuditLogWithUser[];
}

const actionLabels: Record<string, string> = {
  CREATED: 'Caso creado',
  SUBMITTED: 'Caso enviado',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  RETURNED: 'Devuelto para correcciones',
  UPDATED: 'Actualizado',
  FILE_UPLOADED: 'Archivo subido',
  FILE_DELETED: 'Archivo eliminado',
  COMMENT_ADDED: 'Comentario agregado',
  STATUS_CHANGED: 'Estado cambiado',
  ASSIGNED: 'Asignado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

const actionColors: Record<string, string> = {
  CREATED: 'bg-blue-500',
  SUBMITTED: 'bg-blue-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  RETURNED: 'bg-orange-500',
  UPDATED: 'bg-gray-500',
  FILE_UPLOADED: 'bg-purple-500',
  FILE_DELETED: 'bg-red-500',
  COMMENT_ADDED: 'bg-blue-500',
  STATUS_CHANGED: 'bg-yellow-500',
  ASSIGNED: 'bg-indigo-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
};

export function Timeline({ history }: TimelineProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay historial disponible
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {idx !== history.length - 1 && (
                <span
                  className="absolute left-3 sm:left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-2 sm:space-x-3">
                <div className="flex-shrink-0">
                  <span
                    className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ring-4 sm:ring-8 ring-white ${
                      actionColors[item.action] || 'bg-gray-500'
                    }`}
                  >
                    <span className="text-white text-xs font-bold">
                      {actionLabels[item.action]?.[0] || '?'}
                    </span>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:justify-between sm:space-x-4 pt-0.5 sm:pt-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900">
                      {actionLabels[item.action] || item.action}
                      {item.userName && (
                        <span className="font-medium text-gray-900"> por {item.userName}</span>
                      )}
                    </p>
                    {item.comments && (
                      <p className="mt-1 text-xs sm:text-sm text-gray-600 break-words">{item.comments}</p>
                    )}
                    {item.newValue && (
                      <div className="mt-1 text-xs text-gray-500 break-all">
                        {JSON.stringify(item.newValue)}
                      </div>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-left sm:text-right text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
                    <time dateTime={item.createdAt.toString()}>
                      {format(new Date(item.createdAt), "d 'de' MMM, HH:mm")}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
