import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { EstadoNotificacion } from "./enums";

interface NotifAttrs {
  id: number;
  usuario_id: number;
  tipo: string;
  payload_json: string | null;
  estado: EstadoNotificacion;
  evento_id: number | null;
  tarea_id: number | null;
  creado_el: Date;
  leido_el: Date | null;
}

type NotifCreate = Optional<
  NotifAttrs,
  "id" | "payload_json" | "estado" | "evento_id" | "tarea_id" | "creado_el" | "leido_el"
>;

export class Notificacion extends Model<NotifAttrs, NotifCreate> implements NotifAttrs {
  // ⚠️ NO declarar propiedades públicas - Sequelize las maneja automáticamente
  // public id!: number;
  // public usuario_id!: number;
  // public tipo!: string;
  // public payload_json!: string | null;
  // public estado!: EstadoNotificacion;
  // public evento_id!: number | null;
  // public tarea_id!: number | null;
  // public creado_el!: Date;
  // public leido_el!: Date | null;
  
  // Para TypeScript, declaramos como accesores
  declare id: number;
  declare usuario_id: number;
  declare tipo: string;
  declare payload_json: string | null;
  declare estado: EstadoNotificacion;
  declare evento_id: number | null;
  declare tarea_id: number | null;
  declare creado_el: Date;
  declare leido_el: Date | null;

  // Getter virtual para compatibilidad con frontend
  public get leida(): boolean {
    return this.estado === EstadoNotificacion.read;
  }

  // Getter virtual para el payload parseado
  public get datos_adicionales(): any {
    if (!this.payload_json) return null;
    try {
      return JSON.parse(this.payload_json);
    } catch {
      return null;
    }
  }

  // Getters virtuales para campos del payload
  public get titulo(): string {
    const datos = this.datos_adicionales;
    return datos?.titulo || '';
  }

  public get mensaje(): string {
    const datos = this.datos_adicionales;
    return datos?.mensaje || '';
  }

  public get importante(): boolean {
    const datos = this.datos_adicionales;
    return datos?.importante || false;
  }

  public get url(): string | undefined {
    const datos = this.datos_adicionales;
    return datos?.url;
  }
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
    evento_id: { type: DataTypes.INTEGER, allowNull: true },
    tarea_id: { type: DataTypes.INTEGER, allowNull: true },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    leido_el: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "notificaciones",
    timestamps: false,
    getterMethods: {
      leida() {
        return (this as any).estado === EstadoNotificacion.read;
      },
      datos_adicionales() {
        const payload = (this as any).payload_json;
        if (!payload) return null;
        try {
          return JSON.parse(payload);
        } catch {
          return null;
        }
      },
      titulo() {
        const datos = (this as any).datos_adicionales;
        return datos?.titulo || '';
      },
      mensaje() {
        const datos = (this as any).datos_adicionales;
        return datos?.mensaje || '';
      },
      importante() {
        const datos = (this as any).datos_adicionales;
        return datos?.importante || false;
      },
      url() {
        const datos = (this as any).datos_adicionales;
        return datos?.url;
      }
    },
    indexes: [
      { name: "ix_notif_usuario", fields: ["usuario_id"] },
      { name: "ix_notif_estado", fields: ["estado"] },
      { name: "ix_notif_creado", fields: ["creado_el"] },
      { name: "ix_notif_evento", fields: ["evento_id"] },
      { name: "ix_notif_tarea", fields: ["tarea_id"] },
    ],
  }
);
