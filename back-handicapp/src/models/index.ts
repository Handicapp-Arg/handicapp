// src/models/index.ts
// -----------------------------------------------------------------------------
// HandicApp API - Registro de modelos y asociaciones
// -----------------------------------------------------------------------------

import { DataTypes, Sequelize } from "sequelize";

// Importar todos los modelos
import { User } from "./User";
import { Role } from "./roles";
import { Establecimiento } from "./Establecimiento";
import { Caballo } from "./Caballo";
import { MembresiaUsuarioEstablecimiento } from "./MembresiaUsuarioEstablecimiento";
import { PropietarioCaballo } from "./PropietarioCaballo";
import { CaballoEstablecimiento } from "./CaballoEstablecimiento";
import { Evento } from "./Evento";
import { TipoEvento } from "./TipoEvento";
import { Tarea } from "./Tarea";
import { Adjunto } from "./Adjunto";
import { CodigoQR } from "./CodigoQR";
import { Auditoria } from "./Auditoria";
import { Notificacion } from "./Notificacion";
import { EstadoUsuario } from "./enums";

// Función para inicializar modelos
export function initializeModels(sequelize: Sequelize) {
  // Inicializamos los modelos
  Role.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    clave: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(80), allowNull: false },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, { sequelize, tableName: "roles", timestamps: false });

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          len: [5, 150],
        },
        set(value: string) {
          this.setDataValue("email", value?.trim().toLowerCase());
        },
      },
      hash_contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      verificado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      estado_usuario: {
        type: DataTypes.ENUM(...Object.values(EstadoUsuario)),
        allowNull: false,
        defaultValue: EstadoUsuario.pending,
      },
      nombre: {
        type: DataTypes.STRING(80),
        allowNull: false,
        set(value: string) {
          this.setDataValue("nombre", value?.trim());
        },
        validate: { len: [1, 80] },
      },
      apellido: {
        type: DataTypes.STRING(80),
        allowNull: false,
        set(value: string) {
          this.setDataValue("apellido", value?.trim());
        },
        validate: { len: [1, 80] },
      },
      telefono: {
        type: DataTypes.STRING(40),
        allowNull: true,
        set(value: string | null) {
          this.setDataValue("telefono", value?.trim() || null);
        },
      },
      creado_el: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      actualizado_el: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ultimo_acceso_el: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "usuarios",
      timestamps: false,
      modelName: "User",
      underscored: false,
      defaultScope: {
        attributes: {
          exclude: ["hash_contrasena"],
        },
      },
      scopes: {
        withSecret: {},
        byEmail(email: string) {
          return {
            where: { email: email.trim().toLowerCase() },
          };
        },
        activos: {
          where: { estado_usuario: EstadoUsuario.active },
        },
      },
      indexes: [
        { fields: ["email"], unique: true, name: "ux_usuarios_email" },
        { fields: ["estado_usuario"], name: "ix_usuarios_estado" },
        { fields: ["rol_id"], name: "ix_usuarios_rol" },
        { fields: ["creado_el"], name: "ix_usuarios_creado_el" },
      ],
    }
  );

  // Definir hooks para User
  const HASH_ROUNDS = 12;

  async function maybeHash(instance: User) {
    const plain: string | undefined = (instance as User & { _plainPassword?: string })._plainPassword;
    if (plain && plain.length >= 8) {
      const bcrypt = require("bcrypt");
      const salt = await bcrypt.genSalt(HASH_ROUNDS);
      const hash = await bcrypt.hash(plain, salt);
      instance.set("hash_contrasena", hash);
      return;
    }

    // Si alguien setea directamente `hash_contrasena` con algo que no parece bcrypt, lo protegemos.
    if (instance.changed("hash_contrasena")) {
      const current = instance.get("hash_contrasena");
      const looksHashed = typeof current === "string" && current.startsWith("$2b$");
      if (!looksHashed && typeof current === "string" && current.length >= 8) {
        const bcrypt = require("bcrypt");
        const salt = await bcrypt.genSalt(HASH_ROUNDS);
        const hash = await bcrypt.hash(current, salt);
        instance.set("hash_contrasena", hash);
      }
    }
  }

  User.beforeCreate(async (u) => {
    // saneamos nombre/apellido por si entran null/undefined
    u.nombre = (u.nombre || "").trim();
    u.apellido = (u.apellido || "").trim();
    await maybeHash(u);
  });

  User.beforeUpdate(async (u) => {
    await maybeHash(u);
    u.actualizado_el = new Date();
  });

  // ===========================================
  // INICIALIZACIÓN DE OTROS MODELOS
  // ===========================================
  
  // Nota: Los modelos Establecimiento, Caballo, MembresiaUsuarioEstablecimiento, etc.
  // ya están inicializados en sus propios archivos con sequelize.
  // Aquí solo definimos las asociaciones entre ellos.

  // Definir asociaciones
  // ===========================================
  // RELACIONES PRINCIPALES
  // ===========================================
  
  // 1. Usuario ↔ Rol (muchos a uno)
  User.belongsTo(Role, { foreignKey: "rol_id", as: "rol" });
  Role.hasMany(User, { foreignKey: "rol_id", as: "usuarios" });

  // 2. Usuario ↔ Establecimiento (muchos a muchos via MembresiaUsuarioEstablecimiento)
  User.belongsToMany(Establecimiento, {
    through: MembresiaUsuarioEstablecimiento,
    foreignKey: "usuario_id",
    otherKey: "establecimiento_id",
    as: "establecimientos"
  });
  Establecimiento.belongsToMany(User, {
    through: MembresiaUsuarioEstablecimiento,
    foreignKey: "establecimiento_id", 
    otherKey: "usuario_id",
    as: "usuarios"
  });

  // 3. Relaciones directas de la tabla intermedia MembresiaUsuarioEstablecimiento
  MembresiaUsuarioEstablecimiento.belongsTo(User, { foreignKey: "usuario_id", as: "usuario" });
  MembresiaUsuarioEstablecimiento.belongsTo(Establecimiento, { foreignKey: "establecimiento_id", as: "establecimiento" });
  User.hasMany(MembresiaUsuarioEstablecimiento, { foreignKey: "usuario_id", as: "membresias" });
  Establecimiento.hasMany(MembresiaUsuarioEstablecimiento, { foreignKey: "establecimiento_id", as: "membresias" });

  // 4. Usuario ↔ Caballo (muchos a muchos via PropietarioCaballo)
  User.belongsToMany(Caballo, {
    through: PropietarioCaballo,
    foreignKey: "propietario_usuario_id",
    otherKey: "caballo_id",
    as: "caballos_propiedad"
  });
  Caballo.belongsToMany(User, {
    through: PropietarioCaballo,
    foreignKey: "caballo_id",
    otherKey: "propietario_usuario_id", 
    as: "propietarios"
  });

  // 5. Relaciones directas de PropietarioCaballo
  PropietarioCaballo.belongsTo(User, { foreignKey: "propietario_usuario_id", as: "propietario" });
  PropietarioCaballo.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  User.hasMany(PropietarioCaballo, { foreignKey: "propietario_usuario_id", as: "propiedades_caballos" });
  Caballo.hasMany(PropietarioCaballo, { foreignKey: "caballo_id", as: "propiedades" });

  // 6. Caballo ↔ Establecimiento (muchos a muchos via CaballoEstablecimiento)
  Caballo.belongsToMany(Establecimiento, {
    through: CaballoEstablecimiento,
    foreignKey: "caballo_id",
    otherKey: "establecimiento_id",
    as: "establecimientos"
  });
  Establecimiento.belongsToMany(Caballo, {
    through: CaballoEstablecimiento,
    foreignKey: "establecimiento_id",
    otherKey: "caballo_id",
    as: "caballos"
  });

  // 7. Relaciones directas de CaballoEstablecimiento
  CaballoEstablecimiento.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  CaballoEstablecimiento.belongsTo(Establecimiento, { foreignKey: "establecimiento_id", as: "establecimiento" });
  Caballo.hasMany(CaballoEstablecimiento, { foreignKey: "caballo_id", as: "asociaciones_establecimientos" });
  Establecimiento.hasMany(CaballoEstablecimiento, { foreignKey: "establecimiento_id", as: "asociaciones_caballos" });

  // 8. Caballo ↔ Caballo (pedigrí - relaciones recursivas padre/madre)
  Caballo.belongsTo(Caballo, { foreignKey: "padre_id", as: "padre" });
  Caballo.belongsTo(Caballo, { foreignKey: "madre_id", as: "madre" });
  Caballo.hasMany(Caballo, { foreignKey: "padre_id", as: "hijos_como_padre" });
  Caballo.hasMany(Caballo, { foreignKey: "madre_id", as: "hijos_como_madre" });

  // ===========================================
  // RELACIONES DE EVENTOS Y TIPOS
  // ===========================================

  // 9. Evento ↔ Caballo (muchos a uno)
  Evento.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  Caballo.hasMany(Evento, { foreignKey: "caballo_id", as: "eventos" });

  // 10. Evento ↔ TipoEvento (muchos a uno)
  Evento.belongsTo(TipoEvento, { foreignKey: "tipo_evento_id", as: "tipo_evento" });
  TipoEvento.hasMany(Evento, { foreignKey: "tipo_evento_id", as: "eventos" });

  // 11. Evento ↔ Usuario (creado_por y validado_por)
  Evento.belongsTo(User, { foreignKey: "creado_por_usuario_id", as: "creado_por" });
  Evento.belongsTo(User, { foreignKey: "validado_por_usuario_id", as: "validado_por" });
  User.hasMany(Evento, { foreignKey: "creado_por_usuario_id", as: "eventos_creados" });
  User.hasMany(Evento, { foreignKey: "validado_por_usuario_id", as: "eventos_validados" });

  // 12. Evento ↔ Establecimiento (muchos a uno - opcional)
  Evento.belongsTo(Establecimiento, { foreignKey: "establecimiento_id", as: "establecimiento" });
  Establecimiento.hasMany(Evento, { foreignKey: "establecimiento_id", as: "eventos" });

  // ===========================================
  // RELACIONES DE TAREAS
  // ===========================================

  // 13. Tarea ↔ Establecimiento (muchos a uno)
  Tarea.belongsTo(Establecimiento, { foreignKey: "establecimiento_id", as: "establecimiento" });
  Establecimiento.hasMany(Tarea, { foreignKey: "establecimiento_id", as: "tareas" });

  // 14. Tarea ↔ Caballo (muchos a uno - opcional)
  Tarea.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  Caballo.hasMany(Tarea, { foreignKey: "caballo_id", as: "tareas" });

  // 15. Tarea ↔ Usuario (asignado_a y creado_por)
  Tarea.belongsTo(User, { foreignKey: "asignado_a_usuario_id", as: "asignado_a" });
  Tarea.belongsTo(User, { foreignKey: "creado_por_usuario_id", as: "creado_por" });
  User.hasMany(Tarea, { foreignKey: "asignado_a_usuario_id", as: "tareas_asignadas" });
  User.hasMany(Tarea, { foreignKey: "creado_por_usuario_id", as: "tareas_creadas" });

  // ===========================================
  // RELACIONES DE ADJUNTOS Y QR
  // ===========================================

  // 16. Adjunto ↔ Caballo (muchos a uno - opcional)
  Adjunto.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  Caballo.hasMany(Adjunto, { foreignKey: "caballo_id", as: "adjuntos" });

  // 17. Adjunto ↔ Evento (muchos a uno - opcional)
  Adjunto.belongsTo(Evento, { foreignKey: "evento_id", as: "evento" });
  Evento.hasMany(Adjunto, { foreignKey: "evento_id", as: "adjuntos" });

  // 18. Adjunto ↔ Usuario (subido_por)
  Adjunto.belongsTo(User, { foreignKey: "subido_por_usuario_id", as: "subido_por" });
  User.hasMany(Adjunto, { foreignKey: "subido_por_usuario_id", as: "adjuntos_subidos" });

  // 19. CodigoQR ↔ Caballo (muchos a uno)
  CodigoQR.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  Caballo.hasMany(CodigoQR, { foreignKey: "caballo_id", as: "codigos_qr" });

  // 20. CodigoQR ↔ Usuario (creado_por)
  CodigoQR.belongsTo(User, { foreignKey: "creado_por_usuario_id", as: "creado_por" });
  User.hasMany(CodigoQR, { foreignKey: "creado_por_usuario_id", as: "codigos_qr_creados" });

  // ===========================================
  // RELACIONES DE AUDITORÍA
  // ===========================================

  // 21. Auditoria ↔ Usuario (muchos a uno)
  Auditoria.belongsTo(User, { foreignKey: "actor_usuario_id", as: "actor_usuario" });
  User.hasMany(Auditoria, { foreignKey: "actor_usuario_id", as: "auditorias" });

  // 22. Auditoria - Relación polimórfica (entidad_tipo, entidad_id)
  // Nota: Las relaciones polimórficas se manejan a nivel de aplicación, no con FK de Sequelize

  // ===========================================
  // RELACIONES DE NOTIFICACIONES
  // ===========================================

  // 23. Notificacion ↔ Usuario (muchos a uno)
  Notificacion.belongsTo(User, { foreignKey: "usuario_id", as: "usuario" });
  User.hasMany(Notificacion, { foreignKey: "usuario_id", as: "notificaciones" });

  // 24. Notificacion ↔ Evento (muchos a uno - opcional)
  Notificacion.belongsTo(Evento, { foreignKey: "evento_id", as: "evento" });
  Evento.hasMany(Notificacion, { foreignKey: "evento_id", as: "notificaciones" });

  // 25. Notificacion ↔ Tarea (muchos a uno - opcional)
  Notificacion.belongsTo(Tarea, { foreignKey: "tarea_id", as: "tarea" });
  Tarea.hasMany(Notificacion, { foreignKey: "tarea_id", as: "notificaciones" });

  console.log('✅ Todas las relaciones del modelo han sido configuradas correctamente (25 relaciones definidas)');
}

// Registrar modelos en Sequelize
const db = {
  // Modelos principales
  User,
  Role,
  Establecimiento,
  Caballo,
  
  // Tablas de relación muchos a muchos
  MembresiaUsuarioEstablecimiento,
  PropietarioCaballo,
  CaballoEstablecimiento,
  
  // Eventos y tipos
  Evento,
  TipoEvento,
  
  // Tareas y gestión
  Tarea,
  
  // Adjuntos y QR
  Adjunto,
  CodigoQR,
  
  // Sistema de auditoría y notificaciones
  Auditoria,
  Notificacion,
  
  // Enums para uso en servicios
  EstadoUsuario,
};

export { db };
export default db;