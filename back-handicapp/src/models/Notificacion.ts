import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { EstadoNotificacion } from "./enums";

interface NotifAttrs {
  id: number;
  usuario_id: number;
  tipo: string;
  payload_json: string | null;
  estado: EstadoNotificacion;
  creado_el: Date;
  leido_el: Date | null;
}

type NotifCreate = Optional<
  NotifAttrs,
  "id" | "payload_json" | "estado" | "creado_el" | "leido_el"
>;

export class Notificacion extends Model<NotifAttrs, NotifCreate> implements NotifAttrs {
  public id!: number;
  public usuario_id!: number;
  public tipo!: string;
  public payload_json!: string | null;
  public estado!: EstadoNotificacion;
  public creado_el!: Date;
  public leido_el!: Date | null;
}

Notificacion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.STRING(60), allowNull: false },
    payload_json: { type: DataTypes.TEXT, allowNull: true },
    estado: {
      type: DataTypes.ENUM(...Object.values(EstadoNotificacion)),
      allowNull: false,
      defaultValue: EstadoNotificacion.unread,
    },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    leido_el: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "notificaciones",
    timestamps: false,
    indexes: [
      { name: "ix_notif_usuario", fields: ["usuario_id"] },
      { name: "ix_notif_estado", fields: ["estado"] },
      { name: "ix_notif_creado", fields: ["creado_el"] },
    ],
  }
);
