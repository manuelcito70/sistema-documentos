# Restricciones de Permisos por Rol de Usuario (ACTUALIZADO)

## 📋 Resumen de Permisos

Este documento describe las restricciones de permisos implementadas en el sistema de documentos.

---

## 👥 Roles de Usuario

### 1. **Administrador** (`admin`)
**Permisos completos:**
- ✅ Ver todos los documentos
- ✅ Crear nuevos documentos
- ✅ Editar documentos (excepto finalizados)
- ✅ Eliminar documentos
- ✅ Cambiar estados (pendiente, proceso, finalizado)
- ✅ Acceso a gestión de usuarios
- ✅ Ver dashboard completo
- ✅ Ver calendario
- ✅ Descargar archivos

### 2. **Usuario Interno** (`interno`)
**Permisos de gestión:**
- ✅ Ver todos los documentos
- ✅ Crear nuevos documentos
- ✅ Editar documentos (excepto finalizados)
- ✅ Eliminar documentos
- ✅ Cambiar estados (pendiente, proceso, finalizado)
- ❌ NO puede acceder a gestión de usuarios
- ✅ Ver dashboard completo
- ✅ Ver calendario
- ✅ Descargar archivos

### 3. **Usuario Externo** (`externo`)
**Permisos limitados:**
- ✅ Ver documentos (solo lectura)
- ✅ **CREAR** documentos (solo en estado "Pendiente")
- ❌ **NO puede EDITAR** documentos
- ✅ **ELIMINAR** documentos (si están mal)
- ❌ **NO puede cambiar estados** (pendiente, proceso, finalizado)
- ❌ NO puede acceder a gestión de usuarios
- ✅ Ver dashboard (estadísticas)
- ✅ Ver calendario
- ✅ Descargar archivos
- ✅ Usar filtros de búsqueda

---

## 🔒 Restricciones Implementadas

### Frontend (React)

#### **Componente: Documentos.jsx**

1. **Botón "Enviar Documento"**
   ```javascript
   // TODOS los usuarios pueden crear documentos
   <button onClick={() => setIsModalOpen(true)}>
     Enviar Documento
   </button>
   ```
   - ✅ Visible para TODOS los usuarios

2. **Botón "Eliminar"**
   ```javascript
   // TODOS los usuarios pueden eliminar documentos
   <button onClick={() => handleDeleteRequest(doc)}>
     Eliminar
   </button>
   ```
   - ✅ Visible para TODOS los usuarios

3. **Modo de Edición**
   ```javascript
   if (user?.rol === 'externo' || doc.estado === 'finalizado') {
     setEditFormData(null); // Solo lectura
   } else {
     setEditFormData({ ...doc }); // Permitir edición
   }
   ```
   - ❌ Usuarios externos **NUNCA** pueden editar
   - ✅ Usuarios internos/admin pueden editar si no está finalizado

4. **Selección de Estado al Crear**
   ```javascript
   {user?.rol === 'externo' ? (
     <div>📋 Los documentos se crean automáticamente en estado Pendiente</div>
   ) : (
     <RadioGroup> {/* Pendiente, Proceso, Finalizado */} </RadioGroup>
   )}
   ```
   - ❌ Usuarios externos solo pueden crear en estado "Pendiente"
   - ✅ Usuarios internos/admin pueden elegir cualquier estado

5. **Mensaje Personalizado**
   - Externos: "Envía y recibe documentos (sin edición)"
   - Internos/Admin: "Administra todos tus documentos en un solo lugar"

---

### Backend (Node.js/Express)

#### **Archivo: `documentosRoutes.js`**

```javascript
// Todos los usuarios autenticados pueden VER documentos
router.get("/", auth, documentosController.getAllDocuments);

// Todos los usuarios autenticados pueden CREAR documentos
router.post("/", auth, upload.single("archivo"), documentosController.createDocument);

// Solo usuarios internos y admin pueden ACTUALIZAR/EDITAR documentos
router.put("/:id", auth, requireRole('admin', 'interno'), upload.single("archivo"), documentosController.updateDocument);

// Todos los usuarios autenticados pueden ELIMINAR documentos
router.delete("/:id", auth, documentosController.deleteDocument);
```

**Validaciones:**
- ✅ `GET /documentos` - Todos los usuarios autenticados
- ✅ `POST /documentos` - Todos los usuarios autenticados
- ❌ `PUT /documentos/:id` - Solo admin e interno (403 para externos)
- ✅ `DELETE /documentos/:id` - Todos los usuarios autenticados

---

## 🎯 Funcionalidades Disponibles por Rol

| Funcionalidad | Admin | Interno | Externo |
|--------------|-------|---------|---------|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Ver Documentos | ✅ | ✅ | ✅ (solo lectura) |
| **Crear Documentos** | ✅ | ✅ | ✅ (solo pendiente) |
| **Editar Documentos** | ✅ | ✅ | ❌ |
| **Eliminar Documentos** | ✅ | ✅ | ✅ |
| **Cambiar Estados** | ✅ | ✅ | ❌ |
| Descargar Archivos | ✅ | ✅ | ✅ |
| Filtrar/Buscar | ✅ | ✅ | ✅ |
| Ver Calendario | ✅ | ✅ | ✅ |
| Gestionar Usuarios | ✅ | ❌ | ❌ |

---

## 🔐 Seguridad Implementada

**Frontend + Backend:**
- Las restricciones están implementadas en **ambos lados**
- El frontend oculta/deshabilita funcionalidades según el rol
- El backend valida permisos antes de ejecutar acciones
- Si un usuario externo intenta editar desde la API directamente, recibirá un error `403 Forbidden`

---

## 🚀 Casos de Uso

### **Usuario Externo** (`externo1` / `1234`):

**✅ PUEDE:**
- Ver todos los documentos (modo lectura)
- Crear nuevos documentos (solo en estado "Pendiente")
- Eliminar documentos que creó por error
- Descargar archivos adjuntos
- Usar filtros y búsqueda

**❌ NO PUEDE:**
- Editar documentos existentes
- Cambiar el estado de documentos (pendiente → proceso → finalizado)
- Acceder a gestión de usuarios

### **Usuario Interno** (`interno1` / `1234`):

**✅ PUEDE:**
- Todo lo que puede hacer un usuario externo
- Editar documentos (excepto finalizados)
- Cambiar estados de documentos
- Elegir el estado inicial al crear documentos

**❌ NO PUEDE:**
- Gestionar usuarios (solo admin)

### **Administrador** (`admin` / `1234`):

**✅ PUEDE:**
- Acceso completo a todo el sistema
- Gestionar usuarios
- Todas las funcionalidades de usuarios internos

---

## 📝 Notas Importantes

1. **Usuarios externos** pueden **crear y eliminar** documentos, pero **NO editar**
2. Los documentos creados por externos siempre inician en estado **"Pendiente"**
3. **Todos los usuarios** pueden descargar archivos adjuntos
4. **Solo administradores** pueden gestionar usuarios
5. Los documentos **finalizados** no pueden ser editados por nadie (solo visualización)
6. Las restricciones están implementadas en **frontend Y backend** para mayor seguridad

---

## 🎨 Interfaz de Usuario

### Diferencias Visuales por Rol:

**Usuario Externo:**
- ✅ Botón "Enviar Documento" visible
- ❌ Campo "Estado" bloqueado (solo "Pendiente")
- ✅ Botón "Eliminar" visible
- ❌ Botón "Editar" no funcional (solo "Ver")
- 📋 Mensaje: "Los documentos se crean automáticamente en estado Pendiente"

**Usuario Interno/Admin:**
- ✅ Botón "Enviar Documento" visible
- ✅ Campo "Estado" con todas las opciones
- ✅ Botón "Eliminar" visible
- ✅ Botón "Editar" funcional
- 🎯 Puede elegir cualquier estado al crear

---

## 🔄 Flujo de Trabajo Típico

### Usuario Externo:
1. Inicia sesión
2. Ve el dashboard con estadísticas
3. **Crea** un documento nuevo (automáticamente en "Pendiente")
4. Si se equivoca, puede **eliminarlo**
5. **NO puede editar** el documento después de crearlo
6. Puede **descargar** archivos adjuntos

### Usuario Interno:
1. Inicia sesión
2. Ve el dashboard con estadísticas
3. **Crea** documentos con el estado que desee
4. **Edita** documentos existentes (si no están finalizados)
5. **Cambia estados** de documentos
6. **Elimina** documentos si es necesario

---

## 🚀 Próximas Mejoras Sugeridas

1. ✅ ~~Implementar validaciones de permisos en el backend~~ **COMPLETADO**
2. Agregar logs de auditoría para acciones sensibles
3. Implementar permisos granulares por documento
4. Agregar roles personalizados
5. Implementar permisos de compartir documentos específicos
6. Notificaciones cuando un externo crea un documento
