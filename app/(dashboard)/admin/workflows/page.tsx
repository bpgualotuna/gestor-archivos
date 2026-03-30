import { WorkflowManagement } from '@/components/admin/WorkflowManagement';

export default function AdminWorkflowsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuración de Workflows</h1>
        <p className="text-gray-600 mt-2">Configura los flujos de aprobación del sistema</p>
      </div>
      <WorkflowManagement />
    </div>
  );
}
