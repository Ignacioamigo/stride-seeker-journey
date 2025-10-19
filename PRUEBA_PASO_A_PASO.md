# 🧪 PRUEBA PASO A PASO - Botón Iniciar Entrenamiento

**IMPORTANTE:** Sigue estos pasos EXACTAMENTE y comparte los logs que veas.

---

## 📋 Preparación

### 1. Limpiar Estado Previo
```javascript
// En la consola del navegador/app:
localStorage.removeItem('active_training_session_id');
localStorage.removeItem('savedPlan');
console.log('✅ LocalStorage limpiado');
```

### 2. Verificar Training Sessions en Supabase

Ve a Supabase Dashboard → SQL Editor y ejecuta:

```sql
-- Ver planes y sesiones del usuario
SELECT 
  tp.id as plan_id,
  tp.name as plan_name,
  COUNT(ts.id) as num_sessions
FROM training_plans tp
LEFT JOIN training_sessions ts ON ts.plan_id = tp.id
WHERE tp.user_id = (
  SELECT id FROM user_profiles 
  WHERE user_auth_id = auth.uid()
)
GROUP BY tp.id, tp.name
ORDER BY tp.created_at DESC
LIMIT 1;
```

**Resultado esperado:**
- Si muestra `num_sessions: 0` → El sync creará las sesiones
- Si muestra `num_sessions: 3` (o más) → Las sesiones ya existen

---

## 🔄 PASO 1: Cargar el Plan

### Acción:
1. Abre la app
2. Ve a la pestaña **"Plan"**
3. **MIRA LA CONSOLA** y busca estos logs:

### ✅ Logs Esperados (Caso 1: Sin sesiones):
```
Attempting to load existing plan...
Plan loaded successfully: Plan de Entrenamiento para...
🔄 Sincronizando plan con Supabase...
✅ [SYNC] Plan existe en Supabase: [UUID]
📊 [SYNC] Training sessions existentes: 0
📊 [SYNC] Workouts en el plan: 3
🔧 [SYNC] Creando training_sessions en Supabase...
📊 [SYNC] Sesiones a insertar: 3
📋 [SYNC] Ejemplo de sesión: {id: "...", title: "...", ...}
✅ [SYNC] 3 training_sessions creadas
  📌 Entrenamiento de Intervalos (ID: xxx)
  📌 Tempo Run Largo (ID: xxx)
  📌 Carrera Larga (ID: xxx)
✅ [SYNC] Plan sincronizado correctamente
✅ Plan sincronizado con training_sessions correctas
```

### ✅ Logs Esperados (Caso 2: Con sesiones):
```
Attempting to load existing plan...
Plan loaded successfully: Plan de Entrenamiento para...
🔄 Sincronizando plan con Supabase...
✅ [SYNC] Plan existe en Supabase: [UUID]
📊 [SYNC] Training sessions existentes: 3
📊 [SYNC] Workouts en el plan: 3
✅ [SYNC] Training sessions ya existen, usando las de Supabase
✅ [SYNC] Plan sincronizado correctamente
✅ Plan sincronizado con training_sessions correctas
```

### ❌ Logs de Error a Buscar:
```
❌ [SYNC] Error insertando training_sessions: ...
❌ [SYNC] Plan no existe en Supabase: ...
```

**Si ves errores, COPIA Y PEGA todo el error aquí.**

---

## 🏃 PASO 2: Iniciar Entrenamiento

### Acción:
1. En la página del plan, busca una sesión **NO completada**
2. Haz clic en el botón **"Iniciar entrenamiento"** (morado, a la izquierda)
3. **MIRA LA CONSOLA** inmediatamente

### ✅ Logs Esperados:
```
🚀 Iniciando entrenamiento con GPS para workout: [UUID]
📋 Workout ID que se guardará: [UUID]
```

### ✅ Comportamiento Esperado:
- ✅ Debe aparecer un toast: "Iniciando GPS, te llevaremos al tracker..."
- ✅ Debe navegar a la pantalla GPS (fondo negro)
- ❌ **NO** debe recargar la página del plan
- ❌ **NO** debe aparecer error 404

### ❌ Si aparece un error:
- Copia el error completo
- Copia el UUID del workout que intentaste iniciar
- Verifica en Supabase si ese UUID existe en `training_sessions`

---

## 📱 PASO 3: Pantalla GPS

### Acción:
1. Deberías estar en la pantalla GPS (fondo negro)
2. **MIRA LA CONSOLA** y busca:

### ✅ Logs Esperados:
```
Inicializando GPS...
🎯 [DARK RUN TRACKER] Training session ID detectado: [UUID]
```

### ✅ Comportamiento Esperado:
- ✅ Debe aparecer un toast: "Entrenamiento del plan, se vinculará automáticamente"
- ✅ Debe mostrar botón "Iniciar" para comenzar el GPS
- ✅ El UUID en los logs debe ser el MISMO que en el paso 2

---

## 🏃‍♂️ PASO 4: Correr y Finalizar

### Acción:
1. Haz clic en "Iniciar" en el GPS
2. Corre (o espera unos segundos en modo test)
3. Haz clic en "Finalizar"
4. Rellena el formulario (título, descripción)
5. Haz clic en "Publicar actividad"
6. **MIRA LA CONSOLA**

### ✅ Logs Esperados:
```
🚀 [DARK RUN TRACKER] Publicando actividad con servicio ULTRA SIMPLE...
🚀 [ULTRA SIMPLE] Guardando actividad: [Título]
🎯 [ULTRA SIMPLE] Training session ID: [UUID]
📊 [ULTRA SIMPLE] Guardando actividad: ...
👤 [ULTRA SIMPLE] Usuario encontrado: [Nombre]
🎯 [ULTRA SIMPLE] Esta actividad se vinculará a la sesión: [UUID]
⚡ [ULTRA SIMPLE] El trigger auto-completará la sesión automáticamente
💾 [ULTRA SIMPLE] Datos para published_activities_simple: {...}
```

### ✅ SI TODO VA BIEN:
```
✅ Actividad guardada correctamente en Supabase
✅ [DARK RUN TRACKER] Training session vinculado y completado
```

### ❌ SI HAY ERROR:
```
❌ [ULTRA SIMPLE] Error insertando en Supabase: {...}
💥 [ULTRA SIMPLE] Error general: {...}
```

**Si ves el error, COPIA TODO el objeto de error completo.**

---

## ✅ PASO 5: Verificar Sesión Completada

### Acción:
1. Vuelve a la pestaña **"Plan"**
2. Busca la sesión que iniciaste
3. **Debería estar marcada con ✅**

### ✅ Comportamiento Esperado:
- ✅ La sesión muestra un check verde
- ✅ Muestra la distancia real: "5.2 km"
- ✅ Muestra la duración real: "28:45"
- ✅ El botón "Iniciar entrenamiento" ya NO aparece

### ❌ Si la sesión NO está completada:
1. Ve a Supabase → Table Editor → `training_sessions`
2. Busca el UUID de la sesión
3. Verifica:
   - `completed` = ¿true o false?
   - `actual_distance` = ¿tiene valor o NULL?
   - `actual_duration` = ¿tiene valor o NULL?
4. Copia toda la fila y compártela

---

## 📊 Verificación en Supabase

Ejecuta estas queries en Supabase SQL Editor:

### Query 1: Ver actividad publicada
```sql
SELECT 
  id,
  title,
  training_session_id,
  distance,
  duration,
  user_name,
  created_at
FROM published_activities_simple
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;
```

**Esperado:**
- `training_session_id` = UUID (NO null)

### Query 2: Ver sesión actualizada
```sql
SELECT 
  id,
  title,
  completed,
  actual_distance,
  actual_duration,
  completion_date
FROM training_sessions
WHERE id = 'PEGA_AQUI_EL_UUID_DE_LA_ACTIVIDAD'
LIMIT 1;
```

**Esperado:**
- `completed` = true
- `actual_distance` = número (ej: 5.2)
- `actual_duration` = "HH:MM:SS"
- `completion_date` = timestamp reciente

---

## 🚨 Problemas Comunes

### Problema 1: "La página se recarga en bucle"
**Solución:** Ya está arreglado. Si sigue pasando:
```javascript
// Limpiar localStorage
localStorage.clear();
// Recargar la app
window.location.reload();
```

### Problema 2: "Error de foreign key"
**Causa:** El training_session_id no existe en Supabase

**Verificar:**
```sql
SELECT id, title FROM training_sessions 
WHERE plan_id = 'TU_PLAN_ID';
```

Si la query no devuelve nada:
```javascript
// Forzar sincronización
localStorage.removeItem('savedPlan');
// Recargar plan
window.location.reload();
```

### Problema 3: "La sesión no se marca como completada"
**Verificar trigger:**
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_auto_complete_training_session';
```

Si no existe, ejecutar de nuevo la migración `027_add_training_session_link.sql`

---

## 📝 Checklist Final

- [ ] PASO 1: Plan cargado con sync exitoso
- [ ] PASO 2: "Iniciar entrenamiento" navega a GPS (sin reload)
- [ ] PASO 3: GPS detecta training_session_id
- [ ] PASO 4: Actividad publicada con training_session_id
- [ ] PASO 5: Sesión marcada como completada en plan
- [ ] Query 1: training_session_id NO es NULL
- [ ] Query 2: completed = true

---

## 💬 Cómo Reportar Resultados

Por favor, comparte:

1. **Logs de CADA PASO** (copia de consola)
2. **Resultados de las queries SQL**
3. **Screenshots si hay errores visuales**
4. **Indicar en qué paso falló (si falló)**

Con esta información podré identificar exactamente qué está fallando.

---

**🎯 META: Que TODOS los pasos funcionen sin errores**

