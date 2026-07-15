import { Matricula } from "./types"

/**
 * Generates the next sequential matricula number for a given client name in the format:
 * MAT-(first 3 letters of name)-000000
 *
 * It normalized the name (removes accents, non-letters) and finds the next sequence
 * number specifically for that client name prefix.
 */
export function generateNextNumeroMatricula(clienteNombre: string, existingMatriculas: Matricula[]): string {
  // 1. Get first 3 letters of the client's name, normalized to uppercase, removing special characters/accents
  const normalizedName = clienteNombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z\s]/g, "") // Keep only letters and spaces (remove other chars)
    .trim()
    .replace(/\s+/g, "") // Remove spaces
    .toUpperCase();

  const prefixLetters = (normalizedName.substring(0, 3) || "GEN").padEnd(3, "X");
  const prefix = `MAT-${prefixLetters}-`;

  // 2. Find the highest number for this specific prefix in existing matriculas
  let maxNumber = 0;
  for (const mat of existingMatriculas) {
    if (mat.numero_matricula && mat.numero_matricula.startsWith(prefix)) {
      const suffixStr = mat.numero_matricula.substring(prefix.length);
      const num = parseInt(suffixStr, 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  // 3. Increment the max number and format as 6 digits (padded with zeros)
  const nextNumber = maxNumber + 1;
  const paddedNumber = String(nextNumber).padStart(6, "0");

  return `${prefix}${paddedNumber}`;
}
