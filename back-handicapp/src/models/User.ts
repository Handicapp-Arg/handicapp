import { Model, CreationOptional, NonAttribute } from "sequelize";
import bcrypt from "bcrypt";
import { EstadoUsuario } from "./enums";
import { Role } from "./roles";

export class User extends Model {
  declare id: CreationOptional<number>;
  declare email: string;
  declare hash_contrasena: string;
  declare rol_id: number;
  declare verificado: CreationOptional<boolean>;
  declare estado_usuario: CreationOptional<EstadoUsuario>;
  declare nombre: string;
  declare apellido: string;
  declare telefono: CreationOptional<string | null>;
  declare creado_el: CreationOptional<Date>;
  declare actualizado_el: CreationOptional<Date | null>;
  declare ultimo_acceso_el: CreationOptional<Date | null>;
  declare rol?: NonAttribute<Role>;

  async validatePassword(plain: string): Promise<boolean> {    
    try {
      const cleanPassword = String(plain).trim();
      const hashedPassword = this.hash_contrasena;

      if (!hashedPassword || !cleanPassword) {
        return false;
      }

      const isValid = await bcrypt.compare(cleanPassword, hashedPassword);
      return isValid;

    } catch (error) {
      return false;
    }
  }

  get isActive(): boolean {
    return this.estado_usuario === EstadoUsuario.active;
  }

  setPassword(plain: string): void {
    (this as any)._plainPassword = plain;
  }
}

export default User;