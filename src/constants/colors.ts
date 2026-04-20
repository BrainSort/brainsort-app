/**
 * Definición oficial de colores para la simulación de BrainSort
 * Según Constitución §3 y library-simulation.spec.md
 */
export const SimulationColors = {
  idle: '#4A90D9',        // Azul: Elemento base
  comparison: '#F5A623',  // Amarillo: Comparando
  comparacion: '#F5A623', // Alias backend/core
  swap: '#D0021B',        // Rojo: Intercambiando
  intercambio: '#D0021B', // Alias backend/core
  insercion: '#03DAC6',   // Turquesa: Inserción
  final: '#7ED321',      // Verde: Posición final correcta
  
  // Colores adicionales para animaciones especializadas
  bubble: '#FF9500',     // Naranja: Burbujeo
  minimum: '#00C853',    // Verde brillante: Mínimo encontrado
  sortedZone: '#E8F5E8', // Verde claro: Zona ordenada
  key: '#2962FF',        // Azul brillante: Elemento clave
};

export const ThemeColors = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  background: '#151718',
  surface: '#1E1E1E',
  text: '#ECEDEE',
  textSecondary: '#9BA1A6',
  white: '#FFFFFF',
  black: '#000000',
  error: '#CF6679',
};
