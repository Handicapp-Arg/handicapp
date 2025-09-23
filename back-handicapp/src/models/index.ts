// src/models/index.ts
// -----------------------------------------------------------------------------
// HandicApp API - Registro de modelos y asociaciones
// -----------------------------------------------------------------------------

import { DataTypes, Sequelize } from "sequelize";

// Importar todos los modelos
import { User } from "./User";
import { Role } from "./roles";
import { EstadoUsuario } from "./enums";

// Función para inicializar modelos
export function initializeModels(sequelize: Sequelize) {
  // Inicializar modelos
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

  // Definir asociaciones
  User.belongsTo(Role, { foreignKey: "rol_id", as: "rol" });
  Role.hasMany(User, { foreignKey: "rol_id", as: "usuarios" });
}

// Registrar modelos en Sequelize
const db = {
  User,
  Role,
  EstadoUsuario,
};

export { db };
export default db;