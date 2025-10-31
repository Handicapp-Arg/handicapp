import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

export type UnidadMedida = 'kg' | 'litro' | 'unidad';
export type EstadoProducto = 'activo' | 'inactivo';

interface ProductoAttrs {
  id: number;
  establecimiento_id: number;
  categoria_id: number;
  proveedor_id: number | null;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  unidad_medida: UnidadMedida;
  precio_unitario: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  estado: EstadoProducto;
  imagen_url: string | null;
  notas: string | null;
  creado_el: Date;
  actualizado_el: Date | null;
  eliminado_el: Date | null;
}

type ProductoCreation = Optional<
  ProductoAttrs,
  | "id"
  | "proveedor_id"
  | "descripcion"
  | "imagen_url"
  | "notas"
  | "actualizado_el"
  | "eliminado_el"
>;

class Producto extends Model<ProductoAttrs, ProductoCreation> implements ProductoAttrs {
  public id!: number;
  public establecimiento_id!: number;
  public categoria_id!: number;
  public proveedor_id!: number | null;
  public codigo!: string;
  public nombre!: string;
  public descripcion!: string | null;
  public unidad_medida!: UnidadMedida;
  public precio_unitario!: number;
  public stock_actual!: number;
  public stock_minimo!: number;
  public stock_maximo!: number;
  public estado!: EstadoProducto;
  public imagen_url!: string | null;
  public notas!: string | null;
  public creado_el!: Date;
  public actualizado_el!: Date | null;
  public eliminado_el!: Date | null;
}

Producto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    establecimiento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'establecimientos',
        key: 'id',
      },
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventario_categoria',
        key: 'id',
      },
    },
    proveedor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'inventario_proveedor',
        key: 'id',
      },
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unidad_medida: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'unidad',
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stock_actual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stock_minimo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stock_maximo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'activo',
    },
    imagen_url: {
      type: DataTypes.STRING(500),
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
    eliminado_el: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "inventario_producto",
    timestamps: false,
    paranoid: false,
  }
);

export default Producto;
