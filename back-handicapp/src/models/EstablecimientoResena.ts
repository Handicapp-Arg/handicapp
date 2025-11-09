import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface ResenaAttrs {
  id: number;
  establecimiento_id: number;
  usuario_id: number;
  rating: number;
  comentario: string | null;
  respuesta_establecimiento: string | null;
  respondido_por_usuario_id: number | null;
  respondido_el: Date | null;
  visible: boolean;
  creado_el: Date;
  actualizado_el: Date | null;
}

type ResenaCreation = Optional<
  ResenaAttrs,
  | "id"
  | "comentario"
  | "respuesta_establecimiento"
  | "respondido_por_usuario_id"
  | "respondido_el"
  | "visible"
  | "creado_el"
  | "actualizado_el"
>;

export class EstablecimientoResena
  extends Model<ResenaAttrs, ResenaCreation>
  implements ResenaAttrs
{
  declare id: number;
  declare establecimiento_id: number;
  declare usuario_id: number;
  declare rating: number;
  declare comentario: string | null;
  declare respuesta_establecimiento: string | null;
  declare respondido_por_usuario_id: number | null;
  declare respondido_el: Date | null;
  declare visible: boolean;
  declare creado_el: Date;
  declare actualizado_el: Date | null;

  // Associations
  declare readonly establecimiento?: any;
  declare readonly usuario?: any;
  declare readonly respondido_por?: any;
}

EstablecimientoResena.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    establecimiento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "establecimientos",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    respuesta_establecimiento: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    respondido_por_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    respondido_el: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "establecimiento_resenas",
    timestamps: false,
    indexes: [
      {
        name: "ux_resena_usuario_establecimiento",
        unique: true,
        fields: ["establecimiento_id", "usuario_id"],
      },
      {
        name: "ix_resenas_establecimiento",
        fields: ["establecimiento_id"],
      },
      {
        name: "ix_resenas_usuario",
        fields: ["usuario_id"],
      },
      {
        name: "ix_resenas_rating",
        fields: ["rating"],
      },
      {
        name: "ix_resenas_visible",
        fields: ["visible"],
      },
      {
        name: "ix_resenas_creado",
        fields: ["creado_el"],
      },
    ],
  }
);
