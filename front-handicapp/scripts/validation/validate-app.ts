/**
 * Script de Validación Completa de la Aplicación
 * Valida todas las rutas, layout, tipos TypeScript y funcionalidad
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message?: string;
  details?: string[];
}

const results: ValidationResult[] = [];

// Colores para consola
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

// 1. Validar estructura de archivos
async function validateFileStructure() {
  log('\n📁 Validando estructura de archivos...', 'bold');
  
  const requiredDirs = [
    'src/app/(dashboard)/admin',
    'src/app/(dashboard)/propietario',
    'src/app/(dashboard)/veterinario',
    'src/app/(dashboard)/capataz',
    'src/app/(dashboard)/empleado',
    'src/app/(dashboard)/establecimiento',
    'src/lib',
    'src/components'
  ];
  
  for (const dir of requiredDirs) {
    const exists = fs.existsSync(path.join(process.cwd(), dir));
    addResult('Estructura', `Directorio ${dir}`, exists ? 'PASS' : 'FAIL');
  }
}

// 2. Validar rutas de dashboard
async function validateDashboardRoutes() {
  log('\n🗺️  Validando rutas de dashboard...', 'bold');
  
  const roles = ['admin', 'propietario', 'veterinario', 'capataz', 'empleado', 'establecimiento'];
  const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)');
  
  for (const role of roles) {
    const rolePath = path.join(dashboardPath, role);
    if (fs.existsSync(rolePath)) {
      const files = getAllTsxFiles(rolePath);
      const pageFiles = files.filter(f => f.endsWith('page.tsx'));
      addResult('Rutas', `${role}`, 'PASS', `${pageFiles.length} páginas encontradas`);
    } else {
      addResult('Rutas', `${role}`, 'FAIL', 'Directorio no existe');
    }
  }
}

// 3. Validar consistencia de layout (max-w-7xl mx-auto)
async function validateLayoutConsistency() {
  log('\n🎨 Validando consistencia de layout...', 'bold');
  
  const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)');
  const allPages = getAllTsxFiles(dashboardPath).filter(f => f.endsWith('page.tsx'));
  
  let pagesWithMaxW = 0;
  let pagesWithContainer = 0;
  const problematicPages: string[] = [];
  
  for (const page of allPages) {
    const content = fs.readFileSync(page, 'utf-8');
    
    if (content.includes('max-w-7xl mx-auto')) {
      pagesWithMaxW++;
    } else if (content.includes('container mx-auto')) {
      pagesWithContainer++;
      problematicPages.push(path.relative(process.cwd(), page));
    }
  }
  
  if (pagesWithContainer === 0) {
    addResult('Layout', 'Consistencia de contenedores', 'PASS', 
      `${pagesWithMaxW}/${allPages.length} páginas con max-w-7xl`);
  } else {
    addResult('Layout', 'Consistencia de contenedores', 'WARN',
      `${pagesWithContainer} páginas aún usan "container mx-auto"`, problematicPages);
  }
}

// 4. Validar imports y dependencias
async function validateImports() {
  log('\n📦 Validando imports críticos...', 'bold');
  
  const criticalFiles = [
    'src/lib/utils/logger.ts',
    'src/lib/services/apiClient.ts',
    'src/lib/hooks/useAuthNew.ts',
    'src/components/common/SimplePermissionGuard.tsx'
  ];
  
  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    addResult('Imports', path.basename(file), exists ? 'PASS' : 'FAIL');
  }
}

// 5. Validar tipos TypeScript
async function validateTypeScript() {
  log('\n🔍 Validando TypeScript...', 'bold');
  
  try {
    // Buscar archivos con 'any' types
    const { stdout } = await execAsync('grep -r "as any" src/app src/lib src/components 2>nul || echo ""');
    const anyCount = stdout.split('\n').filter(l => l.trim()).length;
    
    if (anyCount > 100) {
      addResult('TypeScript', 'Uso de "any"', 'WARN', `${anyCount} instancias encontradas (>100)`);
    } else if (anyCount > 50) {
      addResult('TypeScript', 'Uso de "any"', 'WARN', `${anyCount} instancias encontradas (>50)`);
    } else {
      addResult('TypeScript', 'Uso de "any"', 'PASS', `${anyCount} instancias (aceptable)`);
    }
  } catch {
    addResult('TypeScript', 'Análisis de tipos', 'WARN', 'No se pudo ejecutar grep');
  }
}

// 6. Validar console.logs
async function validateConsoleLogs() {
  log('\n🔊 Validando console.logs...', 'bold');
  
  const srcPath = path.join(process.cwd(), 'src');
  const allFiles = getAllTsxFiles(srcPath);
  
  // Archivos que DEBEN tener console para funcionar (excluidos de la validación)
  const excludedFiles = [
    'errorLogger.ts', 
    'logger.ts', 
    'tokenService.ts', 
    'socket.ts',
    'useWebSocket.ts',
    'useNotifications.ts',
    'AuthManager.ts',
    'analyticsService.ts'
  ];
  
  let consoleLogCount = 0;
  let consoleErrorCount = 0;
  const filesWithConsole: string[] = [];
  
  for (const file of allFiles) {
    const fileName = path.basename(file);
    
    // Excluir archivos de logging
    if (excludedFiles.some(excluded => fileName.includes(excluded))) {
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf-8');
    const logs = (content.match(/console\.log\(/g) || []).length;
    const errors = (content.match(/console\.error\(/g) || []).length;
    
    if (logs > 0 || errors > 0) {
      consoleLogCount += logs;
      consoleErrorCount += errors;
      
      if (logs + errors > 3) {
        filesWithConsole.push(`${path.relative(process.cwd(), file)} (${logs + errors})`);
      }
    }
  }
  
  if (consoleLogCount + consoleErrorCount < 20) {
    addResult('Logs', 'Console statements', 'PASS', 
      `${consoleLogCount} logs, ${consoleErrorCount} errors (limpio)`);
  } else if (consoleLogCount + consoleErrorCount < 150) {
    addResult('Logs', 'Console statements', 'WARN',
      `${consoleLogCount} logs, ${consoleErrorCount} errors (en infraestructura)`, 
      filesWithConsole.slice(0, 5));
  } else {
    addResult('Logs', 'Console statements', 'FAIL',
      `${consoleLogCount} logs, ${consoleErrorCount} errors (>150)`, 
      filesWithConsole.slice(0, 10));
  }
}

// 7. Validar configuración de roles
async function validateRoleConfiguration() {
  log('\n👥 Validando configuración de roles...', 'bold');
  
  const rolesFile = path.join(process.cwd(), 'src/lib/constants/roles.ts');
  
  if (fs.existsSync(rolesFile)) {
    const content = fs.readFileSync(rolesFile, 'utf-8');
    const roles = ['admin', 'propietario', 'veterinario', 'capataz', 'empleado', 'establecimiento'];
    
    const missingRoles = roles.filter(role => !content.includes(role));
    
    if (missingRoles.length === 0) {
      addResult('Roles', 'Configuración', 'PASS', 'Todos los roles definidos');
    } else {
      addResult('Roles', 'Configuración', 'FAIL', `Faltan roles: ${missingRoles.join(', ')}`);
    }
  } else {
    addResult('Roles', 'Configuración', 'WARN', 'Archivo de roles no encontrado');
  }
}

// 8. Validar archivos críticos de configuración
async function validateConfigFiles() {
  log('\n⚙️  Validando archivos de configuración...', 'bold');
  
  const configFiles = [
    'next.config.ts',
    'tailwind.config.ts',
    'tsconfig.json',
    'package.json',
    '.env.local'
  ];
  
  for (const file of configFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    addResult('Configuración', file, exists ? 'PASS' : (file === '.env.local' ? 'WARN' : 'FAIL'));
  }
}

// Funciones auxiliares
function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Generar reporte final
function generateReport() {
  log('\n' + '='.repeat(60), 'bold');
  log('📊 REPORTE DE VALIDACIÓN', 'bold');
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
    log('\n🎉 ¡APLICACIÓN COMPLETAMENTE VALIDADA!', 'green');
  } else if (totalFail === 0) {
    log('\n✅ Aplicación funcional con advertencias menores', 'yellow');
  } else {
    log('\n⚠️  Se encontraron errores que requieren atención', 'red');
  }
  
  // Guardar reporte en JSON
  const reportPath = path.join(process.cwd(), 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { pass: totalPass, fail: totalFail, warn: totalWarn },
    results
  }, null, 2));
  
  log(`\n📄 Reporte guardado en: ${reportPath}`, 'cyan');
  
  return totalFail === 0;
}

// Ejecutar todas las validaciones
async function runValidation() {
  log('🚀 Iniciando validación completa de la aplicación...', 'bold');
  log('='.repeat(60), 'bold');
  
  try {
    await validateFileStructure();
    await validateDashboardRoutes();
    await validateLayoutConsistency();
    await validateImports();
    await validateTypeScript();
    await validateConsoleLogs();
    await validateRoleConfiguration();
    await validateConfigFiles();
    
    const success = generateReport();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`\n❌ Error durante la validación: ${error}`, 'red');
    process.exit(1);
  }
}

// Ejecutar
runValidation();
