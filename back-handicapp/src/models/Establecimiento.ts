import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Disciplina } from "./enums";

interface EstabAttrs {
  id: number;
  nombre: string;
  cuit: string;
  email: string | null;
  telefono: string | null;

  direccion_calle: string | null;
  direccion_numero: string | null;
  direccion_complemento: string | null;
  codigo_postal: string | null;
  ciudad: string | null;
  provincia: string | null;
  pais: string | null;

  logo_url: string | null;
  disciplina_principal: Disciplina | null;

  creado_el: Date;
  actualizado_el: Date | null;
}

type EstabCreation = Optional<
  EstabAttrs,
  | "id"
  | "email"
  | "telefono"
  | "direccion_calle"
  | "direccion_numero"
  | "direccion_complemento"
  | "codigo_postal"
  | "ciudad"
  | "provincia"
  | "pais"
  | "logo_url"
  | "disciplina_principal"
  | "creado_el"
  | "actualizado_el"
>;

export class Establecimiento
  extends Model<EstabAttrs, EstabCreation>
  implements EstabAttrs
{
  public id!: number;
  public nombre!: string;
  public cuit!: string;
  public email!: string | null;
  public telefono!: string | null;

  public direccion_calle!: string | null;
  public direccion_numero!: string | null;
  public direccion_complemento!: string | null;
  public codigo_postal!: string | null;
  public ciudad!: string | null;
  public provincia!: string | null;
  public pais!: string | null;

  public logo_url!: string | null;
  public disciplina_principal!: Disciplina | null;

  public creado_el!: Date;
  public actualizado_el!: Date | null;
}

Establecimiento.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    cuit: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(150), allowNull: true },
    telefono: { type: DataTypes.STRING(40), allowNull: true },

    direccion_calle: { type: DataTypes.STRING(150), allowNull: true },
    direccion_numero: { type: DataTypes.STRING(20), allowNull: true },
    direccion_complemento: { type: DataTypes.STRING(80), allowNull: true },
    codigo_postal: { type: DataTypes.STRING(20), allowNull: true },
    ciudad: { type: DataTypes.STRING(100), allowNull: true },
    provincia: { type: DataTypes.STRING(100), allowNull: true },
    pais: { type: DataTypes.STRING(80), allowNull: true },

    logo_url: { type: DataTypes.STRING(300), allowNull: true },
    disciplina_principal: {
      type: DataTypes.ENUM(...Object.values(Disciplina)),
      allowNull: true,
    },

    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_el: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "establecimientos",
    timestamps: false,
    indexes: [
      { name: "ux_establecimientos_nombre", unique: true, fields: ["nombre"] },
      { name: "ux_establecimientos_cuit", unique: true, fields: ["cuit"] },
      { name: "ix_establecimientos_cp", fields: ["codigo_postal"] },
      { name: "ix_establecimientos_provincia", fields: ["provincia"] },
      { name: "ix_establecimientos_ciudad", fields: ["ciudad"] },
    ],
  }
);
