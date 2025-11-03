// src/models/PushSubscription.ts
// -----------------------------------------------------------------------------
// HandicApp API - Modelo de Suscripción a Push Notifications
// -----------------------------------------------------------------------------

import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Atributos de PushSubscription
interface PushSubscriptionAttributes {
  id: number;
  user_id: number;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// Atributos opcionales al crear
interface PushSubscriptionCreationAttributes
  extends Optional<PushSubscriptionAttributes, 'id' | 'user_agent' | 'created_at' | 'updated_at'> {}

// Clase del modelo
export class PushSubscription
  extends Model<PushSubscriptionAttributes, PushSubscriptionCreationAttributes>
  implements PushSubscriptionAttributes
{
  declare id: number;
  declare user_id: number;
  declare endpoint: string;
  declare p256dh_key: string;
  declare auth_key: string;
  declare user_agent: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

// Inicializar modelo
PushSubscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    endpoint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    p256dh_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    auth_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'push_subscriptions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'ix_push_subscriptions_user_id',
        fields: ['user_id'],
      },
      {
        name: 'ix_push_subscriptions_endpoint',
        fields: ['endpoint'],
        unique: true,
      },
    ],
  }
);

export default PushSubscription;
