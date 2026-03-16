import { db } from '../models';
import { logger } from '../utils/logger';
import {
  EstadoUsuario,
  EstadoGlobalCaballo,
  EstadoAsociacionCE,
  EstadoMembresia,
  TipoTarea,
} from '../models/enums';
import { EstadoEstablecimiento } from '../models/Establecimiento';
import bcrypt from 'bcrypt';

const PLAIN_PASSWORD = 'HandicApp2025!';

async function hashPw(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

async function getRoleId(clave: string): Promise<number> {
  const role = await db.Role.findOne({ where: { clave } });
  if (!role) throw new Error(`Role '${clave}' not found`);
  const id: number = (role as any).id ?? (role as any).get?.('id');
  if (!id || typeof id !== 'number') throw new Error(`Invalid ID for role '${clave}'`);
  return id;
}

export const seedDatabase = async () => {
  try {
    // ── 1. ROLES ─────────────────────────────────────────────────────────────
    const rolesDefs = [
      { clave: 'admin', nombre: 'Administrador' },
      { clave: 'establecimiento', nombre: 'Establecimiento' },
      { clave: 'propietario', nombre: 'Propietario' },
    ];

    for (const r of rolesDefs) {
      await db.Role.findOrCreate({
        where: { clave: r.clave },
        defaults: { clave: r.clave, nombre: r.nombre, creado_el: new Date() },
      });
    }
    logger.debug('Roles seeded');

    // ── 2. USUARIOS ───────────────────────────────────────────────────────────
    const hashed = await hashPw(PLAIN_PASSWORD);
    const now = new Date();

    const [adminRoleId, estRoleId, propRoleId] = await Promise.all([
      getRoleId('admin'),
      getRoleId('establecimiento'),
      getRoleId('propietario'),
    ]);

    const baseUser = {
      hash_contrasena: hashed,
      verificado: true,
      estado_usuario: EstadoUsuario.active,
      telefono: null,
      creado_el: now,
      actualizado_el: now,
      ultimo_acceso_el: now,
    };

    const [adminUser] = await db.User.findOrCreate({
      where: { email: 'admin@handicapp.com' },
      defaults: { ...baseUser, email: 'admin@handicapp.com', nombre: 'Admin', apellido: 'HandicApp', rol_id: adminRoleId },
    });

    const [estUser, estCreated] = await db.User.findOrCreate({
      where: { email: 'establo@handicapp.com' },
      defaults: { ...baseUser, email: 'establo@handicapp.com', nombre: 'Haras', apellido: 'San Jorge', rol_id: estRoleId },
    });

    const [propUser, propCreated] = await db.User.findOrCreate({
      where: { email: 'propietario@handicapp.com' },
      defaults: { ...baseUser, email: 'propietario@handicapp.com', nombre: 'Carlos', apellido: 'Mendez', rol_id: propRoleId },
    });

    if (estCreated) logger.debug('Establecimiento user created');
    if (propCreated) logger.debug('Propietario user created');

    const adminId: number = (adminUser as any).id ?? (adminUser as any).get?.('id');
    const estUserId: number = (estUser as any).id ?? (estUser as any).get?.('id');
    const propUserId: number = (propUser as any).id ?? (propUser as any).get?.('id');

    // ── 3. ESTABLECIMIENTO ────────────────────────────────────────────────────
    const [establecimiento, estCreatedRow] = await db.Establecimiento.findOrCreate({
      where: { nombre: 'Haras San Jorge' },
      defaults: {
        nombre: 'Haras San Jorge',
        cuit: '30-71234567-9',
        descripcion: 'Haras de polo y salto en las afueras de Buenos Aires.',
        ciudad: 'Luján',
        provincia: 'Buenos Aires',
        pais: 'Argentina',
        estado: EstadoEstablecimiento.activo,
        propietario_id: estUserId,
        creado_el: now,
        actualizado_el: now,
      } as any,
    });

    if (estCreatedRow) logger.debug('Establecimiento seeded');

    const estId: number = (establecimiento as any).id ?? (establecimiento as any).get?.('id');

    // Membresía establecimiento ↔ usuario establecimiento
    await db.MembresiaUsuarioEstablecimiento.findOrCreate({
      where: { usuario_id: estUserId, establecimiento_id: estId },
      defaults: {
        usuario_id: estUserId,
        establecimiento_id: estId,
        rol_en_establecimiento: 'responsable',
        estado_membresia: EstadoMembresia.active,
        creado_el: now,
      },
    });

    // ── 4. CABALLOS ───────────────────────────────────────────────────────────
    const caballosDefs = [
      { nombre: 'Trueno', sexo: 'macho', pelaje: 'Alazán', raza: 'Polo Argentino', disciplina: 'polo', fecha_nacimiento: '2018-03-15' },
      { nombre: 'Esperanza', sexo: 'hembra', pelaje: 'Tordilla', raza: 'Polo Argentino', disciplina: 'polo', fecha_nacimiento: '2019-07-22' },
      { nombre: 'Relampago', sexo: 'macho', pelaje: 'Zaino', raza: 'SPC', disciplina: 'polo', fecha_nacimiento: '2017-11-08' },
      { nombre: 'Luna Roja', sexo: 'hembra', pelaje: 'Colorado', raza: 'Criollo', disciplina: 'equitacion', fecha_nacimiento: '2020-01-30' },
      { nombre: 'Baron', sexo: 'macho', pelaje: 'Oscuro', raza: 'Warmblood', disciplina: 'polo', fecha_nacimiento: '2016-05-19' },
    ];

    const caballoIds: number[] = [];
    for (const cDef of caballosDefs) {
      const [caballo, created] = await db.Caballo.findOrCreate({
        where: { nombre: cDef.nombre },
        defaults: {
          ...cDef,
          estado_global: EstadoGlobalCaballo.activo,
          creado_el: now,
          actualizado_el: now,
        } as any,
      });
      const cId: number = (caballo as any).id ?? (caballo as any).get?.('id');
      caballoIds.push(cId);

      // Asociar a establecimiento (estado accepted)
      await db.CaballoEstablecimiento.findOrCreate({
        where: { caballo_id: cId, establecimiento_id: estId },
        defaults: {
          caballo_id: cId,
          establecimiento_id: estId,
          estado_asociacion: EstadoAsociacionCE.accepted,
        },
      }).catch(() => { /* ignorar si falla */ });

      // Primeros 3 caballos pertenecen al propietario
      if (created && caballoIds.indexOf(cId) < 3) {
        await db.PropietarioCaballo.findOrCreate({
          where: { caballo_id: cId, propietario_usuario_id: propUserId },
          defaults: {
            caballo_id: cId,
            propietario_usuario_id: propUserId,
            porcentaje_tenencia: 100,
            creado_el: now,
          },
        }).catch(() => { /* ignorar si no existe el modelo */ });
      }

      if (created) logger.debug(`Caballo '${cDef.nombre}' seeded`);
    }

    // ── 5. EVENTOS ────────────────────────────────────────────────────────────
    const tipoEvento = await db.TipoEvento?.findOne({ where: { nombre: 'Revisión General' } })
      .catch(() => null);
    const tipoId: number | null = tipoEvento
      ? ((tipoEvento as any).id ?? (tipoEvento as any).get?.('id'))
      : null;

    const eventosDefs = [
      { titulo: 'Herrado Trueno', estado: 'completado', prioridad: 'media', caballoIdx: 0, diasOffset: -15 },
      { titulo: 'Control veterinario Esperanza', estado: 'pendiente', prioridad: 'alta', caballoIdx: 1, diasOffset: 3 },
      { titulo: 'Vacuna antirrábica Baron', estado: 'pendiente', prioridad: 'alta', caballoIdx: 4, diasOffset: 7 },
      { titulo: 'Entrenamiento Relampago', estado: 'completado', prioridad: 'baja', caballoIdx: 2, diasOffset: -5 },
      { titulo: 'Revisión dental Luna Roja', estado: 'pendiente', prioridad: 'media', caballoIdx: 3, diasOffset: 14 },
    ];

    for (const eDef of eventosDefs) {
      const fecha = new Date(now);
      fecha.setDate(fecha.getDate() + eDef.diasOffset);
      const caballoId = caballoIds[eDef.caballoIdx];
      if (!caballoId) continue;
      await db.Evento.findOrCreate({
        where: { titulo: eDef.titulo, caballo_id: caballoId },
        defaults: {
          titulo: eDef.titulo,
          caballo_id: caballoId,
          establecimiento_id: estId,
          ...(tipoId ? { tipo_evento_id: tipoId } : {}),
          estado: eDef.estado,
          prioridad: eDef.prioridad,
          fecha_evento: fecha,
          creado_por: adminId,
          creado_el: now,
          actualizado_el: now,
        } as any,
      }).catch(() => { /* ignorar si falla por FK */ });
    }
    logger.debug('Eventos seeded');

    // ── 6. TAREAS ─────────────────────────────────────────────────────────────
    const tareasDefs = [
      { titulo: 'Limpiar boxes sector A', tipo: TipoTarea.limpieza_box, estado: 'pendiente', prioridad: 'media', caballoIdx: undefined },
      { titulo: 'Alimentación mañana — todos', tipo: TipoTarea.alimentacion, estado: 'completada', prioridad: 'alta', caballoIdx: undefined },
      { titulo: 'Ejercicio Trueno 30 minutos', tipo: TipoTarea.ejercicio, estado: 'en_progreso', prioridad: 'media', caballoIdx: 0 },
      { titulo: 'Aseo semanal Esperanza', tipo: TipoTarea.aseo_caballo, estado: 'pendiente', prioridad: 'baja', caballoIdx: 1 },
      { titulo: 'Comprar pienso concentrado', tipo: TipoTarea.compras, estado: 'pendiente', prioridad: 'alta', caballoIdx: undefined },
    ];

    for (const tDef of tareasDefs) {
      const fecha = new Date(now);
      fecha.setDate(fecha.getDate() + 2);
      const caballoId = tDef.caballoIdx !== undefined ? (caballoIds[tDef.caballoIdx] ?? null) : null;
      await db.Tarea.findOrCreate({
        where: { titulo: tDef.titulo },
        defaults: {
          titulo: tDef.titulo,
          tipo: tDef.tipo,
          estado: tDef.estado,
          prioridad: tDef.prioridad,
          establecimiento_id: estId,
          ...(caballoId ? { caballo_id: caballoId } : {}),
          asignado_a_id: estUserId,
          creado_por_id: adminId,
          fecha_vencimiento: fecha,
          creado_el: now,
          actualizado_el: now,
        } as any,
      }).catch(() => { /* ignorar si falla */ });
    }
    logger.debug('Tareas seeded');

    logger.debug(`Seed OK — admin@handicapp.com | establo@handicapp.com | propietario@handicapp.com — pw: ${PLAIN_PASSWORD}`);

    return true;
  } catch (error) {
    logger.error('❌ Error during seed process', { error: (error as Error).message });
    throw error;
  }
};
