import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { EstadoAsociacionCE, EstadoInternoCE } from "./enums";

interface CEAttrs {
  id: number;
  caballo_id: number;
  establecimiento_id: number;
  estado_asociacion: EstadoAsociacionCE;
  estado_interno: EstadoInternoCE | null;
  fecha_inicio: Date | null;
  fecha_fin: Date | null;
  comentarios: string | null;
  solicitante_id: number | null; // ID del usuario que solicitó (propietario o capataz)
  aprobador_id: number | null; // ID del usuario que aprobó/rechazó
  fecha_solicitud: Date | null;
  fecha_respuesta: Date | null;
  creado_el: Date;
  actualizado_el: Date | null;
}

type CECreate = Optional<
  CEAttrs,
  "id" | "estado_interno" | "fecha_inicio" | "fecha_fin" | "comentarios" | "solicitante_id" | "aprobador_id" | "fecha_solicitud" | "fecha_respuesta" | "creado_el" | "actualizado_el"
>;

export class CaballoEstablecimiento
  extends Model<CEAttrs, CECreate>
  implements CEAttrs
{
  public id!: number;
  public caballo_id!: number;
  public establecimiento_id!: number;
  public estado_asociacion!: EstadoAsociacionCE;
  public estado_interno!: EstadoInternoCE | null;
  public fecha_inicio!: Date | null;
  public fecha_fin!: Date | null;
  public comentarios!: string | null;
  public solicitante_id!: number | null;
  public aprobador_id!: number | null;
  public fecha_solicitud!: Date | null;
  public fecha_respuesta!: Date | null;
  public creado_el!: Date;
  public actualizado_el!: Date | null;
}

CaballoEstablecimiento.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    caballo_id: { type: DataTypes.INTEGER, allowNull: false },
    establecimiento_id: { type: DataTypes.INTEGER, allowNull: false },
    estado_asociacion: {
      type: DataTypes.ENUM(...Object.values(EstadoAsociacionCE)),
      allowNull: false,
      defaultValue: EstadoAsociacionCE.pending,
    },
    estado_interno: {
      type: DataTypes.ENUM(...Object.values(EstadoInternoCE)),
      allowNull: true,
    },
    fecha_inicio: { type: DataTypes.DATE, allowNull: true },
    fecha_fin: { type: DataTypes.DATE, allowNull: true },
    comentarios: { type: DataTypes.TEXT, allowNull: true },
    solicitante_id: { type: DataTypes.INTEGER, allowNull: true },
    aprobador_id: { type: DataTypes.INTEGER, allowNull: true },
    fecha_solicitud: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    fecha_respuesta: { type: DataTypes.DATE, allowNull: true },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_el: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "caballos_establecimientos",
    timestamps: false,
    indexes: [
      { name: "ix_ce_caballo", fields: ["caballo_id"] },
      { name: "ix_ce_establecimiento", fields: ["establecimiento_id"] },
      { name: "ix_ce_estado_asociacion", fields: ["estado_asociacion"] },
      // unicidades parciales (accepted activa / pending duplicada) -> migraciones SQL
    ],
  }
);
