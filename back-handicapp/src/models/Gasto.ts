import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface GastoAttributes {
  id: number;
  usuario_id: number;
  caballo_id?: number;
  monto: number;
  descripcion?: string;
  fecha: Date;
  categoria?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface GastoCreationAttributes extends Optional<GastoAttributes, 'id'> {}

export class Gasto extends Model<GastoAttributes, GastoCreationAttributes> implements GastoAttributes {
  public id!: number;
  public usuario_id!: number;
  public caballo_id?: number;
  public monto!: number;
  public descripcion?: string;
  public fecha!: Date;
  public categoria?: string;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;
}

Gasto.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    caballo_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    monto: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'gastos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
