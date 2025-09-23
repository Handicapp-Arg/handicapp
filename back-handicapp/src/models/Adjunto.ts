import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { CategoriaAdjunto } from "./enums";

interface AdjuntoAttrs {
  id: number;
  caballo_id: number | null;
  evento_id: number | null;
  subido_por_usuario_id: number;
  rol_autor: string | null;
  categoria: CategoriaAdjunto;
  nombre_archivo: string;
  tipo_mime: string;
  tamanio_bytes: bigint | null;
  ruta_almacenamiento: string;
  creado_el: Date;
  eliminado_el: Date | null;
}

type AdjuntoCreation = Optional<
  AdjuntoAttrs,
  | "id"
  | "caballo_id"
  | "evento_id"
  | "rol_autor"
  | "categoria"
  | "tamanio_bytes"
  | "creado_el"
  | "eliminado_el"
>;

export class Adjunto extends Model<AdjuntoAttrs, AdjuntoCreation> implements AdjuntoAttrs {
  public id!: number;
  public caballo_id!: number | null;
  public evento_id!: number | null;
  public subido_por_usuario_id!: number;
  public rol_autor!: string | null;
  public categoria!: CategoriaAdjunto;
  public nombre_archivo!: string;
  public tipo_mime!: string;
  public tamanio_bytes!: bigint | null;
  public ruta_almacenamiento!: string;
  public creado_el!: Date;
  public eliminado_el!: Date | null;
}

Adjunto.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caballo_id: { type: DataTypes.INTEGER, allowNull: true },
    evento_id: { type: DataTypes.INTEGER, allowNull: true },
    subido_por_usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    rol_autor: { type: DataTypes.STRING(40), allowNull: true },
    categoria: {
      type: DataTypes.ENUM(...Object.values(CategoriaAdjunto)),
      allowNull: false,
      defaultValue: CategoriaAdjunto.operativo,
    },
    nombre_archivo: { type: DataTypes.STRING(200), allowNull: false },
    tipo_mime: { type: DataTypes.STRING(120), allowNull: false },
    tamanio_bytes: { type: DataTypes.BIGINT, allowNull: true },
    ruta_almacenamiento: { type: DataTypes.STRING(300), allowNull: false },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    eliminado_el: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "adjuntos",
    timestamps: false,
    hooks: {
      // Validación de negocio: al menos uno de (caballo_id, evento_id)
      beforeValidate: (a) => {
        if (!a.caballo_id && !a.evento_id) {
          throw new Error("Adjunto: debe especificarse caballo_id o evento_id.");
        }
      },
    },
    indexes: [
      { name: "ix_adjuntos_caballo", fields: ["caballo_id"] },
      { name: "ix_adjuntos_evento", fields: ["evento_id"] },
      { name: "ix_adjuntos_subido_por", fields: ["subido_por_usuario_id"] },
      { name: "ix_adjuntos_creado_el", fields: ["creado_el"] },
    ],
  }
);
