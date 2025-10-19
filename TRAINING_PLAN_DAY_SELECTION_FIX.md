# Fix para Problemas de Selección de Días en Planes de Entrenamiento

## Problemas Identificados

### 1. Duplicación de Días Específicos
**Problema:** Cuando el usuario selecciona días específicos (ej: martes y domingo), a veces se duplican los días (ej: martes y martes en vez de martes y domingo).

**Causa:** Error en la lógica de conversión entre el formato interno (0=Lunes) y el formato JavaScript (0=Domingo), y problemas con la mutación de objetos Date.

### 2. Mala Distribución con Cantidad de Días
**Problema:** Cuando el usuario selecciona la cantidad de días (ej: 2 días/semana), el sistema no distribuye los días inteligentemente, generando entrenamientos en días consecutivos o duplicados (ej: jueves y jueves).

**Causa:** No existía lógica para distribuir entrenamientos cuando solo se especificaba la cantidad de días, solo se generaban los próximos 7 días consecutivos.

### 3. Fecha de Inicio Incorrecta
**Problema:** El plan de entrenamiento empieza una semana más tarde de lo esperado.

**Causa:** Error en el cálculo de `daysToAdd` que causaba que se saltara una semana innecesariamente.

## Soluciones Implementadas

### 1. Corrección de `generateDatesForSelectedDays`
**Cambios principales:**
- Simplificación de la lógica de cálculo de `daysToAdd`
- Corrección para evitar mutación de objetos Date
- Lógica clara: si el día ya pasó o es hoy, ir a la próxima semana
- Uso de `totalDaysToAdd = daysToAdd + (week * 7)` para cálculo correcto

**Código corregido:**
```typescript
// Calculate days to add to get to the target day (for the first week)
let daysToAdd = jsTargetDay - currentDayOfWeek;

// If the day has already passed this week or is today, go to next week
if (daysToAdd <= 0) {
  daysToAdd += 7;
}

// Add the week offset (0, 7, 14, 21 days)
const totalDaysToAdd = daysToAdd + (week * 7);
```

### 2. Nueva Función `generateDatesForWeeklyWorkouts`
Crea una distribución inteligente de días basada en la cantidad seleccionada:

| Días/Semana | Distribución |
|-------------|--------------|
| 1 día | Miércoles |
| 2 días | Martes, Domingo |
| 3 días | Martes, Jueves, Domingo |
| 4 días | Lunes, Miércoles, Viernes, Domingo |
| 5 días | Lunes, Martes, Jueves, Sábado, Domingo |
| 6 días | Todos menos Miércoles |
| 7 días | Todos los días |

**Beneficios:**
- Distribución equilibrada con días de recuperación
- Patrones óptimos según mejores prácticas de running
- Los días más largos/intensos típicamente en fin de semana

### 3. Lógica de Decisión Mejorada
El sistema ahora decide qué función usar de manera inteligente:

```typescript
if (userProfile.selectedDays && userProfile.selectedDays.length > 0) {
  // Usuario seleccionó días específicos
  nextWeekDates = generateDatesForSelectedDays(userProfile.selectedDays);
} else if (userProfile.weeklyWorkouts && userProfile.weeklyWorkouts > 0 && userProfile.weeklyWorkouts <= 7) {
  // Usuario seleccionó cantidad de días
  nextWeekDates = generateDatesForWeeklyWorkouts(userProfile.weeklyWorkouts);
} else {
  // Fallback a los próximos 7 días
  nextWeekDates = generateDatesFromToday();
}
```

## Ejemplos de Funcionamiento

### Ejemplo 1: Días Específicos (Martes y Domingo)
**Input:** 
- Usuario selecciona: Martes (id=1) y Domingo (id=6)
- Fecha actual: Lunes 20 de Octubre 2025

**Output:**
- Martes 21 Oct 2025
- Domingo 26 Oct 2025
- Martes 28 Oct 2025
- Domingo 2 Nov 2025
- etc.

### Ejemplo 2: Cantidad (2 días/semana)
**Input:**
- Usuario selecciona: 2 entrenamientos por semana
- Fecha actual: Lunes 20 de Octubre 2025

**Output:**
- Martes 21 Oct 2025
- Domingo 26 Oct 2025
- Martes 28 Oct 2025
- Domingo 2 Nov 2025
- etc.

### Ejemplo 3: Cantidad (3 días/semana)
**Input:**
- Usuario selecciona: 3 entrenamientos por semana
- Fecha actual: Viernes 17 de Octubre 2025

**Output:**
- Domingo 19 Oct 2025
- Martes 21 Oct 2025
- Jueves 23 Oct 2025
- Domingo 26 Oct 2025
- Martes 28 Oct 2025
- Jueves 30 Oct 2025
- etc.

## Logs de Debug Mejorados

Se añadieron logs detallados para facilitar la depuración:
```typescript
console.log("User selected days:", userProfile.selectedDays);
console.log("User weekly workouts:", userProfile.weeklyWorkouts);
console.log("Using specific selected days / weekly workouts distribution / default");
console.log("Generated dates result:", nextWeekDates.map(...));
```

## Para Aplicar los Cambios

### 1. Verificar que Docker Desktop esté corriendo
```bash
# Verificar el estado de Docker
docker ps
```

### 2. Desplegar la función actualizada
```bash
supabase functions deploy generate-training-plan
```

### 3. Verificar el despliegue
```bash
# Ver logs en tiempo real
supabase functions logs generate-training-plan
```

## Verificación

### Test 1: Días Específicos
1. Ir a onboarding → pregunta de días de entrenamiento
2. Seleccionar modo "Días específicos"
3. Seleccionar Martes y Domingo
4. Completar onboarding y generar plan
5. **Verificar:** Solo aparecen entrenamientos en martes y domingos
6. **Verificar:** Las fechas empiezan desde la próxima semana disponible

### Test 2: Cantidad de Días
1. Ir a onboarding → pregunta de días de entrenamiento
2. Seleccionar modo "Cantidad"
3. Seleccionar 2 días
4. Completar onboarding y generar plan
5. **Verificar:** Aparecen entrenamientos en Martes y Domingo (distribuidos)
6. **Verificar:** NO hay días duplicados (jueves y jueves)
7. **Verificar:** Las fechas empiezan correctamente

### Test 3: Verificar Logs
```bash
# Ver los logs en Supabase Dashboard
# O usar CLI:
supabase functions logs generate-training-plan --tail
```

Buscar en los logs:
- "Using specific selected days" o "Using weekly workouts distribution"
- "Generated dates result: [...]"
- Verificar que las fechas y días sean correctos

## Archivos Modificados

- `/supabase/functions/generate-training-plan/index.ts`
  - Función `generateDatesForSelectedDays` (corregida)
  - Función `generateDatesForWeeklyWorkouts` (nueva)
  - Lógica de decisión en el main handler (mejorada)

## Notas Técnicas

### Conversión de Días
- **Frontend/Interno:** 0=Lunes, 1=Martes, ..., 6=Domingo
- **JavaScript Date:** 0=Domingo, 1=Lunes, ..., 6=Sábado
- **Conversión:** `jsTargetDay = dayId === 6 ? 0 : dayId + 1`

### Manejo de Fechas
- Siempre usar `new Date(targetDate.getTime())` para evitar mutaciones
- Siempre establecer horas a 00:00:00 con `setHours(0, 0, 0, 0)`
- Los cálculos de `daysToAdd` son relativos a `today`

### Distribuciones de Días
Las distribuciones se basan en principios de entrenamiento de running:
- Incluir al menos un día de fin de semana para carreras largas
- Distribuir días de manera equilibrada
- Evitar 3+ días consecutivos para principiantes
- El domingo es preferido para carreras largas

## Problemas Conocidos Resueltos

✅ Días duplicados cuando se seleccionan días específicos
✅ Días consecutivos cuando se selecciona cantidad
✅ Fecha de inicio una semana tarde
✅ Días incorrectos (jueves-jueves en vez de distribuidos)
✅ Nombres de días que no coinciden con las fechas

## Mejoras Futuras (Opcional)

- [ ] Permitir al usuario personalizar la distribución de días
- [ ] Considerar el día actual para distribuciones más inteligentes
- [ ] Permitir al usuario cambiar la distribución después de generada
- [ ] Añadir preferencias de días (ej: "prefiero entrenar en la mañana los fines de semana")

