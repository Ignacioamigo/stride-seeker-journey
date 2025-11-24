# 🚀 Pasos Inmediatos para Arreglar Actividades de Strava

## El Problema

Las actividades se guardan en Supabase pero NO aparecen en la app porque **las políticas de RLS (Row Level Security) están bloqueando el acceso**.

---

## ✅ Solución en 3 Pasos

### Paso 1: Aplicar Migración de RLS (5 minutos)

1. Ve a Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/sql/new
   ```

2. Copia el contenido del archivo:
   ```
   supabase/migrations/fix_published_activities_simple_rls.sql
   ```

3. Pega en el SQL Editor y click **"Run" ▶️**

4. Espera a que diga "Success" ✅

5. Repite con el segundo archivo:
   ```
   supabase/migrations/fix_workouts_simple_rls.sql
   ```

### Paso 2: Verificar que Funcionó (2 minutos)

1. En el mismo SQL Editor, ejecuta:
   ```sql
   -- Ver tus actividades
   SELECT 
     title,
     distance,
     duration,
     imported_from_strava,
     created_at
   FROM published_activities_simple
   WHERE imported_from_strava = TRUE
   ORDER BY created_at DESC
   LIMIT 5;
   ```

2. Si ves actividades → ✅ La migración funcionó

### Paso 3: Probar en la App (1 minuto)

1. Abre la app (o si ya está abierta, espera 30 segundos)
2. Ve al tab "Actividades"
3. ¿Aparecen las carreras de Strava? → ✅ Funcionó!

---

## 🎯 Si SIGUE sin funcionar

### Diagnóstico Rápido

Ejecuta en SQL Editor:

```sql
-- 1. Tu user_id
SELECT id, email FROM auth.users WHERE email = 'tu-email@example.com';

-- 2. user_id en las actividades
SELECT DISTINCT user_id FROM published_activities_simple 
WHERE imported_from_strava = TRUE;

-- ¿Coinciden? Si NO coinciden, ese es el problema
```

### Fix si user_id no coincide:

```sql
-- Reemplaza 'tu-user-id-correcto' con tu ID real
UPDATE published_activities_simple
SET user_id = 'tu-user-id-correcto'
WHERE imported_from_strava = TRUE
  AND (user_id IS NULL OR user_id != 'tu-user-id-correcto');
```

---

## 📝 Resumen

**Lo que estás haciendo:**
- Agregando políticas de RLS para que TÚ puedas ver TUS actividades
- El webhook ya funciona, solo falta el permiso de lectura

**Tiempo total:**
- 5 min aplicar migraciones
- 2 min verificar
- 1 min probar en app
- **TOTAL: 8 minutos**

**Resultado esperado:**
- ✅ Actividades de Strava visibles
- ✅ Estadísticas actualizadas
- ✅ Sesiones de plan completadas

---

## 📞 Ayuda Rápida

Si algo no funciona, ejecuta en la consola del navegador (cuando tengas la app abierta):

```javascript
// 1. Verifica tu user_id
const { data: { user } } = await supabase.auth.getUser();
console.log('Mi user_id:', user?.id);
console.log('Mi email:', user?.email);

// 2. Intenta cargar actividades
const { data, error } = await supabase
  .from('published_activities_simple')
  .select('*')
  .eq('user_id', user.id);
console.log('Actividades:', data);
console.log('Error:', error);
```

Si ves error → **Copia el mensaje de error y búscalo en el documento `FIX_RLS_STRAVA_ACTIVITIES.md`**

---

**¡Empieza con el Paso 1!** 🚀


