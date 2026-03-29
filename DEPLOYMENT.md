# Guía de Deployment

Esta guía te ayudará a desplegar el Sistema de Gestión de Archivos en producción.

## 📋 Pre-requisitos

- Servidor con Node.js 18+
- PostgreSQL (Azure o servidor dedicado)
- Azure Storage Account
- Dominio (opcional)

## 🚀 Deployment en Producción

### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 2. Clonar el Repositorio

```bash
# Clonar
git clone <url-del-repositorio>
cd gestor-archivos

# Instalar dependencias
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Crear archivo de producción
cp .env.example .env.production

# Editar con credenciales de producción
nano .env.production
```

Variables importantes para producción:

```env
# Database (Producción)
DB_HOST=tu-servidor-produccion.postgres.database.azure.com
DB_PORT=5432
DB_NAME=gestion_archivos_prod
DB_USER=admin_user
DB_PASSWORD='contraseña-segura'

# NextAuth (IMPORTANTE: Generar nuevo secret)
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=<generar-con-openssl-rand-base64-32>

# Azure Blob Storage (Producción)
AZURE_STORAGE_ACCOUNT=tu-cuenta-prod
AZURE_STORAGE_KEY=tu-key-prod
AZURE_CONTAINER_NAME=archivos-prod

# App Configuration
NODE_ENV=production
PORT=3000
```

### 4. Configurar Base de Datos de Producción

```bash
# Conectar a PostgreSQL de producción
psql -h <host-prod> -U <user> -d <database>

# Ejecutar scripts en orden
\i database/schema.sql
\i database/migration-auth.sql

# Crear usuarios (ajustar contraseñas en producción)
node database/seed-with-bcrypt.js
```

### 5. Build de Producción

```bash
# Construir aplicación
npm run build

# Verificar que se creó la carpeta .next
ls -la .next
```

### 6. Iniciar Aplicación

#### Opción A: PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar aplicación
pm2 start npm --name "gestor-archivos" -- start

# Configurar inicio automático
pm2 startup
pm2 save

# Ver logs
pm2 logs gestor-archivos

# Monitorear
pm2 monit
```

#### Opción B: Systemd Service

Crear archivo `/etc/systemd/system/gestor-archivos.service`:

```ini
[Unit]
Description=Sistema de Gestión de Archivos
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/gestor-archivos
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Activar servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gestor-archivos
sudo systemctl start gestor-archivos
sudo systemctl status gestor-archivos
```

### 7. Configurar Nginx (Reverse Proxy)

Crear archivo `/etc/nginx/sites-available/gestor-archivos`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar sitio:

```bash
sudo ln -s /etc/nginx/sites-available/gestor-archivos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renovación automática (ya configurada por defecto)
sudo certbot renew --dry-run
```

## 🔒 Seguridad en Producción

### 1. Firewall

```bash
# Configurar UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Usuarios de Base de Datos

```bash
# Cambiar contraseñas de usuarios de prueba
# Ejecutar en PostgreSQL:
UPDATE users SET password_hash = crypt('nueva-contraseña-segura', gen_salt('bf', 10))
WHERE email IN ('admin@sistema.com', 'comercial@sistema.com', ...);
```

### 3. Variables de Entorno

- Nunca commitear `.env.production`
- Usar contraseñas fuertes (mínimo 16 caracteres)
- Rotar `NEXTAUTH_SECRET` periódicamente
- Usar Azure Key Vault para secretos sensibles

### 4. Backups

```bash
# Backup de base de datos
pg_dump -h <host> -U <user> -d <database> > backup_$(date +%Y%m%d).sql

# Configurar backup automático (crontab)
0 2 * * * /path/to/backup-script.sh
```

## 📊 Monitoreo

### Logs de Aplicación

```bash
# PM2
pm2 logs gestor-archivos

# Systemd
sudo journalctl -u gestor-archivos -f
```

### Logs de Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitoreo de Recursos

```bash
# CPU y Memoria
pm2 monit

# Disco
df -h

# Conexiones de base de datos
psql -h <host> -U <user> -d <database> -c "SELECT count(*) FROM pg_stat_activity;"
```

## 🔄 Actualización

```bash
# Detener aplicación
pm2 stop gestor-archivos

# Actualizar código
git pull origin main

# Instalar dependencias
npm install

# Ejecutar migraciones si hay
psql -h <host> -U <user> -d <database> -f database/nueva-migracion.sql

# Rebuild
npm run build

# Reiniciar
pm2 restart gestor-archivos
```

## 🐛 Troubleshooting en Producción

### Aplicación no inicia

```bash
# Verificar logs
pm2 logs gestor-archivos --lines 100

# Verificar puerto
sudo netstat -tulpn | grep 3000

# Verificar variables de entorno
pm2 env 0
```

### Error de conexión a base de datos

```bash
# Verificar conectividad
psql -h <host> -U <user> -d <database>

# Verificar firewall de Azure
# Agregar IP del servidor en Azure Portal
```

### Archivos no se suben

```bash
# Verificar credenciales de Azure
az storage account show --name <account-name>

# Verificar contenedor
az storage container list --account-name <account-name>
```

## 📈 Optimizaciones

### 1. Caché de Next.js

```bash
# Configurar caché en nginx
location /_next/static {
    alias /path/to/gestor-archivos/.next/static;
    expires 365d;
    access_log off;
}
```

### 2. Compresión

```nginx
# En nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 3. Connection Pooling

Ya configurado en `lib/db/index.ts` con:
- Pool size: 20 conexiones
- Timeout: 30 segundos
- Keep-alive habilitado

## 📞 Soporte

Para problemas en producción, contactar al equipo de desarrollo.
