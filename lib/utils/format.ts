/**
 * Formatea el número de caso de "2026-000005" a "Caso n° 05"
 * @param caseNumber - Número de caso completo (ej: "2026-000005")
 * @returns Número de caso formateado (ej: "Caso n° 05")
 */
export function formatCaseNumber(caseNumber: string): string {
  // Extraer los últimos dígitos después del guion
  const parts = caseNumber.split('-');
  if (parts.length === 2) {
    // Obtener el número y eliminar ceros a la izquierda, pero mantener al menos 2 dígitos
    const number = parts[1];
    const numericValue = parseInt(number, 10);
    const formattedNumber = numericValue.toString().padStart(2, '0');
    return `Caso n° ${formattedNumber}`;
  }
  // Si el formato no es el esperado, retornar el original
  return caseNumber;
}
