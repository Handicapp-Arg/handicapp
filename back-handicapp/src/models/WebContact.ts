import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface WebContactAttrs {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: Date;
}

export type WebContactCreation = Optional<WebContactAttrs, 'id' | 'created_at'>;

export class WebContact extends Model<WebContactAttrs, WebContactCreation> {}

WebContact.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'web_contacts',
    timestamps: false,
  }
);
