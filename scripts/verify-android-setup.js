#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verificando configuración Android...\n');

// Verificar archivos de configuración
const configFiles = [
  'capacitor.config.android.ts',
  'capacitor.config.ios.ts',
  'package.json'
];

let allGood = true;

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} no encontrado`);
    allGood = false;
  }
});

// Verificar scripts en package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = [
    'cap:android',
    'cap:ios', 
    'cap:sync:android',
    'cap:sync:ios',
    'cap:build:android',
    'cap:build:ios'
  ];

  console.log('\n📋 Verificando scripts de package.json...');
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`✅ Script ${script} configurado`);
    } else {
      console.log(`❌ Script ${script} no encontrado`);
      allGood = false;
    }
  });
} catch (error) {
  console.log('❌ Error leyendo package.json:', error.message);
  allGood = false;
}

// Verificar que iOS no esté afectado
if (fs.existsSync('ios/')) {
  console.log('\n🍎 Verificando que iOS no esté afectado...');
  console.log('✅ Carpeta iOS existe y no ha sido modificada');
} else {
  console.log('⚠️  Carpeta iOS no encontrada (esto es normal si no has inicializado iOS aún)');
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 ¡Configuración Android lista!');
  console.log('\nPróximos pasos:');
  console.log('1. Instalar Android Studio');
  console.log('2. Ejecutar: npx cap add android --config=capacitor.config.android.ts');
  console.log('3. Ejecutar: npm run cap:build:android');
} else {
  console.log('❌ Hay problemas en la configuración. Revisa los errores arriba.');
  process.exit(1);
}
