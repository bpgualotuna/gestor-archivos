'use client';

import { Case } from '@/types/case.types';
import { Calendar, User, FileText, Building2, Link as LinkIcon, Clock, AlertCircle, FileSignature, FileType } from 'lucide-react';
import { formatCaseNumber } from '@/lib/utils/format';

interface CaseInformationProps {
  caseData: Case;
}

const documentTypeLabels: Record<string, string> = {
  CONTRATO: 'Contrato',
  CONVENIO: 'Convenio',
  ACUERDO: 'Acuerdo',
  OTRO: 'Otro',
};

const signatureTypeLabels: Record<string, string> = {
  FISICA: 'Física',
  ELECTRONICA: 'Electrónica',
};

const templateTypeLabels: Record<string, string> = {
  PLANTILLA_COMWARE: 'Plantilla Comware',
  PLANTILLA_CLIENTE: 'Plantilla Cliente',
  PLANTILLA_PROVEEDOR: 'Plantilla Proveedor',
};

export function CaseInformation({ caseData }: CaseInformationProps) {
  const formatDate = (date?: Date | string) => {
    if (!date) return 'No especificada';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Información General */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Información General
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Número de Caso</label>
            <p className="text-sm font-medium text-gray-900">{formatCaseNumber(caseData.caseNumber)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Título del Caso (Resumen)</label>
            <p className="text-sm font-medium text-gray-900">{caseData.title}</p>
          </div>
          {caseData.advisorName && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" />
                1. Asesor Comercial o Responsable
              </label>
              <p className="text-sm font-medium text-gray-900">{caseData.advisorName}</p>
            </div>
          )}
          {caseData.clientProvider && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                4. Cliente / Proveedor
              </label>
              <p className="text-sm font-medium text-gray-900">{caseData.clientProvider}</p>
            </div>
          )}
          {caseData.description && (
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
              <p className="text-sm text-gray-900">{caseData.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Información del Documento */}
      {(caseData.documentFileName || caseData.odooCode || caseData.documentType || caseData.sharepointUrl) && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileType className="w-5 h-5 text-purple-600" />
            Información del Documento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseData.documentFileName && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  2. Documentos Adjuntos
                </label>
                <div className="text-sm font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                  {caseData.documentFileName.split(', ').map((fileName, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{fileName}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Ver detalles en la pestaña "Archivos"</p>
              </div>
            )}
            {caseData.odooCode && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">3. Código Odoo</label>
                <p className="text-sm font-mono font-medium text-gray-900 bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                  {caseData.odooCode}
                </p>
              </div>
            )}
            {caseData.documentType && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">5. Tipo de Documento</label>
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {documentTypeLabels[caseData.documentType]}
                </span>
              </div>
            )}
            {caseData.sharepointUrl && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  6. URL SharePoint
                </label>
                <a
                  href={caseData.sharepointUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {caseData.sharepointUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fechas y Plazos */}
      {(caseData.requestDate || caseData.requiredDeliveryDate || caseData.urgencyJustification) && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Fechas y Plazos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseData.requestDate && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">7. Fecha de Solicitud</label>
                <p className="text-sm font-medium text-gray-900">{formatDate(caseData.requestDate)}</p>
              </div>
            )}
            {caseData.requiredDeliveryDate && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">8. Fecha de Entrega Requerida</label>
                <p className="text-sm font-medium text-gray-900">{formatDate(caseData.requiredDeliveryDate)}</p>
              </div>
            )}
            {caseData.urgencyJustification && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-orange-500" />
                  9. Justificación de Urgencia
                </label>
                <p className="text-sm text-gray-900 bg-orange-50 p-3 rounded border border-orange-200">
                  {caseData.urgencyJustification}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuración de Firma */}
      {(caseData.signatureType || caseData.templateType) && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-indigo-600" />
            Configuración de Firma
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseData.signatureType && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">10. Tipo de Firma</label>
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                  {signatureTypeLabels[caseData.signatureType]}
                </span>
              </div>
            )}
            {caseData.templateType && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">11. Tipo de Plantilla</label>
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {templateTypeLabels[caseData.templateType]}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Observaciones */}
      {caseData.observations && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">12. Observaciones</h3>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{caseData.observations}</p>
        </div>
      )}

      {/* Información del Sistema */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          Información del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Creación</label>
            <p className="text-sm font-medium text-gray-900">{formatDate(caseData.createdAt)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Última Actualización</label>
            <p className="text-sm font-medium text-gray-900">{formatDate(caseData.updatedAt)}</p>
          </div>
          {caseData.completedAt && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Completado</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(caseData.completedAt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
