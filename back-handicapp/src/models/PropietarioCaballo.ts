import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

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
  public id!: number;
  public caballo_id!: number;
  public propietario_usuario_id!: number;
  public actual!: boolean;
  public porcentaje_tenencia!: number | null;
  public fecha_inicio!: Date | null;
  public fecha_fin!: Date | null;
  public creado_el!: Date;
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
