import { DataTypes, Model, Optional, NonAttribute } from "sequelize";
import { sequelize } from "../config/database";
import type { User } from "./User";

interface PCAttrs {
  id: number;
  caballo_id: number;
  propietario_usuario_id: number;
  actual: boolean;
  porcentaje_tenencia: number | null;
  fecha_inicio: Date | null;
  fecha_fin: Date | null;
  creado_el: Date;
}

type PCCreation = Optional<
  PCAttrs,
  "id" | "porcentaje_tenencia" | "fecha_inicio" | "fecha_fin" | "creado_el" | "actual"
>;

export class PropietarioCaballo
  extends Model<PCAttrs, PCCreation>
  implements PCAttrs
{
  declare id: number;
  declare caballo_id: number;
  declare propietario_usuario_id: number;
  declare actual: boolean;
  declare porcentaje_tenencia: number | null;
  declare fecha_inicio: Date | null;
  declare fecha_fin: Date | null;
  declare creado_el: Date;
  
  // Associations
  declare propietario?: NonAttribute<User>;
}

PropietarioCaballo.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    caballo_id: { type: DataTypes.INTEGER, allowNull: false },
    propietario_usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    actual: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    porcentaje_tenencia: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    fecha_inicio: { type: DataTypes.DATE, allowNull: true },
    fecha_fin: { type: DataTypes.DATE, allowNull: true },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "propietarios_caballos",
    timestamps: false,
    indexes: [
      { name: "ix_pc_caballo", fields: ["caballo_id"] },
      { name: "ix_pc_propietario", fields: ["propietario_usuario_id"] },
      // índice parcial “uno actual por caballo” va como migración SQL
    ],
  }
);
