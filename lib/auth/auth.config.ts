import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { query } from '@/lib/db';
import { UserRole } from '@/types/user.types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        // Buscar usuario en la base de datos
        const result = await query(
          `SELECT id, email, password_hash, first_name, last_name, role, is_active 
           FROM users 
           WHERE email = $1`,
          [credentials.email]
        );

        const user = result.rows[0];

        if (!user) {
          throw new Error('Credenciales inválidas');
        }

        if (!user.is_active) {
          throw new Error('Usuario inactivo. Contacte al administrador');
        }

        // Verificar contraseña
        const isValidPassword = await compare(
          credentials.password,
          user.password_hash
        );

        if (!isValidPassword) {
          throw new Error('Credenciales inválidas');
        }

        // Actualizar último login
        await query(
          `UPDATE users 
           SET last_login = CURRENT_TIMESTAMP, 
               last_login_ip = $1 
           WHERE id = $2`,
          [null, user.id] // TODO: Obtener IP real del request
        );

        // Registrar en audit log
        await query(
          `INSERT INTO audit_log (user_id, action, entity_type, entity_id, comments)
           VALUES ($1, 'CREATED', 'session', $1, 'Usuario inició sesión')`,
          [user.id]
        );

        return {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
        };
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      // Agregar información del usuario al token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Agregar información del token a la sesión
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },
  
  jwt: {
    maxAge: 8 * 60 * 60, // 8 horas
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};
