import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface AuditAttrs {
  id: number;
  actor_usuario_id: number;
  accion: string;
  entidad_tipo: string | null;
  entidad_id: number | null;
  metadatos_json: string | null;
  ip: string | null;
  user_agent: string | null;
  creado_el: Date;
}

type AuditCreate = Optional<
  AuditAttrs,
  | "id"
  | "entidad_tipo"
  | "entidad_id"
  | "metadatos_json"
  | "ip"
  | "user_agent"
  | "creado_el"
>;

export class Auditoria extends Model<AuditAttrs, AuditCreate> implements AuditAttrs {
  public id!: number;
  public actor_usuario_id!: number;
  public accion!: string;
  public entidad_tipo!: string | null;
  public entidad_id!: number | null;
  public metadatos_json!: string | null;
  public ip!: string | null;
  public user_agent!: string | null;
  public creado_el!: Date;
}

Auditoria.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    actor_usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    accion: { type: DataTypes.STRING(60), allowNull: false },
    entidad_tipo: { type: DataTypes.STRING(40), allowNull: true },
    entidad_id: { type: DataTypes.INTEGER, allowNull: true },
    metadatos_json: { type: DataTypes.TEXT, allowNull: true },
    ip: { type: DataTypes.STRING(64), allowNull: true },
    user_agent: { type: DataTypes.STRING(200), allowNull: true },
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "auditoria",
    timestamps: false,
    indexes: [
      { name: "ix_audit_actor", fields: ["actor_usuario_id"] },
      { name: "ix_audit_creado", fields: ["creado_el"] },
      { name: "ix_audit_entidad", fields: ["entidad_tipo", "entidad_id"] },
    ],
  }
);
