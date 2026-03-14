/**
 * Role model — Sequelize model para la tabla `roles`.
 * TODO: Renombrar este archivo a Role.ts (PascalCase) para consistencia con el resto de modelos.
 * Requiere actualizar los imports en: middleware/auth.ts, services/authService.ts,
 * services/userService.ts, services/roleService.ts, services/establecimientoService.ts,
 * services/eventoService.ts, services/tareaService.ts, controllers/userController.ts,
 * models/User.ts, models/index.ts
 */

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
