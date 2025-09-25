import { Model, Optional } from "sequelize";

export interface RoleAttrs {
  id: number;
  clave: string;
  nombre: string;
  creado_el?: Date;
}

export type RoleCreationAttrs = Optional<RoleAttrs, "id" | "creado_el">;

export class Role extends Model<RoleAttrs, RoleCreationAttrs> implements RoleAttrs {
  public id!: number;
  public clave!: string;
  public nombre!: string;
  public creado_el!: Date;
}

// La inicializacion se realiza en src/models/index.ts
