import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { EstadoTarea, TipoTarea } from "./enums";

interface TareaAttrs {
  id: number;
  establecimiento_id: number;
  caballo_id: number | null;
  tipo: TipoTarea;
  titulo: string;
  notas: string | null;
  asignado_a_usuario_id: number | null;
  creado_por_usuario_id: number;
  estado: EstadoTarea;
  fecha_vencimiento: Date | null;
  creado_el: Date;
  actualizado_el: Date | null;
}

type TareaCreation = Optional<
  TareaAttrs,
  | "id"
  | "caballo_id"
  | "tipo"
  | "notas"
  | "asignado_a_usuario_id"
  | "estado"
  | "fecha_vencimiento"
  | "creado_el"
  | "actualizado_el"
>;

export class Tarea extends Model<TareaAttrs, TareaCreation> implements TareaAttrs {
  public id!: number;
  public establecimiento_id!: number;
  public caballo_id!: number | null;
  public tipo!: TipoTarea;
  public titulo!: string;
  public notas!: string | null;
  public asignado_a_usuario_id!: number | null;
  public creado_por_usuario_id!: number;
  public estado!: EstadoTarea;
  public fecha_vencimiento!: Date | null;
  public creado_el!: Date;
  public actualizado_el!: Date | null;
}

Tarea.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    establecimiento_id: { type: DataTypes.INTEGER, allowNull: false },
    caballo_id: { type: DataTypes.INTEGER, allowNull: true },
    tipo: {
      type: DataTypes.ENUM(...Object.values(TipoTarea)),
      allowNull: false,
      defaultValue: TipoTarea.otro,
    },
    titulo: { type: DataTypes.STRING(120), allowNull: false },
    notas: { type: DataTypes.TEXT, allowNull: true },
    asignado_a_usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    creado_por_usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    estado: {
      type: DataTypes.ENUM(...Object.values(EstadoTarea)),
      allowNull: false,
      defaultValue: EstadoTarea.open,
    },
    fecha_vencimiento: { type: DataTypes.DATE, allowNull: true },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_el: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "tareas",
    timestamps: false,
    indexes: [
      { name: "ix_tareas_establecimiento", fields: ["establecimiento_id"] },
      { name: "ix_tareas_asignado", fields: ["asignado_a_usuario_id"] },
      { name: "ix_tareas_estado", fields: ["estado"] },
      { name: "ix_tareas_vencimiento", fields: ["fecha_vencimiento"] },
    ],
  }
);
