// src/models/index.ts
import { DataTypes, Sequelize } from "sequelize";
import { logger } from '../utils/logger';

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
import { PushSubscription } from "./PushSubscription";
import { EstadoUsuario } from "./enums";
import { EstablecimientoResena } from "./EstablecimientoResena";

export function initializeModels(sequelize: Sequelize) {
  Role.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    clave: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(80), allowNull: false },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, { sequelize, tableName: "roles", timestamps: false });

  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true, len: [5, 150] },
        set(value: string) {
          if (value) this.setDataValue("email", value.trim().toLowerCase());
        },
      },
      hash_contrasena: { type: DataTypes.STRING(255), allowNull: false },
      rol_id: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      establecimiento_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'establecimientos', key: 'id' }
      },
      verificado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      estado_usuario: {
        type: DataTypes.ENUM(...Object.values(EstadoUsuario)),
        allowNull: false,
        defaultValue: EstadoUsuario.pending,
      },
      nombre: {
        type: DataTypes.STRING(80),
        allowNull: false,
        set(value: string) { this.setDataValue("nombre", value?.trim()); },
        validate: { len: [1, 80] },
      },
      apellido: {
        type: DataTypes.STRING(80),
        allowNull: false,
        set(value: string) { this.setDataValue("apellido", value?.trim()); },
        validate: { len: [1, 80] },
      },
      telefono: {
        type: DataTypes.STRING(40),
        allowNull: true,
        set(value: string | null) { this.setDataValue("telefono", value?.trim() || null); },
      },
      documento: {
        type: DataTypes.STRING(50),
        allowNull: true,
        set(value: string | null) { this.setDataValue("documento", value?.trim() || null); },
      },
      ubicacion: {
        type: DataTypes.STRING(150),
        allowNull: true,
        set(value: string | null) { this.setDataValue("ubicacion", value?.trim() || null); },
      },
      avatar_url: { type: DataTypes.STRING(512), allowNull: true },
      creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      actualizado_el: { type: DataTypes.DATE, allowNull: true },
      ultimo_acceso_el: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      tableName: "usuarios",
      timestamps: false,
      modelName: "User",
      underscored: false,
      defaultScope: { attributes: { exclude: ["hash_contrasena"] } },
      scopes: {
        withSecret: {},
        byEmail(email: string) {
          return { where: { email: email.trim().toLowerCase() } };
        },
        activos: { where: { estado_usuario: EstadoUsuario.active } },
      },
      indexes: [
        { fields: ["email"], unique: true, name: "ux_usuarios_email" },
        { fields: ["estado_usuario"], name: "ix_usuarios_estado" },
        { fields: ["rol_id"], name: "ix_usuarios_rol" },
        { fields: ["creado_el"], name: "ix_usuarios_creado_el" },
      ],
    }
  );

  const HASH_ROUNDS = 12;
  async function maybeHash(instance: User) {
    const plain: string | undefined = (instance as User & { _plainPassword?: string })._plainPassword;
    if (plain && plain.length >= 8) {
      const bcrypt = require("bcrypt");
      instance.set("hash_contrasena", await bcrypt.hash(plain, await bcrypt.genSalt(HASH_ROUNDS)));
      return;
    }
    if (instance.changed("hash_contrasena")) {
      const current = instance.get("hash_contrasena");
      const looksHashed = typeof current === "string" && current.startsWith("$2b$");
      if (!looksHashed && typeof current === "string" && current.length >= 8) {
        const bcrypt = require("bcrypt");
        instance.set("hash_contrasena", await bcrypt.hash(current, await bcrypt.genSalt(HASH_ROUNDS)));
      }
    }
  }
  User.beforeCreate(async (u) => {
    u.nombre = (u.nombre || "").trim();
    u.apellido = (u.apellido || "").trim();
    await maybeHash(u);
  });
  User.beforeUpdate(async (u) => {
    await maybeHash(u);
    u.actualizado_el = new Date();
  });

  // Associations
  User.belongsTo(Role, { foreignKey: "rol_id", as: "rol" });
  Role.hasMany(User, { foreignKey: "rol_id", as: "usuarios" });

  User.belongsTo(Establecimiento, { foreignKey: "establecimiento_id", as: "establecimiento" });
  Establecimiento.hasMany(User, { foreignKey: "establecimiento_id", as: "usuarios" });

  MembresiaUsuarioEstablecimiento.belongsTo(User, { foreignKey: "usuario_id", as: "usuario" });
  MembresiaUsuarioEstablecimiento.belongsTo(Establecimiento, { foreignKey: "establecimiento_id", as: "establecimiento" });
  User.hasMany(MembresiaUsuarioEstablecimiento, { foreignKey: "usuario_id", as: "membresias" });
  Establecimiento.hasMany(MembresiaUsuarioEstablecimiento, { foreignKey: "establecimiento_id", as: "membresias" });

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

  PropietarioCaballo.belongsTo(User, { foreignKey: "propietario_usuario_id", as: "propietario" });
  PropietarioCaballo.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  User.hasMany(PropietarioCaballo, { foreignKey: "propietario_usuario_id", as: "propiedades_caballos" });
  Caballo.hasMany(PropietarioCaballo, { foreignKey: "caballo_id", as: "propiedades" });

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

  CaballoEstablecimiento.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  CaballoEstablecimiento.belongsTo(Establecimiento, { foreignKey: "establecimiento_id", as: "establecimiento" });
  Caballo.hasMany(CaballoEstablecimiento, { foreignKey: "caballo_id", as: "asociaciones_establecimientos" });
  Establecimiento.hasMany(CaballoEstablecimiento, { foreignKey: "establecimiento_id", as: "asociaciones_caballos" });

  Caballo.belongsTo(Caballo, { foreignKey: "padre_id", as: "padre" });
  Caballo.belongsTo(Caballo, { foreignKey: "madre_id", as: "madre" });
  Caballo.hasMany(Caballo, { foreignKey: "padre_id", as: "hijos_como_padre" });
  Caballo.hasMany(Caballo, { foreignKey: "madre_id", as: "hijos_como_madre" });

  Evento.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  Caballo.hasMany(Evento, { foreignKey: "caballo_id", as: "eventos" });

  Evento.belongsTo(TipoEvento, { foreignKey: "tipo_evento_id", as: "tipo_evento" });
  TipoEvento.hasMany(Evento, { foreignKey: "tipo_evento_id", as: "eventos" });

  Evento.belongsTo(User, { foreignKey: "creado_por_usuario_id", as: "creado_por" });
  Evento.belongsTo(User, { foreignKey: "validado_por_usuario_id", as: "validado_por" });
  User.hasMany(Evento, { foreignKey: "creado_por_usuario_id", as: "eventos_creados" });
  User.hasMany(Evento, { foreignKey: "validado_por_usuario_id", as: "eventos_validados" });

  Evento.belongsTo(Establecimiento, { foreignKey: "establecimiento_id", as: "establecimiento" });
  Establecimiento.hasMany(Evento, { foreignKey: "establecimiento_id", as: "eventos" });

  Tarea.belongsTo(Establecimiento, { foreignKey: "establecimiento_id", as: "establecimiento" });
  Establecimiento.hasMany(Tarea, { foreignKey: "establecimiento_id", as: "tareas" });

  Tarea.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  Caballo.hasMany(Tarea, { foreignKey: "caballo_id", as: "tareas" });

  Tarea.belongsTo(User, { foreignKey: "asignado_a_usuario_id", as: "asignado_a" });
  Tarea.belongsTo(User, { foreignKey: "creado_por_usuario_id", as: "creado_por" });
  User.hasMany(Tarea, { foreignKey: "asignado_a_usuario_id", as: "tareas_asignadas" });
  User.hasMany(Tarea, { foreignKey: "creado_por_usuario_id", as: "tareas_creadas" });

  Adjunto.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  Caballo.hasMany(Adjunto, { foreignKey: "caballo_id", as: "adjuntos" });

  Adjunto.belongsTo(Evento, { foreignKey: "evento_id", as: "evento" });
  Evento.hasMany(Adjunto, { foreignKey: "evento_id", as: "adjuntos" });

  Adjunto.belongsTo(User, { foreignKey: "subido_por_usuario_id", as: "subido_por" });
  User.hasMany(Adjunto, { foreignKey: "subido_por_usuario_id", as: "adjuntos_subidos" });

  CodigoQR.belongsTo(Caballo, { foreignKey: "caballo_id", as: "caballo" });
  Caballo.hasMany(CodigoQR, { foreignKey: "caballo_id", as: "codigos_qr" });

  CodigoQR.belongsTo(User, { foreignKey: "creado_por_usuario_id", as: "creado_por" });
  User.hasMany(CodigoQR, { foreignKey: "creado_por_usuario_id", as: "codigos_qr_creados" });

  Auditoria.belongsTo(User, { foreignKey: "actor_usuario_id", as: "actor_usuario" });
  User.hasMany(Auditoria, { foreignKey: "actor_usuario_id", as: "auditorias" });

  Notificacion.belongsTo(User, { foreignKey: "usuario_id", as: "usuario" });
  User.hasMany(Notificacion, { foreignKey: "usuario_id", as: "notificaciones" });

  Notificacion.belongsTo(Evento, { foreignKey: "evento_id", as: "evento" });
  Evento.hasMany(Notificacion, { foreignKey: "evento_id", as: "notificaciones" });

  Notificacion.belongsTo(Tarea, { foreignKey: "tarea_id", as: "tarea" });
  Tarea.hasMany(Notificacion, { foreignKey: "tarea_id", as: "notificaciones" });

  PushSubscription.belongsTo(User, { foreignKey: "user_id", as: "user" });
  User.hasMany(PushSubscription, { foreignKey: "user_id", as: "push_subscriptions" });

  EstablecimientoResena.belongsTo(Establecimiento, { foreignKey: 'establecimiento_id', as: 'establecimiento' });
  Establecimiento.hasMany(EstablecimientoResena, { foreignKey: 'establecimiento_id', as: 'resenas' });

  EstablecimientoResena.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
  User.hasMany(EstablecimientoResena, { foreignKey: 'usuario_id', as: 'resenas' });

  EstablecimientoResena.belongsTo(User, { foreignKey: 'respondido_por_usuario_id', as: 'respondido_por' });
  User.hasMany(EstablecimientoResena, { foreignKey: 'respondido_por_usuario_id', as: 'respuestas_resenas' });

  if (process.env['NODE_ENV'] === 'development' && process.env['DEBUG_MODELS'] === 'true') {
    logger.debug('Model associations initialized');
  }
}

const db = {
  User,
  Role,
  Establecimiento,
  Caballo,
  MembresiaUsuarioEstablecimiento,
  PropietarioCaballo,
  CaballoEstablecimiento,
  Evento,
  TipoEvento,
  Tarea,
  Adjunto,
  CodigoQR,
  Auditoria,
  Notificacion,
  PushSubscription,
  EstablecimientoResena,
  EstadoUsuario,
};

export { db };
export default db;
