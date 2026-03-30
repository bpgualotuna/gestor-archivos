export type UserRole = 
  | 'USER'       // Usuario normal (crea casos)
  | 'AREA_USER'  // Usuario de área (revisa casos)
  | 'ADMIN';     // Administrador

export type UserArea = 
  | 'COMERCIAL' 
  | 'TECNICA' 
  | 'FINANCIERA' 
  | 'LEGAL';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  area?: UserArea;  // Solo para AREA_USER
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
  area?: UserArea;  // Requerido si role es AREA_USER
}
