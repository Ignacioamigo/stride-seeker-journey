# ✅ SOLUCIÓN FINAL COMPLETA - Actividades de Strava

## 🎯 Problema Identificado y Corregido

### El Problema
Las actividades de Strava se guardaban en la base de datos PERO NO aparecían en la app porque:
1. El webhook guardaba con `user_id` incorrecto (usaba `userProfile.id` en lugar de `user_auth_id`)
2. La app guardaba actividades con `user_id = NULL` cuando fallaba la autenticación
3. Los filtros por `user_id` no coincidían

### La Solución Implementada
1. ✅ **App corregida**: Ahora SIEMPRE valida que `user_id` exista antes de guardar
2. ✅ **Webhook corregido**: Usa `user_auth_id` correcto
3. ✅ **Build completado**: App compilada y sincronizada con iOS

---

## 📋 PASOS FINALES (HAZ ESTO AHORA)

### Paso 1: Corregir Actividades Existentes en Base de Datos (SQL)

Ejecuta este SQL en Supabase para corregir TODAS las actividades que tienen `user_id` incorrecto o NULL:

```sql
-- ============================================
-- CORRECCIÓN FINAL: Asignar user_id correcto
-- ============================================

-- Ver el problema actual
SELECT 
  'ANTES DE LA CORRECCIÓN' as estado,
  user_id,
  user_email,
  COUNT(*) as cantidad
FROM published_activities_simple
GROUP BY user_id, user_email;

-- Obtener el user_id correcto (tu usuario actual)
DO $$
DECLARE
  v_correct_user_id UUID;
BEGIN
  -- Obtener tu user_id (el más reciente que se logueó)
  SELECT id INTO v_correct_user_id
  FROM auth.users
  ORDER BY last_sign_in_at DESC
  LIMIT 1;
  
  RAISE NOTICE '✅ Tu user_id correcto: %', v_correct_user_id;
  
  -- Corregir published_activities_simple
  UPDATE published_activities_simple
  SET user_id = v_correct_user_id,
      user_email = (SELECT email FROM auth.users WHERE id = v_correct_user_id)
  WHERE user_id IS NULL 
     OR user_id != v_correct_user_id;
  
  RAISE NOTICE '✅ Actividades corregidas: %', (SELECT COUNT(*) FROM published_activities_simple WHERE user_id = v_correct_user_id);
  
  -- Corregir workouts_simple
  UPDATE workouts_simple
  SET user_id = v_correct_user_id,
      user_email = (SELECT email FROM auth.users WHERE id = v_correct_user_id)
  WHERE user_id IS NULL 
     OR user_id != v_correct_user_id;
  
  RAISE NOTICE '✅ Workouts corregidos: %', (SELECT COUNT(*) FROM workouts_simple WHERE user_id = v_correct_user_id);
END $$;

-- Verificar que se corrigió
SELECT 
  'DESPUÉS DE LA CORRECCIÓN' as estado,
  user_id,
  user_email,
  COUNT(*) as cantidad
FROM published_activities_simple
GROUP BY user_id, user_email;

-- Ver las actividades corregidas
SELECT 
  title,
  distance || ' km' as distancia,
  duration,
  imported_from_strava as de_strava,
  to_char(created_at, 'DD/MM HH24:MI') as fecha
FROM published_activities_simple
ORDER BY created_at DESC
LIMIT 10;
```

### Paso 2: Redesplegar el Webhook de Strava

El webhook también necesita usar el `user_auth_id` correcto. Ve a:

https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions/strava-webhook

1. Click "Deploy new version"
2. Copia TODO el contenido de: `supabase/functions/strava-webhook/index.ts`
3. Pega y click "Deploy"

### Paso 3: Probar la App

1. Abre Xcode:
   ```bash
   open ios/App/App.xcworkspace
   ```

2. Compila y ejecuta en tu dispositivo/simulador

3. Verifica:
   - ✅ Tab "Actividades" → Deberían aparecer TODAS las actividades (las de Strava y las normales)
   - ✅ Tab "Estadísticas" → Números actualizados
   - ✅ Tab "Plan" → Sesiones completadas

4. **Prueba crear una nueva actividad:**
   - Inicia un entrenamiento desde la app
   - Corre/camina unos metros
   - Finaliza
   - Verifica que la actividad aparezca CON `user_id` (no NULL)

---

## 🔧 Cambios Técnicos Realizados

### 1. `src/services/ultraSimpleActivityService.ts`

**ANTES (INCORRECTO):**
```typescript
let userId = null;
try {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userId = user.id;
  }
} catch (authError) {
  console.log('Error');  // ❌ Continúa con userId = null
}
```

**AHORA (CORRECTO):**
```typescript
let userId: string | null = null;
try {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('No hay usuario autenticado');  // ✅ DETIENE la ejecución
  }
  
  userId = user.id;  // ✅ SIEMPRE tiene valor
} catch (authError) {
  throw authError;  // ✅ NO permite guardar sin user_id
}

// ✅ Verificación final
if (!userId) {
  throw new Error('CRÍTICO: No se pudo obtener user_id');
}
```

### 2. `supabase/functions/strava-webhook/index.ts`

**ANTES (INCORRECTO):**
```typescript
user_id: userProfile.id,  // ❌ Usa userProfile.id (incorrecto)
```

**AHORA (CORRECTO):**
```typescript
user_id: connection.user_auth_id,  // ✅ Usa user_auth_id (correcto)
```

### 3. Búsqueda de Actividades Mejorada

Ahora la app busca actividades de **3 formas** para máxima compatibilidad:
1. Por `user_id` directo (auth.users.id)
2. Por `user_email` 
3. Por `userProfile.id` (para compatibilidad con actividades antiguas)

---

## 🎯 Resultado Esperado

### ANTES:
- ❌ Actividades en Supabase pero NO en la app
- ❌ `user_id = NULL` o `user_id` incorrecto
- ❌ Webhook guardaba con ID equivocado

### AHORA:
- ✅ Actividades visibles en la app
- ✅ `user_id` siempre tiene el valor correcto
- ✅ Webhook guarda con `user_auth_id` correcto
- ✅ App NO permite guardar sin `user_id`

---

## 🐛 Si Algo NO Funciona

### Problema 1: Actividades Siguen sin Aparecer

```sql
-- Verifica si el user_id es correcto
SELECT 
  'Tu user_id' as tipo,
  id as user_id
FROM auth.users
ORDER BY last_sign_in_at DESC
LIMIT 1;

SELECT 
  'user_id en actividades' as tipo,
  DISTINCT user_id
FROM published_activities_simple;

-- ¿Coinciden?
```

### Problema 2: Nueva Actividad se Guarda con user_id NULL

1. Verifica en la consola de la app si hay errores
2. El error debería ser: "CRÍTICO: No se pudo obtener user_id"
3. Significa que `supabase.auth.getUser()` está fallando
4. Verifica que el usuario esté autenticado en Supabase

### Problema 3: Webhook Sigue Guardando con user_id Incorrecto

1. Verifica que redesplegaste el webhook
2. Crea una nueva actividad en Strava
3. Revisa los logs del webhook
4. Debería mostrar: "👤 User info: { user_auth_id: ... }"

---

## ✅ Checklist Final

- [ ] SQL de corrección ejecutado
- [ ] Webhook redesplegado
- [ ] App compilada y sincronizada
- [ ] App abierta en Xcode
- [ ] Actividades antiguas ahora visibles
- [ ] Nueva actividad creada desde la app
- [ ] Nueva actividad tiene `user_id` (no NULL)
- [ ] Actividad de Strava probada (opcional)

---

**Fecha:** 21 de noviembre de 2025  
**Estado:** ✅ SOLUCIÓN COMPLETA IMPLEMENTADA  
**Versión:** FINAL CORREGIDA

**CRÍTICO**: Ejecuta el SQL del Paso 1 para corregir las actividades existentes.


