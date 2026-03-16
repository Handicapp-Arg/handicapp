export enum EstadoUsuario { pending="pending", invited="invited", active="active", suspended="suspended", disabled="disabled", deleted="deleted" }
export enum EstadoMembresia { active="active", suspended="suspended", finished="finished" }
export enum SexoCaballo { macho="macho", hembra="hembra" }
export enum Disciplina { polo="polo", equitacion="equitacion", turf="turf" }
export enum EstadoGlobalCaballo { activo="activo", inactivo="inactivo", vendido="vendido", fallecido="fallecido" }
export enum EstadoAsociacionCE { pending="pending", accepted="accepted", rejected="rejected", finished="finished" }
export enum EstadoInternoCE { en_cuarentena="en_cuarentena", en_transito="en_transito", activo_en_haras="activo_en_haras" }
export enum EstadoValidacionEvento { draft="draft", pending_review="pending_review", approved="approved", rejected="rejected" }
export enum CategoriaAdjunto { propietario="propietario", operativo="operativo", salud="salud", otro="otro" }
export enum EstadoQR { active="active", revoked="revoked", expired="expired" }
export enum TipoTarea { 
  // Tareas específicas del caballo (requieren caballo_id)
  alimentacion="alimentacion", 
  limpieza_box="limpieza_box", 
  aseo_caballo="aseo_caballo", 
  ejercicio="ejercicio", 
  salud="salud", 
  entrenamiento="entrenamiento",
  // Tareas del establecimiento (caballo_id null)
  mantenimiento="mantenimiento", 
  reparacion="reparacion", 
  limpieza_general="limpieza_general", 
  compras="compras", 
  otro="otro" 
}
export enum EstadoTarea { open="open", in_progress="in_progress", done="done", cancelled="cancelled" }
export enum EstadoNotificacion { unread="unread", read="read", sent="sent" }
