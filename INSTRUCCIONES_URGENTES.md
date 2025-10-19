# 🚨 INSTRUCCIONES URGENTES - EJECUTAR AHORA

## 🔍 Problema Identificado

El error es claro:
```
❌ Error creando plan: "Could not find the 'duration' column of 'training_plans'"
❌ Error: Key is not present in table "training_sessions"
```

**Causa:** La tabla `training_plans` en Supabase no tiene las columnas necesarias.

---

## ✅ SOLUCIÓN (3 Pasos)

### PASO 1: Ejecutar SQL en Supabase

1. **Abre Supabase Dashboard**
2. Ve a **SQL Editor**
3. Abre el archivo: **`FIX_URGENTE_EJECUTAR_EN_SUPABASE.sql`**
4. **Copia TODO el contenido**
5. **Pégalo en SQL Editor**
6. **Haz clic en "Run"**

### PASO 2: Verificar Resultado

Deberías ver al final una tabla con las columnas. Verifica que aparezcan:

**En training_plans:**
- ✅ `duration` (TEXT)
- ✅ `intensity` (TEXT)  
- ✅ `week_number` (INTEGER)
- ✅ `start_date` (DATE)

**En training_sessions:**
- ✅ Tabla existe con todas sus columnas

**En published_activities_simple:**
- ✅ `training_session_id` (UUID)

### PASO 3: Limpiar App y Recargar

**En la consola del navegador/app:**
```javascript
// Limpiar localStorage
localStorage.removeItem('savedPlan');
localStorage.removeItem('active_training_session_id');

// Recargar
window.location.reload();
```

---

## 🧪 PROBAR DE NUEVO

### 1. Recargar Plan
1. Abre la app
2. Ve a "Plan"
3. **BUSCA EN CONSOLA:**

```
✅ Esperado:
🔄 Sincronizando plan con Supabase...
✅ [SYNC] Plan creado en Supabase: [UUID]
🔧 [SYNC] Creando training_sessions en Supabase...
✅ [SYNC] 3 training_sessions creadas

❌ NO debe aparecer:
❌ [SYNC] Error creando plan
```

### 2. Iniciar Entrenamiento
1. Haz clic en "Iniciar entrenamiento"
2. Debe llevarte al GPS (SIN recargar)

### 3. Finalizar y Publicar
1. Corre y finaliza
2. Publica actividad
3. **BUSCA EN CONSOLA:**

```
✅ Esperado:
🎯 [ULTRA SIMPLE] Esta actividad se vinculará a la sesión: [UUID]
💾 [ULTRA SIMPLE] Datos para published_activities_simple: {...}
✅ Actividad guardada correctamente en Supabase

❌ NO debe aparecer:
❌ [ULTRA SIMPLE] Error insertando en Supabase
❌ Foreign key constraint
```

### 4. Verificar Completado
1. Vuelve al Plan
2. La sesión debe estar marcada con ✅

---

## 🔍 Si Sigue Sin Funcionar

Ejecuta esta query en Supabase SQL Editor:

```sql
-- Ver tus training_sessions
SELECT 
  ts.id,
  ts.title,
  ts.completed
FROM training_sessions ts
JOIN training_plans tp ON tp.id = ts.plan_id
WHERE tp.user_id = (
  SELECT id FROM user_profiles 
  WHERE user_auth_id = auth.uid()
)
ORDER BY ts.day_number;
```

**Comparte el resultado** junto con los logs de consola.

---

## 📊 Qué Va a Pasar

1. **SQL arregla la estructura** de las tablas
2. **App recarga el plan**
3. **Sync crea el plan** en Supabase (ahora con columnas correctas)
4. **Sync crea training_sessions** con los IDs correctos
5. **Inicias entrenamiento** → guarda training_session_id correcto
6. **Finalizas** → actividad se guarda con FK válida
7. **Trigger auto-completa** la sesión
8. **✅ Plan se actualiza**

---

## ⏰ HAZLO AHORA

1. ✅ Ejecutar `FIX_URGENTE_EJECUTAR_EN_SUPABASE.sql` en Supabase
2. ✅ Limpiar localStorage en app
3. ✅ Recargar app
4. ✅ Ir a Plan
5. ✅ Ver logs de sincronización
6. ✅ Probar "Iniciar entrenamiento"

**COMPARTE los logs después de hacer esto.**

---

¿Ejecutaste el SQL en Supabase?

