# Fix para Selección de Días en Planes de Entrenamiento

## Problema Identificado
Cuando un usuario selecciona días específicos para entrenar (ej: Martes y Domingo), el plan generado muestra días incorrectos (ej: Domingo y Domingo).

## Causa del Problema
La función `generateDatesForSelectedDays` en `/supabase/functions/generate-training-plan/index.ts` tenía errores en la lógica de cálculo de fechas:

1. **Error de mapeo de días**: No convertía correctamente entre el formato interno (0=Lunes) y el formato JavaScript (0=Domingo)
2. **Lógica de semanas compleja**: Usaba cálculos de "lunes de la semana" que generaban fechas incorrectas
3. **Filtrado inconsistente**: No filtraba correctamente solo los días seleccionados

## Solución Implementada

### Estructura de Datos
- Frontend: `{ id: 0, name: "Lunes", selected: true }` donde `id: 0-6` representa Lunes-Domingo
- Backend: Debe respetar esta estructura y calcular fechas correctamente

### Nueva Lógica
```javascript
function generateDatesForSelectedDays(selectedDays: any[]) {
  // 1. Filtrar solo días seleccionados
  const actualSelectedDays = selectedDays.filter(day => day.selected);
  
  // 2. Para cada día seleccionado, calcular fechas futuras
  for (let week = 0; week < 4; week++) {
    for (const selectedDay of actualSelectedDays) {
      const dayId = selectedDay.id; // 0=Lunes, 1=Martes, ..., 6=Domingo
      
      // 3. Convertir a formato JavaScript (0=Domingo, 1=Lunes, etc.)
      const jsTargetDay = dayId === 6 ? 0 : dayId + 1;
      
      // 4. Calcular días a añadir desde hoy
      let daysToAdd = jsTargetDay - today.getDay();
      if (daysToAdd < 0) daysToAdd += 7; // Próxima semana si ya pasó
      daysToAdd += (week * 7); // Añadir offset de semana
      
      // 5. Crear fecha y añadir a resultado
      targetDate.setDate(today.getDate() + daysToAdd);
      dates.push({ date: targetDate, dayName: selectedDay.name });
    }
  }
}
```

## Ejemplo de Funcionamiento
**Input**: Usuario selecciona Martes (id=1) y Domingo (id=6)

**Proceso**:
- Martes (id=1) → jsDay=2 → Próximo martes + cada martes siguiente
- Domingo (id=6) → jsDay=0 → Próximo domingo + cada domingo siguiente

**Output**: Plan con entrenamientos SOLO en martes y domingos

## Logs de Debug Añadidos
```javascript
console.log("Selected days received:", selectedDays);
console.log("Actually selected days:", actualSelectedDays);
console.log("Generated dates:", dates.map(d => ({ 
  date: d.date.toISOString().split('T')[0], 
  dayName: d.dayName 
})));
```

## Para Aplicar el Fix
1. Iniciar Docker Desktop
2. Ejecutar: `supabase functions deploy generate-training-plan`
3. Probar generación de plan con días específicos

## Verificación
- Seleccionar Martes y Domingo en onboarding
- Generar plan de entrenamiento
- Verificar que SOLO aparecen entrenamientos en martes y domingos
- Revisar logs de Supabase Functions para debug si es necesario
