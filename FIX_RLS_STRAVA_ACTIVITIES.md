# 🔧 Fix: Actividades de Strava No Aparecen en la App

## 🎯 Problema Identificado

Las actividades de Strava **SÍ se guardan en Supabase**, pero **NO aparecen en la app** debido a **políticas de RLS (Row Level Security) incorrectas o faltantes**.

### Síntomas:
- ✅ Webhook funciona correctamente (logs muestran éxito)
- ✅ Datos guardados en `published_activities_simple`
- ✅ Datos guardados en `workouts_simple`
- ❌ App NO muestra las actividades
- ❌ Estadísticas NO se actualizan
- ❌ Plan NO muestra sesiones completadas

---

## 🔍 Diagnóstico

### Paso 1: Ejecutar Script de Diagnóstico

1. Abre la app en el navegador/simulador
2. Abre la consola del navegador (DevTools)
3. Pega y ejecuta el contenido de `debug-strava-activities.js`
4. Observa el output

**Lo que debes buscar:**
```javascript
// Si ves esto:
Actividades totales: 0
Workouts: 2  // Pero actividades = 0

// Significa: RLS está bloqueando el acceso a published_activities_simple
```

### Paso 2: Verificar Directamente en Supabase

Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor

#### Verificar `published_activities_simple`:
```sql
-- Como admin, deberías ver las actividades:
SELECT 
  id,
  user_id,
  title,
  distance,
  imported_from_strava,
  created_at
FROM published_activities_simple
WHERE imported_from_strava = TRUE
ORDER BY created_at DESC
LIMIT 5;
```

Si ves actividades aquí pero NO en la app → **Problema de RLS confirmado**

---

## ✅ Solución: Aplicar Migraciones de RLS

### Opción 1: Via Supabase Dashboard (Recomendado)

1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/sql/new

2. **Primera migración** - Copia y pega el contenido de:
   ```
   supabase/migrations/fix_published_activities_simple_rls.sql
   ```
   Click "Run" ▶️

3. **Segunda migración** - Copia y pega el contenido de:
   ```
   supabase/migrations/fix_workouts_simple_rls.sql
   ```
   Click "Run" ▶️

4. Verifica que se ejecutaron sin errores

### Opción 2: Via Supabase CLI

```bash
cd /Users/nachoamigo/stride-seeker-journey

# Aplicar migraciones
supabase db push

# O aplicar manualmente:
psql $DATABASE_URL -f supabase/migrations/fix_published_activities_simple_rls.sql
psql $DATABASE_URL -f supabase/migrations/fix_workouts_simple_rls.sql
```

---

## 🧪 Verificación Post-Fix

### 1. Verificar Políticas de RLS

```sql
-- Ver políticas de published_activities_simple
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies
WHERE tablename = 'published_activities_simple';
```

**Deberías ver:**
- `Users can view own activities` (SELECT)
- `Users can insert own activities` (INSERT)
- `Users can update own activities` (UPDATE)
- `Users can delete own activities` (DELETE)

### 2. Verificar Políticas de workouts_simple

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies
WHERE tablename = 'workouts_simple';
```

**Deberías ver:**
- `Users can view own workouts` (SELECT)
- `Users can insert own workouts` (INSERT)
- `Users can update own workouts` (UPDATE)
- `Users can delete own workouts` (DELETE)

### 3. Probar Acceso desde la App

1. Abre la app
2. Espera 30 segundos (auto-refresh)
3. Verifica cada tab:
   - **Activities**: ¿Aparecen las actividades de Strava?
   - **Stats**: ¿Se actualizaron las estadísticas?
   - **Plan**: ¿Sesiones marcadas como completadas?

### 4. Ejecutar Diagnóstico Nuevamente

Vuelve a ejecutar `debug-strava-activities.js` en la consola.

**Ahora deberías ver:**
```javascript
Actividades totales: 2  // ✅ Ya no es 0
Actividades de Strava: 2  // ✅ Ya no es 0
Workouts: 2
```

---

## 🐛 Troubleshooting Adicional

### Si SIGUE sin funcionar después de aplicar las migraciones:

#### Problema 1: user_id No Coincide

Verifica que el `user_id` en las actividades coincida con tu usuario:

```sql
-- Tu user_id actual:
SELECT id, email FROM auth.users WHERE email = 'tu-email@example.com';

-- user_id en las actividades:
SELECT DISTINCT user_id FROM published_activities_simple 
WHERE imported_from_strava = TRUE;

-- ¿Coinciden? Si no coinciden, este es el problema
```

**Solución:** Actualizar el `user_id` en las actividades existentes:

```sql
UPDATE published_activities_simple
SET user_id = 'tu-user-id-correcto'
WHERE imported_from_strava = TRUE
  AND user_id IS NULL OR user_id != 'tu-user-id-correcto';
```

#### Problema 2: auth.uid() Devuelve NULL

Si las políticas usan `auth.uid()` pero el usuario está en modo anónimo:

```sql
-- Verificar si hay usuario autenticado
SELECT auth.uid();
-- Si devuelve NULL → problema de autenticación
```

**Solución:** Asegurarse de que el usuario está autenticado en la app.

#### Problema 3: Service Role No Puede Insertar

Si el webhook usa service_role pero RLS lo bloquea:

```sql
-- Las políticas no deben aplicar a service_role
-- Verificar que el webhook usa SUPABASE_SERVICE_ROLE_KEY
```

**Solución:** El service_role bypass RLS automáticamente, no necesita políticas especiales.

---

## 📊 Qué Hacen las Migraciones

### `fix_published_activities_simple_rls.sql`

1. **Elimina** políticas antiguas que puedan estar conflictivas
2. **Crea** nuevas políticas que permiten:
   - ✅ Ver actividades donde `auth.uid() = user_id`
   - ✅ Ver actividades sin `user_id` (legacy/anónimas)
   - ✅ Insertar actividades propias
   - ✅ Actualizar/eliminar actividades propias
3. **Añade** columna `imported_from_strava` si no existe
4. **Crea** índices para mejorar rendimiento

### `fix_workouts_simple_rls.sql`

1. **Elimina** políticas antiguas que puedan estar conflictivas
2. **Crea** nuevas políticas que permiten:
   - ✅ Ver workouts donde `user_email = auth.email()`
   - ✅ Ver workouts anónimos (`user_email IS NULL` o `'anonimo@app.com'`)
   - ✅ Insertar workouts propios
   - ✅ Actualizar/eliminar workouts propios
3. **Añade** columna `user_id` para futura migración
4. **Crea** índices para mejorar rendimiento

---

## 🎯 Resultado Esperado

**Después de aplicar las migraciones:**

1. ✅ Actividades de Strava **visibles** en tab "Activities"
2. ✅ Estadísticas **actualizadas** en tab "Stats"
3. ✅ Sesiones **completadas** en tab "Plan"
4. ✅ Auto-refresh cada 30 segundos **funciona**
5. ✅ No necesitas cerrar/abrir la app

**Tiempo total:**
- Webhook: 1-5 minutos (Strava)
- Auto-refresh: Máximo 30 segundos (App)
- **TOTAL: 1.5-6 minutos** desde que guardas en Strava

---

## 📞 Si Necesitas Ayuda

### Logs a Revisar:

1. **Webhook logs**: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions/strava-webhook/logs
2. **Consola del navegador**: Busca errores con "RLS" o "permission denied"
3. **Supabase logs**: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/logs

### Errores Comunes:

- `new row violates row-level security policy` → RLS bloqueando INSERT
- `permission denied for table published_activities_simple` → RLS bloqueando SELECT
- `null value in column "user_id" violates not-null constraint` → Falta user_id

---

**Fecha:** 21 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Listo para aplicar


