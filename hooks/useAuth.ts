import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/user.types';

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
  const isArea = () => hasRole(['COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL']);
  
  const canCreateCase = () => hasRole(['USER', 'ADMIN']);
  const canReviewCase = () => hasRole(['COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL', 'ADMIN']);
  const canApproveCase = (caseAreaRole?: UserRole) => {
    if (!user || !caseAreaRole) return false;
    return user.role === caseAreaRole || user.role === 'ADMIN';
  };
  
  const canEditCase = (caseCreatorId?: string) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.id === caseCreatorId;
  };

  const canViewCase = (caseCreatorId?: string, caseAreaRole?: UserRole) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.id === caseCreatorId) return true;
    if (caseAreaRole && user.role === caseAreaRole) return true;
    return false;
  };

  return {
    hasRole,
    isAdmin,
    isUser,
    isArea,
    canCreateCase,
    canReviewCase,
    canApproveCase,
    canEditCase,
    canViewCase,
  };
}
