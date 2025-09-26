import { Model, Optional, CreationOptional } from "sequelize";

export interface RoleAttrs {
  id: number;
  clave: string;
  nombre: string;
  creado_el?: Date;
}

export type RoleCreationAttrs = Optional<RoleAttrs, "id" | "creado_el">;

export class Role extends Model<RoleAttrs, RoleCreationAttrs> implements RoleAttrs {
  // Use 'declare' so TS doesn't emit runtime fields that shadow Sequelize getters/setters
  declare id: CreationOptional<number>;
  declare clave: string;
  declare nombre: string;
  declare creado_el: CreationOptional<Date>;
}

// La inicializacion se realiza en src/models/index.ts
