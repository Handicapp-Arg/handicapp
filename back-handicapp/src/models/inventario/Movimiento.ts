import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

interface MovimientoAttrs {
  id: number;
  producto_id: number;
  tipo: TipoMovimiento;
  cantidad: number;
  precio_unitario: number | null;
  motivo: string | null;
  referencia: string | null;
  usuario_id: number;
  stock_anterior: number;
  stock_nuevo: number;
  creado_el: Date;
}

type MovimientoCreation = Optional<
  MovimientoAttrs,
  | "id"
  | "precio_unitario"
  | "motivo"
  | "referencia"
>;

class Movimiento extends Model<MovimientoAttrs, MovimientoCreation> implements MovimientoAttrs {
  public id!: number;
  public producto_id!: number;
  public tipo!: TipoMovimiento;
  public cantidad!: number;
  public precio_unitario!: number | null;
  public motivo!: string | null;
  public referencia!: string | null;
  public usuario_id!: number;
  public stock_anterior!: number;
  public stock_nuevo!: number;
  public creado_el!: Date;
}

Movimiento.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventario_producto',
        key: 'id',
      },
    },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    referencia: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    stock_anterior: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock_nuevo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    creado_el: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "inventario_movimiento",
    timestamps: false,
  }
);

export default Movimiento;
