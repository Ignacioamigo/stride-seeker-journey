# 🔧 SOLUCIÓN: Training Sessions No Sincronizadas

**Fecha:** 19 Octubre 2025  
**Problema:** Foreign key constraint violation - training_session_id no existe

---

## 🐛 Problema Identificado

### Error Original
```
❌ Error: insert or update on table "published_activities_simple" 
violates foreign key constraint "fk_published_activities_training_session"
Key (training_session_id)=(4aa38ced-b8d9-47d0-9c7e-eaca18e29f5a) 
is not present in table "training_sessions"
```

### Causa Raíz

1. **Planes generados con UUIDs locales:**
   ```typescript
   // En generateTrainingPlan()
   workouts: edgePlanData.workouts.map((workout: any) => ({
     id: uuidv4(),  // ❌ UUID generado en el frontend
   }))
   ```

2. **Training sessions no creadas en Supabase:**
   - El plan se guarda en localStorage con IDs locales
   - Las `training_sessions` no se insertan en Supabase (o fallan silenciosamente)
   - El usuario hace clic en "Iniciar entrenamiento"
   - Se pasa el UUID local que NO existe en Supabase
   - 💥 Error de foreign key constraint

---

## ✅ Solución Implementada

### 1. Servicio de Sincronización

**Archivo:** `src/services/syncPlanService.ts`

```typescript
export const syncPlanWithDatabase = async (plan: WorkoutPlan) => {
  // 1. Verificar si el plan existe en Supabase
  // 2. Si no existe, crearlo
  // 3. Verificar training_sessions
  // 4. Si no existen, crearlas con los mismos UUIDs del plan local
  // 5. Recargar plan desde Supabase con IDs correctos
  // 6. Actualizar localStorage
}
```

**Flujo:**
```
1. Plan cargado desde localStorage (IDs locales)
   ↓
2. syncPlanWithDatabase() se ejecuta
   ↓
3. Verifica si plan existe en Supabase → Si no, lo crea
   ↓
4. Verifica si training_sessions existen → Si no, las crea
   ↓
5. Recarga plan desde Supabase con IDs correctos
   ↓
6. Actualiza localStorage con IDs de Supabase
   ↓
7. ✅ Plan sincronizado
```

---

### 2. Validación Antes de Iniciar GPS

**Archivo:** `src/components/plan/TrainingPlanDisplay.tsx`

```typescript
const handleStartWorkout = async (workoutId: string) => {
  // ✅ VALIDAR que el training_session existe en Supabase
  const { data: sessionExists } = await supabase
    .from('training_sessions')
    .select('id')
    .eq('id', workoutId)
    .single();
  
  if (!sessionExists) {
    // ❌ No existe, mostrar error y recargar
    toast({ title: "Error", description: "Sesión no sincronizada. Recargando..." });
    window.location.reload();
    return;
  }
  
  // ✅ Existe, continuar con el flujo normal
  localStorage.setItem('active_training_session_id', workoutId);
  navigate('/train');
};
```

---

### 3. Integración en Plan.tsx

**Archivo:** `src/pages/Plan.tsx`

```typescript
useEffect(() => {
  const loadPlan = async () => {
    let plan = await loadLatestPlan();
    
    if (plan) {
      // 🔄 SINCRONIZAR con Supabase
      const syncedPlan = await syncPlanWithDatabase(plan);
      
      if (syncedPlan) {
        setCurrentPlan(syncedPlan); // IDs correctos de Supabase
      } else {
        setCurrentPlan(plan); // Fallback a plan original
      }
    }
  };
  
  loadPlan();
}, []);
```

---

## 🔄 Flujo Completo Actualizado

### Generación de Plan
```
1. Usuario completa onboarding
   ↓
2. generateTrainingPlan() genera plan con UUIDs locales
   ↓
3. savePlan() guarda plan + training_sessions en Supabase
   ↓
4. localStorage se actualiza con plan (IDs locales aún)
```

### Carga de Plan (NUEVO)
```
1. loadLatestPlan() carga plan
   ↓
2. syncPlanWithDatabase() se ejecuta:
   a. Verifica plan en Supabase
   b. Crea training_sessions si no existen
   c. Usa IDs del plan local para training_sessions
   d. Recarga desde Supabase
   ↓
3. Plan con IDs correctos de Supabase
   ↓
4. localStorage actualizado
```

### Inicio de Entrenamiento (NUEVO)
```
1. Usuario hace clic "Iniciar entrenamiento"
   ↓
2. handleStartWorkout() valida que training_session existe
   ↓
3. Si NO existe → Error + Reload
   ↓
4. Si existe → Guarda training_session_id + Navega a GPS
   ↓
5. Usuario corre y finaliza
   ↓
6. Se publica actividad con training_session_id
   ↓
7. ⚡ Trigger auto-completa la sesión
   ↓
8. ✅ Plan se actualiza automáticamente
```

---

## 🧪 Cómo Probar la Solución

### Test 1: Sincronización Automática
```
1. Abre la app
2. Ve a "Plan"
3. Busca en console:
   🔄 Sincronizando plan con Supabase...
   ✅ Plan sincronizado con training_sessions correctas
4. ✅ No debe haber errores
```

### Test 2: Validación de Training Session
```
1. En "Plan", haz clic "Iniciar entrenamiento"
2. Busca en console:
   ✅ Training session existe: [UUID]
3. Debe navegar a GPS sin errores
4. ✅ No debe aparecer error 404 ni foreign key
```

### Test 3: Completar Entrenamiento
```
1. Inicia GPS desde plan
2. Corre y finaliza
3. Publica actividad
4. Busca en console:
   ⚡ El trigger auto-completará la sesión automáticamente
5. Vuelve al plan
6. ✅ Sesión debe estar marcada como completada
```

---

## 📊 Verificación en Base de Datos

### Verificar Training Sessions
```sql
-- Ver training_sessions del usuario
SELECT 
  ts.id,
  ts.title,
  ts.completed,
  ts.actual_distance,
  ts.actual_duration,
  tp.name as plan_name
FROM training_sessions ts
JOIN training_plans tp ON tp.id = ts.plan_id
WHERE tp.user_id = (
  SELECT id FROM user_profiles 
  WHERE user_auth_id = auth.uid()
)
ORDER BY ts.day_number;
```

### Verificar Actividades Vinculadas
```sql
-- Ver actividades con training_session_id
SELECT 
  pas.id,
  pas.title,
  pas.training_session_id,
  ts.title as session_title,
  ts.completed as session_completed
FROM published_activities_simple pas
LEFT JOIN training_sessions ts ON ts.id = pas.training_session_id
WHERE pas.user_id = auth.uid()
ORDER BY pas.created_at DESC;
```

---

## 🚨 Troubleshooting

### Error: "Sesión no sincronizada. Recargando..."

**Causa:** Las training_sessions no se crearon correctamente

**Solución:**
1. Abrir Supabase Dashboard
2. Ir a Table Editor → training_sessions
3. Verificar que existen registros para el plan
4. Si no existen, ejecutar:
   ```sql
   -- Limpiar y regenerar
   DELETE FROM training_sessions WHERE plan_id = 'TU_PLAN_ID';
   -- Recargar la app para que sync las cree
   ```

---

### Error: Foreign Key aún después de sync

**Causa:** El UUID del workout no coincide con ningún training_session

**Solución:**
1. Limpiar localStorage:
   ```javascript
   localStorage.removeItem('savedPlan');
   ```
2. Recargar la app
3. El plan se recargará desde Supabase con IDs correctos

---

### Plan no se actualiza después de completar

**Causa:** El evento `workoutCompleted` no se dispara o no se escucha

**Solución:**
1. Verificar en console:
   ```
   ✅ [DARK RUN TRACKER] Training session vinculado y completado
   🎉 [TRAINING PLAN] Entrenamiento completado, actualizando plan...
   ```
2. Si no aparecen, verificar que:
   - `training_session_id` se pasa correctamente
   - El evento se dispara en DarkRunTracker
   - El listener existe en TrainingPlanDisplay

---

## 📝 Archivos Modificados

| Archivo | Cambio | Propósito |
|---------|--------|-----------|
| `src/services/syncPlanService.ts` | ✅ NUEVO | Sincronizar plan con Supabase |
| `src/pages/Plan.tsx` | 🔧 Modificado | Llamar a sync al cargar plan |
| `src/components/plan/TrainingPlanDisplay.tsx` | 🔧 Modificado | Validar training_session antes de GPS |

---

## ✅ Resultado Esperado

### Consola al Cargar Plan
```
Attempting to load existing plan...
Plan loaded successfully: Plan de Entrenamiento para...
🔄 Sincronizando plan con Supabase...
📊 [SYNC] Training sessions existentes: 0
📊 [SYNC] Workouts en el plan: 3
🔧 [SYNC] Creando training_sessions en Supabase...
✅ [SYNC] 3 training_sessions creadas
✅ [SYNC] Plan sincronizado correctamente
✅ Plan sincronizado con training_sessions correctas
```

### Consola al Iniciar Entrenamiento
```
🚀 Iniciando entrenamiento con GPS para workout: 4aa38ced-...
✅ Training session existe: 4aa38ced-...
```

### Consola al Finalizar
```
🎯 [ULTRA SIMPLE] Training session ID: 4aa38ced-...
⚡ [ULTRA SIMPLE] El trigger auto-completará la sesión automáticamente
💾 [ULTRA SIMPLE] Datos para published_activities_simple: {...}
✅ Actividad guardada correctamente
✅ [DARK RUN TRACKER] Training session vinculado y completado
🎉 [TRAINING PLAN] Entrenamiento completado, actualizando plan...
```

---

## 🎉 Estado Final

| Aspecto | Estado |
|---------|--------|
| Sincronización automática | ✅ |
| Validación pre-GPS | ✅ |
| Foreign key constraint | ✅ Resuelto |
| Auto-completado | ✅ |
| Build | ✅ Sin errores |

**Listo para probar en la app** 🚀

