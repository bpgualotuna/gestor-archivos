'use client';

import { CreateCaseForm } from '@/components/cases/CreateCaseForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewCasePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a casos
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Caso</h2>
        <p className="text-gray-600 mt-1">
          Completa la información para crear un nuevo caso
        </p>
      </div>

      <CreateCaseForm />
    </div>
  );
}
