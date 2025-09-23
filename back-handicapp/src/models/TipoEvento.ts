import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Disciplina } from "./enums";

interface TEAttrs {
  id: number;
  clave: string;
  nombre: string;
  disciplina: Disciplina | null;
  activo: boolean;
  creado_el: Date;
}

type TECreate = Optional<TEAttrs, "id" | "disciplina" | "activo" | "creado_el">;

export class TipoEvento extends Model<TEAttrs, TECreate> implements TEAttrs {
  public id!: number;
  public clave!: string;
  public nombre!: string;
  public disciplina!: Disciplina | null;
  public activo!: boolean;
  public creado_el!: Date;
}

TipoEvento.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clave: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(80), allowNull: false },
    disciplina: { type: DataTypes.ENUM(...Object.values(Disciplina)), allowNull: true },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "tipos_evento",
    timestamps: false,
    indexes: [
      { name: "ux_tipo_evento_clave", unique: true, fields: ["clave"] },
      { name: "ix_tipo_evento_activo", fields: ["activo"] },
      { name: "ix_tipo_evento_disciplina", fields: ["disciplina"] },
    ],
  }
);
