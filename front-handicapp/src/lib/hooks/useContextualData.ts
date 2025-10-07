import { useAuthNew } from './useAuthNew';
import { usePermissions } from './usePermissions';

export const useContextualData = () => {
  const { user } = useAuthNew();
  const { isAdmin, isEstablecimiento, isVeterinario, isPropietario } = usePermissions();

  // Filtros para establecimientos
  const getEstablecimientoFilters = () => {
    if (isAdmin) {
      return {}; // Admin ve todos
    }
    
    if (isEstablecimiento) {
      return { propietario_id: user?.id }; // Solo su establecimiento
    }
    
    // Otros roles ven establecimientos donde trabajan/tienen caballos
    return { usuario_id: user?.id };
  };

  // Filtros para caballos
  const getCaballoFilters = () => {
    if (isAdmin) {
      return {}; // Admin ve todos
    }
    
    if (isPropietario) {
      return { propietario_id: user?.id }; // Solo sus caballos
    }
    
    if (isEstablecimiento || isVeterinario) {
      return { establecimiento_id: user?.establecimiento_id }; // Caballos del establecimiento
    }
    
    return { establecimiento_id: user?.establecimiento_id };
  };

  // Filtros para eventos
  const getEventoFilters = () => {
    if (isAdmin) {
      return {}; // Admin ve todos
    }
    
    if (isVeterinario) {
      return { 
        $or: [
          { creado_por_usuario_id: user?.id },
          { validado_por_usuario_id: user?.id }
        ]
      };
    }
    
    // Otros ven eventos de sus caballos/establecimiento
    return { establecimiento_id: user?.establecimiento_id };
  };

  // Filtros para tareas
  const getTareaFilters = () => {
    if (isAdmin) {
      return {}; // Admin ve todas
    }
    
    return {
      $or: [
        { asignado_a_usuario_id: user?.id },
        { creado_por_usuario_id: user?.id },
        { establecimiento_id: user?.establecimiento_id }
      ]
    };
  };

  return {
    getEstablecimientoFilters,
    getCaballoFilters,
    getEventoFilters,
    getTareaFilters,
    currentUser: user,
    isAdmin,
    isEstablecimiento,
    isVeterinario,
    isPropietario
  };
};