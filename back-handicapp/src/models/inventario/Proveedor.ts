import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface ProveedorAttrs {
  id: number;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  cuit: string | null;
  notas: string | null;
  creado_el: Date;
  actualizado_el: Date | null;
}

type ProveedorCreation = Optional<
  ProveedorAttrs,
  | "id"
  | "contacto"
  | "telefono"
  | "email"
  | "direccion"
  | "cuit"
  | "notas"
  | "actualizado_el"
>;

class Proveedor extends Model<ProveedorAttrs, ProveedorCreation> implements ProveedorAttrs {
  public id!: number;
  public nombre!: string;
  public contacto!: string | null;
  public telefono!: string | null;
  public email!: string | null;
  public direccion!: string | null;
  public cuit!: string | null;
  public notas!: string | null;
  public creado_el!: Date;
  public actualizado_el!: Date | null;
}

Proveedor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    contacto: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cuit: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creado_el: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    actualizado_el: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "inventario_proveedor",
    timestamps: false,
  }
);

export default Proveedor;
