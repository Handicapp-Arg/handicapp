import * as jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from '../models/User';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class AuthService {
  static async login({ email, password }: LoginRequest): Promise<LoginResponse> {
    try {
      
      const user = await User.findOne({ 
        where: { email: email.toLowerCase() },
        attributes: ['id', 'email', 'hash_contrasena', 'nombre', 'apellido', 'rol_id', 'verificado', 'estado_usuario']
      });
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
          error: 'Invalid email or password'
        };
      }
      
      const isValidPassword = await user.validatePassword(password);
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password',
          error: 'Invalid email or password'
        };
      }
      
      const payload = {
        id: user.id,
        email: user.email,
        role: user.rol_id
      };
      
      const token = jwt.sign(payload, config.jwt.secret as string, {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions);
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            rol_id: user.rol_id,
          },
          token,
        },
      };
      
    } catch (error: any) {
      throw error;
    }
  }
}
