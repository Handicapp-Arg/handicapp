import { Establecimiento, TipoEstablecimiento, EstadoEstablecimiento } from '../src/models/Establecimiento';
import { Disciplina } from '../src/models/enums';
import { sequelize } from '../src/config/database';

const establecimientosData = [
  {
    nombre: 'Haras Los Pinos',
    cuit: '30-71234567-8',
    email: 'info@harraslospinos.com.ar',
    telefono: '+54 11 4567-8900',
    direccion_calle: 'Ruta Provincial 6',
    direccion_numero: 'Km 45',
    direccion_complemento: null,
    codigo_postal: '1625',
    ciudad: 'Escobar',
    provincia: 'Buenos Aires',
    pais: 'Argentina',
    latitud: -34.3485,
    longitud: -58.7945,
    descripcion: 'Haras especializado en cría y entrenamiento de caballos de polo. Contamos con instalaciones de primer nivel, pistas reglamentarias y un equipo de profesionales altamente capacitados. Ofrecemos servicios de entrenamiento, pensión completa y venta de ejemplares de alto rendimiento.',
    imagenes: [
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800',
      'https://images.unsplash.com/photo-1598454297627-7b5e3f2f3c00?w=800',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800'
    ],
    rating_promedio: 4.7,
    total_resenas: 23,
    verificado: true,
    fecha_verificacion: new Date('2024-06-15'),
    logo_url: null,
    disciplina_principal: Disciplina.polo,
    tipo_establecimiento: TipoEstablecimiento.polo,
    estado: EstadoEstablecimiento.activo,
    superficie_hectareas: 150,
    cantidad_boxes: 80,
    servicios: [
      'Pensión completa',
      'Entrenamiento',
      'Veterinario 24hs',
      'Herrería',
      'Pistas reglamentarias',
      'Transporte',
      'Alimentación balanceada',
      'Paddocks individuales'
    ]
  },
  {
    nombre: 'Estancia El Ombú',
    cuit: '30-71234568-9',
    email: 'contacto@estanciaelombu.com',
    telefono: '+54 2227 45-6789',
    direccion_calle: 'Camino Rural 205',
    direccion_numero: 'S/N',
    direccion_complemento: 'Entrada por Ruta 205',
    codigo_postal: '7000',
    ciudad: 'Tandil',
    provincia: 'Buenos Aires',
    pais: 'Argentina',
    latitud: -37.3218,
    longitud: -59.1332,
    descripcion: 'Estancia familiar dedicada al salto y doma clásica. Ambiente tranquilo rodeado de naturaleza, ideal para el desarrollo integral del binomio. Contamos con instructores certificados, pistas cubiertas y al aire libre. Organizamos clínicas y competencias mensuales.',
    imagenes: [
      'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800',
      'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800',
      'https://images.unsplash.com/photo-1591808216528-3ce2e137ad7f?w=800'
    ],
    rating_promedio: 4.9,
    total_resenas: 45,
    verificado: true,
    fecha_verificacion: new Date('2024-08-20'),
    logo_url: null,
    disciplina_principal: Disciplina.equitacion,
    tipo_establecimiento: TipoEstablecimiento.salto,
    estado: EstadoEstablecimiento.activo,
    superficie_hectareas: 85,
    cantidad_boxes: 45,
    servicios: [
      'Clases de salto',
      'Doma clásica',
      'Pensión semi-completa',
      'Veterinario',
      'Herrería',
      'Pista cubierta',
      'Pista exterior',
      'Clínicas mensuales',
      'Paddocks amplios',
      'Solarium'
    ]
  },
  {
    nombre: 'Club Hípico San Jorge',
    cuit: '30-71234569-0',
    email: 'administracion@clubsanjorge.com.ar',
    telefono: '+54 351 489-7654',
    direccion_calle: 'Avenida Colón',
    direccion_numero: '8965',
    direccion_complemento: 'Barrio Jardín',
    codigo_postal: '5000',
    ciudad: 'Córdoba',
    provincia: 'Córdoba',
    pais: 'Argentina',
    latitud: -31.4201,
    longitud: -64.1888,
    descripcion: 'Club hípico con más de 50 años de trayectoria en la región. Especializado en formación de jinetes y amazonas de todas las edades. Ofrecemos clases grupales e individuales, campamentos de verano y preparación para competencias. Instalaciones modernas con todas las comodidades.',
    imagenes: [
      'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=800',
      'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800',
      'https://images.unsplash.com/photo-1520615287754-54e2c32838e7?w=800'
    ],
    rating_promedio: 4.5,
    total_resenas: 67,
    verificado: true,
    fecha_verificacion: new Date('2024-09-10'),
    logo_url: null,
    disciplina_principal: Disciplina.equitacion,
    tipo_establecimiento: TipoEstablecimiento.mixto,
    estado: EstadoEstablecimiento.activo,
    superficie_hectareas: 35,
    cantidad_boxes: 60,
    servicios: [
      'Clases grupales',
      'Clases individuales',
      'Iniciación ecuestre',
      'Salto ecuestre',
      'Doma',
      'Pensión',
      'Veterinario',
      'Herrería',
      'Cafetería',
      'Vestuarios',
      'Estacionamiento',
      'Campamentos de verano'
    ]
  },
  {
    nombre: 'Haras Santa Rosa de Calamuchita',
    cuit: '30-71234570-1',
    email: 'info@harassantarosa.com',
    telefono: '+54 3546 42-8765',
    direccion_calle: 'Ruta Provincial 5',
    direccion_numero: 'Km 12',
    direccion_complemento: 'Valle de Calamuchita',
    codigo_postal: '5196',
    ciudad: 'Santa Rosa de Calamuchita',
    provincia: 'Córdoba',
    pais: 'Argentina',
    latitud: -32.0683,
    longitud: -64.5371,
    descripcion: 'Haras boutique ubicado en el corazón del Valle de Calamuchita. Especializado en cría de caballos de sangre pura de carrera y caballos de enduro. Entorno natural privilegiado con senderos montañosos para entrenamiento. Pensión premium con atención personalizada y seguimiento veterinario permanente.',
    imagenes: [
      'https://images.unsplash.com/photo-1560967294-6b5b8173f89a?w=800',
      'https://images.unsplash.com/photo-1575057695801-068d8c9e8d81?w=800',
      'https://images.unsplash.com/photo-1545182842-cc4f08c81906?w=800'
    ],
    rating_promedio: 4.8,
    total_resenas: 31,
    verificado: true,
    fecha_verificacion: new Date('2024-07-05'),
    logo_url: null,
    disciplina_principal: Disciplina.turf,
    tipo_establecimiento: TipoEstablecimiento.haras,
    estado: EstadoEstablecimiento.activo,
    superficie_hectareas: 220,
    cantidad_boxes: 50,
    servicios: [
      'Cría de SPC',
      'Entrenamiento de enduro',
      'Pensión premium',
      'Veterinario 24hs',
      'Herrería especializada',
      'Natación ecuestre',
      'Caminadora mecánica',
      'Potrero rotativo',
      'Alimentación premium',
      'Transporte especializado',
      'Seguimiento nutricional',
      'Fisioterapia equina'
    ]
  }
];

async function seedEstablecimientos() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    console.log('🌱 Insertando establecimientos de prueba...');

    for (const data of establecimientosData) {
      const [establecimiento, created] = await Establecimiento.findOrCreate({
        where: { cuit: data.cuit },
        defaults: data
      });

      if (created) {
        console.log(`✅ Establecimiento creado: ${establecimiento.nombre} (${establecimiento.ciudad}, ${establecimiento.provincia})`);
      } else {
        console.log(`ℹ️  Establecimiento ya existe: ${establecimiento.nombre}`);
      }
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log(`📊 Total de establecimientos en la base de datos: ${await Establecimiento.count()}`);

  } catch (error) {
    console.error('❌ Error en el seed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el seed
seedEstablecimientos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
