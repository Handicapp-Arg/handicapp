/**
 * FormField — Campo de formulario estándar: label + input/select/textarea + error.
 *
 * Uso:
 *   <FormField label="Nombre" error={errors.nombre}>
 *     <Input value={nombre} onChange={...} />
 *   </FormField>
 *
 *   <FormField label="Estado" error={errors.estado}>
 *     <Select value={estado} onValueChange={...}>...</Select>
 *   </FormField>
 */

import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, required, hint, children, className }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

/**
 * FormGrid — Grid de 1 o 2 columnas para agrupar FormFields.
 *
 * <FormGrid cols={2}>
 *   <FormField label="Nombre">...</FormField>
 *   <FormField label="Apellido">...</FormField>
 * </FormGrid>
 */
export function FormGrid({
  cols = 1,
  children,
  className,
}: {
  cols?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}) {
  const gridClass = {
    1: 'grid grid-cols-1 gap-4',
    2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  }[cols];

  return <div className={`${gridClass} ${className ?? ''}`}>{children}</div>;
}

/**
 * FormActions — Fila de botones al pie de un formulario.
 *
 * <FormActions>
 *   <Button variant="outline" onClick={onClose}>Cancelar</Button>
 *   <Button type="submit">Guardar</Button>
 * </FormActions>
 */
export function FormActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 border-t border-gray-100 ${className ?? ''}`}>
      {children}
    </div>
  );
}
