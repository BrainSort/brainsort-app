export type TipoOperacion = 'idle' | 'comparacion' | 'intercambio' | 'insercion' | 'final';

export interface SimulationStep {
  numeroPaso: number;
  tipoOperacion: TipoOperacion;
  indicesActivos: number[];
  estadoArray: number[];
  lineaPseudocodigo: number;
}
