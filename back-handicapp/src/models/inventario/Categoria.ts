import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface CategoriaAttrs {
  id: number;
  nombre: string;
  descripcion: string | null;
  color: string | null;
  icono: string | null;
  creado_el: Date;
  actualizado_el: Date | null;
}

type CategoriaCreation = Optional<
  CategoriaAttrs,
  | "id"
  | "descripcion"
  | "color"
  | "icono"
  | "actualizado_el"
>;

class Categoria extends Model<CategoriaAttrs, CategoriaCreation> implements CategoriaAttrs {
  public id!: number;
  public nombre!: string;
  public descripcion!: string | null;
  public color!: string | null;
  public icono!: string | null;
  public creado_el!: Date;
  public actualizado_el!: Date | null;
}

Categoria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    icono: {
      type: DataTypes.STRING(50),
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
    tableName: "inventario_categoria",
    timestamps: false,
  }
);

export default Categoria;
