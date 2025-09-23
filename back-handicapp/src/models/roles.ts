import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface RoleAttrs { id: number; clave: string; nombre: string; creado_el?: Date }
type RoleCreation = Optional<RoleAttrs, "id"|"creado_el">;

export class Role extends Model<RoleAttrs, RoleCreation> implements RoleAttrs {
  public id!: number;
  public clave!: string;
  public nombre!: string;
  public creado_el!: Date;
}

// La inicialización se hará en el archivo index.ts de modelos
// Role.init({
//   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//   clave: { type: DataTypes.STRING(50), allowNull: false, unique: true },
//   nombre: { type: DataTypes.STRING(80), allowNull: false },
//   creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
// }, { sequelize, tableName: "roles", timestamps: false });
