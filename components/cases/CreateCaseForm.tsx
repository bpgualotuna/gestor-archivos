'use client';

import { useState } from 'react';
import { useCreateCase } from '@/hooks/useCases';
import { useRouter } from 'next/navigation';

export function CreateCaseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);

  const router = useRouter();
  const createMutation = useCreateCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate(
      {
        title,
        description: description || undefined,
        priority,
      },
      {
        onSuccess: (data) => {
          router.push(`/cases/${data.id}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título del Caso
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Ingresa un título descriptivo..."
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Describe el caso en detalle..."
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
          Prioridad (0-10)
        </label>
        <input
          type="number"
          id="priority"
          value={priority}
          onChange={(e) => setPriority(parseInt(e.target.value))}
          min={0}
          max={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {createMutation.isPending ? 'Creando...' : 'Crear Caso'}
      </button>

      {createMutation.isError && (
        <div className="text-red-600 text-sm">
          Error: {createMutation.error.message}
        </div>
      )}
    </form>
  );
}
