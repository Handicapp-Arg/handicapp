import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Disciplina, EstadoGlobalCaballo, SexoCaballo } from "./enums";

interface CaballoAttrs {
  id: number;
  nombre: string;
  sexo: SexoCaballo | null;
  fecha_nacimiento: Date | null;
  pelaje: string | null;
  raza: string | null;
  disciplina: Disciplina | null;
  microchip: string | null;
  foto_url: string | null;
  estado_global: EstadoGlobalCaballo;
  padre_id: number | null;
  madre_id: number | null;
  
  // Documentación e identificación oficial
  rp: string | null; // Registro de Pedigree / Identificador único
  sba: string | null; // Registro Stud Book Argentino
  adn: string | null; // Verificación genética / Código ADN
  pasaporte: string | null; // Número de pasaporte equino
  numero_fei: string | null; // Número FEI (Federación Ecuestre Internacional)
  ueln: string | null; // Universal Equine Life Number (identificador universal)
  
  // Datos físicos
  altura: number | null; // Altura en centímetros
  peso: number | null; // Peso en kilogramos
  
  creado_el: Date;
  actualizado_el: Date | null;
  eliminado_el: Date | null;
}

type CaballoCreation = Optional<
  CaballoAttrs,
  | "id"
  | "sexo"
  | "fecha_nacimiento"
  | "pelaje"
  | "raza"
  | "disciplina"
  | "microchip"
  | "foto_url"
  | "padre_id"
  | "madre_id"
  | "rp"
  | "sba"
  | "adn"
  | "pasaporte"
  | "numero_fei"
  | "ueln"
  | "altura"
  | "peso"
  | "creado_el"
  | "actualizado_el"
  | "eliminado_el"
>;

export class Caballo extends Model<CaballoAttrs, CaballoCreation> implements CaballoAttrs {
  declare id: number;
  declare nombre: string;
  declare sexo: SexoCaballo | null;
  declare fecha_nacimiento: Date | null;
  declare pelaje: string | null;
  declare raza: string | null;
  declare disciplina: Disciplina | null;
  declare microchip: string | null;
  declare foto_url: string | null;
  declare estado_global: EstadoGlobalCaballo;
  declare padre_id: number | null;
  declare madre_id: number | null;
  
  // Documentación e identificación oficial
  declare rp: string | null;
  declare sba: string | null;
  declare adn: string | null;
  declare pasaporte: string | null;
  declare numero_fei: string | null;
  declare ueln: string | null;
  
  // Datos físicos
  declare altura: number | null;
  declare peso: number | null;
  
  declare creado_el: Date;
  declare actualizado_el: Date | null;
  declare eliminado_el: Date | null;
}

Caballo.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    sexo: { type: DataTypes.ENUM(...Object.values(SexoCaballo)), allowNull: true },
    fecha_nacimiento: { type: DataTypes.DATE, allowNull: true },
    pelaje: { type: DataTypes.STRING(80), allowNull: true },
    raza: { type: DataTypes.STRING(80), allowNull: true },
    disciplina: { type: DataTypes.ENUM(...Object.values(Disciplina)), allowNull: true },
    microchip: { type: DataTypes.STRING(80), allowNull: true },
    foto_url: { type: DataTypes.STRING(300), allowNull: true },
    estado_global: {
      type: DataTypes.ENUM(...Object.values(EstadoGlobalCaballo)),
      allowNull: false,
      defaultValue: EstadoGlobalCaballo.activo,
    },
    padre_id: { type: DataTypes.INTEGER, allowNull: true },
    madre_id: { type: DataTypes.INTEGER, allowNull: true },
    
    // Documentación e identificación oficial
    rp: { 
      type: DataTypes.STRING(100), 
      allowNull: true,
      comment: 'Registro de Pedigree - Identificador único del ejemplar'
    },
    sba: { 
      type: DataTypes.STRING(100), 
      allowNull: true,
      comment: 'Stud Book Argentino - Registro oficial en Argentina'
    },
    adn: { 
      type: DataTypes.STRING(150), 
      allowNull: true,
      comment: 'Código de verificación genética / ADN'
    },
    pasaporte: { 
      type: DataTypes.STRING(100), 
      allowNull: true,
      comment: 'Número de pasaporte equino'
    },
    numero_fei: { 
      type: DataTypes.STRING(50), 
      allowNull: true,
      comment: 'Número FEI - Federación Ecuestre Internacional'
    },
    ueln: { 
      type: DataTypes.STRING(50), 
      allowNull: true,
      comment: 'Universal Equine Life Number - Identificador universal'
    },
    
    // Datos físicos
    altura: { 
      type: DataTypes.DECIMAL(5, 2), 
      allowNull: true,
      comment: 'Altura en centímetros'
    },
    peso: { 
      type: DataTypes.DECIMAL(6, 2), 
      allowNull: true,
      comment: 'Peso en kilogramos'
    },
    
    creado_el: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_el: { type: DataTypes.DATE, allowNull: true },
    eliminado_el: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "caballos",
    timestamps: false,
    indexes: [
      // Índice único parcial: solo aplica cuando microchip NO es NULL
      // Este índice se crea manualmente via migración SQL, no automáticamente por Sequelize
      // { name: "ux_caballos_microchip", unique: true, fields: ["microchip"], where: { microchip: { [Op.ne]: null } } },
      { name: "ix_caballos_estado", fields: ["estado_global"] },
      { name: "ix_caballos_nombre", fields: ["nombre"] },
    ],
  }
);

// Relaciones recursivas (pedigrí) se declaran en models/index.ts o aquí si preferís:
// Caballo.belongsTo(Caballo, { foreignKey: "padre_id", as: "padre" });
// Caballo.belongsTo(Caballo, { foreignKey: "madre_id", as: "madre" });
