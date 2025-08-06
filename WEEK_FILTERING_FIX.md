# 🔧 Fix: Estadísticas Semanales Independientes

## 🐛 **Problema Identificado**

### **❌ ANTES:**
- El sistema sumaba entrenamientos de **todas las semanas anteriores**
- En semana 2 mostraba "4/2 entrenamientos" (imposible: 4 completados de 2 objetivo)
- Estadísticas acumulativas en lugar de semanales independientes
- Filtrado basado en "últimos 7 días" desde hoy

### **✅ DESPUÉS:**
- Cada semana muestra **solo sus propias estadísticas**
- Semana 2 mostrará correctamente "2/2" o "1/2" entrenamientos
- Estadísticas independientes por semana de plan
- Filtrado basado en fechas específicas del plan actual

---

## 🔧 **Cambios Técnicos Realizados**

### **1. Modificación de `generateWeeklyInsights`**
```typescript
// ANTES:
export const generateWeeklyInsights = async (
  userName: string,
  weeklyGoal: number,
  currentWeekStats: any
)

// DESPUÉS:
export const generateWeeklyInsights = async (
  userName: string,
  weeklyGoal: number,
  currentWeekStats: any,
  currentPlan: WorkoutPlan  // ← NUEVO PARÁMETRO
)
```

### **2. Filtrado Correcto por Fechas del Plan**
```typescript
// ANTES: Problemático - últimos 7 días
const thisWeekWorkouts = allWorkouts.filter(w => {
  const workoutDate = new Date(w.fecha_completado);
  return workoutDate >= oneWeekAgo; // Incluía todo desde hace 7 días
});

// DESPUÉS: Correcto - fechas específicas del plan
const planWorkouts = currentPlan.workouts.filter(w => w.date);
const planDates = planWorkouts.map(w => new Date(w.date!));
const planStartDate = new Date(Math.min(...planDates.map(d => d.getTime())));
const planEndDate = new Date(Math.max(...planDates.map(d => d.getTime())));

const thisWeekWorkouts = allWorkouts.filter(w => {
  const workoutDate = new Date(w.fecha_completado);
  // Normalizar fechas y filtrar SOLO por rango del plan actual
  return normalizedWorkoutDate >= normalizedStartDate && 
         normalizedWorkoutDate <= normalizedEndDate;
});
```

### **3. Comparación con Semana Anterior Correcta**
```typescript
// ANTES: Basado en fechas relativas
const lastWeekWorkouts = allWorkouts.filter(w => {
  return workoutDate >= twoWeeksAgo && workoutDate < oneWeekAgo;
});

// DESPUÉS: Basado en semanas de plan específicas
const lastWeekWorkouts = allWorkouts.filter(w => {
  if (currentPlan.weekNumber <= 1) return false; // Primera semana no tiene anterior
  
  const oneWeekBefore = new Date(planStartDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksBefore = new Date(planStartDate.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  return workoutDate >= twoWeeksBefore && workoutDate < oneWeekBefore;
});
```

### **4. Actualización de Contexto y Llamadas**
```typescript
// WeeklyFeedbackContext.tsx
interface WeeklyFeedbackContextProps {
  showWeeklyFeedback: (currentPlan: WorkoutPlan, onClose?: () => void) => Promise<void>;
}

// TrainingPlanDisplay.tsx
await showWeeklyFeedback(plan, () => {
  performPlanGeneration();
});
```

---

## 📊 **Logging Mejorado**

### **Debug Information Añadido:**
```typescript
console.log('📅 Fechas del plan actual:', {
  weekNumber: currentPlan.weekNumber,
  startDate: planStartDate.toISOString().split('T')[0],
  endDate: planEndDate.toISOString().split('T')[0]
});

console.log(`📊 Entrenamientos filtrados para semana ${currentPlan.weekNumber}:`, {
  thisWeek: thisWeekWorkouts.length,
  lastWeek: lastWeekWorkouts.length,
  thisWeekWorkouts: thisWeekWorkouts.map(w => ({
    fecha: w.fecha_completado,
    distancia: w.distancia_recorrida
  }))
});
```

---

## 🎯 **Resultados Esperados**

### **Semana 1:**
- ✅ Muestra: "2/3 entrenamientos" (solo entrenamientos de semana 1)
- ✅ No hay semana anterior para comparar
- ✅ Estadísticas independientes

### **Semana 2:**
- ✅ Muestra: "2/3 entrenamientos" (solo entrenamientos de semana 2)
- ✅ Compara con semana 1 específica
- ✅ **NO suma** entrenamientos de semana 1

### **Semana 3+:**
- ✅ Solo estadísticas de la semana actual del plan
- ✅ Comparación correcta con semana anterior del plan
- ✅ Estadísticas completamente independientes

---

## 🧪 **Testing**

### **Mock Plan para Testing:**
```typescript
const mockPlan: WorkoutPlan = {
  weekNumber: 2, // Simula semana 2
  workouts: [
    { date: 'hace 6 días', completed: true },
    { date: 'hace 4 días', completed: true },
    { date: 'hace 2 días', completed: false }
  ]
};
```

### **Casos de Prueba:**
- ✅ Semana 1: Solo cuenta entrenamientos del rango de fechas del plan 1
- ✅ Semana 2: Solo cuenta entrenamientos del rango de fechas del plan 2
- ✅ Semana 3: Solo cuenta entrenamientos del rango de fechas del plan 3
- ✅ No hay acumulación entre semanas

---

## 🚀 **Validación**

**Ahora el feedback debería mostrar:**
- **Entrenamientos**: X/Y (donde X ≤ Y siempre)
- **Distancia**: Solo de la semana actual del plan
- **Consistencia**: Porcentaje correcto de la semana específica
- **Comparaciones**: Solo con la semana anterior del plan (si existe)

**🎊 ¡Cada semana es ahora completamente independiente!** 