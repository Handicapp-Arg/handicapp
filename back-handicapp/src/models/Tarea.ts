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
  prioridad: string | null;
  evento_generado_id: number | null;
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
  | "prioridad"
  | "evento_generado_id"
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
  public prioridad!: string | null;
  public evento_generado_id!: number | null;
  public creado_el!: Date;
  public actualizado_el!: Date | null;
}

// Mapeo bidireccional entre estados de base de datos (inglés) y API (español)
const ESTADO_DB_TO_API: Record<string, string> = {
  'open': 'pendiente',
  'in_progress': 'en_progreso',
  'done': 'completada',
  'cancelled': 'cancelada'
};

const ESTADO_API_TO_DB: Record<string, string> = {
  'pendiente': 'open',
  'en_progreso': 'in_progress',
  'completada': 'done',
  'cancelada': 'cancelled',
  'vencida': 'open' // vencida se trata como pendiente en DB
};

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
      get() {
        const rawValue = this.getDataValue('estado');
        // Traducir de inglés (DB) a español (API)
        return ESTADO_DB_TO_API[rawValue] || rawValue;
      },
      set(value: string) {
        // Traducir de español (API) a inglés (DB)
        const dbValue = ESTADO_API_TO_DB[value] || value;
        this.setDataValue('estado', dbValue as EstadoTarea);
      }
    },
    fecha_vencimiento: { type: DataTypes.DATE, allowNull: true },
    prioridad: { 
      type: DataTypes.STRING(20), 
      allowNull: true, 
      defaultValue: 'media',
      validate: {
        isIn: [['baja', 'media', 'alta', 'critica']]
      }
    },
    evento_generado_id: { type: DataTypes.INTEGER, allowNull: true },
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
