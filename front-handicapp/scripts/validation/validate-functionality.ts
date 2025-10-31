/**
 * Script de Validación de Funcionalidad
 * Valida componentes, hooks, rutas y servicios críticos
 */

import * as fs from 'fs';
import * as path from 'path';

interface FunctionalityResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message?: string;
  details?: string[];
}

const results: FunctionalityResult[] = [];

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

// 1. Validar hooks críticos
async function validateCriticalHooks() {
  log('\n🪝 Validando hooks críticos...', 'bold');
  
  const criticalHooks = [
    'src/lib/hooks/useAuthNew.ts',
    'src/hooks/useWebSocket.ts',
    'src/hooks/useNotifications.ts',
    'src/lib/hooks/useStats.ts'
  ];
  
  let hooksFound = 0;
  const missingHooks: string[] = [];
  const brokenHooks: string[] = [];
  
  for (const hook of criticalHooks) {
    const hookPath = path.join(process.cwd(), hook);
    const hookName = path.basename(hook, '.ts');
    
    if (!fs.existsSync(hookPath)) {
      missingHooks.push(hookName);
      continue;
    }
    
    hooksFound++;
    const content = fs.readFileSync(hookPath, 'utf-8');
    
    // Validar que el hook exporta algo
    if (!content.includes('export')) {
      brokenHooks.push(`${hookName} (sin exports)`);
    }
    
    // Validar que hooks de React usan useState, useEffect, etc
    if (hookName.startsWith('use') && 
        !content.includes('useState') && 
        !content.includes('useEffect') && 
        !content.includes('useQuery') &&
        !content.includes('useMutation')) {
      brokenHooks.push(`${hookName} (no usa hooks de React)`);
    }
  }
  
  if (missingHooks.length === 0 && brokenHooks.length === 0) {
    addResult('Hooks', 'Hooks críticos', 'PASS',
      `${hooksFound}/${criticalHooks.length} hooks disponibles y funcionales`);
  } else if (missingHooks.length > 0) {
    addResult('Hooks', 'Hooks críticos', 'FAIL',
      `Faltan ${missingHooks.length} hooks`, missingHooks);
  } else {
    addResult('Hooks', 'Hooks críticos', 'WARN',
      `${brokenHooks.length} hooks con problemas`, brokenHooks);
  }
}

// 2. Validar componentes críticos
async function validateCriticalComponents() {
  log('\n🧩 Validando componentes críticos...', 'bold');
  
  const criticalComponents = [
    'src/components/common/SimplePermissionGuard.tsx',
    'src/components/dashboard/CaballoCard.tsx'
  ];
  
  let componentsFound = 0;
  const missingComponents: string[] = [];
  const componentsWithIssues: string[] = [];
  
  for (const component of criticalComponents) {
    const componentPath = path.join(process.cwd(), component);
    const componentName = path.basename(component, '.tsx');
    
    if (!fs.existsSync(componentPath)) {
      missingComponents.push(componentName);
      continue;
    }
    
    componentsFound++;
    const content = fs.readFileSync(componentPath, 'utf-8');
    
    // Validar que exporta el componente
    if (!content.includes('export default') && !content.includes('export {')) {
      componentsWithIssues.push(`${componentName} (sin export)`);
    }
    
    // Validar que es un componente de React
    if (!content.includes('return') || (!content.includes('jsx') && !content.includes('<'))) {
      componentsWithIssues.push(`${componentName} (no retorna JSX)`);
    }
  }
  
  if (missingComponents.length === 0 && componentsWithIssues.length === 0) {
    addResult('Componentes', 'Componentes críticos', 'PASS',
      `${componentsFound}/${criticalComponents.length} componentes disponibles`);
  } else if (missingComponents.length > 0) {
    addResult('Componentes', 'Componentes críticos', 'FAIL',
      `Faltan ${missingComponents.length} componentes`, missingComponents);
  } else {
    addResult('Componentes', 'Componentes críticos', 'WARN',
      `${componentsWithIssues.length} componentes con problemas`, componentsWithIssues);
  }
}

// 3. Validar servicios de API
async function validateAPIServices() {
  log('\n📡 Validando servicios de API...', 'bold');
  
  const servicesPath = path.join(process.cwd(), 'src/lib/services');
  
  if (!fs.existsSync(servicesPath)) {
    addResult('Servicios API', 'Directorio de servicios', 'FAIL', 'No existe');
    return;
  }
  
  const serviceFiles = fs.readdirSync(servicesPath)
    .filter(f => f.endsWith('Service.ts') || f.endsWith('Service.tsx'));
  
  let servicesWithApiClient = 0;
  const servicesWithoutApiClient: string[] = [];
  
  for (const service of serviceFiles) {
    const servicePath = path.join(servicesPath, service);
    const content = fs.readFileSync(servicePath, 'utf-8');
    
    if (content.includes('apiClient')) {
      servicesWithApiClient++;
    } else {
      servicesWithoutApiClient.push(service);
    }
  }
  
  if (serviceFiles.length === 0) {
    addResult('Servicios API', 'Servicios disponibles', 'WARN', 'No hay servicios en src/lib/services');
  } else if (servicesWithoutApiClient.length === 0) {
    addResult('Servicios API', 'Uso de apiClient', 'PASS',
      `${servicesWithApiClient}/${serviceFiles.length} servicios usan apiClient`);
  } else {
    addResult('Servicios API', 'Uso de apiClient', 'WARN',
      `${servicesWithoutApiClient.length} servicios sin apiClient`,
      servicesWithoutApiClient.slice(0, 5));
  }
}

// 4. Validar rutas de navegación
async function validateRoutes() {
  log('\n🛣️  Validando rutas de navegación...', 'bold');
  
  const roles = ['admin', 'propietario', 'veterinario', 'capataz', 'empleado', 'establecimiento'];
  const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)');
  
  let totalRoutes = 0;
  let routesWithLayouts = 0;
  const rolesWithoutLayout: string[] = [];
  
  for (const role of roles) {
    const rolePath = path.join(dashboardPath, role);
    
    if (fs.existsSync(rolePath)) {
      totalRoutes++;
      
      // Verificar si tiene page.tsx (dashboard principal)
      const mainPage = path.join(rolePath, 'page.tsx');
      if (!fs.existsSync(mainPage)) {
        rolesWithoutLayout.push(`${role}/page.tsx (falta dashboard principal)`);
      } else {
        routesWithLayouts++;
      }
    }
  }
  
  if (rolesWithoutLayout.length === 0) {
    addResult('Rutas', 'Dashboards principales', 'PASS',
      `${routesWithLayouts}/${totalRoutes} roles tienen dashboard principal`);
  } else {
    addResult('Rutas', 'Dashboards principales', 'FAIL',
      `Faltan ${rolesWithoutLayout.length} dashboards`, rolesWithoutLayout);
  }
}

// 5. Validar integraciones externas
async function validateIntegrations() {
  log('\n🔌 Validando integraciones...', 'bold');
  
  const integrations = [
    { name: 'WebSocket', file: 'src/hooks/useWebSocket.ts', key: 'socket.io-client' },
    { name: 'React Query', file: 'src/app/providers.tsx', key: '@tanstack/react-query' },
    { name: 'Toast Notifications', file: 'src/components', key: 'react-hot-toast' }
  ];
  
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const deps = { ...packageContent.dependencies, ...packageContent.devDependencies };
  
  let integrationsOk = 0;
  const missingIntegrations: string[] = [];
  
  for (const integration of integrations) {
    const hasFile = integration.file.includes('.') 
      ? fs.existsSync(path.join(process.cwd(), integration.file))
      : fs.existsSync(path.join(process.cwd(), integration.file));
    
    const hasDep = Object.keys(deps).some(dep => 
      dep.includes(integration.key.toLowerCase()) || 
      integration.key.toLowerCase().includes(dep.toLowerCase())
    );
    
    if (hasFile && hasDep) {
      integrationsOk++;
    } else if (!hasDep) {
      missingIntegrations.push(`${integration.name} (dependencia no instalada)`);
    } else if (!hasFile) {
      missingIntegrations.push(`${integration.name} (archivo no encontrado)`);
    }
  }
  
  if (missingIntegrations.length === 0) {
    addResult('Integraciones', 'Integraciones externas', 'PASS',
      `${integrationsOk}/${integrations.length} integraciones configuradas`);
  } else {
    addResult('Integraciones', 'Integraciones externas', 'WARN',
      `${missingIntegrations.length} integraciones con problemas`, missingIntegrations);
  }
}

// 6. Validar configuración de build
async function validateBuildConfig() {
  log('\n⚙️  Validando configuración de build...', 'bold');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  
  if (!fs.existsSync(nextConfigPath)) {
    addResult('Build', 'next.config.ts', 'FAIL', 'No existe');
    return;
  }
  
  const content = fs.readFileSync(nextConfigPath, 'utf-8');
  
  // Verificar configuraciones importantes
  const checks = [
    { name: 'React Strict Mode', pattern: /strictMode|strict/, required: false },
    { name: 'Optimización de imágenes', pattern: /images|remotePatterns/, required: false },
    { name: 'Experimental features', pattern: /experimental/, required: false }
  ];
  
  const configured: string[] = [];
  const notConfigured: string[] = [];
  
  for (const check of checks) {
    if (check.pattern.test(content)) {
      configured.push(check.name);
    } else if (check.required) {
      notConfigured.push(check.name);
    }
  }
  
  if (notConfigured.length === 0) {
    addResult('Build', 'Configuración Next.js', 'PASS',
      `Configuración válida (${configured.length} optimizaciones)`);
  } else {
    addResult('Build', 'Configuración Next.js', 'WARN',
      `Faltan ${notConfigured.length} configuraciones recomendadas`, notConfigured);
  }
}

// 7. Validar estructura de datos
async function validateDataStructures() {
  log('\n📊 Validando estructura de datos...', 'bold');
  
  const servicesPath = path.join(process.cwd(), 'src/lib/services');
  
  if (!fs.existsSync(servicesPath)) {
    addResult('Datos', 'Directorio de servicios', 'WARN', 'No existe src/lib/services');
    return;
  }
  
  const serviceFiles = fs.readdirSync(servicesPath).filter(f => f.endsWith('.ts'));
  
  const criticalTypes = ['User', 'Caballo', 'Evento', 'Tarea', 'Establecimiento'];
  const foundTypes: string[] = [];
  const missingTypes: string[] = [];
  
  // Buscar tipos en todos los archivos de servicios
  for (const serviceFile of serviceFiles) {
    const content = fs.readFileSync(path.join(servicesPath, serviceFile), 'utf-8');
    
    for (const type of criticalTypes) {
      if (content.includes(`interface ${type}`) || 
          content.includes(`type ${type}`) ||
          content.includes(`export { ${type}`)) {
        if (!foundTypes.includes(type)) {
          foundTypes.push(type);
        }
      }
    }
  }
  
  for (const type of criticalTypes) {
    if (!foundTypes.includes(type)) {
      missingTypes.push(type);
    }
  }
  
  if (missingTypes.length === 0) {
    addResult('Datos', 'Tipos críticos', 'PASS',
      `${foundTypes.length}/${criticalTypes.length} tipos definidos`);
  } else if (missingTypes.length <= 2) {
    addResult('Datos', 'Tipos críticos', 'WARN',
      `Faltan ${missingTypes.length} tipos`, missingTypes);
  } else {
    addResult('Datos', 'Tipos críticos', 'FAIL',
      `Faltan ${missingTypes.length} tipos críticos`, missingTypes);
  }
}

// 8. Validar archivos estáticos
async function validateStaticAssets() {
  log('\n🖼️  Validando archivos estáticos...', 'bold');
  
  const publicPath = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(publicPath)) {
    addResult('Assets', 'Directorio public', 'FAIL', 'No existe');
    return;
  }
  
  const criticalAssets = [
    'manifest.json',
    'favicon.ico',
    'logos'
  ];
  
  let assetsFound = 0;
  const missingAssets: string[] = [];
  
  for (const asset of criticalAssets) {
    const assetPath = path.join(publicPath, asset);
    if (fs.existsSync(assetPath)) {
      assetsFound++;
    } else {
      missingAssets.push(asset);
    }
  }
  
  if (missingAssets.length === 0) {
    addResult('Assets', 'Archivos estáticos', 'PASS',
      `${assetsFound}/${criticalAssets.length} assets críticos presentes`);
  } else {
    addResult('Assets', 'Archivos estáticos', 'WARN',
      `Faltan ${missingAssets.length} assets`, missingAssets);
  }
}

// Generar reporte final
function generateReport() {
  log('\n' + '='.repeat(60), 'bold');
  log('⚡ REPORTE DE FUNCIONALIDAD', 'bold');
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
    log('\n🎉 ¡FUNCIONALIDAD COMPLETAMENTE VALIDADA!', 'green');
  } else if (totalFail === 0) {
    log('\n✅ Funcionalidad operativa con mejoras sugeridas', 'yellow');
  } else {
    log('\n⚠️  Se encontraron problemas funcionales que requieren atención', 'red');
  }
  
  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'functionality-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { pass: totalPass, fail: totalFail, warn: totalWarn },
    results
  }, null, 2));
  
  log(`\n📄 Reporte guardado en: ${reportPath}`, 'cyan');
  
  return totalFail === 0;
}

// Ejecutar todas las validaciones
async function runFunctionalityValidation() {
  log('⚡ Iniciando validación de funcionalidad...', 'bold');
  log('='.repeat(60), 'bold');
  
  try {
    await validateCriticalHooks();
    await validateCriticalComponents();
    await validateAPIServices();
    await validateRoutes();
    await validateIntegrations();
    await validateBuildConfig();
    await validateDataStructures();
    await validateStaticAssets();
    
    const success = generateReport();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`\n❌ Error durante la validación: ${error}`, 'red');
    process.exit(1);
  }
}

// Ejecutar
runFunctionalityValidation();
