#!/usr/bin/env node

/**
 * Script para subir imagen de branding de Garmin a Supabase Storage
 * 
 * Uso:
 * 1. Asegúrate de tener una imagen 300x300px llamada 'garmin-branding-300x300.png' en public/
 * 2. Ejecuta: node scripts/upload-garmin-branding.js
 * 3. Copia la URL que se muestra y úsala en el formulario de Garmin
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uprohtkbghujvjwjnqyv.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function uploadBrandingImage() {
  try {
    console.log('🚀 Subiendo imagen de branding a Supabase Storage...\n');

    // Usar el bucket 'activity-images' existente (ya es público)
    const bucketName = 'activity-images';
    console.log(`📦 Usando bucket existente: ${bucketName}\n`);

    // Buscar imagen 300x300px en public/
    const imagePath = path.join(__dirname, '../public/garmin-branding-300x300.png');
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ No se encontró la imagen en:', imagePath);
      console.log('\n💡 Primero ejecuta: ./scripts/resize-garmin-branding.sh');
      console.log('   Esto creará la imagen 300x300px necesaria.');
      return;
    }

    // Leer archivo
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = 'garmin-branding-300x300.png';

    console.log(`📤 Subiendo ${fileName}...`);

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`branding/${fileName}`, fileBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true // Sobrescribir si existe
      });

    if (uploadError) {
      console.error('❌ Error subiendo imagen:', uploadError);
      return;
    }

    console.log('✅ Imagen subida exitosamente\n');

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`branding/${fileName}`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ URL PÚBLICA DE LA IMAGEN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(publicUrl);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Copia esta URL y úsala en el campo "Branding image" de Garmin\n');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

uploadBrandingImage();

