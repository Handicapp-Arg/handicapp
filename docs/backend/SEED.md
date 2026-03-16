# 🌱 Seeders de HandicApp

Este documento explica cómo usar los seeders para poblar la base de datos con datos de prueba.

## 📋 Seeders Disponibles

### 1. Seeder Básico (`seed`)
Crea roles y usuarios básicos (admin y veterinario de prueba).

```bash
npm run seed
```

### 2. Seeder de Establecimientos (`seed:establecimientos`)
Crea 4 establecimientos completos con toda su información.

```bash
npm run seed:establecimientos
```

### 3. Seeder Completo (`seed:completo`) ⭐ **RECOMENDADO**
Crea múltiples registros de todos los modelos y los relaciona entre sí:

- **6 Roles** (admin, establecimiento, capataz, veterinario, empleado, propietario)
- **29 Usuarios** (1 admin, 3 establecimientos, 5 veterinarios, 10 propietarios, 5 capataces, 5 empleados)
- **5 Establecimientos** completos con ubicación
- **Membresías** usuario-establecimiento (relaciones)
- **30 Caballos** con diferentes razas y características
- **Relaciones** propietario-caballo
- **Relaciones** caballo-establecimiento
- **50 Eventos** distribuidos en los últimos 30 días
- **40 Tareas** con diferentes estados y tipos

```bash
npm run seed:completo
```

## 🚀 Cómo Ejecutar el Seeder Completo

### Opción 1: Desde el directorio del backend

```bash
cd back-handicapp
npm run seed:completo
```

### Opción 2: Con ts-node directamente

```bash
cd back-handicapp
npx ts-node -r tsconfig-paths/register scripts/seed-completo.ts
```

## 📝 Credenciales de Prueba

Todos los usuarios creados tienen la contraseña: **`password123`**

### Usuarios de prueba:

- **Admin**: `admin@handicapp.com`
- **Establecimientos**: 
  - `establecimiento1@test.com`
  - `establecimiento2@test.com`
  - `establecimiento3@test.com`
- **Veterinarios**: 
  - `vet1@test.com`
  - `vet2@test.com`
  - ... (hasta vet5@test.com)
- **Propietarios**: 
  - `propietario1@test.com`
  - `propietario2@test.com`
  - ... (hasta propietario10@test.com)
- **Capataces**: 
  - `capataz1@test.com`
  - `capataz2@test.com`
  - ... (hasta capataz5@test.com)
- **Empleados**: 
  - `empleado1@test.com`
  - `empleado2@test.com`
  - ... (hasta empleado5@test.com)

## ⚠️ Importante

- El seeder usa `findOrCreate`, por lo que puedes ejecutarlo múltiples veces sin duplicar datos
- Si quieres limpiar y empezar de nuevo, necesitas truncar las tablas primero
- El seeder crea relaciones completas entre todos los modelos
- Los eventos se distribuyen en los últimos 30 días
- Las tareas tienen fechas de vencimiento futuras

## 🔄 Ejecutar Todo el Seed Inicial

Si quieres ejecutar todo desde cero (incluyendo el seed básico):

```bash
cd back-handicapp
npm run seed          # Roles y usuarios básicos
npm run seed:completo  # Todo lo demás
```

O simplemente:

```bash
npm run seed:completo  # Incluye tipos de evento y todo lo demás
```

