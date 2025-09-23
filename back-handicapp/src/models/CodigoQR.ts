import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { EstadoQR } from "./enums";

interface QRAttrs {
  id: number;
  caballo_id: number;
  token: string;
  expira_el: Date | null;
  estado: EstadoQR;
  creado_por_usuario_id: number;
  creado_el: Date;
}

type QRCreate = Optional<QRAttrs, "id" | "expira_el" | "estado" | "creado_el">;

export class CodigoQR extends Model<QRAttrs, QRCreate> implements QRAttrs {
  public id!: number;
  public caballo_id!: number;
  public token!: string;
  public expira_el!: Date | null;
  public estado!: EstadoQR;
  public creado_por_usuario_id!: number;
  public creado_el!: Date;
}

CodigoQR.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caballo_id: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    expira_el: { type: DataTypes.DATE, allowNull: true },
    estado: {
      type: DataTypes.ENUM(...Object.values(EstadoQR)),
      allowNull: false,
      defaultValue: EstadoQR.active,
    },
    creado_por_usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "codigos_qr",
    timestamps: false,
    indexes: [
      { name: "ix_qr_caballo", fields: ["caballo_id"] },
      { name: "ux_qr_token", unique: true, fields: ["token"] },
    ],
  }
);
