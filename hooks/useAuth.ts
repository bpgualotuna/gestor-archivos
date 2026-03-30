import { useSession } from 'next-auth/react';
import { UserRole, UserArea } from '@/types/user.types';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    status,
  };
}

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isAdmin = () => hasRole('ADMIN');
  const isUser = () => hasRole('USER');
  const isAreaUser = () => hasRole('AREA_USER');
  
  const canCreateCase = () => hasRole(['USER', 'ADMIN']);
  const canReviewCase = () => hasRole(['AREA_USER', 'ADMIN']);
  
  const canApproveCase = (caseArea?: UserArea) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'AREA_USER' && caseArea && user.area === caseArea) return true;
    return false;
  };
  
  const canEditCase = (caseCreatorId?: string) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.id === caseCreatorId;
  };

  const canViewCase = (caseCreatorId?: string, caseArea?: UserArea) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.id === caseCreatorId) return true;
    if (user.role === 'AREA_USER') return true; // AREA_USER puede ver todos los casos
    return false;
  };

  const canInteractWithCase = (caseCreatorId?: string, caseArea?: UserArea) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.id === caseCreatorId) return true;
    if (user.role === 'AREA_USER' && caseArea && user.area === caseArea) return true;
    return false;
  };

  return {
    hasRole,
    isAdmin,
    isUser,
    isAreaUser,
    canCreateCase,
    canReviewCase,
    canApproveCase,
    canEditCase,
    canViewCase,
    canInteractWithCase,
  };
}
