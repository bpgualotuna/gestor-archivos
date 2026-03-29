export type UserRole = 
  | 'USER' 
  | 'COMERCIAL' 
  | 'TECNICA' 
  | 'FINANCIERA' 
  | 'LEGAL' 
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
