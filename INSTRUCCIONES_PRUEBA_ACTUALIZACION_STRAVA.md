# 🧪 Instrucciones para Probar la Actualización Automática de Strava

## ✅ Cambios Implementados

He agregado **auto-refresh cada 30 segundos** en todos los componentes de la app para que detecten automáticamente las actividades importadas desde Strava.

---

## 🎯 Cómo Probar (Paso a Paso)

### Preparación:
1. ✅ Xcode ya está abierto con el proyecto
2. ✅ Compila y ejecuta la app en tu dispositivo/simulador
3. ✅ Asegúrate de estar autenticado en la app

---

### 🏃 Prueba 1: Actividad Real de Strava

#### Paso 1: Corre con Strava (Actividad Real)
```
1. Abre Strava en tu móvil
2. Inicia una carrera (al menos 100 metros)
3. Completa la carrera
4. GUARDA la actividad en Strava
5. Anota la hora exacta: _______
```

#### Paso 2: Espera el Webhook de Strava
```
⏰ Tiempo estimado: 1-5 minutos

Mientras esperas, puedes:
- Revisar los logs del webhook en Supabase:
  https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions/strava-webhook/logs
  
- Busca este mensaje:
  ✅ "Successfully imported Strava activity XXXXXXX"
```

#### Paso 3: Abre BeRun y Espera
```
⏰ Tiempo estimado: Máximo 30 segundos

1. Abre la app BeRun
2. NO toques nada, solo espera
3. Observa cómo se actualizan automáticamente:
   - Tab "Actividades" (nuevo card de actividad)
   - Tab "Estadísticas" (números actualizados)
   - Tab "Plan" (sesión marcada como completada ✓)
```

---

### 🧪 Prueba 2: Actividad de Prueba Corta

Si no quieres correr una distancia real, puedes hacer una prueba rápida:

#### Opción A: Actividad Manual en Strava
```
1. Abre Strava (app o web)
2. Crea una actividad manual:
   - Tipo: Run (Carrera)
   - Distancia: 1 km
   - Duración: 5 minutos
   - Fecha: Hoy
3. Guarda
4. Espera 1-5 minutos para el webhook
5. Observa la app (se actualizará automáticamente)
```

#### Opción B: Simular con la API de Strava
```bash
# Desde tu terminal (si tienes acceso a la API):
curl -X POST https://www.strava.com/api/v3/activities \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d "name=Prueba BeRun" \
  -d "type=Run" \
  -d "start_date_local=2025-11-21T19:00:00Z" \
  -d "elapsed_time=300" \
  -d "distance=1000"
```

---

## 📊 Qué Observar en Cada Tab

### Tab "Actividades" (📱 Mis Actividades)

**Antes:**
- Sin actividades de Strava

**Después (máx 30 seg):**
```
┌─────────────────────────────────────┐
│ 🏃 Carrera de noche              ✨ │  ← Título de Strava
│ hoy                                  │
│                                      │
│  5.2 km    25:30    4:54 /km        │  ← Datos reales
│                                      │
│ Importado desde Strava              │  ← Indicador
└─────────────────────────────────────┘
```

### Tab "Estadísticas" (📈 Stats)

**Antes:**
```
Esta semana: 10.5 km
Total entrenamientos: 3
```

**Después (máx 30 seg):**
```
Esta semana: 15.7 km      ← +5.2 km
Total entrenamientos: 4    ← +1
```

### Tab "Plan" (📅 Mi Plan)

**Antes:**
```
┌─────────────────────────────────────┐
│ Lunes - Carrera continua            │
│ 5 km • 25 min • 5:00 /km            │
│                                      │
│ [ Iniciar ]                         │  ← Pendiente
└─────────────────────────────────────┘
```

**Después (máx 30 seg):**
```
┌─────────────────────────────────────┐
│ Lunes - Carrera continua         ✓  │  ← Completado
│ 5 km • 25 min • 5:00 /km            │
│                                      │
│ Completado: 5.2 km en 25:30        │  ← Datos reales
└─────────────────────────────────────┘
```

---

## 🐛 Si NO Se Actualiza

### 1. Verifica los Logs del Webhook

Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions/strava-webhook/logs

Busca:
```
✅ "Successfully imported Strava activity XXXXXXX"
✅ "Activity saved to workouts_simple"
✅ "Activity saved to published_activities_simple"
```

Si NO ves estos mensajes, el webhook no se disparó. Posibles causas:
- ❌ La actividad no es de tipo "Run" (solo se procesan carreras)
- ❌ Strava aún no ha enviado el webhook (espera 5 minutos más)
- ❌ El webhook está mal configurado

### 2. Verifica los Datos en Supabase

Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor

**Tabla `published_activities_simple`:**
```sql
SELECT * FROM published_activities_simple 
WHERE imported_from_strava = true 
ORDER BY created_at DESC 
LIMIT 5;
```

**Tabla `workouts_simple`:**
```sql
SELECT * FROM workouts_simple 
WHERE notes LIKE '%Strava%' 
ORDER BY created_at DESC 
LIMIT 5;
```

Si los datos ESTÁN en Supabase pero NO aparecen en la app:
- ❌ Verifica que el `user_id` coincida
- ❌ Espera 30 segundos más (auto-refresh)
- ❌ Cierra y reabre la app

### 3. Fuerza un Refresh Manual

Si después de 30 segundos aún no se actualiza, cierra y reabre la app completamente:
```
1. Cierra la app (swipe up)
2. Vuelve a abrir
3. Verifica cada tab
```

---

## 🎯 Checklist de Prueba

### ✅ Preparación
- [ ] App compilada en Xcode sin errores
- [ ] Usuario autenticado en BeRun
- [ ] Strava conectado (check en Settings)

### ✅ Prueba de Importación
- [ ] Actividad creada en Strava (tipo: Run)
- [ ] Actividad guardada correctamente
- [ ] Webhook procesado (ver logs en Supabase)
- [ ] Datos guardados en `published_activities_simple`
- [ ] Datos guardados en `workouts_simple`

### ✅ Verificación en App
- [ ] Tab "Actividades": Nueva actividad visible
- [ ] Tab "Estadísticas": Números actualizados
- [ ] Tab "Plan": Sesión marcada como completada ✓

### ✅ Auto-Refresh
- [ ] Cambios detectados sin cerrar/abrir app
- [ ] Actualización en máximo 30 segundos
- [ ] Logs en consola: "🔄 Auto-refresh activado"

---

## 📱 Logs de Consola Esperados

Mientras la app está abierta, deberías ver estos logs cada 30 segundos:

```
🔄 [Activities] Auto-refresh activado (cada 30s)
[useSimpleStats] 🔄 Auto-refresh activado (cada 30s) - verificando nuevos datos
[usePeriodStats] 🔄 Auto-refresh activado (cada 30s) - verificando nuevos datos
[Plan.tsx] 🔄 Auto-refresh activado (cada 30s) - verificando cambios en el plan
```

Cuando encuentra una nueva actividad:
```
✅ [Activities] Loaded from Supabase: 5 activities  ← Antes: 4
📊 [ULTRA SIMPLE] Actividades desde Supabase (filtradas): 5 actividades
✅ [SimpleWorkouts] Obtenidos 5 entrenamientos  ← Antes: 4
```

---

## 🎉 Resultado Esperado

**Tiempo total desde que guardas en Strava hasta que aparece en BeRun:**
- Webhook: 1-5 minutos (depende de Strava)
- Auto-refresh: Máximo 30 segundos (depende del ciclo)
- **TOTAL: 1.5-6 minutos**

**Sin necesidad de:**
- ❌ Cerrar y abrir la app
- ❌ Hacer pull-to-refresh
- ❌ Cambiar de tab
- ❌ Tocar ningún botón

**La app se actualiza sola automáticamente** 🎯✨

---

## 📞 Soporte

Si algo no funciona:
1. Revisa el documento `SOLUCION_ACTUALIZACION_STRAVA.md` para más detalles técnicos
2. Verifica los logs del webhook en Supabase
3. Verifica que los datos estén en las tablas de Supabase

**Fecha:** 21 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Listo para probar


