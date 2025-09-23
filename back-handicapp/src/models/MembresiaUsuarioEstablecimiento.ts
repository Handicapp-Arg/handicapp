import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { EstadoMembresia, RolEnEstablecimiento } from "./enums";

interface MUEAttrs {
  id: number;
  usuario_id: number;
  establecimiento_id: number;
  rol_en_establecimiento: RolEnEstablecimiento;
  estado_membresia: EstadoMembresia;
  fecha_inicio: Date | null;
  fecha_fin: Date | null;
  creado_el: Date;
}

type MUECreation = Optional<
  MUEAttrs,
  "id" | "estado_membresia" | "fecha_inicio" | "fecha_fin" | "creado_el"
>;

export class MembresiaUsuarioEstablecimiento
  extends Model<MUEAttrs, MUECreation>
  implements MUEAttrs
{
  public id!: number;
  public usuario_id!: number;
  public establecimiento_id!: number;
  public rol_en_establecimiento!: RolEnEstablecimiento;
  public estado_membresia!: EstadoMembresia;
  public fecha_inicio!: Date | null;
  public fecha_fin!: Date | null;
  public creado_el!: Date;
}

MembresiaUsuarioEstablecimiento.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    establecimiento_id: { type: DataTypes.INTEGER, allowNull: false },
    rol_en_establecimiento: {
      type: DataTypes.ENUM(...Object.values(RolEnEstablecimiento)),
      allowNull: false,
    },
    estado_membresia: {
      type: DataTypes.ENUM(...Object.values(EstadoMembresia)),
      allowNull: false,
      defaultValue: EstadoMembresia.active,
    },
    fecha_inicio: { type: DataTypes.DATE, allowNull: true },
    fecha_fin: { type: DataTypes.DATE, allowNull: true },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "membresias_usuario_establecimiento",
    timestamps: false,
    indexes: [
      {
        name: "ix_mue_usuario",
        fields: ["usuario_id"],
      },
      {
        name: "ix_mue_establecimiento",
        fields: ["establecimiento_id"],
      },
      // La unicidad de una activa por usuario se hace con índice parcial en migración SQL
    ],
  }
);
