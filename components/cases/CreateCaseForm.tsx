'use client';

import { useState } from 'react';
import { useCreateCase } from '@/hooks/useCases';
import { useRouter } from 'next/navigation';
import { DocumentType, SignatureType, TemplateType } from '@/types/case.types';

export function CreateCaseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [documentFileName, setDocumentFileName] = useState('');
  const [odooCode, setOdooCode] = useState('');
  const [clientProvider, setClientProvider] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('CONTRATO');
  const [sharepointUrl, setSharepointUrl] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState('');
  const [urgencyJustification, setUrgencyJustification] = useState('');
  const [signatureType, setSignatureType] = useState<SignatureType>('FISICA');
  const [templateType, setTemplateType] = useState<TemplateType>('PLANTILLA_COMWARE');
  const [observations, setObservations] = useState('');

  const router = useRouter();
  const createMutation = useCreateCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate(
      {
        title,
        description: description || undefined,
        priority: 0,
        advisorName: advisorName || undefined,
        documentFileName: documentFileName || undefined,
        odooCode: odooCode || undefined,
        clientProvider: clientProvider || undefined,
        documentType,
        sharepointUrl: sharepointUrl || undefined,
        requestDate: requestDate ? new Date(requestDate) : undefined,
        requiredDeliveryDate: requiredDeliveryDate ? new Date(requiredDeliveryDate) : undefined,
        urgencyJustification: urgencyJustification || undefined,
        signatureType,
        templateType,
        observations: observations || undefined,
      },
      {
        onSuccess: (data) => {
          router.push(`/cases/${data.id}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        Solicitud Revisión Legal y Firma de Documentos
      </h2>

      {/* Asesor Comercial */}
      <div>
        <label htmlFor="advisorName" className="block text-sm font-medium text-gray-700 mb-2">
          1. Asesor Comercial o Responsable de Solicitud <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="advisorName"
          value={advisorName}
          onChange={(e) => setAdvisorName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Nombre completo del asesor"
        />
      </div>

      {/* Nombre del Archivo */}
      <div>
        <label htmlFor="documentFileName" className="block text-sm font-medium text-gray-700 mb-2">
          2. Nombre del Documento <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="documentFileName"
          value={documentFileName}
          onChange={(e) => setDocumentFileName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Ej: 13 Formulario Compromiso Cumplimiento Código de Conducta.docx"
        />
        <p className="mt-1 text-xs text-gray-500">
          IMPORTANTE: Debe ingresar el nombre completo incluyendo la extensión del archivo (.pdf - .doc), no olvide el punto (.) antes de la extensión.
        </p>
      </div>

      {/* Código Odoo */}
      <div>
        <label htmlFor="odooCode" className="block text-sm font-medium text-gray-700 mb-2">
          3. # Odoo (si aplica)
        </label>
        <input
          type="text"
          id="odooCode"
          value={odooCode}
          onChange={(e) => setOdooCode(e.target.value)}
          maxLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Ej: S12345"
        />
        <p className="mt-1 text-xs text-gray-500">
          Este código debe tener como máximo 6 caracteres, empezando con la letra "S". No es obligatorio.
        </p>
      </div>

      {/* Cliente / Proveedor */}
      <div>
        <label htmlFor="clientProvider" className="block text-sm font-medium text-gray-700 mb-2">
          4. Cliente / Proveedor <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="clientProvider"
          value={clientProvider}
          onChange={(e) => setClientProvider(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Nombre del cliente o proveedor"
        />
      </div>

      {/* Tipo de Documento */}
      <div>
        <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
          5. Tipo de Documento <span className="text-red-500">*</span>
        </label>
        <select
          id="documentType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="CONTRATO">Contrato</option>
          <option value="CONVENIO">Convenio</option>
          <option value="ACUERDO">Acuerdo</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      {/* URL SharePoint */}
      <div>
        <label htmlFor="sharepointUrl" className="block text-sm font-medium text-gray-700 mb-2">
          6. URL del SharePoint del documento enviado <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="sharepointUrl"
          value={sharepointUrl}
          onChange={(e) => setSharepointUrl(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="https://..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Todo documento debe ser subido previamente a la carpeta: 01_Ingresos en SharePoint.
        </p>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="requestDate" className="block text-sm font-medium text-gray-700 mb-2">
            7. Fecha de la solicitud <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="requestDate"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="requiredDeliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
            8. Fecha de entrega requerida <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="requiredDeliveryDate"
            value={requiredDeliveryDate}
            onChange={(e) => setRequiredDeliveryDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <p className="mt-1 text-xs text-gray-500">
            Fecha máxima que se requiere para entrega del documento firmado al cliente
          </p>
        </div>
      </div>

      {/* Urgencia - Justificación */}
      <div>
        <label htmlFor="urgencyJustification" className="block text-sm font-medium text-gray-700 mb-2">
          9. Urgencia - Justificación
        </label>
        <textarea
          id="urgencyJustification"
          value={urgencyJustification}
          onChange={(e) => setUrgencyJustification(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Si la fecha de entrega es para el mismo día o hasta 24h posteriores, incluya la justificación..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Si la fecha de entrega es urgente, debe incluir la justificación y el impacto potencial.
        </p>
      </div>

      {/* Tipo de Firma */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          10. Tipo de Firma <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="FISICA"
              checked={signatureType === 'FISICA'}
              onChange={(e) => setSignatureType(e.target.value as SignatureType)}
              className="mr-2"
            />
            <span className="text-gray-900">Física</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="ELECTRONICA"
              checked={signatureType === 'ELECTRONICA'}
              onChange={(e) => setSignatureType(e.target.value as SignatureType)}
              className="mr-2"
            />
            <span className="text-gray-900">Electrónica</span>
          </label>
        </div>
      </div>

      {/* Tipo de Plantilla */}
      <div>
        <label htmlFor="templateType" className="block text-sm font-medium text-gray-700 mb-2">
          11. Tipo de Plantilla <span className="text-red-500">*</span>
        </label>
        <select
          id="templateType"
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value as TemplateType)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="PLANTILLA_COMWARE">Plantilla Comware</option>
          <option value="PLANTILLA_CLIENTE">Plantilla Cliente</option>
          <option value="PLANTILLA_PROVEEDOR">Plantilla Proveedor</option>
        </select>
      </div>

      {/* Título (resumen interno) */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título del Caso (Resumen) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Resumen breve del caso..."
        />
      </div>

      {/* Observaciones */}
      <div>
        <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
          12. Observaciones
        </label>
        <textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Recomendamos incluir las observaciones del proceso de revisión con el GPT Legal Comercial..."
        />
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-base"
      >
        {createMutation.isPending ? 'Enviando...' : 'Enviar Solicitud'}
      </button>

      {createMutation.isError && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          Error: {createMutation.error.message}
        </div>
      )}
    </form>
  );
}
