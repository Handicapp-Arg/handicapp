/**
 * Script de Validación de Rendimiento
 * Valida optimizaciones, bundle size, lazy loading, imágenes
 */

import * as fs from 'fs';
import * as path from 'path';

interface PerformanceResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message?: string;
  details?: string[];
}

const results: PerformanceResult[] = [];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', message?: string, details?: string[]) {
  results.push({ category, test, status, message, details });
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  
  log(`${icon} ${test}${message ? ': ' + message : ''}`, color);
  if (details && details.length > 0) {
    details.forEach(d => log(`   - ${d}`, 'cyan'));
  }
}

// 1. Validar lazy loading
async function validateLazyLoading() {
  log('\n🚀 Validando lazy loading...', 'bold');
  
  const srcPath = path.join(process.cwd(), 'src');
  const files: string[] = [];
  
  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(srcPath);
  
  let dynamicImports = 0;
  let lazyComponents = 0;
  const filesWithLazy: string[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Buscar dynamic imports
    if (content.includes('import(') || content.includes('dynamic(')) {
      dynamicImports++;
      filesWithLazy.push(path.basename(file));
    }
    
    // Buscar React.lazy
    if (content.includes('React.lazy') || content.includes('lazy(')) {
      lazyComponents++;
    }
  }
  
  if (dynamicImports + lazyComponents > 0) {
    addResult('Rendimiento', 'Lazy Loading', 'PASS',
      `${dynamicImports + lazyComponents} componentes/módulos con carga diferida`,
      filesWithLazy.slice(0, 5));
  } else {
    addResult('Rendimiento', 'Lazy Loading', 'WARN',
      'No se encontraron componentes con lazy loading');
  }
}

// 2. Validar optimización de imágenes
async function validateImageOptimization() {
  log('\n🖼️  Validando optimización de imágenes...', 'bold');
  
  const publicPath = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(publicPath)) {
    addResult('Imágenes', 'Directorio public', 'WARN', 'No existe');
    return;
  }
  
  const imageFiles: string[] = [];
  
  function findImages(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findImages(fullPath);
      } else if (entry.isFile() && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)) {
        imageFiles.push(fullPath);
      }
    }
  }
  
  findImages(publicPath);
  
  let largeImages = 0;
  const largeImagesList: string[] = [];
  
  for (const img of imageFiles) {
    const stats = fs.statSync(img);
    const sizeKB = stats.size / 1024;
    
    if (sizeKB > 500) {
      largeImages++;
      largeImagesList.push(`${path.basename(img)} (${sizeKB.toFixed(0)}KB)`);
    }
  }
  
  if (largeImages === 0) {
    addResult('Imágenes', 'Tamaño de imágenes', 'PASS',
      `${imageFiles.length} imágenes, ninguna mayor a 500KB`);
  } else if (largeImages <= 3) {
    addResult('Imágenes', 'Tamaño de imágenes', 'WARN',
      `${largeImages} imágenes mayores a 500KB`, largeImagesList);
  } else {
    addResult('Imágenes', 'Tamaño de imágenes', 'FAIL',
      `${largeImages} imágenes mayores a 500KB`, largeImagesList.slice(0, 5));
  }
  
  // Verificar uso de Next Image
  const srcPath = path.join(process.cwd(), 'src');
  const componentsWithImage: string[] = [];
  const componentsWithImgTag: string[] = [];
  
  function scanForImages(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        scanForImages(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('next/image') || content.includes('<Image')) {
          componentsWithImage.push(entry.name);
        }
        if (content.includes('<img') && !content.includes('next/image')) {
          componentsWithImgTag.push(entry.name);
        }
      }
    }
  }
  
  scanForImages(srcPath);
  
  if (componentsWithImgTag.length === 0) {
    addResult('Imágenes', 'Next Image Component', 'PASS',
      `${componentsWithImage.length} componentes usan next/image`);
  } else if (componentsWithImgTag.length <= 15) {
    addResult('Imágenes', 'Next Image Component', 'WARN',
      `${componentsWithImgTag.length} componentes usan <img> tag (considerar next/image para optimización)`, componentsWithImgTag.slice(0, 5));
  } else {
    addResult('Imágenes', 'Next Image Component', 'FAIL',
      `${componentsWithImgTag.length} componentes usan <img> tag`, componentsWithImgTag.slice(0, 5));
  }
}

// 3. Validar React Query configuración
async function validateReactQuery() {
  log('\n⚡ Validando React Query...', 'bold');
  
  const providersPath = path.join(process.cwd(), 'src/app/providers.tsx');
  
  if (!fs.existsSync(providersPath)) {
    addResult('React Query', 'Configuración', 'WARN', 'providers.tsx no encontrado');
    return;
  }
  
  const content = fs.readFileSync(providersPath, 'utf-8');
  
  const checks = [
    { name: 'QueryClient configurado', pattern: /QueryClient|queryClient/, required: true },
    { name: 'Cache time configurado', pattern: /cacheTime|gcTime/, required: false },
    { name: 'Stale time configurado', pattern: /staleTime/, required: false },
    { name: 'Retry configurado', pattern: /retry/, required: false }
  ];
  
  const configured: string[] = [];
  const missing: string[] = [];
  
  for (const check of checks) {
    if (check.pattern.test(content)) {
      configured.push(check.name);
    } else if (check.required) {
      missing.push(check.name);
    }
  }
  
  if (missing.length === 0) {
    addResult('React Query', 'Configuración', 'PASS',
      `${configured.length} configuraciones encontradas`);
  } else {
    addResult('React Query', 'Configuración', 'WARN',
      `Faltan ${missing.length} configuraciones`, missing);
  }
}

// 4. Validar memoización
async function validateMemoization() {
  log('\n🧠 Validando memoización...', 'bold');
  
  const srcPath = path.join(process.cwd(), 'src');
  const files: string[] = [];
  
  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(path.join(srcPath, 'components'));
  
  let useMemoCount = 0;
  let useCallbackCount = 0;
  let memoCount = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    const memoMatches = content.match(/useMemo\(/g);
    const callbackMatches = content.match(/useCallback\(/g);
    const reactMemoMatches = content.match(/React\.memo\(|memo\(/g);
    
    useMemoCount += memoMatches ? memoMatches.length : 0;
    useCallbackCount += callbackMatches ? callbackMatches.length : 0;
    memoCount += reactMemoMatches ? reactMemoMatches.length : 0;
  }
  
  const total = useMemoCount + useCallbackCount + memoCount;
  
  if (total > 20) {
    addResult('Memoización', 'Optimizaciones', 'PASS',
      `${total} optimizaciones (useMemo: ${useMemoCount}, useCallback: ${useCallbackCount}, memo: ${memoCount})`);
  } else if (total > 10) {
    addResult('Memoización', 'Optimizaciones', 'WARN',
      `${total} optimizaciones encontradas - considerar más memoización`);
  } else {
    addResult('Memoización', 'Optimizaciones', 'WARN',
      `Solo ${total} optimizaciones - componentes grandes deberían usar memoización`);
  }
}

// 5. Validar bundle size (package.json)
async function validateBundleSize() {
  log('\n📦 Validando configuración de bundle...', 'bold');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  const deps = packageContent.dependencies || {};
  
  const heavyPackages = [
    'moment',
    'lodash',
    'axios'
  ];
  
  const foundHeavy: string[] = [];
  
  for (const pkg of heavyPackages) {
    if (deps[pkg]) {
      foundHeavy.push(pkg);
    }
  }
  
  // Verificar alternativas ligeras
  const lightAlternatives = [
    { heavy: 'moment', light: 'date-fns', has: !!deps['date-fns'] },
    { heavy: 'lodash', light: 'lodash-es', has: !!deps['lodash-es'] },
    { heavy: 'axios', light: 'fetch API nativo', has: true }
  ];
  
  if (foundHeavy.length === 0) {
    addResult('Bundle', 'Dependencias pesadas', 'PASS',
      'No se encontraron dependencias pesadas comunes');
  } else {
    const suggestions = foundHeavy.map(pkg => {
      const alt = lightAlternatives.find(a => a.heavy === pkg);
      return `${pkg} (considerar ${alt?.light || 'alternativa más ligera'})`;
    });
    addResult('Bundle', 'Dependencias pesadas', 'WARN',
      `${foundHeavy.length} dependencias pesadas`, suggestions);
  }
  
  // Verificar tree-shaking
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
    
    if (nextConfig.includes('modularizeImports') || nextConfig.includes('transpilePackages')) {
      addResult('Bundle', 'Tree-shaking', 'PASS', 'Configurado en next.config.ts');
    } else {
      addResult('Bundle', 'Tree-shaking', 'WARN', 'No configurado explícitamente');
    }
  }
}

// 6. Validar código duplicado
async function validateCodeDuplication() {
  log('\n🔍 Validando código duplicado...', 'bold');
  
  const srcPath = path.join(process.cwd(), 'src');
  const componentFiles: string[] = [];
  
  function scanComponents(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        scanComponents(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        componentFiles.push(fullPath);
      }
    }
  }
  
  scanComponents(path.join(srcPath, 'components'));
  
  // Buscar componentes con código similar (más de 300 líneas)
  const largeComponents: string[] = [];
  
  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n').length;
    
    if (lines > 300) {
      largeComponents.push(`${path.basename(file)} (${lines} líneas)`);
    }
  }
  
  if (largeComponents.length === 0) {
    addResult('Código', 'Componentes grandes', 'PASS',
      'No hay componentes mayores a 300 líneas');
  } else if (largeComponents.length <= 10) {
    addResult('Código', 'Componentes grandes', 'WARN',
      `${largeComponents.length} componentes grandes (>300 líneas) - considerar refactorizar`, largeComponents.slice(0, 5));
  } else {
    addResult('Código', 'Componentes grandes', 'FAIL',
      `${largeComponents.length} componentes mayores a 300 líneas`, largeComponents.slice(0, 5));
  }
}

// Generar reporte final
function generateReport() {
  log('\n' + '='.repeat(60), 'bold');
  log('⚡ REPORTE DE RENDIMIENTO', 'bold');
  log('='.repeat(60), 'bold');
  
  const categories = [...new Set(results.map(r => r.category))];
  
  let totalPass = 0;
  let totalFail = 0;
  let totalWarn = 0;
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const pass = categoryResults.filter(r => r.status === 'PASS').length;
    const fail = categoryResults.filter(r => r.status === 'FAIL').length;
    const warn = categoryResults.filter(r => r.status === 'WARN').length;
    
    totalPass += pass;
    totalFail += fail;
    totalWarn += warn;
    
    log(`\n${category}:`, 'cyan');
    log(`  ✅ Pass: ${pass}  ❌ Fail: ${fail}  ⚠️  Warn: ${warn}`);
  }
  
  log('\n' + '='.repeat(60), 'bold');
  log(`TOTAL: ✅ ${totalPass} | ❌ ${totalFail} | ⚠️  ${totalWarn}`, 'bold');
  log('='.repeat(60), 'bold');
  
  // Estado general
  if (totalFail === 0 && totalWarn === 0) {
    log('\n🚀 ¡RENDIMIENTO COMPLETAMENTE OPTIMIZADO!', 'green');
  } else if (totalFail === 0) {
    log('\n✅ Rendimiento aceptable con mejoras sugeridas', 'yellow');
  } else {
    log('\n⚠️  Se encontraron problemas de rendimiento que requieren atención', 'red');
  }
  
  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { pass: totalPass, fail: totalFail, warn: totalWarn },
    results
  }, null, 2));
  
  log(`\n📄 Reporte guardado en: ${reportPath}`, 'cyan');
  
  return totalFail === 0;
}

// Ejecutar todas las validaciones
async function runPerformanceValidation() {
  log('⚡ Iniciando validación de rendimiento...', 'bold');
  log('='.repeat(60), 'bold');
  
  try {
    await validateLazyLoading();
    await validateImageOptimization();
    await validateReactQuery();
    await validateMemoization();
    await validateBundleSize();
    await validateCodeDuplication();
    
    const success = generateReport();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`\n❌ Error durante la validación: ${error}`, 'red');
    process.exit(1);
  }
}

// Ejecutar
runPerformanceValidation();
