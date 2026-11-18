export type CategoriaAlgoritmo =
  | 'Ordenamiento'
  | 'Busqueda'
  | 'EstructurasLineales'
  | 'EstructurasArboles'
  | 'Grafos';

export interface AlgoritmoMeta {
  nombre: string;
  descripcion: string;
  complejidadTiempo: string;
  complejidadEspacio: string;
  categoria: CategoriaAlgoritmo;
  tipoEstructura?: 'array' | 'grafo';
  requiereOrdenado?: boolean;
}

export interface Algoritmo extends AlgoritmoMeta {
  id: string;
  activo?: boolean;
}

export interface PseudocodeLine {
  line: number;
  text: string;
  indent: number;
}
