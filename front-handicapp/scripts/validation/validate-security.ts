/**
 * Script de Validación de Seguridad y Permisos
 * Valida que todas las rutas tengan protección adecuada
 */

import * as fs from 'fs';
import * as path from 'path';

interface SecurityResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message?: string;
  details?: string[];
}

const results: SecurityResult[] = [];

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

// 1. Validar guards de permisos en todas las páginas
async function validatePermissionGuards() {
  log('\n🔐 Validando guards de permisos...', 'bold');
  
  const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)');
  const roles = ['admin', 'propietario', 'veterinario', 'capataz', 'empleado', 'establecimiento'];
  
  let totalPages = 0;
  let pagesWithGuards = 0;
  const pagesWithoutGuards: string[] = [];
  
  for (const role of roles) {
    const rolePath = path.join(dashboardPath, role);
    if (fs.existsSync(rolePath)) {
      const pages = getAllPageFiles(rolePath);
      
      for (const page of pages) {
        totalPages++;
        const content = fs.readFileSync(page, 'utf-8');
        
        // Buscar guards: SimpleRoleGuard, SimpleAdminOnly, useAuth, etc.
        const hasGuard = 
          content.includes('SimpleRoleGuard') ||
          content.includes('SimpleAdminOnly') ||
          content.includes('SimplePermissionGuard') ||
          content.includes('useAuthNew()') ||
          content.includes('PermissionGuard');
        
        if (hasGuard) {
          pagesWithGuards++;
        } else {
          pagesWithoutGuards.push(path.relative(process.cwd(), page));
        }
      }
    }
  }
  
  const percentage = Math.round((pagesWithGuards / totalPages) * 100);
  
  if (pagesWithoutGuards.length === 0) {
    addResult('Seguridad', 'Guards de permisos', 'PASS', 
      `${pagesWithGuards}/${totalPages} páginas protegidas (100%)`);
  } else if (percentage >= 75) {
    addResult('Seguridad', 'Guards de permisos', 'WARN',
      `${pagesWithGuards}/${totalPages} páginas protegidas (${percentage}%) - Agregar guards a las restantes`,
      pagesWithoutGuards.slice(0, 5));
  } else {
    addResult('Seguridad', 'Guards de permisos', 'FAIL',
      `${pagesWithGuards}/${totalPages} páginas protegidas (${percentage}%)`,
      pagesWithoutGuards.slice(0, 10));
  }
}

// 2. Validar autenticación en hooks
async function validateAuthHooks() {
  log('\n🔑 Validando hooks de autenticación...', 'bold');
  
  const libPath = path.join(process.cwd(), 'src/lib');
  const allFiles = getAllTsFiles(libPath);
  
  let serviciosConAuth = 0;
  const serviciosSinAuth: string[] = [];
  
  // Archivos de servicios que deberían usar auth
  const serviceFiles = allFiles.filter(f => 
    f.includes('Service.ts') && 
    !f.includes('test.ts') &&
    !f.includes('logger.ts')
  );
  
  for (const service of serviceFiles) {
    const content = fs.readFileSync(service, 'utf-8');
    
    // Verificar si usa apiClient (que maneja auth automáticamente)
    if (content.includes('apiClient') || content.includes('getAuthHeaders')) {
      serviciosConAuth++;
    } else {
      serviciosSinAuth.push(path.relative(process.cwd(), service));
    }
  }
  
  if (serviciosSinAuth.length === 0) {
    addResult('Autenticación', 'Servicios con auth', 'PASS',
      `${serviciosConAuth}/${serviceFiles.length} servicios usan apiClient`);
  } else {
    addResult('Autenticación', 'Servicios con auth', 'WARN',
      `${serviciosConAuth}/${serviceFiles.length} servicios`,
      serviciosSinAuth.slice(0, 5));
  }
}

// 3. Validar manejo de errores
async function validateErrorHandling() {
  log('\n⚠️  Validando manejo de errores...', 'bold');
  
  const srcPath = path.join(process.cwd(), 'src');
  const allFiles = getAllTsFiles(srcPath);
  
  const apiCallsWithoutTryCatch: string[] = [];
  
  for (const file of allFiles) {
    // Excluir archivos de test y tipos
    if (file.includes('.test.') || file.includes('types/') || file.includes('.d.ts')) {
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Buscar llamadas a API sin try-catch
    const hasApiCalls = content.includes('apiClient.') || content.includes('fetch(');
    const hasTryCatch = content.includes('try {') && content.includes('catch');
    
    if (hasApiCalls && !hasTryCatch) {
      // Verificar si usa React Query (que maneja errores)
      if (!content.includes('useQuery') && !content.includes('useMutation')) {
        apiCallsWithoutTryCatch.push(path.relative(process.cwd(), file));
      }
    }
  }
  
  if (apiCallsWithoutTryCatch.length === 0) {
    addResult('Manejo de Errores', 'API calls protegidas', 'PASS',
      'Todas las llamadas API tienen manejo de errores');
  } else if (apiCallsWithoutTryCatch.length < 10) {
    addResult('Manejo de Errores', 'API calls protegidas', 'WARN',
      `${apiCallsWithoutTryCatch.length} archivos sin try-catch explícito`,
      apiCallsWithoutTryCatch.slice(0, 5));
  } else {
    addResult('Manejo de Errores', 'API calls protegidas', 'FAIL',
      `${apiCallsWithoutTryCatch.length} archivos sin try-catch`,
      apiCallsWithoutTryCatch.slice(0, 10));
  }
}

// 4. Validar variables de entorno
async function validateEnvVariables() {
  log('\n🌍 Validando variables de entorno...', 'bold');
  
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envLocalPath)) {
    addResult('Variables ENV', '.env.local', 'WARN', 'Archivo no encontrado');
    return;
  }
  
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  
  // Variables críticas que deben existir
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_WS_URL'
  ];
  
  const missingVars: string[] = [];
  const emptyVars: string[] = [];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    } else {
      // Verificar si está vacía
      const match = envContent.match(new RegExp(`${varName}=(.*)`, 'i'));
      if (match && (!match[1] || match[1].trim() === '')) {
        emptyVars.push(varName);
      }
    }
  }
  
  if (missingVars.length === 0 && emptyVars.length === 0) {
    addResult('Variables ENV', 'Variables críticas', 'PASS',
      `${requiredVars.length}/${requiredVars.length} variables configuradas`);
  } else if (missingVars.length > 0) {
    addResult('Variables ENV', 'Variables críticas', 'FAIL',
      `Faltan ${missingVars.length} variables`, missingVars);
  } else {
    addResult('Variables ENV', 'Variables críticas', 'WARN',
      `${emptyVars.length} variables vacías`, emptyVars);
  }
  
  // Verificar .env.example existe
  if (fs.existsSync(envExamplePath)) {
    addResult('Variables ENV', '.env.example', 'PASS', 'Existe para referencia');
  } else {
    addResult('Variables ENV', '.env.example', 'WARN', 'No existe (recomendado para el equipo)');
  }
}

// 5. Validar rutas protegidas en middleware
async function validateMiddleware() {
  log('\n🛡️  Validando middleware...', 'bold');
  
  const middlewarePath = path.join(process.cwd(), 'middleware.ts');
  
  if (!fs.existsSync(middlewarePath)) {
    addResult('Middleware', 'Archivo middleware.ts', 'WARN', 'No encontrado');
    return;
  }
  
  const content = fs.readFileSync(middlewarePath, 'utf-8');
  
  // Verificar que protege rutas de dashboard
  const protectsDashboard = content.includes('/admin') || 
                           content.includes('/propietario') ||
                           content.includes('(dashboard)');
  
  const hasAuthCheck = content.includes('token') || 
                      content.includes('auth') ||
                      content.includes('session');
  
  if (protectsDashboard && hasAuthCheck) {
    addResult('Middleware', 'Protección de rutas', 'PASS', 
      'Dashboard protegido correctamente');
  } else if (protectsDashboard) {
    addResult('Middleware', 'Protección de rutas', 'WARN',
      'Dashboard referenciado pero sin validación de auth clara');
  } else {
    addResult('Middleware', 'Protección de rutas', 'FAIL',
      'No se detecta protección de rutas de dashboard');
  }
}

// 6. Validar dependencias de seguridad
async function validateSecurityDependencies() {
  log('\n📦 Validando dependencias de seguridad...', 'bold');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  const deps = { ...packageContent.dependencies, ...packageContent.devDependencies };
  
  // Dependencias recomendadas para seguridad
  const securityDeps = {
    'jose': 'JWT seguro',
    'jwt-decode': 'Decodificación JWT',
    '@sentry/nextjs': 'Monitoreo de errores',
    'zod': 'Validación de schemas'
  };
  
  const present: string[] = [];
  const missing: string[] = [];
  
  for (const [dep, description] of Object.entries(securityDeps)) {
    if (deps[dep]) {
      present.push(`${dep} (${description})`);
    } else {
      missing.push(`${dep} (${description})`);
    }
  }
  
  if (present.length >= 3) {
    addResult('Dependencias', 'Seguridad', 'PASS',
      `${present.length}/4 dependencias de seguridad instaladas`);
  } else {
    addResult('Dependencias', 'Seguridad', 'WARN',
      `${present.length}/4 dependencias instaladas`,
      missing);
  }
}

// 7. Validar tokens y cookies
async function validateTokenHandling() {
  log('\n🍪 Validando manejo de tokens...', 'bold');
  
  const libPath = path.join(process.cwd(), 'src/lib');
  const allFiles = getAllTsFiles(libPath);
  
  let hasTokenService = false;
  let hasCookieHandling = false;
  let hasSecureStorage = false;
  
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const fileName = path.basename(file);
    
    if (fileName.includes('token') || fileName.includes('auth')) {
      hasTokenService = true;
      
      // Verificar uso de httpOnly o secure
      if (content.includes('httpOnly') || content.includes('secure')) {
        hasSecureStorage = true;
      }
      
      if (content.includes('cookie') || content.includes('Cookies')) {
        hasCookieHandling = true;
      }
    }
  }
  
  if (hasTokenService && hasCookieHandling) {
    addResult('Tokens', 'Servicio de tokens', 'PASS', 
      hasSecureStorage ? 'Con configuración segura' : 'Existe');
  } else if (hasTokenService) {
    addResult('Tokens', 'Servicio de tokens', 'WARN',
      'Existe pero sin manejo de cookies explícito');
  } else {
    addResult('Tokens', 'Servicio de tokens', 'FAIL',
      'No se encontró servicio de manejo de tokens');
  }
}

// Funciones auxiliares
function getAllPageFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllPageFiles(fullPath));
    } else if (item === 'page.tsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    try {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...getAllTsFiles(fullPath));
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    } catch {
      // Ignorar archivos que no se pueden leer
    }
  }
  
  return files;
}

// Generar reporte final
function generateReport() {
  log('\n' + '='.repeat(60), 'bold');
  log('🔒 REPORTE DE SEGURIDAD', 'bold');
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
    log('\n🎉 ¡APLICACIÓN COMPLETAMENTE SEGURA!', 'green');
  } else if (totalFail === 0) {
    log('\n✅ Aplicación segura con recomendaciones menores', 'yellow');
  } else {
    log('\n⚠️  Se encontraron problemas de seguridad que requieren atención', 'red');
  }
  
  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'security-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { pass: totalPass, fail: totalFail, warn: totalWarn },
    results
  }, null, 2));
  
  log(`\n📄 Reporte guardado en: ${reportPath}`, 'cyan');
  
  return totalFail === 0;
}

// Ejecutar todas las validaciones
async function runSecurityValidation() {
  log('🔒 Iniciando validación de seguridad...', 'bold');
  log('='.repeat(60), 'bold');
  
  try {
    await validatePermissionGuards();
    await validateAuthHooks();
    await validateErrorHandling();
    await validateEnvVariables();
    await validateMiddleware();
    await validateSecurityDependencies();
    await validateTokenHandling();
    
    const success = generateReport();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`\n❌ Error durante la validación: ${error}`, 'red');
    process.exit(1);
  }
}

// Ejecutar
runSecurityValidation();
