# 🗄️ Estructura Final de Base de Datos - Sistema de Documentos

## Tablas Activas (Solo lo que usa la aplicación)

### 1. **Users** (Tabla Madre - Usuarios del Sistema)
```sql
- id (PK)
- username (UNIQUE)
- email (UNIQUE)
- password (HASHED con bcrypt)
- rol (admin | interno | externo)
- nombre
- cargo
- departamento
- telefono
- activo
- areaId (FK → Areas)
- isVerified
- ultimoAcceso
- createdAt
- updatedAt
```

### 2. **Areas** (Departamentos/Áreas Organizacionales)
```sql
- id (PK)
- nombre (UNIQUE)
- descripcion
- activo
- createdAt
- updatedAt
```

### 3. **Documents** (Documentos del Sistema)
```sql
- id (PK)
- codigo (UNIQUE)
- tipoMovimiento (enviado | recibido)
- clasificacion (interno | externo)
- estado (pendiente | proceso | finalizado)
- fechaRegistro
- fechaEnvio
- remitente
- destinatario (texto legacy)
- destinatarioId (FK → Users) ✨ NUEVO
- cargo
- quienRecibe
- detalle
- observaciones
- archivo
- archivoOriginal
- archivoTamano
- archivoTipo
- userId (FK → Users - Creador)
- creadoPor (legacy)
- rolCreador (legacy)
- createdAt
- updatedAt
```

### 4. **DocumentHistories** (Auditoría de Cambios)
```sql
- id (PK)
- documentId (FK → Documents)
- userId (FK → Users)
- accion (creado | editado | eliminado)
- camposModificados
- valoresAnteriores (JSON)
- valoresNuevos (JSON)
- descripcion
- createdAt
- updatedAt
```

### 5. **VerificationTokens** (Tokens de Verificación de Email)
```sql
- id (PK)
- userId (FK → Users)
- token (UNIQUE)
- expiresAt
- createdAt
- updatedAt
```

---

## ❌ Tablas ELIMINADAS (No se usaban)

- ~~**Categories**~~ - No implementada en frontend
- ~~**Notifications**~~ - No implementada en frontend

---

## ❌ Campos ELIMINADOS de Documents

- ~~**prioridad**~~ - No se usa en formularios ni vistas
- ~~**fechaVencimiento**~~ - No se usa en formularios ni vistas

---

## 🔗 Relaciones Entre Tablas

```
Areas (1) ──────► (N) Users
                       │
                       ├──► (N) Documents (como creador)
                       │         │
                       │         ├──► (N) DocumentHistories
                       │         │
                       │         └──► (1) VerificationTokens
                       │
                       └──► (N) Documents (como destinatario) ✨
```

### Relaciones Detalladas:

1. **Areas → Users** (1:N)
   - Un área tiene muchos usuarios
   - Un usuario pertenece a un área

2. **Users → Documents** (1:N como Creador)
   - Un usuario crea muchos documentos
   - `userId` en Documents

3. **Users → Documents** (1:N como Destinatario) ✨
   - Un usuario recibe muchos documentos
   - `destinatarioId` en Documents

4. **Documents → DocumentHistories** (1:N)
   - Un documento tiene muchos registros de historial
   - CASCADE: Si se elimina documento, se elimina historial

5. **Users → DocumentHistories** (1:N)
   - Un usuario realiza muchas acciones
   - SET NULL: Si se elimina usuario, se mantiene historial

6. **Users → VerificationTokens** (1:1)
   - Un usuario tiene un token de verificación
   - CASCADE: Si se elimina usuario, se elimina token

---

## 📊 Índices Optimizados

### Users
- `idx_users_username` (UNIQUE)
- `idx_users_email` (UNIQUE)
- `idx_users_areaId`
- `idx_users_rol_activo`

### Documents
- `idx_documents_codigo` (UNIQUE)
- `idx_documents_userId`
- `idx_documents_destinatarioId` ✨
- `idx_documents_userId_estado`
- `idx_documents_fechaRegistro_desc`
- `idx_documents_clasificacion_estado`
- `idx_documents_tipoMovimiento`
- `idx_documents_estado`
- `idx_documents_remitente`
- `idx_documents_destinatario`

### DocumentHistories
- `idx_documenthistory_documentId_createdAt`
- `idx_documenthistory_userId`

### Areas
- `idx_areas_nombre` (UNIQUE)

---

## 🎯 Campos Usados por Página

### Dashboard
- Users: `id`, `username`, `nombre`, `rol`
- Documents: `id`, `codigo`, `detalle`, `remitente`, `cargo`, `quienRecibe`, `destinatario`, `observaciones`, `estado`, `tipoMovimiento`, `userId`, `fechaRegistro`

### Documentos
- Users: `id`, `username`, `nombre`, `rol`, `cargo`
- Documents: TODOS los campos
- Areas: `id`, `nombre` (para filtros futuros)

### Calendario
- Users: `id`, `username`, `nombre`, `rol`
- Documents: `id`, `codigo`, `detalle`, `remitente`, `destinatario`, `estado`, `tipoMovimiento`, `userId`, `fechaRegistro`

### Panel de Control (Admin)
- Users: TODOS los campos
- Areas: TODOS los campos

---

## 🔒 Validaciones Activas

### A Nivel de Base de Datos:
- Emails únicos y válidos
- Usernames únicos
- Códigos de documento únicos
- ENUMs estrictos (rol, tipoMovimiento, clasificacion, estado)
- Foreign Keys con CASCADE/RESTRICT configurados

### A Nivel de Modelo (Sequelize):
- Longitud de campos
- Formatos de email
- Passwords hasheados automáticamente
- Timestamps automáticos

---

## 📝 Notas Importantes

1. **Campos Legacy**: `creadoPor`, `rolCreador`, `destinatario` (texto) se mantienen por compatibilidad pero se recomienda usar las FK.

2. **Migración Gradual**: El sistema usa `destinatarioId` cuando está disponible, pero sigue soportando `destinatario` (texto) para documentos antiguos.

3. **Sincronización**: El backend usa `sequelize.sync({ alter: true })` que ajusta automáticamente la estructura sin perder datos.

4. **Archivos**: Los archivos se guardan en `/backend/uploads/` y solo se guarda metadata en la BD.

---

## ✅ Checklist de Integridad

- [x] Todas las tablas tienen Primary Key
- [x] Todas las relaciones tienen Foreign Keys
- [x] Todos los campos requeridos tienen validaciones
- [x] Índices en campos de búsqueda frecuente
- [x] Cascadas configuradas correctamente
- [x] Passwords encriptados
- [x] Timestamps automáticos
- [x] Solo tablas y campos USADOS en el frontend
