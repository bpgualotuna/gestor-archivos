# Recomendaciones y Mejores Prácticas

## 🔐 Seguridad

### 1. Autenticación y Autorización

**Implementar NextAuth:**
```typescript
// lib/auth/auth-config.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { query } from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const result = await query(
          'SELECT * FROM users WHERE email = $1',
          [credentials?.email]
        );
        
        const user = result.rows[0];
        if (!user) return null;
        
        const isValid = await compare(
          credentials?.password || '',
          user.password_hash
        );
        
        if (!isValid) return null;
        
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
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  }
};
```

**Middleware de Protección:**
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      
      // Rutas públicas
      if (path.startsWith('/login')) return true;
      
      // Requiere autenticación
      if (!token) return false;
      
      // Admin routes
      if (path.startsWith('/admin')) {
        return token.role === 'ADMIN';
      }
      
      return true;
    },
  },
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 2. Validación de Permisos por Rol

```typescript
// lib/auth/permissions.ts
import { UserRole } from '@/types/user.types';

export const canApproveStep = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return userRole === requiredRole || userRole === 'ADMIN';
};

export const canEditCase = (userId: string, caseCreatorId: string, userRole: UserRole): boolean => {
  return userId === caseCreatorId || userRole === 'ADMIN';
};

export const canViewCase = (userId: string, caseCreatorId: string, userRole: UserRole): boolean => {
  // Admin puede ver todo
  if (userRole === 'ADMIN') return true;
  
  // Creador puede ver su caso
  if (userId === caseCreatorId) return true;
  
  // Áreas pueden ver casos en su flujo
  const areaRoles: UserRole[] = ['COMERCIAL', 'TECNICA', 'FINANCIERA', 'LEGAL'];
  return areaRoles.includes(userRole);
};
```

### 3. Rate Limiting

```typescript
// lib/utils/rate-limit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Uso en API route
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip ?? '127.0.0.1';
    await limiter.check(10, ip); // 10 requests por minuto
    
    // ... resto del código
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
}
```

## 🚀 Performance

### 1. Optimización de Queries

```typescript
// Usar índices compuestos
CREATE INDEX idx_cases_status_created ON cases(status, created_at DESC);

// Paginación
export async function getCasesPaginated(
  page: number = 1,
  limit: number = 20
): Promise<{ cases: Case[]; total: number }> {
  const offset = (page - 1) * limit;
  
  const [casesResult, countResult] = await Promise.all([
    query(
      `SELECT * FROM cases_with_creator 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    query('SELECT COUNT(*) FROM cases')
  ]);
  
  return {
    cases: casesResult.rows,
    total: parseInt(countResult.rows[0].count)
  };
}
```

### 2. Caché con React Query

```typescript
// hooks/useCases.ts
export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: fetchCases,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
```

### 3. Lazy Loading de Componentes

```typescript
// app/(dashboard)/cases/[id]/page.tsx
import dynamic from 'next/dynamic';

const Timeline = dynamic(() => import('@/components/history/Timeline'), {
  loading: () => <Loader2 className="animate-spin" />,
  ssr: false,
});

const FileUploader = dynamic(() => import('@/components/files/FileUploader'), {
  loading: () => <div>Cargando...</div>,
});
```

## 📊 Monitoreo y Logging

### 1. Logging Estructurado

```typescript
// lib/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Uso
logger.info({ caseId, userId }, 'Case created');
logger.error({ error, caseId }, 'Failed to upload file');
```

### 2. Métricas

```typescript
// lib/utils/metrics.ts
export class Metrics {
  static async trackCaseCreation(duration: number) {
    // Enviar a servicio de métricas (DataDog, New Relic, etc.)
    console.log(`Case creation took ${duration}ms`);
  }
  
  static async trackFileUpload(fileSize: number, duration: number) {
    console.log(`File upload: ${fileSize} bytes in ${duration}ms`);
  }
}

// Uso en service
const start = Date.now();
const newCase = await CaseService.createCase(data, userId);
await Metrics.trackCaseCreation(Date.now() - start);
```

## 🧪 Testing

### 1. Tests Unitarios

```typescript
// services/__tests__/case.service.test.ts
import { CaseService } from '../case.service';
import { query } from '@/lib/db';

jest.mock('@/lib/db');

describe('CaseService', () => {
  describe('createCase', () => {
    it('should create a case with workflow', async () => {
      const mockCase = {
        id: 'uuid',
        title: 'Test Case',
        status: 'DRAFT',
      };
      
      (query as jest.Mock).mockResolvedValue({ rows: [mockCase] });
      
      const result = await CaseService.createCase(
        { title: 'Test Case' },
        'user-id'
      );
      
      expect(result).toEqual(mockCase);
      expect(query).toHaveBeenCalled();
    });
  });
});
```

### 2. Tests de Integración

```typescript
// app/api/cases/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/cases', () => {
  it('should create a new case', async () => {
    const request = new NextRequest('http://localhost:3000/api/cases', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Case',
        description: 'Test description',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
  });
});
```

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: test_db
          DB_USER: postgres
          DB_PASSWORD: postgres
      
      - name: Build
        run: npm run build
```

## 📱 Responsive Design

```typescript
// Usar Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// Mobile-first approach
<nav className="flex flex-col md:flex-row gap-4">
  {/* Navigation items */}
</nav>
```

## 🌐 Internacionalización (i18n)

```typescript
// lib/i18n/es.ts
export const es = {
  cases: {
    title: 'Casos',
    create: 'Crear Caso',
    status: {
      DRAFT: 'Borrador',
      SUBMITTED: 'Enviado',
      // ...
    }
  }
};

// Uso
import { es } from '@/lib/i18n/es';

<h1>{es.cases.title}</h1>
```

## 🔧 Mantenimiento

### 1. Limpieza de Archivos Antiguos

```sql
-- Script para limpiar archivos eliminados hace más de 30 días
DELETE FROM files 
WHERE is_deleted = true 
  AND deleted_at < NOW() - INTERVAL '30 days';
```

### 2. Backup Automático

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="gestion_archivos"

# Backup de PostgreSQL
pg_dump $DB_NAME > "$BACKUP_DIR/db_$DATE.sql"

# Comprimir
gzip "$BACKUP_DIR/db_$DATE.sql"

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

### 3. Monitoreo de Salud

```typescript
// app/api/health/route.ts
import { query } from '@/lib/db';
import { getBlobStorage } from '@/lib/azure/blob-storage';

export async function GET() {
  const checks = {
    database: false,
    azureBlob: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await query('SELECT 1');
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    const blobStorage = getBlobStorage();
    await blobStorage.ensureContainer();
    checks.azureBlob = true;
  } catch (error) {
    console.error('Azure Blob health check failed:', error);
  }

  const isHealthy = checks.database && checks.azureBlob;
  
  return Response.json(checks, {
    status: isHealthy ? 200 : 503,
  });
}
```

## 📚 Documentación de API

Usar herramientas como Swagger/OpenAPI:

```typescript
// lib/swagger.ts
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Sistema de Gestión de Archivos API',
        version: '1.0.0',
      },
    },
  });
  return spec;
};
```

---

Estas recomendaciones te ayudarán a mantener el sistema seguro, escalable y fácil de mantener en producción.
