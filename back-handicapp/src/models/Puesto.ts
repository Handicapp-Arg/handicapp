import { Model, CreationOptional } from "sequelize";

export class Puesto extends Model {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare descripcion: CreationOptional<string | null>;
  declare departamento_id: CreationOptional<number | null>;
  declare activo: CreationOptional<boolean>;
  declare creado_el: CreationOptional<Date>;
  declare actualizado_el: CreationOptional<Date | null>;
}

export default Puesto;
