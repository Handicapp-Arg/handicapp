import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Disciplina } from "./enums";

export enum TipoEstablecimiento {
  haras = 'haras',
  polo = 'polo',
  salto = 'salto',
  doma = 'doma',
  turf = 'turf',
  enduro = 'enduro',
  mixto = 'mixto',
  otro = 'otro'
}

export enum EstadoEstablecimiento {
  activo = 'activo',
  inactivo = 'inactivo',
  mantenimiento = 'mantenimiento',
  suspendido = 'suspendido'
}

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

  // Geolocation & Media
  latitud: number | null;
  longitud: number | null;
  descripcion: string | null;
  imagenes: string[];

  // Ratings & Reviews
  rating_promedio: number;
  total_resenas: number;
  verificado: boolean;
  fecha_verificacion: Date | null;

  logo_url: string | null;
  disciplina_principal: Disciplina | null;
  
  tipo_establecimiento: TipoEstablecimiento;
  estado: EstadoEstablecimiento;
  superficie_hectareas: number | null;
  cantidad_boxes: number | null;
  servicios: string[];

  creado_el: Date;
  actualizado_el: Date | null;

  // NOTE: There is no propietario_id on this model.
  // The responsible user for a stable is represented by User.establecimiento_id:
  // the User with role 'establecimiento' whose establecimiento_id points back to this stable.
  // The word "propietario" in this context means stable owner/operator, NOT a horse-owning propietario (role 6).
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
  | "latitud"
  | "longitud"
  | "descripcion"
  | "imagenes"
  | "rating_promedio"
  | "total_resenas"
  | "verificado"
  | "fecha_verificacion"
  | "logo_url"
  | "disciplina_principal"
  | "tipo_establecimiento"
  | "estado"
  | "superficie_hectareas"
  | "cantidad_boxes"
  | "servicios"
  | "creado_el"
  | "actualizado_el"
>;

export class Establecimiento
  extends Model<EstabAttrs, EstabCreation>
  implements EstabAttrs
{
  declare id: number;
  declare nombre: string;
  declare cuit: string;
  declare email: string | null;
  declare telefono: string | null;

  declare direccion_calle: string | null;
  declare direccion_numero: string | null;
  declare direccion_complemento: string | null;
  declare codigo_postal: string | null;
  declare ciudad: string | null;
  declare provincia: string | null;
  declare pais: string | null;

  // Geolocation & Media
  declare latitud: number | null;
  declare longitud: number | null;
  declare descripcion: string | null;
  declare imagenes: string[];

  // Ratings & Reviews
  declare rating_promedio: number;
  declare total_resenas: number;
  declare verificado: boolean;
  declare fecha_verificacion: Date | null;

  declare logo_url: string | null;
  declare disciplina_principal: Disciplina | null;
  
  declare tipo_establecimiento: TipoEstablecimiento;
  declare estado: EstadoEstablecimiento;
  declare superficie_hectareas: number | null;
  declare cantidad_boxes: number | null;
  declare servicios: string[];

  declare creado_el: Date;
  declare actualizado_el: Date | null;
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

    // Geolocation & Media
    latitud: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    longitud: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    imagenes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    // Ratings & Reviews
    rating_promedio: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_resenas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    verificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fecha_verificacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    logo_url: { type: DataTypes.STRING(300), allowNull: true },
    disciplina_principal: {
      type: DataTypes.ENUM(...Object.values(Disciplina)),
      allowNull: true,
    },

    tipo_establecimiento: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'mixto',
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'activo',
    },
    superficie_hectareas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cantidad_boxes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    servicios: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
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
      { name: "ix_establecimientos_tipo", fields: ["tipo_establecimiento"] },
      { name: "ix_establecimientos_estado", fields: ["estado"] },
      { name: "ix_establecimientos_latitud", fields: ["latitud"] },
      { name: "ix_establecimientos_longitud", fields: ["longitud"] },
      { name: "ix_establecimientos_rating", fields: ["rating_promedio"] },
      { name: "ix_establecimientos_verificado", fields: ["verificado"] },
    ],
  }
);
