import {
  DataTypes,
  Model,
  Optional,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";
import bcrypt from "bcrypt";
import { sequelize } from "../config/database";
import { EstadoUsuario } from "./enums";
import { Role } from "./roles";

/**
 * Esquema de la tabla:
 * usuarios (
 *   id, email, hash_contrasena, rol_id, verificado, estado_usuario,
 *   nombre, apellido, telefono, creado_el, actualizado_el, ultimo_acceso_el
 * )
 */

export interface UserAttrs
  extends InferAttributes<User> {
  id: number;
  email: string;
  hash_contrasena: string;
  rol_id: number;
  verificado: boolean;
  estado_usuario: EstadoUsuario;
  nombre: string;
  apellido: string;
  telefono: string | null;
  creado_el: Date;
  actualizado_el: Date | null;
  ultimo_acceso_el: Date | null;

  // Asociaciones (no se persisten):
  rol?: NonAttribute<Role>;
}

export interface UserCreationAttrs
  extends Optional<
    InferCreationAttributes<User>,
    | "id"
    | "verificado"
    | "estado_usuario"
    | "telefono"
    | "creado_el"
    | "actualizado_el"
    | "ultimo_acceso_el"
  > {
  // Permite recibir `password` en vez de `hash_contrasena` al crear
  password?: string;
}

const HASH_ROUNDS = 12;

export class User
  extends Model<UserAttrs, UserCreationAttrs>
  implements UserAttrs {
  declare id: CreationOptional<number>;
  declare email: string;
  declare hash_contrasena: string;
  declare rol_id: number;
  declare verificado: CreationOptional<boolean>;
  declare estado_usuario: CreationOptional<EstadoUsuario>;
  declare nombre: string;
  declare apellido: string;
  declare telefono: CreationOptional<string | null>;
  declare creado_el: CreationOptional<Date>;
  declare actualizado_el: CreationOptional<Date | null>;
  declare ultimo_acceso_el: CreationOptional<Date | null>;

  // Asociaciones
  declare rol?: NonAttribute<Role>;

  /**
   * Retorna el nombre completo (no se persiste).
   */
  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`.trim();
  }

  /**
   * Compara contraseña plana vs hash almacenado.
   */
  async checkPassword(plain: string): Promise<boolean> {
    if (!this.hash_contrasena) return false;
    return bcrypt.compare(plain, this.hash_contrasena);
  }

  /**
   * Serialización segura (oculta hash).
   */
  toJSON(): Record<string, unknown> {
    const raw = { ...this.get() };
    delete (raw as Record<string, unknown>).hash_contrasena;
    return raw;
  }

  /**
   * Helper para establecer password y que dispare el hook de hash.
   */
  setPassword(plain: string) {
    // Guardamos temporalmente en un "virtual"
    (this as User & { _plainPassword?: string })._plainPassword = plain;
  }
}

// La inicialización se hará en el archivo index.ts de modelos
// User.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     // ... resto de la configuración
//   },
//   {
//     sequelize,
//     tableName: "usuarios",
//     timestamps: false,
//     modelName: "User",
//     underscored: false,
//     // ... resto de opciones
//   }
// );

/* ===================== Hooks ===================== */

/**
 * En create/update:
 * - Si viene `password` (virtual) -> hasheamos y guardamos en `hash_contrasena`.
 * - Si cambió `hash_contrasena` y NO es un hash ya bcrypt (caso migración), lo hasheamos.
 * - Actualizamos `actualizado_el` si no es create.
 */
async function maybeHash(instance: User) {
  const plain: string | undefined = (instance as User & { _plainPassword?: string })._plainPassword;
  if (plain && plain.length >= 8) {
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
      const salt = await bcrypt.genSalt(HASH_ROUNDS);
      const hash = await bcrypt.hash(current, salt);
      instance.set("hash_contrasena", hash);
    }
  }
}

// Los hooks se definirán en el archivo index.ts de modelos
// User.beforeCreate(async (u) => {
//   // saneamos nombre/apellido por si entran null/undefined
//   u.nombre = (u.nombre || "").trim();
//   u.apellido = (u.apellido || "").trim();
//   await maybeHash(u);
// });

// User.beforeUpdate(async (u) => {
//   await maybeHash(u);
//   u.actualizado_el = new Date();
// });

/**
 * Pequeño helper: si guardamos "login" exitoso, actualizar último acceso.
 * Útil para ser llamado desde el servicio de auth.
 */
export async function touchUltimoAcceso(userId: number) {
  await User.update(
    { ultimo_acceso_el: new Date() },
    { where: { id: userId } }
  );
}

/* ===================== Asociaciones ===================== */
// Las asociaciones se definirán en el archivo index.ts de modelos
// User.belongsTo(Role, { foreignKey: "rol_id", as: "rol" });
// Role.hasMany(User, { foreignKey: "rol_id", as: "usuarios" });

export default User;
