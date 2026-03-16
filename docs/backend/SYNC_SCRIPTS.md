# 🔄 Explicación de sequelize.sync()

## Diferencia entre las opciones de sync()

### ❌ `sequelize.sync()` (sin opciones)
- **NO elimina datos**
- Solo crea las tablas si no existen
- Si las tablas ya existen, no hace nada
- **Los datos se mantienen**

### ⚠️ `sequelize.sync({ alter: true })`
- **NO elimina datos** (generalmente)
- Modifica las tablas existentes para que coincidan con los modelos
- Puede perder datos si eliminas o cambias columnas
- Agrega nuevas columnas si faltan
- **Los datos existentes se mantienen** (a menos que cambies la estructura)

### 💥 `sequelize.sync({ force: true })`
- **SÍ ELIMINA TODOS LOS DATOS**
- Elimina TODAS las tablas
- Recrea todas las tablas desde cero
- **PIERDE TODOS LOS DATOS**

## ¿Por qué no se eliminan los datos?

Si estás usando `sync()` sin `force: true`, los datos NO se eliminan porque:

1. **`sync()` sin opciones**: Solo crea tablas nuevas, no toca las existentes
2. **`sync({ alter: true })`: Modifica tablas pero preserva datos**
3. **Solo `sync({ force: true })` elimina todo**

## Cómo resetear la base de datos

### Opción 1: Script dedicado (RECOMENDADO)
```bash
npm run reset:db
```

### Opción 2: Modificar el código
En `src/config/database.ts`, cambiar:
```typescript
await sequelize.sync({ force: true }); // Esto SÍ elimina todo
```

### Opción 3: Variable de entorno
En `.env`:
```env
DB_RESET_ON_START=true
NODE_ENV=development
```

Luego ejecutar:
```bash
npm run init-models
```

## Resumen

| Opción | Elimina Datos | Elimina Tablas | Crea Tablas |
|--------|---------------|----------------|-------------|
| `sync()` | ❌ No | ❌ No | ✅ Solo si no existen |
| `sync({ alter: true })` | ⚠️ Puede perder algunos | ❌ No | ✅ Modifica existentes |
| `sync({ force: true })` | ✅ **SÍ, TODO** | ✅ **SÍ, TODO** | ✅ Recrea desde cero |

**Para eliminar todos los datos, DEBES usar `force: true`**

