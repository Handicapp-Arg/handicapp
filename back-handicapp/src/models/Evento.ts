import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { EstadoValidacionEvento } from "./enums";

interface EventoAttrs {
  id: number;
  caballo_id: number;
  tipo_evento_id: number;
  fecha_evento: Date;
  titulo: string | null;
  descripcion: string | null;
  creado_por_usuario_id: number;
  rol_autor: string | null;
  establecimiento_id: number | null;
  estado_validacion: EstadoValidacionEvento;
  validado_por_usuario_id: number | null;
  validado_el: Date | null;
  costo_monto: string | null;
  costo_moneda: string | null;
  // Nuevos campos
  hora_inicio: string | null;
  hora_fin: string | null;
  ubicacion: string | null;
  estado: string | null;
  prioridad: string | null;
  es_publico: boolean;
  requiere_validacion: boolean;
  // Timestamps
  creado_el: Date;
  actualizado_el: Date | null;
  eliminado_el: Date | null;
}

type EventoCreate = Optional<
  EventoAttrs,
  | "id"
  | "titulo"
  | "descripcion"
  | "rol_autor"
  | "establecimiento_id"
  | "estado_validacion"
  | "validado_por_usuario_id"
  | "validado_el"
  | "costo_monto"
  | "costo_moneda"
  | "hora_inicio"
  | "hora_fin"
  | "ubicacion"
  | "estado"
  | "prioridad"
  | "es_publico"
  | "requiere_validacion"
  | "creado_el"
  | "actualizado_el"
  | "eliminado_el"
>;

export class Evento extends Model<EventoAttrs, EventoCreate> implements EventoAttrs {
  public id!: number;
  public caballo_id!: number;
  public tipo_evento_id!: number;
  public fecha_evento!: Date;
  public titulo!: string | null;
  public descripcion!: string | null;
  public creado_por_usuario_id!: number;
  public rol_autor!: string | null;
  public establecimiento_id!: number | null;
  public estado_validacion!: EstadoValidacionEvento;
  public validado_por_usuario_id!: number | null;
  public validado_el!: Date | null;
  public costo_monto!: string | null;
  public costo_moneda!: string | null;
  public hora_inicio!: string | null;
  public hora_fin!: string | null;
  public ubicacion!: string | null;
  public estado!: string | null;
  public prioridad!: string | null;
  public es_publico!: boolean;
  public requiere_validacion!: boolean;
  public creado_el!: Date;
  public actualizado_el!: Date | null;
  public eliminado_el!: Date | null;
}

Evento.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    caballo_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo_evento_id: { type: DataTypes.INTEGER, allowNull: false },
    fecha_evento: { type: DataTypes.DATE, allowNull: false },
    titulo: { type: DataTypes.STRING(120), allowNull: true },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    creado_por_usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    rol_autor: { type: DataTypes.STRING(40), allowNull: true },
    establecimiento_id: { type: DataTypes.INTEGER, allowNull: true },
    estado_validacion: {
      type: DataTypes.ENUM(...Object.values(EstadoValidacionEvento)),
      allowNull: false,
      defaultValue: EstadoValidacionEvento.approved,
    },
    validado_por_usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    validado_el: { type: DataTypes.DATE, allowNull: true },
    costo_monto: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
    costo_moneda: { type: DataTypes.CHAR(3), allowNull: true },
    hora_inicio: { type: DataTypes.TIME, allowNull: true },
    hora_fin: { type: DataTypes.TIME, allowNull: true },
    ubicacion: { type: DataTypes.STRING(255), allowNull: true },
    estado: { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'programado' },
    prioridad: { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'media' },
    es_publico: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    requiere_validacion: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_el: { type: DataTypes.DATE, allowNull: true },
    eliminado_el: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "eventos",
    timestamps: false,
    indexes: [
      { name: "ix_eventos_caballo_fecha", fields: ["caballo_id", "fecha_evento"] },
      { name: "ix_eventos_tipo", fields: ["tipo_evento_id"] },
      { name: "ix_eventos_estado_validacion", fields: ["estado_validacion"] },
    ],
  }
);
