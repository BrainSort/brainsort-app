export type TipoOrigenDatos = 'Predeterminado' | 'Personalizado';

export interface GrafoData {
  nodos: string[];
  aristas: [string, string][];
  dirigido: boolean;
  pesos?: Record<string, number>;
  aristasPonderadas?: [string, string, number][];
}

export interface SimulationInput {
  tipoOrigen?: TipoOrigenDatos;
  data?: number[];
  valores?: number[];
  tamano?: number;
  objetivo?: number;
  grafo?: GrafoData;
  nodoInicio?: string;
}

export interface ConjuntoDeDatos {
  valores?: number[];
  tipoOrigen: TipoOrigenDatos;
  tamano?: number;
  objetivo?: number;
  grafo?: GrafoData;
  nodoInicio?: string;
}

export interface SesionSimulacion {
  id: string;
  usuarioId?: string;
  algoritmoId: string;
  pasosCompletados: number;
  totalPasos: number;
  completada: boolean;
  fechaInicio: Date;
  fechaFin?: Date | null;
}
