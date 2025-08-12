# 🚀 CONFIGURACIÓN COMPLETA DE SUPABASE - INSTRUCCIONES

## 📍 PASO 1: ACCEDER A TU DASHBOARD

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: **stride-seeker-journey**
3. Ve a la sección **SQL Editor**

## 📍 PASO 2: CREAR TABLA (MUY IMPORTANTE)

1. **Abre el archivo**: `SQL_SETUP_SUPABASE.sql`
2. **Copia TODO el contenido**
3. **Pégalo en SQL Editor**
4. **Ejecuta LÍNEA POR LÍNEA** (no todo junto)
5. **Verifica** que cada comando se ejecute sin errores

### ⚠️ IMPORTANTE:
- Ejecuta **UNA LÍNEA A LA VEZ**
- Si hay errores, me avisas inmediatamente
- Al final deberías ver: "Table created successfully"

## 📍 PASO 3: CONFIGURAR STORAGE

1. Ve a **Storage** en el sidebar
2. Click **"Create new bucket"**
3. **Configuración del bucket**:
   ```
   Name: activity-images
   Public: ✅ true
   File size limit: 10MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```
4. Click **"Create bucket"**

### Luego ejecuta las políticas:
1. Vuelve a **SQL Editor**
2. Abre `STORAGE_SETUP_SUPABASE.sql`
3. **Ejecuta línea por línea**

## 📍 PASO 4: VERIFICACIÓN

### Verificar tabla:
```sql
SELECT COUNT(*) FROM published_activities;
```
**Resultado esperado**: `0` (tabla vacía pero existe)

### Verificar bucket:
```sql
SELECT * FROM storage.buckets WHERE id = 'activity-images';
```
**Resultado esperado**: 1 fila con el bucket

### Verificar políticas:
```sql
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'published_activities';
```
**Resultado esperado**: `5` (las 5 políticas)

## 📍 PASO 5: NOTIFICARME

Una vez hayas ejecutado todo:

1. **✅ Tabla creada**: `published_activities`
2. **✅ Bucket creado**: `activity-images`  
3. **✅ Políticas configuradas**: RLS habilitado
4. **✅ Verificaciones pasadas**: Consultas funcionan

**Escríbeme: "✅ SUPABASE CONFIGURADO"** y procederé a:
- Actualizar el código para usar Supabase
- Migrar tus actividades locales
- Testear todo el flujo completo

## 🚨 SI HAY ERRORES:

**Envíame EXACTAMENTE**:
1. El comando que ejecutaste
2. El error completo que apareció
3. Screenshot si es necesario

**¡Vamos a hacerlo perfecto!** 🚀
