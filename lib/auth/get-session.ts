import { getServerSession } from 'next-auth';
import { authOptions } from './auth.config';
import { UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';
import { UserRole, UserArea } from '@/types/user.types';

/**
 * Obtiene la sesión del usuario en el servidor
 */
export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Obtiene la sesión y lanza error si no está autenticado
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session || !session.user) {
    throw new UnauthorizedError('Debe iniciar sesión');
  }
  
  return session;
}

/**
 * Requiere un rol específico
 */
export async function requireRole(roles: UserRole | UserRole[]) {
  const session = await requireAuth();
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  if (!roleArray.includes(session.user.role)) {
    throw new ForbiddenError('No tiene permisos para realizar esta acción');
  }
  
  return session;
}

/**
 * Verifica si el usuario puede acceder a un caso (solo lectura)
 */
export async function canAccessCase(caseCreatorId: string, caseArea?: UserArea) {
  const session = await requireAuth();
  const user = session.user;
  
  // Admin puede ver todo
  if (user.role === 'ADMIN') return true;
  
  // Creador puede ver su caso
  if (user.id === caseCreatorId) return true;
  
  // Usuarios de área pueden ver TODOS los casos
  if (user.role === 'AREA_USER') return true;
  
  throw new ForbiddenError('No tiene acceso a este caso');
}

/**
 * Verifica si el usuario puede interactuar con un caso (subir archivos, aprobar, devolver)
 */
export async function canInteractWithCase(caseCreatorId: string, caseArea?: UserArea) {
  const session = await requireAuth();
  const user = session.user;
  
  // Admin puede interactuar con todo
  if (user.role === 'ADMIN') return true;
  
  // Creador puede interactuar con su caso
  if (user.id === caseCreatorId) return true;
  
  // Usuarios de área solo pueden interactuar si el caso está asignado a su área
  if (user.role === 'AREA_USER') {
    if (caseArea && user.area === caseArea) return true;
    throw new ForbiddenError('Solo puede interactuar con casos asignados a su área');
  }
  
  throw new ForbiddenError('No tiene permisos para interactuar con este caso');
}
