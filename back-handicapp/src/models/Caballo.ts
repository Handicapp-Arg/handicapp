import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Disciplina, EstadoGlobalCaballo, SexoCaballo } from "./enums";

interface CaballoAttrs {
  id: number;
  nombre: string;
  sexo: SexoCaballo | null;
  fecha_nacimiento: Date | null;
  pelaje: string | null;
  raza: string | null;
  disciplina: Disciplina | null;
  microchip: string | null;
  foto_url: string | null;
  estado_global: EstadoGlobalCaballo;
  padre_id: number | null;
  madre_id: number | null;
  creado_el: Date;
  actualizado_el: Date | null;
  eliminado_el: Date | null;
}

type CaballoCreation = Optional<
  CaballoAttrs,
  | "id"
  | "sexo"
  | "fecha_nacimiento"
  | "pelaje"
  | "raza"
  | "disciplina"
  | "microchip"
  | "foto_url"
  | "padre_id"
  | "madre_id"
  | "creado_el"
  | "actualizado_el"
  | "eliminado_el"
>;

export class Caballo extends Model<CaballoAttrs, CaballoCreation> implements CaballoAttrs {
  public id!: number;
  public nombre!: string;
  public sexo!: SexoCaballo | null;
  public fecha_nacimiento!: Date | null;
  public pelaje!: string | null;
  public raza!: string | null;
  public disciplina!: Disciplina | null;
  public microchip!: string | null;
  public foto_url!: string | null;
  public estado_global!: EstadoGlobalCaballo;
  public padre_id!: number | null;
  public madre_id!: number | null;
  public creado_el!: Date;
  public actualizado_el!: Date | null;
  public eliminado_el!: Date | null;
}

Caballo.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    sexo: { type: DataTypes.ENUM(...Object.values(SexoCaballo)), allowNull: true },
    fecha_nacimiento: { type: DataTypes.DATE, allowNull: true },
    pelaje: { type: DataTypes.STRING(80), allowNull: true },
    raza: { type: DataTypes.STRING(80), allowNull: true },
    disciplina: { type: DataTypes.ENUM(...Object.values(Disciplina)), allowNull: true },
    microchip: { type: DataTypes.STRING(80), allowNull: true, unique: true },
    foto_url: { type: DataTypes.STRING(300), allowNull: true },
    estado_global: {
      type: DataTypes.ENUM(...Object.values(EstadoGlobalCaballo)),
      allowNull: false,
      defaultValue: EstadoGlobalCaballo.activo,
    },
    padre_id: { type: DataTypes.INTEGER, allowNull: true },
    madre_id: { type: DataTypes.INTEGER, allowNull: true },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_el: { type: DataTypes.DATE, allowNull: true },
    eliminado_el: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "caballos",
    timestamps: false,
    indexes: [
      { name: "ux_caballos_microchip", unique: true, fields: ["microchip"] },
      { name: "ix_caballos_estado", fields: ["estado_global"] },
      { name: "ix_caballos_nombre", fields: ["nombre"] },
    ],
  }
);

// Relaciones recursivas (pedigrí) se declaran en models/index.ts o aquí si preferís:
// Caballo.belongsTo(Caballo, { foreignKey: "padre_id", as: "padre" });
// Caballo.belongsTo(Caballo, { foreignKey: "madre_id", as: "madre" });
