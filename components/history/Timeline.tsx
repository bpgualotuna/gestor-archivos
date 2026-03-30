import { AuditLogWithUser } from '@/types/history.types';
import { format } from 'date-fns';
import { useState } from 'react';
import { X, Calendar, User, FileText, Info } from 'lucide-react';

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

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SUBMITTED: 'Enviado',
  IN_REVIEW: 'En Revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  RETURNED: 'Devuelto',
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
  const [selectedItem, setSelectedItem] = useState<AuditLogWithUser | null>(null);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay historial disponible
      </div>
    );
  }

  const getStatusChangeMessage = (item: AuditLogWithUser): string | null => {
    if (item.action === 'STATUS_CHANGED' && item.newValue) {
      try {
        const newValue = typeof item.newValue === 'string' 
          ? JSON.parse(item.newValue) 
          : item.newValue;
        
        if (newValue.status) {
          const statusLabel = statusLabels[newValue.status] || newValue.status;
          return `Estado cambiado a ${statusLabel}`;
        }
      } catch (e) {
        // Si hay error parseando, retornar null
      }
    }
    return null;
  };

  const formatDetailedDate = (date: Date | string) => {
    const d = new Date(date);
    return format(d, "d 'de' MMMM 'de' yyyy 'a las' HH:mm:ss");
  };

  const getDetailedInfo = (item: AuditLogWithUser) => {
    const details: { label: string; value: string }[] = [];

    // Información básica
    details.push({
      label: 'Acción',
      value: actionLabels[item.action] || item.action,
    });

    details.push({
      label: 'Fecha y Hora',
      value: formatDetailedDate(item.createdAt),
    });

    if (item.userName) {
      details.push({
        label: 'Usuario',
        value: item.userName,
      });
    }

    if (item.userEmail) {
      details.push({
        label: 'Correo',
        value: item.userEmail,
      });
    }

    // Información específica según el tipo de acción
    if (item.action === 'STATUS_CHANGED' && item.newValue) {
      try {
        const newValue = typeof item.newValue === 'string' 
          ? JSON.parse(item.newValue) 
          : item.newValue;
        
        if (newValue.status) {
          details.push({
            label: 'Nuevo Estado',
            value: statusLabels[newValue.status] || newValue.status,
          });
        }
      } catch (e) {
        // Ignorar error
      }
    }

    if (item.comments) {
      details.push({
        label: 'Comentarios',
        value: item.comments,
      });
    }

    if (item.entityType) {
      details.push({
        label: 'Tipo de Entidad',
        value: item.entityType,
      });
    }

    if (item.ipAddress) {
      details.push({
        label: 'Dirección IP',
        value: item.ipAddress,
      });
    }

    return details;
  };

  return (
    <>
      <div className="flow-root">
        <ul className="-mb-8">
          {history.map((item, idx) => {
            const statusMessage = getStatusChangeMessage(item);
            
            return (
              <li key={item.id}>
                <div className="relative pb-8">
                  {idx !== history.length - 1 && (
                    <span
                      className="absolute left-3 sm:left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div 
                    className="relative flex space-x-2 sm:space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
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
                          {statusMessage || actionLabels[item.action] || item.action}
                          {!statusMessage && item.userName && (
                            <span className="font-medium text-gray-900"> por {item.userName}</span>
                          )}
                        </p>
                        {item.comments && (
                          <p className="mt-1 text-xs sm:text-sm text-gray-600 break-words">{item.comments}</p>
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
            );
          })}
        </ul>
      </div>

      {/* Modal de detalles */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    actionColors[selectedItem.action] || 'bg-gray-500'
                  }`}
                >
                  <span className="text-white text-sm font-bold">
                    {actionLabels[selectedItem.action]?.[0] || '?'}
                  </span>
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  Detalles del Evento
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {getDetailedInfo(selectedItem).map((detail, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {detail.label === 'Fecha y Hora' && <Calendar className="w-4 h-4 text-gray-400" />}
                      {detail.label === 'Usuario' && <User className="w-4 h-4 text-gray-400" />}
                      {detail.label === 'Comentarios' && <FileText className="w-4 h-4 text-gray-400" />}
                      {!['Fecha y Hora', 'Usuario', 'Comentarios'].includes(detail.label) && (
                        <Info className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {detail.label}
                      </p>
                      <p className="mt-1 text-sm text-gray-900 break-words">
                        {detail.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
